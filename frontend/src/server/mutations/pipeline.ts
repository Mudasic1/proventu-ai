import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  contact,
  deal,
  followUpTask,
  pipeline,
  pipelineStage,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import type { DealInput, TaskInput } from "@/lib/validations/pipeline";
import { recordActivity } from "@/server/mutations/activity";
import { getDeal } from "@/server/queries/pipeline";

type MutationContext = { workspaceId: string; userId: string; role: string };

function ownerScope(context: MutationContext) {
  return context.role === "sales_rep" ? context.userId : undefined;
}

async function requireStage(workspaceId: string, stageId: string) {
  const [stage] = await db
    .select()
    .from(pipelineStage)
    .where(
      and(
        eq(pipelineStage.workspaceId, workspaceId),
        eq(pipelineStage.id, stageId),
      ),
    )
    .limit(1);
  if (!stage) throw new AppError("NOT_FOUND", "Pipeline stage not found.");
  return stage;
}

async function requireContact(workspaceId: string, contactId?: string) {
  if (!contactId) return;
  const [record] = await db
    .select({ id: contact.id })
    .from(contact)
    .where(and(eq(contact.workspaceId, workspaceId), eq(contact.id, contactId)))
    .limit(1);
  if (!record) throw new AppError("NOT_FOUND", "Contact not found.");
}

export async function createDeal(context: MutationContext, input: DealInput) {
  const stage = await requireStage(context.workspaceId, input.stageId);
  if (stage.terminalKind) {
    throw new AppError("VALIDATION_ERROR", "Start new deals in an active stage.");
  }
  await requireContact(context.workspaceId, input.contactId);
  const [pipelineRecord] = await db
    .select({ id: pipeline.id })
    .from(pipeline)
    .where(
      and(
        eq(pipeline.id, stage.pipelineId),
        eq(pipeline.workspaceId, context.workspaceId),
      ),
    )
    .limit(1);
  if (!pipelineRecord) throw new AppError("NOT_FOUND", "Pipeline not found.");

  const dealId = crypto.randomUUID();
  await db.insert(deal).values({
    id: dealId,
    workspaceId: context.workspaceId,
    pipelineId: stage.pipelineId,
    stageId: stage.id,
    contactId: input.contactId,
    ownerUserId: context.userId,
    title: input.title,
    valueCents: Math.round(input.value * 100),
    expectedCloseAt: input.expectedCloseAt ? new Date(input.expectedCloseAt) : undefined,
    notes: input.notes,
  });
  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "deal",
    entityId: dealId,
    action: "deal.created",
    summary: `${input.title} added to ${stage.name}`,
  });
  return dealId;
}

export async function moveDeal(
  context: MutationContext,
  dealId: string,
  stageId: string,
) {
  const record = await getDeal(context.workspaceId, dealId, ownerScope(context));
  if (!record) throw new AppError("NOT_FOUND", "Deal not found.");
  if (record.status !== "open") {
    throw new AppError("CONFLICT", "Closed deals cannot move between active stages.");
  }
  const stage = await requireStage(context.workspaceId, stageId);
  if (stage.pipelineId !== record.pipelineId || stage.terminalKind) {
    throw new AppError("VALIDATION_ERROR", "Choose an active stage in this pipeline.");
  }
  await db
    .update(deal)
    .set({ stageId, lastActivityAt: new Date() })
    .where(and(eq(deal.id, dealId), eq(deal.workspaceId, context.workspaceId)));
  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "deal",
    entityId: dealId,
    action: "deal.stage_moved",
    summary: `${record.title} moved to ${stage.name}`,
  });
}

export async function closeDeal(
  context: MutationContext,
  dealId: string,
  outcome: "won" | "lost",
  lostReason?: string,
) {
  const record = await getDeal(context.workspaceId, dealId, ownerScope(context));
  if (!record) throw new AppError("NOT_FOUND", "Deal not found.");
  if (record.status !== "open") {
    throw new AppError("CONFLICT", "This deal is already closed.");
  }
  const [stage] = await db
    .select()
    .from(pipelineStage)
    .where(
      and(
        eq(pipelineStage.workspaceId, context.workspaceId),
        eq(pipelineStage.pipelineId, record.pipelineId),
        eq(pipelineStage.terminalKind, outcome),
      ),
    )
    .limit(1);
  if (!stage) throw new AppError("NOT_FOUND", "Closure stage not found.");
  const closedAt = new Date();
  await db
    .update(deal)
    .set({
      stageId: stage.id,
      status: outcome,
      closedAt,
      lastActivityAt: closedAt,
      lostReason: outcome === "lost" ? lostReason : null,
    })
    .where(and(eq(deal.id, dealId), eq(deal.workspaceId, context.workspaceId)));
  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "deal",
    entityId: dealId,
    action: `deal.${outcome}`,
    summary: `${record.title} closed as ${outcome}`,
    metadata: lostReason ? { lostReason } : undefined,
  });
}

export async function createFollowUpTask(
  context: MutationContext,
  input: TaskInput,
) {
  await requireContact(context.workspaceId, input.contactId);
  if (input.dealId && !(await getDeal(context.workspaceId, input.dealId, ownerScope(context)))) {
    throw new AppError("NOT_FOUND", "Deal not found.");
  }
  const taskId = crypto.randomUUID();
  await db.insert(followUpTask).values({
    id: taskId,
    workspaceId: context.workspaceId,
    ownerUserId: context.userId,
    contactId: input.contactId,
    dealId: input.dealId,
    title: input.title,
    dueAt: new Date(input.dueAt),
    priority: input.priority,
    notes: input.notes,
  });
  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "task",
    entityId: taskId,
    action: "task.created",
    summary: `${input.title} follow-up added`,
  });
  return taskId;
}

export async function completeFollowUpTask(
  context: MutationContext,
  taskId: string,
) {
  const [task] = await db
    .select()
    .from(followUpTask)
    .where(
      and(
        eq(followUpTask.workspaceId, context.workspaceId),
        eq(followUpTask.id, taskId),
        context.role === "sales_rep" ? eq(followUpTask.ownerUserId, context.userId) : undefined,
      ),
    )
    .limit(1);
  if (!task) throw new AppError("NOT_FOUND", "Follow-up task not found.");
  if (task.status === "completed") return;
  await db
    .update(followUpTask)
    .set({ status: "completed", completedAt: new Date() })
    .where(
      and(
        eq(followUpTask.workspaceId, context.workspaceId),
        eq(followUpTask.id, taskId),
      ),
    );
  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "task",
    entityId: taskId,
    action: "task.completed",
    summary: `${task.title} marked complete`,
  });
}
