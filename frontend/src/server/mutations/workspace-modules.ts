import "server-only";

import { and, eq } from "drizzle-orm";

import { parseLocalToUtc } from "@/lib/date-utils";
import { db } from "@/lib/db";
import {
  automation,
  automationAction,
  automationCondition,
  automationTrigger,
  campaign,
  company,
  contact,
  emailCampaign,
  emailSequence,
  inboxConversation,
  inboxMessage,
  socialPost,
  user,
  workspaceMember,
  workspaceSetting,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import type {
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
import { recordActivity } from "@/server/mutations/activity";
import { getWorkspaceSettings } from "@/server/queries/workspace-modules";
import type { z } from "zod";

type MutationContext = { workspaceId: string; userId: string };
type CompanyInput = z.infer<typeof companySchema>;
type CampaignInput = z.infer<typeof campaignSchema>;
type SocialPostInput = z.infer<typeof socialPostSchema>;
type EmailCampaignInput = z.infer<typeof emailCampaignSchema>;
type EmailSequenceInput = z.infer<typeof emailSequenceSchema>;
type InboxConversationInput = z.infer<typeof inboxConversationSchema>;
type AutomationInput = z.infer<typeof automationSchema>;
type WorkspaceSettingsInput = z.infer<typeof workspaceSettingsSchema>;
type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>;
export type WorkspaceRecordType =
  | "company"
  | "campaign"
  | "social_post"
  | "email_campaign"
  | "email_sequence"
  | "inbox_conversation"
  | "automation";

function id() {
  return crypto.randomUUID();
}

function optionalDate(value: string) {
  return value ? new Date(value) : null;
}

function optionalId(value: string) {
  return value || null;
}

async function requireWorkspaceCampaign(workspaceId: string, campaignId: string) {
  if (!campaignId) return;
  const [record] = await db
    .select({ id: campaign.id })
    .from(campaign)
    .where(and(eq(campaign.id, campaignId), eq(campaign.workspaceId, workspaceId)))
    .limit(1);
  if (!record) throw new AppError("NOT_FOUND", "Campaign not found.");
}

async function requireWorkspaceContact(workspaceId: string, contactId: string) {
  if (!contactId) return;
  const [record] = await db
    .select({ id: contact.id })
    .from(contact)
    .where(and(eq(contact.id, contactId), eq(contact.workspaceId, workspaceId)))
    .limit(1);
  if (!record) throw new AppError("NOT_FOUND", "Contact not found.");
}

async function logCreated(
  context: MutationContext,
  entityType: string,
  entityId: string,
  summary: string,
) {
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType,
    entityId,
    action: `${entityType}.created`,
    summary,
  });
}

export async function createCompany(context: MutationContext, input: CompanyInput) {
  const companyId = id();
  await db.insert(company).values({
    id: companyId,
    workspaceId: context.workspaceId,
    name: input.name,
    website: input.website,
    email: input.email,
    phone: input.phone,
    industry: input.industry,
    status: input.status,
    notes: input.notes,
  });
  await logCreated(context, "company", companyId, `${input.name} added to companies`);
  return companyId;
}

export async function createCampaign(context: MutationContext, input: CampaignInput) {
  const campaignId = id();
  await db.insert(campaign).values({
    id: campaignId,
    workspaceId: context.workspaceId,
    ownerUserId: context.userId,
    name: input.name,
    channel: input.channel,
    objective: input.objective,
    status: input.status,
    budgetCents: input.budgetCents,
    startsAt: optionalDate(input.startsAt),
    endsAt: optionalDate(input.endsAt),
  });
  await logCreated(context, "campaign", campaignId, `${input.name} campaign created`);
  return campaignId;
}

export async function createSocialPost(context: MutationContext, input: SocialPostInput) {
  await requireWorkspaceCampaign(context.workspaceId, input.campaignId);
  const settings = await getWorkspaceSettings(context.workspaceId);
  const tz = settings?.timezone || "UTC";
  const scheduledDate = input.scheduledAt ? parseLocalToUtc(input.scheduledAt, tz) : null;

  const socialPostId = id();
  await db.insert(socialPost).values({
    id: socialPostId,
    workspaceId: context.workspaceId,
    campaignId: optionalId(input.campaignId),
    createdByUserId: context.userId,
    platform: input.platform,
    content: input.content,
    status: input.status,
    scheduledAt: scheduledDate,
  });
  await logCreated(context, "social_post", socialPostId, `${input.platform} post saved`);
  return socialPostId;
}

export async function createEmailCampaign(
  context: MutationContext,
  input: EmailCampaignInput,
) {
  await requireWorkspaceCampaign(context.workspaceId, input.campaignId);
  const settings = await getWorkspaceSettings(context.workspaceId);
  const tz = settings?.timezone || "UTC";
  const scheduledDate = input.scheduledAt ? parseLocalToUtc(input.scheduledAt, tz) : null;

  const emailCampaignId = id();
  await db.insert(emailCampaign).values({
    id: emailCampaignId,
    workspaceId: context.workspaceId,
    campaignId: optionalId(input.campaignId),
    createdByUserId: context.userId,
    name: input.name,
    subject: input.subject,
    previewText: input.previewText,
    body: input.body,
    status: input.status,
    scheduledAt: scheduledDate,
  });
  await logCreated(context, "email_campaign", emailCampaignId, `${input.name} email draft saved`);
  return emailCampaignId;
}

export async function createEmailSequence(
  context: MutationContext,
  input: EmailSequenceInput,
) {
  await requireWorkspaceCampaign(context.workspaceId, input.campaignId);
  const sequenceId = id();
  await db.insert(emailSequence).values({
    id: sequenceId,
    workspaceId: context.workspaceId,
    campaignId: optionalId(input.campaignId),
    createdByUserId: context.userId,
    name: input.name,
    description: input.description,
    status: input.status,
  });
  await logCreated(context, "email_sequence", sequenceId, `${input.name} sequence created`);
  return sequenceId;
}

export async function createInboxConversation(
  context: MutationContext,
  input: InboxConversationInput,
) {
  await requireWorkspaceContact(context.workspaceId, input.contactId);
  const conversationId = id();
  await db.insert(inboxConversation).values({
    id: conversationId,
    workspaceId: context.workspaceId,
    contactId: optionalId(input.contactId),
    subject: input.subject,
    priority: input.priority,
    channel: "internal_note",
    assignedUserId: context.userId,
  });
  await db.insert(inboxMessage).values({
    id: id(),
    workspaceId: context.workspaceId,
    conversationId,
    body: input.message,
    senderKind: "workspace_user",
    createdByUserId: context.userId,
  });
  await logCreated(context, "inbox_conversation", conversationId, `${input.subject} opened`);
  return conversationId;
}

export async function createAutomation(context: MutationContext, input: AutomationInput) {
  const automationId = id();
  await db.insert(automation).values({
    id: automationId,
    workspaceId: context.workspaceId,
    createdByUserId: context.userId,
    name: input.name,
    description: input.description,
    status: input.status ?? "draft",
  });
  await db.insert(automationTrigger).values({
    id: id(),
    workspaceId: context.workspaceId,
    automationId,
    type: input.triggerType,
  });
  await db.insert(automationAction).values({
    id: id(),
    workspaceId: context.workspaceId,
    automationId,
    type: input.actionType,
    position: 0,
  });
  await logCreated(context, "automation", automationId, `${input.name} rule created`);
  return automationId;
}

export async function updateAutomation(
  context: MutationContext,
  automationId: string,
  input: AutomationInput & { triggerConfig?: Record<string, string>; conditions?: { field: string; operator: string; value: string }[] },
) {
  const [existing] = await db
    .select({ id: automation.id })
    .from(automation)
    .where(and(eq(automation.id, automationId), eq(automation.workspaceId, context.workspaceId)))
    .limit(1);
  if (!existing) throw new AppError("NOT_FOUND", "Automation not found.");

  await db
    .update(automation)
    .set({ name: input.name, description: input.description, status: input.status ?? "draft" })
    .where(eq(automation.id, automationId));

  if (input.triggerType) {
    const [trigger] = await db
      .select({ id: automationTrigger.id })
      .from(automationTrigger)
      .where(eq(automationTrigger.automationId, automationId))
      .limit(1);
    if (trigger) {
      await db
        .update(automationTrigger)
        .set({ type: input.triggerType, config: input.triggerConfig ?? {} })
        .where(eq(automationTrigger.id, trigger.id));
    } else {
      await db.insert(automationTrigger).values({
        id: id(), workspaceId: context.workspaceId, automationId,
        type: input.triggerType, config: input.triggerConfig ?? {},
      });
    }
  }

  if (input.conditions) {
    await db.delete(automationCondition).where(eq(automationCondition.automationId, automationId));
    if (input.conditions.length > 0) {
      await db.insert(automationCondition).values(
        input.conditions.map((c, i) => ({
          id: id(), workspaceId: context.workspaceId, automationId,
          field: c.field, operator: c.operator, value: c.value, position: i,
        })),
      );
    }
  }

  if (input.actionType) {
    const [action] = await db
      .select({ id: automationAction.id })
      .from(automationAction)
      .where(eq(automationAction.automationId, automationId))
      .limit(1);
    if (action) {
      await db
        .update(automationAction)
        .set({ type: input.actionType, position: 0 })
        .where(eq(automationAction.id, action.id));
    } else {
      await db.insert(automationAction).values({
        id: id(), workspaceId: context.workspaceId, automationId,
        type: input.actionType, position: 0,
      });
    }
  }

  await recordActivity({
    ...context, actorUserId: context.userId,
    entityType: "automation", entityId: automationId,
    action: "automation.updated", summary: `${input.name} rule updated`,
  });
}

export async function saveWorkspaceSettings(
  context: MutationContext,
  input: WorkspaceSettingsInput,
) {
  const values = {
    timezone: input.timezone,
    currency: input.currency,
    brandVoice: input.brandVoice,
    emailFromName: input.emailFromName,
    requireContentReview: input.requireContentReview,
  };
  await db
    .insert(workspaceSetting)
    .values({ id: id(), workspaceId: context.workspaceId, ...values })
    .onConflictDoUpdate({
      target: workspaceSetting.workspaceId,
      set: values,
    });
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "workspace_setting",
    entityId: context.workspaceId,
    action: "workspace_setting.updated",
    summary: "Workspace preferences updated",
  });
}

export async function addTeamMember(context: MutationContext, input: AddTeamMemberInput) {
  const [account] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (!account) {
    throw new AppError(
      "NOT_FOUND",
      "That email must create an account before it can be added to this workspace.",
    );
  }

  const [existing] = await db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, context.workspaceId),
        eq(workspaceMember.userId, account.id),
      ),
    )
    .limit(1);

  if (existing) {
    throw new AppError("CONFLICT", "That user is already a workspace member.");
  }

  const memberId = id();
  const inserted = await db
    .insert(workspaceMember)
    .values({
      id: memberId,
      workspaceId: context.workspaceId,
      userId: account.id,
      role: input.role,
    })
    .onConflictDoNothing({
      target: [workspaceMember.workspaceId, workspaceMember.userId],
    })
    .returning({ id: workspaceMember.id });
  if (!inserted.length) {
    throw new AppError("CONFLICT", "That user is already a workspace member.");
  }
  await logCreated(context, "workspace_member", memberId, `${input.email} added as ${input.role}`);
  return memberId;
}

export async function updateTeamMemberRole(
  context: MutationContext,
  input: UpdateTeamMemberRoleInput,
) {
  const [member] = await db
    .select({ id: workspaceMember.id, role: workspaceMember.role })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.id, input.memberId),
        eq(workspaceMember.workspaceId, context.workspaceId),
      ),
    )
    .limit(1);

  if (!member) throw new AppError("NOT_FOUND", "Workspace member not found.");
  if (member.role === "owner") {
    throw new AppError("FORBIDDEN", "The workspace owner role cannot be reassigned.");
  }

  await db
    .update(workspaceMember)
    .set({ role: input.role })
    .where(
      and(
        eq(workspaceMember.id, input.memberId),
        eq(workspaceMember.workspaceId, context.workspaceId),
      ),
    );
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "workspace_member",
    entityId: input.memberId,
    action: "workspace_member.role_updated",
    summary: `Workspace member role changed to ${input.role}`,
  });
}

const allowedStatuses: Record<WorkspaceRecordType, readonly string[]> = {
  company: ["prospect", "active", "customer", "inactive"],
  campaign: ["draft", "planned", "active", "completed", "archived"],
  social_post: ["draft", "scheduled", "published", "cancelled"],
  email_campaign: ["draft", "scheduled", "sent", "cancelled"],
  email_sequence: ["draft", "active", "paused", "archived"],
  inbox_conversation: ["open", "pending", "closed"],
  automation: ["draft", "active", "paused"],
};

export async function updateWorkspaceRecordStatus(
  context: MutationContext,
  entityType: WorkspaceRecordType,
  entityId: string,
  status: string,
) {
  if (!allowedStatuses[entityType].includes(status)) {
    throw new AppError("VALIDATION_ERROR", "Choose a valid record status.");
  }

  let updated: { id: string }[] = [];
  switch (entityType) {
    case "company":
      updated = await db.update(company).set({ status }).where(and(eq(company.id, entityId), eq(company.workspaceId, context.workspaceId))).returning({ id: company.id });
      break;
    case "campaign":
      updated = await db.update(campaign).set({ status }).where(and(eq(campaign.id, entityId), eq(campaign.workspaceId, context.workspaceId))).returning({ id: campaign.id });
      break;
    case "social_post":
      updated = await db.update(socialPost).set({ status }).where(and(eq(socialPost.id, entityId), eq(socialPost.workspaceId, context.workspaceId))).returning({ id: socialPost.id });
      break;
    case "email_campaign":
      updated = await db.update(emailCampaign).set({ status }).where(and(eq(emailCampaign.id, entityId), eq(emailCampaign.workspaceId, context.workspaceId))).returning({ id: emailCampaign.id });
      break;
    case "email_sequence":
      updated = await db.update(emailSequence).set({ status }).where(and(eq(emailSequence.id, entityId), eq(emailSequence.workspaceId, context.workspaceId))).returning({ id: emailSequence.id });
      break;
    case "inbox_conversation":
      updated = await db.update(inboxConversation).set({ status }).where(and(eq(inboxConversation.id, entityId), eq(inboxConversation.workspaceId, context.workspaceId))).returning({ id: inboxConversation.id });
      break;
    case "automation":
      updated = await db.update(automation).set({ status }).where(and(eq(automation.id, entityId), eq(automation.workspaceId, context.workspaceId))).returning({ id: automation.id });
      break;
  }

  if (!updated.length) throw new AppError("NOT_FOUND", "Workspace record not found.");
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType,
    entityId,
    action: `${entityType}.status_updated`,
    summary: `${entityType.replaceAll("_", " ")} status changed to ${status}`,
  });
}
