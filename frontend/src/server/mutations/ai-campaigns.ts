import "server-only";

import { and, eq } from "drizzle-orm";

import { requestCampaignPlan } from "@/lib/ai/backend";
import { db } from "@/lib/db";
import {
  businessProfile,
  campaign,
  campaignAiRequest,
  contentApproval,
  emailCampaign,
  followUpTask,
  offer,
  socialPost,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import type {
  CampaignPlanRequestInput,
} from "@/lib/validations/ai-campaigns";
import { recordActivity } from "@/server/mutations/activity";

type MutationContext = { workspaceId: string; userId: string };

function id() {
  return crypto.randomUUID();
}

function dueDate(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export async function generateCampaignDrafts(
  context: MutationContext,
  input: CampaignPlanRequestInput,
) {
  const [[profile], [campaignRecord], [offerRecord]] = await Promise.all([
    db
      .select()
      .from(businessProfile)
      .where(eq(businessProfile.workspaceId, context.workspaceId))
      .limit(1),
    db
      .select({ id: campaign.id })
      .from(campaign)
      .where(
        and(
          eq(campaign.id, input.campaignId),
          eq(campaign.workspaceId, context.workspaceId),
        ),
      )
      .limit(1),
    db
      .select()
      .from(offer)
      .where(
        and(eq(offer.id, input.offerId), eq(offer.workspaceId, context.workspaceId)),
      )
      .limit(1),
  ]);

  if (!profile) throw new AppError("NOT_FOUND", "Complete the workspace profile first.");
  if (!campaignRecord) throw new AppError("NOT_FOUND", "Campaign not found.");
  if (!offerRecord) throw new AppError("NOT_FOUND", "Offer not found.");

  const existing = await db
    .select({ id: campaignAiRequest.id, status: campaignAiRequest.status })
    .from(campaignAiRequest)
    .where(
      and(
        eq(campaignAiRequest.workspaceId, context.workspaceId),
        eq(campaignAiRequest.requestKey, input.requestKey),
      ),
    )
    .limit(1);
  if (existing[0]?.status === "completed") return existing[0].id;

  const requestId = existing[0]?.id ?? id();
  if (!existing.length) {
    await db.insert(campaignAiRequest).values({
      id: requestId,
      workspaceId: context.workspaceId,
      campaignId: input.campaignId,
      offerId: input.offerId,
      requestKey: input.requestKey,
      goal: input.goal,
      targetAudience: input.targetAudience,
      createdByUserId: context.userId,
    });
  }

  try {
    const result = await requestCampaignPlan({
      request_key: input.requestKey,
      workspace_id: context.workspaceId,
      user_id: context.userId,
      campaign_id: input.campaignId,
      goal: input.goal,
      target_audience: input.targetAudience,
      business_profile: {
        business_name: profile.businessName,
        industry: profile.industry,
        target_audience: profile.targetAudience,
        brand_voice: profile.brandVoice,
        products_services: profile.productsServices,
        sales_process: profile.salesProcess,
      },
      offer: {
        id: offerRecord.id,
        name: offerRecord.name,
        description: offerRecord.description,
      },
    });

    await db.transaction(async (tx) => {
      await tx
        .update(campaignAiRequest)
        .set({
          aiRunId: result.ai_run_id,
          summary: result.plan.summary,
          recommendedAngle: result.plan.recommended_angle,
          status: "completed",
          safeErrorMessage: null,
        })
        .where(
          and(
            eq(campaignAiRequest.id, requestId),
            eq(campaignAiRequest.workspaceId, context.workspaceId),
          ),
        );

      for (const [index, draft] of result.plan.social_posts.entries()) {
        const draftId = id();
        await tx.insert(socialPost).values({
          id: draftId,
          workspaceId: context.workspaceId,
          campaignId: input.campaignId,
          createdByUserId: context.userId,
          platform: draft.platform,
          content: draft.content,
          status: "draft",
          generatedByAi: true,
          sourceAiRunId: result.ai_run_id,
        });
        await tx.insert(contentApproval).values({
          id: id(),
          workspaceId: context.workspaceId,
          campaignId: input.campaignId,
          aiRequestId: requestId,
          draftType: "social_post",
          draftId,
          riskFlags: result.risk_flags
            .filter((flag) => flag.draft_kind === "social_post" && flag.draft_index === index)
            .map(({ code, severity, message }) => ({ code, severity, message })),
        });
      }

      for (const [index, draft] of result.plan.email_drafts.entries()) {
        const draftId = id();
        await tx.insert(emailCampaign).values({
          id: draftId,
          workspaceId: context.workspaceId,
          campaignId: input.campaignId,
          createdByUserId: context.userId,
          name: draft.name,
          subject: draft.subject,
          previewText: draft.preview_text,
          body: draft.body,
          status: "draft",
          generatedByAi: true,
          sourceAiRunId: result.ai_run_id,
        });
        await tx.insert(contentApproval).values({
          id: id(),
          workspaceId: context.workspaceId,
          campaignId: input.campaignId,
          aiRequestId: requestId,
          draftType: "email_campaign",
          draftId,
          riskFlags: result.risk_flags
            .filter((flag) => flag.draft_kind === "email" && flag.draft_index === index)
            .map(({ code, severity, message }) => ({ code, severity, message })),
        });
      }

      for (const task of result.plan.follow_up_tasks) {
        await tx.insert(followUpTask).values({
          id: id(),
          workspaceId: context.workspaceId,
          title: task.title,
          dueAt: dueDate(task.due_in_days),
          ownerUserId: context.userId,
          priority: task.priority,
          notes: "Suggested by the supervised campaign planner.",
        });
      }

      await tx.insert(contentApproval).values({
        id: id(),
        workspaceId: context.workspaceId,
        campaignId: input.campaignId,
        aiRequestId: requestId,
        draftType: "campaign_plan",
        draftId: requestId,
        riskFlags: result.risk_flags
          .filter((flag) => flag.draft_kind === "plan")
          .map(({ code, severity, message }) => ({ code, severity, message })),
      });
    });
  } catch (error) {
    await db
      .update(campaignAiRequest)
      .set({
        status: "failed",
        safeErrorMessage:
          error instanceof AppError
            ? error.message
            : "Campaign planning did not complete. Try again.",
      })
      .where(
        and(
          eq(campaignAiRequest.id, requestId),
          eq(campaignAiRequest.workspaceId, context.workspaceId),
        ),
      );
    throw error;
  }

  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "campaign",
    entityId: input.campaignId,
    action: "campaign.ai_drafts_created",
    summary: "Supervised AI campaign drafts created for review",
  });
  return requestId;
}

export async function decideContentApproval(
  context: MutationContext,
  input: { approvalId: string; decision: "approved" | "rejected" },
) {
  const updated = await db
    .update(contentApproval)
    .set({
      status: input.decision,
      reviewedByUserId: context.userId,
      reviewedAt: new Date(),
    })
    .where(
      and(
        eq(contentApproval.id, input.approvalId),
        eq(contentApproval.workspaceId, context.workspaceId),
        eq(contentApproval.status, "pending"),
      ),
    )
    .returning({
      id: contentApproval.id,
      draftType: contentApproval.draftType,
      draftId: contentApproval.draftId,
    });
  if (!updated.length) {
    throw new AppError("NOT_FOUND", "Pending approval item not found.");
  }
  await recordActivity({
    ...context,
    actorUserId: context.userId,
    entityType: "content_approval",
    entityId: input.approvalId,
    action: `content_approval.${input.decision}`,
    summary: `AI ${updated[0].draftType.replaceAll("_", " ")} ${input.decision}`,
  });
}
