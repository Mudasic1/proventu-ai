"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, toActionError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import {
  appointmentScheduleSchema,
  crmActivitySchema,
} from "@/lib/validations/crm-activities";
import { createCrmActivity } from "@/server/mutations/crm-activities";

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return {
    workspaceId: context.workspaceId,
    userId: context.session.user.id,
    role: context.role,
  };
}

function parseFormData(formData: FormData) {
  return Object.fromEntries(formData);
}

function parseAppointmentFormData(formData: FormData) {
  const values = parseFormData(formData);
  const appointmentDate = String(values.appointmentDate ?? "");
  const appointmentTime = String(values.appointmentTime ?? "");

  if (!values.scheduledAt && appointmentDate && appointmentTime) {
    values.scheduledAt = `${appointmentDate}T${appointmentTime}`;
  }

  return values;
}

export async function createCrmActivityAction(
  contactId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = crmActivitySchema.safeParse(parseFormData(formData));
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
    revalidatePath("/crm/activity");
    return { status: "success", message: "Activity saved to the CRM timeline." };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createSelectedContactCrmActivityAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const contactId = String(formData.get("contactId") ?? "");
  const result = crmActivitySchema.safeParse(parseFormData(formData));
  if (!contactId) {
    return {
      status: "error",
      message: "Choose a contact before logging activity.",
      fieldErrors: { contactId: ["Choose a contact."] },
    };
  }
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
    revalidatePath("/crm/activity");
    revalidatePath(`/crm/contacts/${contactId}`);
    return { status: "success", message: "Activity saved." };
  } catch (error) {
    return toActionError(error);
  }
}

export async function scheduleAppointmentAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = appointmentScheduleSchema.safeParse(parseAppointmentFormData(formData));
  if (!result.success) {
    return {
      status: "error",
      message: "Review the appointment details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const context = await requirePermission("contacts:write");
    await createCrmActivity(
      mutationContext(context),
      result.data.contactId,
      result.data.activity,
    );
    revalidatePath("/sales/appointments");
    revalidatePath("/crm/activity");
    revalidatePath(`/crm/contacts/${result.data.contactId}`);
    return { status: "success", message: "Appointment scheduled in Google Calendar." };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createCrmActivityFormAction(
  contactId: string,
  formData: FormData,
) {
  const result = crmActivitySchema.safeParse(parseFormData(formData));
  if (!result.success) return;

  const context = await requirePermission("contacts:write");
  await createCrmActivity(mutationContext(context), contactId, result.data);
  revalidatePath(`/crm/contacts/${contactId}`);
  revalidatePath("/crm/activity");
}
