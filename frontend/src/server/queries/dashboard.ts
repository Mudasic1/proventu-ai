import "server-only";

import { and, asc, count, desc, eq, gte, isNull, lt, lte, sql, sum } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  campaign,
  contact,
  deal,
  emailCampaign,
  followUpTask,
  socialPost,
} from "@/lib/db/schema";

export async function getDashboardData(workspaceId: string, ownerUserId?: string) {
  const now = new Date();
  const staleBefore = new Date(now);
  staleBefore.setDate(staleBefore.getDate() - 7);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const [
    [contactMetric],
    [leadsThisWeekMetric],
    [pipelineMetric],
    [forecastMetric],
    [overdueMetric],
    [tasksDueTodayMetric],
    [staleMetric],
    [activeCampaignsMetric],
    [scheduledPostsMetric],
    [emailDraftsMetric],
    priorityTasks,
    staleDeals,
    hotLeads,
    recentActivity,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(contact)
      .where(and(eq(contact.workspaceId, workspaceId), isNull(contact.removedAt), ownerUserId ? eq(contact.ownerUserId, ownerUserId) : undefined)),
    db
      .select({ value: count() })
      .from(contact)
      .where(
        and(
          eq(contact.workspaceId, workspaceId),
          isNull(contact.removedAt),
          ownerUserId ? eq(contact.ownerUserId, ownerUserId) : undefined,
          gte(contact.createdAt, weekStart),
        ),
      ),
    db
      .select({ value: sum(deal.valueCents) })
      .from(deal)
      .where(and(eq(deal.workspaceId, workspaceId), eq(deal.status, "open"), ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined)),
    db
      .select({ value: sum(sql<number>`${deal.valueCents} * ${deal.probability} / 100`) })
      .from(deal)
      .where(and(eq(deal.workspaceId, workspaceId), eq(deal.status, "open"), ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined)),
    db
      .select({ value: count() })
      .from(followUpTask)
      .where(
        and(
          eq(followUpTask.workspaceId, workspaceId),
          eq(followUpTask.status, "open"),
          ownerUserId ? eq(followUpTask.ownerUserId, ownerUserId) : undefined,
          lt(followUpTask.dueAt, now),
        ),
      ),
    db
      .select({ value: count() })
      .from(followUpTask)
      .where(
        and(
          eq(followUpTask.workspaceId, workspaceId),
          eq(followUpTask.status, "open"),
          ownerUserId ? eq(followUpTask.ownerUserId, ownerUserId) : undefined,
          gte(followUpTask.dueAt, todayStart),
          lte(followUpTask.dueAt, todayEnd),
        ),
      ),
    db
      .select({ value: count() })
      .from(deal)
      .where(
        and(
          eq(deal.workspaceId, workspaceId),
          eq(deal.status, "open"),
          ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined,
          lt(deal.lastActivityAt, staleBefore),
        ),
      ),
    db
      .select({ value: count() })
      .from(campaign)
      .where(and(eq(campaign.workspaceId, workspaceId), eq(campaign.status, "active"))),
    db
      .select({ value: count() })
      .from(socialPost)
      .where(
        and(eq(socialPost.workspaceId, workspaceId), eq(socialPost.status, "scheduled")),
      ),
    db
      .select({ value: count() })
      .from(emailCampaign)
      .where(
        and(eq(emailCampaign.workspaceId, workspaceId), eq(emailCampaign.status, "draft")),
      ),
    db
      .select()
      .from(followUpTask)
      .where(
        and(
          eq(followUpTask.workspaceId, workspaceId),
          eq(followUpTask.status, "open"),
          ownerUserId ? eq(followUpTask.ownerUserId, ownerUserId) : undefined,
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
          ownerUserId ? eq(deal.ownerUserId, ownerUserId) : undefined,
          lt(deal.lastActivityAt, staleBefore),
        ),
      )
      .orderBy(asc(deal.lastActivityAt))
      .limit(5),
    db
      .select()
      .from(contact)
      .where(
        and(
          eq(contact.workspaceId, workspaceId),
          isNull(contact.removedAt),
          eq(contact.status, "qualified"),
          ownerUserId ? eq(contact.ownerUserId, ownerUserId) : undefined,
        ),
      )
      .orderBy(desc(contact.updatedAt))
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
      leadsThisWeek: leadsThisWeekMetric.value,
      openPipelineCents: Number(pipelineMetric.value ?? 0),
      revenueForecastCents: Number(forecastMetric.value ?? 0),
      overdueTasks: overdueMetric.value,
      tasksDueToday: tasksDueTodayMetric.value,
      staleDeals: staleMetric.value,
      activeCampaigns: activeCampaignsMetric.value,
      scheduledPosts: scheduledPostsMetric.value,
      emailDrafts: emailDraftsMetric.value,
    },
    priorityTasks,
    staleDeals,
    hotLeads,
    recentActivity,
  };
}
