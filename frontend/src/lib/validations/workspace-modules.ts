import { z } from "zod";

import { workspaceRoles } from "@/lib/permissions/roles";

const optionalText = z.string().trim().max(2_000).optional().default("");
const optionalDate = z.string().trim().optional().default("");

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(160),
  domain: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().email().optional().or(z.literal("")).default(""),
  phone: z.string().trim().max(80).optional().default(""),
  industry: z.string().trim().max(120).optional().default(""),
  status: z.enum(["prospect", "active", "customer", "inactive"]).default("prospect"),
  notes: optionalText,
});

export const campaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required.").max(160),
  channel: z.enum(["multi_channel", "email", "social", "content"]).default("multi_channel"),
  objective: optionalText,
  status: z.enum(["draft", "planned", "active", "completed", "archived"]).default("draft"),
  budgetCents: z.coerce.number().int().min(0).default(0),
  startsAt: optionalDate,
  endsAt: optionalDate,
});

export const socialPostSchema = z.object({
  campaignId: z.string().trim().optional().default(""),
  platform: z.enum(["linkedin", "facebook", "instagram", "x", "other"]).default("linkedin"),
  content: z.string().trim().min(1, "Post content is required.").max(5_000),
  status: z.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
  scheduledAt: optionalDate,
});

export const emailCampaignSchema = z.object({
  campaignId: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "Email campaign name is required.").max(160),
  subject: z.string().trim().min(1, "Subject is required.").max(240),
  previewText: z.string().trim().max(320).optional().default(""),
  body: z.string().trim().min(1, "Email body is required.").max(20_000),
  status: z.enum(["draft", "scheduled", "sent", "cancelled"]).default("draft"),
  scheduledAt: optionalDate,
});

export const emailSequenceSchema = z.object({
  campaignId: z.string().trim().optional().default(""),
  name: z.string().trim().min(1, "Sequence name is required.").max(160),
  description: optionalText,
  status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
});

export const inboxConversationSchema = z.object({
  contactId: z.string().trim().optional().default(""),
  subject: z.string().trim().min(1, "Conversation subject is required.").max(240),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  message: z.string().trim().min(1, "Add the first internal message.").max(5_000),
});

export const automationSchema = z.object({
  name: z.string().trim().min(1, "Automation name is required.").max(160),
  description: optionalText,
  status: z.enum(["draft", "active", "paused"]).default("draft"),
  triggerType: z.enum([
    "new_lead_added",
    "deal_moved_to_proposal",
    "task_overdue",
    "campaign_completed",
    "deal_marked_won",
  ]),
  actionType: z.enum([
    "create_task",
    "create_follow_up_reminder",
    "notify_inside_dashboard",
    "create_review_task",
    "create_customer_follow_up_task",
  ]),
});

export const workspaceSettingsSchema = z.object({
  timezone: z.string().trim().min(1).max(80),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  brandVoice: optionalText,
  emailFromName: z.string().trim().max(160).optional().default(""),
  requireContentReview: z.boolean().default(true),
});

export const addTeamMemberSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(workspaceRoles).exclude(["owner"]),
});

export const updateTeamMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(workspaceRoles).exclude(["owner"]),
});
