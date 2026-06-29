import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  campaign,
  campaignAiRequest,
  contentApproval,
  offer,
} from "@/lib/db/schema";

export async function listActiveOffers(workspaceId: string) {
  return db
    .select({ id: offer.id, name: offer.name, description: offer.description })
    .from(offer)
    .where(eq(offer.workspaceId, workspaceId))
    .orderBy(desc(offer.updatedAt))
    .limit(100);
}

export async function listCampaignAiRequests(workspaceId: string) {
  return db
    .select({
      id: campaignAiRequest.id,
      campaignName: campaign.name,
      goal: campaignAiRequest.goal,
      summary: campaignAiRequest.summary,
      recommendedAngle: campaignAiRequest.recommendedAngle,
      status: campaignAiRequest.status,
      safeErrorMessage: campaignAiRequest.safeErrorMessage,
      createdAt: campaignAiRequest.createdAt,
    })
    .from(campaignAiRequest)
    .innerJoin(campaign, eq(campaignAiRequest.campaignId, campaign.id))
    .where(eq(campaignAiRequest.workspaceId, workspaceId))
    .orderBy(desc(campaignAiRequest.createdAt))
    .limit(20);
}

export async function listContentApprovals(workspaceId: string) {
  return db
    .select({
      id: contentApproval.id,
      campaignName: campaign.name,
      draftType: contentApproval.draftType,
      draftId: contentApproval.draftId,
      status: contentApproval.status,
      riskFlags: contentApproval.riskFlags,
      createdAt: contentApproval.createdAt,
    })
    .from(contentApproval)
    .innerJoin(campaign, eq(contentApproval.campaignId, campaign.id))
    .where(eq(contentApproval.workspaceId, workspaceId))
    .orderBy(desc(contentApproval.createdAt))
    .limit(100);
}
