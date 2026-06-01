import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  contact,
  deal,
  followUpTask,
  pipeline,
  pipelineStage,
} from "@/lib/db/schema";

export async function getDefaultPipeline(workspaceId: string) {
  const [record] = await db
    .select()
    .from(pipeline)
    .where(and(eq(pipeline.workspaceId, workspaceId), eq(pipeline.isDefault, true)))
    .limit(1);
  return record;
}

export async function listPipelineStages(workspaceId: string, pipelineId: string) {
  return db
    .select()
    .from(pipelineStage)
    .where(
      and(
        eq(pipelineStage.workspaceId, workspaceId),
        eq(pipelineStage.pipelineId, pipelineId),
      ),
    )
    .orderBy(asc(pipelineStage.position));
}

export async function listPipelineDeals(workspaceId: string, pipelineId: string, ownerUserId?: string) {
  return db
    .select({
      id: deal.id,
      title: deal.title,
      valueCents: deal.valueCents,
      status: deal.status,
      stageId: deal.stageId,
      contactId: deal.contactId,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      expectedCloseAt: deal.expectedCloseAt,
      lastActivityAt: deal.lastActivityAt,
    })
    .from(deal)
    .leftJoin(contact, eq(deal.contactId, contact.id))
    .where(
      and(
        eq(deal.workspaceId, workspaceId),
        eq(deal.pipelineId, pipelineId),
        ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined,
      ),
    )
    .orderBy(desc(deal.updatedAt));
}

export async function getDeal(workspaceId: string, dealId: string, ownerUserId?: string) {
  const [record] = await db
    .select({
      id: deal.id,
      workspaceId: deal.workspaceId,
      pipelineId: deal.pipelineId,
      stageId: deal.stageId,
      title: deal.title,
      valueCents: deal.valueCents,
      status: deal.status,
      contactId: deal.contactId,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
      expectedCloseAt: deal.expectedCloseAt,
      lostReason: deal.lostReason,
      notes: deal.notes,
      createdAt: deal.createdAt,
      lastActivityAt: deal.lastActivityAt,
    })
    .from(deal)
    .leftJoin(contact, eq(deal.contactId, contact.id))
    .where(and(eq(deal.id, dealId), eq(deal.workspaceId, workspaceId), ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined))
    .limit(1);
  return record;
}

export async function listFollowUpTasks(workspaceId: string, status?: string, ownerUserId?: string) {
  return db
    .select({
      id: followUpTask.id,
      title: followUpTask.title,
      dueAt: followUpTask.dueAt,
      priority: followUpTask.priority,
      status: followUpTask.status,
      notes: followUpTask.notes,
      dealId: followUpTask.dealId,
      dealTitle: deal.title,
      contactId: followUpTask.contactId,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
    })
    .from(followUpTask)
    .leftJoin(deal, eq(followUpTask.dealId, deal.id))
    .leftJoin(contact, eq(followUpTask.contactId, contact.id))
    .where(
      and(
        eq(followUpTask.workspaceId, workspaceId),
        status && status !== "all" ? eq(followUpTask.status, status) : undefined,
        ownerUserId ? eq(followUpTask.ownerUserId, ownerUserId) : undefined,
      ),
    )
    .orderBy(asc(followUpTask.dueAt));
}
