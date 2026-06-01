import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  businessProfile,
  offer,
  pipeline,
  pipelineStage,
  workspace,
  workspaceMember,
} from "@/lib/db/schema";
import type { OnboardingInput } from "@/lib/validations/onboarding";

const defaultStages = [
  ["New Lead", null],
  ["Contacted", null],
  ["Qualified", null],
  ["Meeting Booked", null],
  ["Proposal Sent", null],
  ["Negotiation", null],
  ["Won", "won"],
  ["Lost", "lost"],
] as const;

function id() {
  return crypto.randomUUID();
}

function slugify(value: string) {
  return `${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${id().slice(0, 8)}`;
}

export async function createWorkspaceForUser(
  userId: string,
  input: OnboardingInput,
) {
  const [existing] = await db
    .select({ workspaceId: workspaceMember.workspaceId })
    .from(workspaceMember)
    .where(eq(workspaceMember.userId, userId))
    .limit(1);

  if (existing) {
    return existing.workspaceId;
  }

  const workspaceId = id();
  const pipelineId = id();

  return db.transaction(async (tx) => {
    await tx.insert(workspace).values({
      id: workspaceId,
      name: input.businessName,
      slug: slugify(input.businessName),
    });
    await tx.insert(workspaceMember).values({
      id: id(),
      workspaceId,
      userId,
      role: "owner",
    });
    await tx.insert(businessProfile).values({
      id: id(),
      workspaceId,
      businessName: input.businessName,
      industry: input.industry,
      targetAudience: input.targetAudience,
      brandVoice: input.brandVoice,
      productsServices: input.productsServices,
      salesProcess: input.salesProcess,
    });
    await tx.insert(offer).values({
      id: id(),
      workspaceId,
      name: input.offerName,
      description: input.offerDescription,
    });
    await tx.insert(pipeline).values({
      id: pipelineId,
      workspaceId,
      name: "Sales Pipeline",
    });
    await tx.insert(pipelineStage).values(
      defaultStages.map(([name, terminalKind], position) => ({
        id: id(),
        workspaceId,
        pipelineId,
        name,
        position,
        terminalKind,
      })),
    );
    await tx.insert(activityEntry).values({
      id: id(),
      workspaceId,
      actorUserId: userId,
      entityType: "workspace",
      entityId: workspaceId,
      action: "workspace.created",
      summary: `${input.businessName} workspace created`,
    });

    return workspaceId;
  });
}

export async function updateWorkspaceProfile(
  workspaceId: string,
  userId: string,
  input: OnboardingInput,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(workspace)
      .set({ name: input.businessName })
      .where(eq(workspace.id, workspaceId));
    await tx
      .update(businessProfile)
      .set({
        businessName: input.businessName,
        industry: input.industry,
        targetAudience: input.targetAudience,
        brandVoice: input.brandVoice,
        productsServices: input.productsServices,
        salesProcess: input.salesProcess,
      })
      .where(eq(businessProfile.workspaceId, workspaceId));
    await tx
      .update(offer)
      .set({
        name: input.offerName,
        description: input.offerDescription,
      })
      .where(eq(offer.workspaceId, workspaceId));
    await tx.insert(activityEntry).values({
      id: id(),
      workspaceId,
      actorUserId: userId,
      entityType: "workspace",
      entityId: workspaceId,
      action: "workspace.profile_updated",
      summary: "Workspace profile updated",
    });
  });
}
