import "server-only";

import { count, desc, eq, sum } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  automation,
  campaign,
  company,
  contact,
  deal,
  emailCampaign,
  followUpTask,
  socialPost,
  user,
  workspace,
  workspaceMember,
  workspaceSubscription,
} from "@/lib/db/schema";

export async function getSuperAdminDashboardData() {
  const [
    [users],
    [workspaces],
    [memberships],
    [contacts],
    [companies],
    [deals],
    [openPipeline],
    [wonRevenue],
    [campaigns],
    [posts],
    [emailDrafts],
    [tasks],
    [automations],
    [subscriptions],
    recentWorkspaces,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(workspace),
    db.select({ value: count() }).from(workspaceMember),
    db.select({ value: count() }).from(contact),
    db.select({ value: count() }).from(company),
    db.select({ value: count() }).from(deal),
    db.select({ value: sum(deal.valueCents) }).from(deal).where(eq(deal.status, "open")),
    db.select({ value: sum(deal.valueCents) }).from(deal).where(eq(deal.status, "won")),
    db.select({ value: count() }).from(campaign),
    db.select({ value: count() }).from(socialPost),
    db.select({ value: count() }).from(emailCampaign),
    db.select({ value: count() }).from(followUpTask),
    db.select({ value: count() }).from(automation),
    db.select({ value: count() }).from(workspaceSubscription),
    db.select().from(workspace).orderBy(desc(workspace.createdAt)).limit(8),
    db.select({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt })
      .from(user)
      .orderBy(desc(user.createdAt))
      .limit(8),
    db.select({
      id: activityEntry.id,
      summary: activityEntry.summary,
      action: activityEntry.action,
      createdAt: activityEntry.createdAt,
      workspaceName: workspace.name,
    })
      .from(activityEntry)
      .innerJoin(workspace, eq(activityEntry.workspaceId, workspace.id))
      .orderBy(desc(activityEntry.createdAt))
      .limit(10),
  ]);

  return {
    metrics: {
      users: users.value,
      workspaces: workspaces.value,
      memberships: memberships.value,
      contacts: contacts.value,
      companies: companies.value,
      deals: deals.value,
      openPipelineCents: Number(openPipeline.value ?? 0),
      wonRevenueCents: Number(wonRevenue.value ?? 0),
      campaigns: campaigns.value,
      posts: posts.value,
      emailDrafts: emailDrafts.value,
      tasks: tasks.value,
      automations: automations.value,
      subscriptions: subscriptions.value,
    },
    recentWorkspaces,
    recentUsers,
    recentActivity,
  };
}

