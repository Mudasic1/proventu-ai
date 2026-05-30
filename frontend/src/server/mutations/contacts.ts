import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { contact } from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import {
  normalizeEmail,
  normalizePhone,
  splitTags,
  type ContactInput,
} from "@/lib/validations/contacts";
import { recordActivity } from "@/server/mutations/activity";
import { findDuplicateContact, getContact } from "@/server/queries/contacts";

type MutationContext = { workspaceId: string; userId: string };

export async function createContact(
  context: MutationContext,
  input: ContactInput,
) {
  const duplicate = await findDuplicateContact(context.workspaceId, input);
  if (duplicate && input.confirmDuplicate !== "yes") return { duplicate };

  const contactId = crypto.randomUUID();
  await db.insert(contact).values({
    id: contactId,
    workspaceId: context.workspaceId,
    ownerUserId: context.userId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    normalizedEmail: normalizeEmail(input.email),
    phone: input.phone,
    normalizedPhone: normalizePhone(input.phone),
    companyName: input.companyName,
    source: input.source,
    status: input.status,
    tags: splitTags(input.tags),
    notes: input.notes,
  });
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "contact",
    entityId: contactId,
    action: "contact.created",
    summary: `${input.firstName} ${input.lastName}`.trim() + " added to CRM",
  });
  return { contactId };
}

export async function updateContact(
  context: MutationContext,
  contactId: string,
  input: ContactInput,
) {
  if (!(await getContact(context.workspaceId, contactId))) {
    throw new AppError("NOT_FOUND", "Contact not found.");
  }

  await db
    .update(contact)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      normalizedEmail: normalizeEmail(input.email),
      phone: input.phone,
      normalizedPhone: normalizePhone(input.phone),
      companyName: input.companyName,
      source: input.source,
      status: input.status,
      tags: splitTags(input.tags),
      notes: input.notes,
    })
    .where(and(eq(contact.id, contactId), eq(contact.workspaceId, context.workspaceId)));
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "contact",
    entityId: contactId,
    action: "contact.updated",
    summary: "Contact details updated",
  });
}

export async function addContactNote(
  context: MutationContext,
  contactId: string,
  note: string,
) {
  if (!(await getContact(context.workspaceId, contactId))) {
    throw new AppError("NOT_FOUND", "Contact not found.");
  }
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "contact",
    entityId: contactId,
    action: "contact.note_added",
    summary: note,
  });
}

export async function removeContact(
  context: MutationContext,
  contactId: string,
) {
  if (!(await getContact(context.workspaceId, contactId))) {
    throw new AppError("NOT_FOUND", "Contact not found.");
  }
  await db
    .update(contact)
    .set({ removedAt: new Date() })
    .where(and(eq(contact.id, contactId), eq(contact.workspaceId, context.workspaceId)));
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "contact",
    entityId: contactId,
    action: "contact.removed",
    summary: "Contact removed after explicit confirmation",
  });
}
