"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, toActionError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import { crmActivitySchema } from "@/lib/validations/crm-activities";
import { createCrmActivity } from "@/server/mutations/crm-activities";

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return {
    workspaceId: context.workspaceId,
    userId: context.session.user.id,
    role: context.role,
  };
}

export async function createCrmActivityAction(
  contactId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = crmActivitySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      status: "error",
      message: "Review the activity details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const context = await requirePermission("contacts:write");
    await createCrmActivity(mutationContext(context), contactId, result.data);
    revalidatePath(`/crm/contacts/${contactId}`);
    return { status: "success", message: "Activity saved to the CRM timeline." };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createCrmActivityFormAction(
  contactId: string,
  formData: FormData,
) {
  const result = crmActivitySchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return;

  const context = await requirePermission("contacts:write");
  await createCrmActivity(mutationContext(context), contactId, result.data);
  revalidatePath(`/crm/contacts/${contactId}`);
}
