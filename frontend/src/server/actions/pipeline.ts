"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, toActionError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import {
  closeDealSchema,
  dealSchema,
  moveDealSchema,
  taskSchema,
} from "@/lib/validations/pipeline";
import {
  closeDeal,
  completeFollowUpTask,
  createDeal,
  createFollowUpTask,
  moveDeal,
} from "@/server/mutations/pipeline";

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return { workspaceId: context.workspaceId, userId: context.session.user.id, role: context.role };
}

export async function createDealAction(_state: ActionState, formData: FormData) {
  const result = dealSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      status: "error" as const,
      message: "Review the deal details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const context = await requirePermission("pipeline:write");
    await createDeal(mutationContext(context), result.data);
  } catch (error) {
    return toActionError(error);
  }
  redirect("/sales/pipeline?toast=deal-created");
}

export async function moveDealAction(dealId: string, formData: FormData) {
  const result = moveDealSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return;
  const context = await requirePermission("pipeline:write");
  await moveDeal(mutationContext(context), dealId, result.data.stageId);
  revalidatePath("/sales/pipeline");
}

export async function closeDealAction(dealId: string, formData: FormData) {
  const result = closeDealSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return;
  const context = await requirePermission("pipeline:write");
  await closeDeal(
    mutationContext(context),
    dealId,
    result.data.outcome,
    result.data.lostReason,
  );
  revalidatePath("/sales/pipeline");
  revalidatePath(`/sales/deals/${dealId}`);
}

export async function createTaskAction(_state: ActionState, formData: FormData) {
  const result = taskSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      status: "error" as const,
      message: "Review the follow-up details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  try {
    const context = await requirePermission("tasks:write");
    await createFollowUpTask(mutationContext(context), result.data);
  } catch (error) {
    return toActionError(error);
  }
  redirect("/sales/tasks?toast=task-created");
}

export async function completeTaskAction(taskId: string) {
  const context = await requirePermission("tasks:write");
  await completeFollowUpTask(mutationContext(context), taskId);
  revalidatePath("/sales/tasks");
}
