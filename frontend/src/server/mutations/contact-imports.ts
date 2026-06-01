import "server-only";

import Papa from "papaparse";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { contactImport, contactImportRow } from "@/lib/db/schema";
import {
  contactSchema,
} from "@/lib/validations/contacts";
import { createContact } from "@/server/mutations/contacts";
import { findDuplicateContact } from "@/server/queries/contacts";

type ImportContext = { workspaceId: string; userId: string; role: string };

export async function importContacts(
  context: ImportContext,
  file: File,
) {
  const importId = crypto.randomUUID();
  const parsed = Papa.parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: true,
  });
  let acceptedCount = 0;
  let rejectedCount = 0;
  let duplicateCount = 0;

  await db.insert(contactImport).values({
    id: importId,
    workspaceId: context.workspaceId,
    createdByUserId: context.userId,
    fileName: file.name,
  });

  for (const [index, raw] of parsed.data.entries()) {
    const candidate = contactSchema.safeParse({
      firstName: raw.firstName ?? raw.first_name ?? raw.name,
      lastName: raw.lastName ?? raw.last_name ?? "",
      email: raw.email ?? "",
      phone: raw.phone ?? "",
      companyName: raw.companyName ?? raw.company ?? "",
      source: raw.source ?? "import",
      status: raw.status ?? "lead",
      tags: raw.tags ?? "",
      notes: raw.notes ?? "",
    });
    let status = "accepted";
    let reason: string | undefined;

    if (!candidate.success) {
      status = "rejected";
      reason = candidate.error.issues[0]?.message ?? "Invalid row";
      rejectedCount += 1;
    } else if (await findDuplicateContact(context.workspaceId, candidate.data)) {
      status = "duplicate";
      reason = "A contact with this email or phone already exists.";
      duplicateCount += 1;
    } else {
      await createContact(context, { ...candidate.data, confirmDuplicate: "yes" });
      acceptedCount += 1;
    }

    await db.insert(contactImportRow).values({
      id: crypto.randomUUID(),
      importId,
      rowNumber: index + 2,
      rawData: raw,
      status,
      reason,
    });
  }

  await db
    .update(contactImport)
    .set({ acceptedCount, rejectedCount, duplicateCount })
    .where(eq(contactImport.id, importId));

  return { acceptedCount, rejectedCount, duplicateCount };
}
