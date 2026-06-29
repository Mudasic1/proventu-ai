"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import {
  addTeamMemberSchema,
  automationSchema,
  campaignSchema,
  companySchema,
  emailCampaignSchema,
  emailSequenceSchema,
  inboxConversationSchema,
  socialPostSchema,
  updateTeamMemberRoleSchema,
  workspaceSettingsSchema,
} from "@/lib/validations/workspace-modules";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { automation } from "@/lib/db/schema";
import {
  addTeamMember,
  createAutomation,
  createCampaign,
  createCompany,
  createEmailCampaign,
  createEmailSequence,
  createInboxConversation,
  createSocialPost,
  updateAutomation,
  saveWorkspaceSettings,
  updateTeamMemberRole,
  updateWorkspaceRecordStatus,
  type WorkspaceRecordType,
} from "@/server/mutations/workspace-modules";
import type { ZodType } from "zod";

function mutationContext(context: Awaited<ReturnType<typeof requirePermission>>) {
  return { workspaceId: context.workspaceId, userId: context.session.user.id };
}

function parse<T>(schema: ZodType<T>, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "Review the submitted fields.",
    );
  }
  return result.data;
}

export async function createCompanyAction(formData: FormData) {
  const context = await requirePermission("companies:write");
  await createCompany(mutationContext(context), parse(companySchema, formData));
  redirect("/crm/companies?toast=company-created");
}

export async function createCampaignAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  await createCampaign(mutationContext(context), parse(campaignSchema, formData));
  redirect("/marketing/campaigns?toast=campaign-created");
}

export async function createSocialPostAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  await createSocialPost(mutationContext(context), parse(socialPostSchema, formData));
  redirect("/marketing/posts?toast=post-created");
}

export async function createEmailCampaignAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  await createEmailCampaign(
    mutationContext(context),
    parse(emailCampaignSchema, formData),
  );
  redirect("/marketing/email-campaigns?toast=email-campaign-created");
}

export async function createEmailSequenceAction(formData: FormData) {
  const context = await requirePermission("campaigns:write");
  await createEmailSequence(
    mutationContext(context),
    parse(emailSequenceSchema, formData),
  );
  redirect("/marketing/email-sequences?toast=email-sequence-created");
}

export async function createInboxConversationAction(formData: FormData) {
  const context = await requirePermission("inbox:write");
  await createInboxConversation(
    mutationContext(context),
    parse(inboxConversationSchema, formData),
  );
  redirect("/inbox?toast=conversation-created");
}

export async function createAutomationAction(formData: FormData) {
  const context = await requirePermission("automations:write");
  await createAutomation(mutationContext(context), parse(automationSchema, formData));
  redirect("/automations?toast=automation-created");
}

export async function updateAutomationAction(formData: FormData) {
  const context = await requirePermission("automations:write");
  const automationId = formData.get("id") as string;
  if (!automationId) throw new AppError("VALIDATION_ERROR", "Automation ID is required.");
  let conditions: { field: string; operator: string; value: string }[] = [];
  try {
    const raw = formData.get("conditions");
    if (raw && typeof raw === "string") conditions = JSON.parse(raw);
  } catch { /* ignore invalid JSON */ }
  let triggerConfig: Record<string, string> = {};
  try {
    const raw = formData.get("triggerConfig");
    if (raw && typeof raw === "string") triggerConfig = JSON.parse(raw);
  } catch { /* ignore invalid JSON */ }
  await updateAutomation(
    mutationContext(context),
    automationId,
    { ...parse(automationSchema, formData), triggerConfig, conditions },
  );
  revalidatePath(`/automations/${automationId}`);
  redirect(`/automations/${automationId}?toast=automation-updated`);
}

export async function deleteAutomationAction(formData: FormData) {
  const context = await requirePermission("automations:write");
  const automationId = formData.get("id") as string;
  if (!automationId) throw new AppError("VALIDATION_ERROR", "Automation ID is required.");
  await db.delete(automation).where(
    and(eq(automation.id, automationId), eq(automation.workspaceId, context.workspaceId)),
  );
  revalidatePath("/automations");
  redirect("/automations?toast=automation-deleted");
}

export async function saveWorkspaceSettingsAction(formData: FormData) {
  const context = await requirePermission("settings:write");
  const values = {
    ...Object.fromEntries(formData),
    requireContentReview: formData.get("requireContentReview") === "on",
  };
  const result = workspaceSettingsSchema.safeParse(values);
  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      result.error.issues[0]?.message ?? "Review the workspace settings.",
    );
  }
  await saveWorkspaceSettings(mutationContext(context), result.data);
  redirect("/settings?toast=settings-saved");
}

export async function addTeamMemberAction(formData: FormData) {
  const context = await requirePermission("team:write");
  await addTeamMember(mutationContext(context), parse(addTeamMemberSchema, formData));
  redirect("/team?toast=member-added");
}

export async function updateTeamMemberRoleAction(formData: FormData) {
  const context = await requirePermission("team:write");
  await updateTeamMemberRole(
    mutationContext(context),
    parse(updateTeamMemberRoleSchema, formData),
  );
  revalidatePath("/team");
}

const recordPermissions: Record<WorkspaceRecordType, "companies:write" | "campaigns:write" | "inbox:write" | "automations:write"> = {
  company: "companies:write",
  campaign: "campaigns:write",
  social_post: "campaigns:write",
  email_campaign: "campaigns:write",
  email_sequence: "campaigns:write",
  inbox_conversation: "inbox:write",
  automation: "automations:write",
};

export async function updateWorkspaceRecordStatusAction(
  entityType: WorkspaceRecordType,
  entityId: string,
  formData: FormData,
) {
  const status = formData.get("status");
  if (typeof status !== "string") {
    throw new AppError("VALIDATION_ERROR", "Choose a record status.");
  }
  const context = await requirePermission(recordPermissions[entityType]);
  await updateWorkspaceRecordStatus(mutationContext(context), entityType, entityId, status);
  revalidatePath("/");
}
