import { z } from "zod";

export const campaignPlanRequestSchema = z.object({
  requestKey: z.string().uuid(),
  campaignId: z.string().uuid(),
  offerId: z.string().uuid(),
  goal: z.string().trim().min(8, "Describe the campaign goal.").max(2_000),
  targetAudience: z
    .string()
    .trim()
    .min(8, "Describe the audience for this campaign.")
    .max(2_000),
});

export const contentApprovalDecisionSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

const socialPostDraftSchema = z.object({
  platform: z.enum(["linkedin", "facebook", "instagram", "x"]),
  content: z.string().min(1).max(5_000),
});

const emailDraftSchema = z.object({
  name: z.string().min(1).max(160),
  subject: z.string().min(1).max(240),
  preview_text: z.string().max(320),
  body: z.string().min(1).max(20_000),
});

const followUpTaskDraftSchema = z.object({
  title: z.string().min(1).max(240),
  due_in_days: z.number().int().min(0).max(90),
  priority: z.enum(["low", "medium", "high"]),
});

const guardrailFindingSchema = z.object({
  code: z.string().min(1).max(80),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string().min(1).max(400),
  draft_kind: z.enum(["plan", "social_post", "email"]),
  draft_index: z.number().int().min(0).nullable().optional(),
});

export const campaignPlanResponseSchema = z.object({
  ai_run_id: z.string().uuid(),
  approval_required: z.literal(true),
  plan: z.object({
    summary: z.string().min(1).max(4_000),
    recommended_angle: z.string().min(1).max(2_000),
    social_posts: z.array(socialPostDraftSchema).min(1).max(8),
    email_drafts: z.array(emailDraftSchema).min(1).max(4),
    follow_up_tasks: z.array(followUpTaskDraftSchema).min(1).max(8),
  }),
  risk_flags: z.array(guardrailFindingSchema),
});

export type CampaignPlanRequestInput = z.infer<typeof campaignPlanRequestSchema>;
export type CampaignPlanResponse = z.infer<typeof campaignPlanResponseSchema>;
