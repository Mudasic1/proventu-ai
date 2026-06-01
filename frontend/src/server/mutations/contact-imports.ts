import "server-only";

import Papa from "papaparse";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  contact,
  contactImport,
  contactImportRow,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import {
  contactSchema,
  normalizeEmail,
  normalizePhone,
  splitTags,
  type ContactInput,
} from "@/lib/validations/contacts";
import { findDuplicateContact } from "@/server/queries/contacts";

type ImportContext = { workspaceId: string; userId: string; role: string };

type StagedImportRow = {
  contact?: ContactInput & { id: string };
  rawData: Record<string, string>;
  reason?: string;
  rowNumber: number;
  status: "accepted" | "duplicate" | "rejected";
};

export const MAX_IMPORT_BYTES = 1_000_000;
const MAX_IMPORT_ROWS = 1_000;
const DUPLICATE_CHECK_BATCH_SIZE = 25;
const INSERT_BATCH_SIZE = 100;

function batches<T>(items: T[], size: number) {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_, index) => items.slice(index * size, (index + 1) * size),
  );
}

function parseErrors(errors: Papa.ParseError[]) {
  return errors
    .slice(0, 5)
    .map((error) => `row ${error.row === undefined ? "unknown" : error.row + 1}: ${error.message}`)
    .join("; ");
}

export async function importContacts(
  context: ImportContext,
  file: File,
) {
  const importId = crypto.randomUUID();
  const parsed = Papa.parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    throw new AppError(
      "VALIDATION_ERROR",
      `The CSV file could not be parsed: ${parseErrors(parsed.errors)}`,
    );
  }
  if (parsed.data.length > MAX_IMPORT_ROWS) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Import files can contain at most ${MAX_IMPORT_ROWS} contacts.`,
    );
  }

  const stagedRows: StagedImportRow[] = [];
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();

  for (const batch of batches(parsed.data, DUPLICATE_CHECK_BATCH_SIZE)) {
    const candidates = batch.map((rawData, index) => {
      const rowNumber = stagedRows.length + index + 2;
      const result = contactSchema.safeParse({
        firstName: rawData.firstName ?? rawData.first_name ?? rawData.name,
        lastName: rawData.lastName ?? rawData.last_name ?? "",
        email: rawData.email ?? "",
        phone: rawData.phone ?? "",
        companyName: rawData.companyName ?? rawData.company ?? "",
        source: rawData.source ?? "import",
        status: rawData.status ?? "lead",
        tags: rawData.tags ?? "",
        notes: rawData.notes ?? "",
      });
      return { rawData, result, rowNumber };
    });
    const duplicates = await Promise.all(
      candidates.map(({ result }) => (
        result.success
          ? findDuplicateContact(context.workspaceId, result.data)
          : undefined
      )),
    );

    for (const [index, candidate] of candidates.entries()) {
      if (!candidate.result.success) {
        stagedRows.push({
          rawData: candidate.rawData,
          reason: candidate.result.error.issues[0]?.message ?? "Invalid row",
          rowNumber: candidate.rowNumber,
          status: "rejected",
        });
        continue;
      }

      const email = normalizeEmail(candidate.result.data.email);
      const phone = normalizePhone(candidate.result.data.phone);
      if (
        duplicates[index]
        || (email && seenEmails.has(email))
        || (phone && seenPhones.has(phone))
      ) {
        stagedRows.push({
          rawData: candidate.rawData,
          reason: "A contact with this email or phone already exists.",
          rowNumber: candidate.rowNumber,
          status: "duplicate",
        });
        continue;
      }

      if (email) seenEmails.add(email);
      if (phone) seenPhones.add(phone);
      stagedRows.push({
        contact: { ...candidate.result.data, id: crypto.randomUUID() },
        rawData: candidate.rawData,
        rowNumber: candidate.rowNumber,
        status: "accepted",
      });
    }
  }

  const acceptedRows = stagedRows.filter((row) => row.contact);
  const acceptedCount = acceptedRows.length;
  const rejectedCount = stagedRows.filter((row) => row.status === "rejected").length;
  const duplicateCount = stagedRows.filter((row) => row.status === "duplicate").length;

  await db.transaction(async (tx) => {
    await tx.insert(contactImport).values({
      id: importId,
      workspaceId: context.workspaceId,
      createdByUserId: context.userId,
      fileName: file.name,
    });

    for (const batch of batches(acceptedRows, INSERT_BATCH_SIZE)) {
      await tx.insert(contact).values(batch.map(({ contact: record }) => ({
        id: record!.id,
        workspaceId: context.workspaceId,
        ownerUserId: context.userId,
        firstName: record!.firstName,
        lastName: record!.lastName,
        email: record!.email,
        normalizedEmail: normalizeEmail(record!.email),
        phone: record!.phone,
        normalizedPhone: normalizePhone(record!.phone),
        companyName: record!.companyName,
        source: record!.source,
        status: record!.status,
        tags: splitTags(record!.tags),
        notes: record!.notes,
      })));
      await tx.insert(activityEntry).values(batch.map(({ contact: record }) => ({
        id: crypto.randomUUID(),
        workspaceId: context.workspaceId,
        actorUserId: context.userId,
        entityType: "contact",
        entityId: record!.id,
        action: "contact.created",
        summary: `${record!.firstName} ${record!.lastName}`.trim() + " added to CRM",
      })));
    }

    for (const batch of batches(stagedRows, INSERT_BATCH_SIZE)) {
      await tx.insert(contactImportRow).values(batch.map((row) => ({
        id: crypto.randomUUID(),
        importId,
        rowNumber: row.rowNumber,
        rawData: row.rawData,
        status: row.status,
        reason: row.reason,
      })));
    }

    await tx
      .update(contactImport)
      .set({ acceptedCount, rejectedCount, duplicateCount })
      .where(eq(contactImport.id, importId));
  });

  return { acceptedCount, rejectedCount, duplicateCount };
}
