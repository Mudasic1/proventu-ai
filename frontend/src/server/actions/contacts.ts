"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  type ActionState,
  toActionError,
} from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import { contactSchema, noteSchema } from "@/lib/validations/contacts";
import {
  importContacts,
  MAX_IMPORT_BYTES,
} from "@/server/mutations/contact-imports";
import {
  addContactNote,
  createContact,
  removeContact,
  updateContact,
} from "@/server/mutations/contacts";

export type ContactActionState = ActionState & {
  duplicateName?: string;
  importSummary?: { acceptedCount: number; rejectedCount: number; duplicateCount: number };
};

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return { workspaceId: context.workspaceId, userId: context.session.user.id, role: context.role };
}

function parseContact(formData: FormData) {
  return contactSchema.safeParse(Object.fromEntries(formData));
}

export async function createContactAction(
  _state: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const result = parseContact(formData);
  if (!result.success) {
    return {
      status: "error",
      message: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const context = await requirePermission("contacts:write");
    const created = await createContact(mutationContext(context), result.data);
    if ("duplicate" in created) {
      return {
        status: "error",
        message: "A likely duplicate already exists. Confirm to add another record.",
        duplicateName: `${created.duplicate?.firstName} ${created.duplicate?.lastName}`.trim(),
      };
    }
  } catch (error) {
    return toActionError(error);
  }
  redirect("/crm/contacts?toast=contact-created");
}

export async function updateContactAction(
  contactId: string,
  _state: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const result = parseContact(formData);
  if (!result.success) {
    return {
      status: "error",
      message: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const context = await requirePermission("contacts:write");
    await updateContact(mutationContext(context), contactId, result.data);
    revalidatePath(`/crm/contacts/${contactId}`);
    return { status: "success", message: "Contact updated." };
  } catch (error) {
    return toActionError(error);
  }
}

export async function addContactNoteAction(contactId: string, formData: FormData) {
  const result = noteSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return;
  const context = await requirePermission("contacts:write");
  await addContactNote(mutationContext(context), contactId, result.data.note);
  revalidatePath(`/crm/contacts/${contactId}`);
}

export async function removeContactAction(contactId: string, formData: FormData) {
  if (formData.get("confirmation") !== "remove") return;
  const context = await requirePermission("contacts:write");
  await removeContact(mutationContext(context), contactId);
  redirect("/crm/contacts?toast=contact-removed");
}

export async function importContactsAction(
  _state: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a CSV file to import." };
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { status: "error", message: "Upload a CSV file." };
  }
  if (file.size > MAX_IMPORT_BYTES) {
    return { status: "error", message: "Upload a CSV file smaller than 1 MB." };
  }
  try {
    const context = await requirePermission("contacts:write");
    const importSummary = await importContacts(mutationContext(context), file);
    revalidatePath("/crm/contacts");
    return {
      status: "success",
      message: "Contact import processed.",
      importSummary,
    };
  } catch (error) {
    return toActionError(error);
  }
}
