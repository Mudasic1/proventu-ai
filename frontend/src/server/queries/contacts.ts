import "server-only";

import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { activityEntry, contact } from "@/lib/db/schema";
import { normalizeEmail, normalizePhone } from "@/lib/validations/contacts";

type ContactFilters = {
  query?: string;
  status?: string;
};

export async function listContacts(workspaceId: string, filters: ContactFilters) {
  const query = filters.query?.trim();
  return db
    .select()
    .from(contact)
    .where(
      and(
        eq(contact.workspaceId, workspaceId),
        isNull(contact.removedAt),
        filters.status && filters.status !== "all"
          ? eq(contact.status, filters.status)
          : undefined,
        query
          ? or(
              ilike(contact.firstName, `%${query}%`),
              ilike(contact.lastName, `%${query}%`),
              ilike(contact.email, `%${query}%`),
              ilike(contact.companyName, `%${query}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(contact.updatedAt))
    .limit(100);
}

export async function getContact(workspaceId: string, contactId: string) {
  const [record] = await db
    .select()
    .from(contact)
    .where(
      and(
        eq(contact.id, contactId),
        eq(contact.workspaceId, workspaceId),
        isNull(contact.removedAt),
      ),
    )
    .limit(1);
  return record;
}

export async function getContactActivity(workspaceId: string, contactId: string) {
  return db
    .select()
    .from(activityEntry)
    .where(
      and(
        eq(activityEntry.workspaceId, workspaceId),
        eq(activityEntry.entityType, "contact"),
        eq(activityEntry.entityId, contactId),
      ),
    )
    .orderBy(desc(activityEntry.createdAt))
    .limit(50);
}

export async function findDuplicateContact(
  workspaceId: string,
  values: { email?: string; phone?: string },
) {
  const email = normalizeEmail(values.email);
  const phone = normalizePhone(values.phone);

  if (!email && !phone) return undefined;

  const [record] = await db
    .select({ id: contact.id, firstName: contact.firstName, lastName: contact.lastName })
    .from(contact)
    .where(
      and(
        eq(contact.workspaceId, workspaceId),
        isNull(contact.removedAt),
        or(
          email ? eq(contact.normalizedEmail, email) : undefined,
          phone ? eq(contact.normalizedPhone, phone) : undefined,
        ),
      ),
    )
    .limit(1);
  return record;
}
