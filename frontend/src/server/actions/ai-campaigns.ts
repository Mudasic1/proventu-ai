"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import {
  campaignPlanRequestSchema,
  contentApprovalDecisionSchema,
} from "@/lib/validations/ai-campaigns";
import {
  decideContentApproval,
  generateCampaignDrafts,
} from "@/server/mutations/ai-campaigns";

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return { workspaceId: context.workspaceId, userId: context.session.user.id };
}

export async function generateCampaignDraftsAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  const parsed = campaignPlanRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Review the campaign planner fields.",
    );
  }
  await generateCampaignDrafts(mutationContext(context), parsed.data);
  redirect("/marketing/campaigns?toast=ai-drafts-created");
}

export async function decideContentApprovalAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  const parsed = contentApprovalDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", "Choose an approval decision.");
  }
  await decideContentApproval(mutationContext(context), parsed.data);
  revalidatePath("/marketing/campaigns");
}
