import "server-only";

import { and, asc, count, desc, eq, isNull, lt, sql, sum } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  contact,
  deal,
  followUpTask,
} from "@/lib/db/schema";

export async function getDashboardData(workspaceId: string) {
  const now = new Date();
  const staleBefore = new Date(now);
  staleBefore.setDate(staleBefore.getDate() - 7);

  const [
    [contactMetric],
    [pipelineMetric],
    [overdueMetric],
    [staleMetric],
    priorityTasks,
    staleDeals,
    recentActivity,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(contact)
      .where(and(eq(contact.workspaceId, workspaceId), isNull(contact.removedAt))),
    db
      .select({ value: sum(deal.valueCents) })
      .from(deal)
      .where(and(eq(deal.workspaceId, workspaceId), eq(deal.status, "open"))),
    db
      .select({ value: count() })
      .from(followUpTask)
      .where(
        and(
          eq(followUpTask.workspaceId, workspaceId),
          eq(followUpTask.status, "open"),
          lt(followUpTask.dueAt, now),
        ),
      ),
    db
      .select({ value: count() })
      .from(deal)
      .where(
        and(
          eq(deal.workspaceId, workspaceId),
          eq(deal.status, "open"),
          lt(deal.lastActivityAt, staleBefore),
        ),
      ),
    db
      .select()
      .from(followUpTask)
      .where(
        and(
          eq(followUpTask.workspaceId, workspaceId),
          eq(followUpTask.status, "open"),
        ),
      )
      .orderBy(
        sql`case ${followUpTask.priority} when 'high' then 1 when 'medium' then 2 else 3 end`,
        asc(followUpTask.dueAt),
      )
      .limit(5),
    db
      .select()
      .from(deal)
      .where(
        and(
          eq(deal.workspaceId, workspaceId),
          eq(deal.status, "open"),
          lt(deal.lastActivityAt, staleBefore),
        ),
      )
      .orderBy(asc(deal.lastActivityAt))
      .limit(5),
    db
      .select()
      .from(activityEntry)
      .where(eq(activityEntry.workspaceId, workspaceId))
      .orderBy(desc(activityEntry.createdAt))
      .limit(8),
  ]);

  return {
    metrics: {
      contacts: contactMetric.value,
      openPipelineCents: Number(pipelineMetric.value ?? 0),
      overdueTasks: overdueMetric.value,
      staleDeals: staleMetric.value,
    },
    priorityTasks,
    staleDeals,
    recentActivity,
  };
}
