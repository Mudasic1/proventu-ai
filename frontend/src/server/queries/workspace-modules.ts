import "server-only";

import { and, asc, count, desc, eq, gte, isNull, lt, sum } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  activityEntry,
  automation,
  automationAction,
  automationCondition,
  automationTrigger,
  billingPlan,
  campaign,
  company,
  contact,
  deal,
  emailCampaign,
  emailSequence,
  followUpTask,
  inboxConversation,
  socialPost,
  user,
  workspaceMember,
  workspaceSetting,
  workspaceSubscription,
} from "@/lib/db/schema";

export async function listCompanies(workspaceId: string) {
  return db
    .select()
    .from(company)
    .where(eq(company.workspaceId, workspaceId))
    .orderBy(desc(company.updatedAt))
    .limit(100);
}

export async function listCampaigns(workspaceId: string) {
  return db
    .select()
    .from(campaign)
    .where(eq(campaign.workspaceId, workspaceId))
    .orderBy(desc(campaign.updatedAt))
    .limit(100);
}

export async function listSocialPosts(workspaceId: string) {
  return db
    .select({
      id: socialPost.id,
      platform: socialPost.platform,
      content: socialPost.content,
      status: socialPost.status,
      scheduledAt: socialPost.scheduledAt,
      createdAt: socialPost.createdAt,
      campaignName: campaign.name,
    })
    .from(socialPost)
    .leftJoin(campaign, eq(socialPost.campaignId, campaign.id))
    .where(eq(socialPost.workspaceId, workspaceId))
    .orderBy(desc(socialPost.createdAt))
    .limit(100);
}

export async function listEmailCampaigns(workspaceId: string) {
  return db
    .select({
      id: emailCampaign.id,
      name: emailCampaign.name,
      subject: emailCampaign.subject,
      previewText: emailCampaign.previewText,
      status: emailCampaign.status,
      scheduledAt: emailCampaign.scheduledAt,
      sentAt: emailCampaign.sentAt,
      createdAt: emailCampaign.createdAt,
      campaignName: campaign.name,
    })
    .from(emailCampaign)
    .leftJoin(campaign, eq(emailCampaign.campaignId, campaign.id))
    .where(eq(emailCampaign.workspaceId, workspaceId))
    .orderBy(desc(emailCampaign.createdAt))
    .limit(100);
}

export async function listEmailSequences(workspaceId: string) {
  return db
    .select({
      id: emailSequence.id,
      name: emailSequence.name,
      description: emailSequence.description,
      status: emailSequence.status,
      createdAt: emailSequence.createdAt,
      campaignName: campaign.name,
    })
    .from(emailSequence)
    .leftJoin(campaign, eq(emailSequence.campaignId, campaign.id))
    .where(eq(emailSequence.workspaceId, workspaceId))
    .orderBy(desc(emailSequence.createdAt))
    .limit(100);
}

export async function listInboxConversations(workspaceId: string) {
  return db
    .select({
      id: inboxConversation.id,
      subject: inboxConversation.subject,
      channel: inboxConversation.channel,
      priority: inboxConversation.priority,
      status: inboxConversation.status,
      lastMessageAt: inboxConversation.lastMessageAt,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
    })
    .from(inboxConversation)
    .leftJoin(contact, eq(inboxConversation.contactId, contact.id))
    .where(eq(inboxConversation.workspaceId, workspaceId))
    .orderBy(desc(inboxConversation.lastMessageAt))
    .limit(100);
}

export async function listAutomations(workspaceId: string) {
  return db
    .select({
      id: automation.id,
      name: automation.name,
      description: automation.description,
      status: automation.status,
      createdAt: automation.createdAt,
      triggerType: automationTrigger.type,
      actionType: automationAction.type,
    })
    .from(automation)
    .leftJoin(automationTrigger, eq(automationTrigger.automationId, automation.id))
    .leftJoin(automationAction, eq(automationAction.automationId, automation.id))
    .where(eq(automation.workspaceId, workspaceId))
    .orderBy(desc(automation.createdAt))
    .limit(100);
}

export async function getAutomation(workspaceId: string, automationId: string) {
  const [record] = await db
    .select({
      id: automation.id,
      name: automation.name,
      description: automation.description,
      status: automation.status,
      createdAt: automation.createdAt,
    })
    .from(automation)
    .where(and(eq(automation.id, automationId), eq(automation.workspaceId, workspaceId)))
    .limit(1);
  if (!record) return null;
  const triggers = await db
    .select()
    .from(automationTrigger)
    .where(eq(automationTrigger.automationId, automationId))
    .orderBy(automationTrigger.id);
  const conditions = await db
    .select()
    .from(automationCondition)
    .where(eq(automationCondition.automationId, automationId))
    .orderBy(asc(automationCondition.position));
  const actions = await db
    .select()
    .from(automationAction)
    .where(eq(automationAction.automationId, automationId))
    .orderBy(asc(automationAction.position));
  return { ...record, triggers, conditions, actions };
}

export async function listTeamMembers(workspaceId: string) {
  return db
    .select({
      id: workspaceMember.id,
      role: workspaceMember.role,
      createdAt: workspaceMember.createdAt,
      userId: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(workspaceMember.userId, user.id))
    .where(eq(workspaceMember.workspaceId, workspaceId))
    .orderBy(asc(user.name));
}

export async function getWorkspaceSettings(workspaceId: string) {
  const [settings] = await db
    .select()
    .from(workspaceSetting)
    .where(eq(workspaceSetting.workspaceId, workspaceId))
    .limit(1);
  return settings;
}

export async function getBillingSummary(workspaceId: string) {
  const [subscription] = await db
    .select({
      id: workspaceSubscription.id,
      status: workspaceSubscription.status,
      renewsAt: workspaceSubscription.renewsAt,
      planName: billingPlan.name,
      planCode: billingPlan.code,
      priceCents: billingPlan.priceCents,
      interval: billingPlan.interval,
      features: billingPlan.features,
    })
    .from(workspaceSubscription)
    .innerJoin(billingPlan, eq(workspaceSubscription.billingPlanId, billingPlan.id))
    .where(eq(workspaceSubscription.workspaceId, workspaceId))
    .limit(1);
  return subscription;
}

export async function getAnalyticsSummary(workspaceId: string) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    [contactsMetric],
    [companiesMetric],
    [openDealsMetric],
    [pipelineMetric],
    [wonRevenueMetric],
    [campaignsMetric],
    [scheduledPostsMetric],
    [pendingTasksMetric],
  ] = await Promise.all([
    db.select({ value: count() }).from(contact).where(
      and(eq(contact.workspaceId, workspaceId), isNull(contact.removedAt)),
    ),
    db.select({ value: count() }).from(company).where(eq(company.workspaceId, workspaceId)),
    db.select({ value: count() }).from(deal).where(
      and(eq(deal.workspaceId, workspaceId), eq(deal.status, "open")),
    ),
    db.select({ value: sum(deal.valueCents) }).from(deal).where(
      and(eq(deal.workspaceId, workspaceId), eq(deal.status, "open")),
    ),
    db.select({ value: sum(deal.valueCents) }).from(deal).where(
      and(
        eq(deal.workspaceId, workspaceId),
        eq(deal.status, "won"),
        gte(deal.closedAt, weekStart),
      ),
    ),
    db.select({ value: count() }).from(campaign).where(
      and(eq(campaign.workspaceId, workspaceId), eq(campaign.status, "active")),
    ),
    db.select({ value: count() }).from(socialPost).where(
      and(eq(socialPost.workspaceId, workspaceId), eq(socialPost.status, "scheduled")),
    ),
    db.select({ value: count() }).from(followUpTask).where(
      and(eq(followUpTask.workspaceId, workspaceId), eq(followUpTask.status, "open")),
    ),
  ]);

  return {
    contacts: contactsMetric.value,
    companies: companiesMetric.value,
    openDeals: openDealsMetric.value,
    pipelineCents: Number(pipelineMetric.value ?? 0),
    wonRevenueThisWeekCents: Number(wonRevenueMetric.value ?? 0),
    activeCampaigns: campaignsMetric.value,
    scheduledPosts: scheduledPostsMetric.value,
    pendingTasks: pendingTasksMetric.value,
  };
}

export async function getAdminSummary(workspaceId: string) {
  const now = new Date();
  const [
    analytics,
    [membersMetric],
    [automationsMetric],
    [overdueTasksMetric],
    recentActivity,
    billing,
  ] = await Promise.all([
    getAnalyticsSummary(workspaceId),
    db.select({ value: count() }).from(workspaceMember).where(
      eq(workspaceMember.workspaceId, workspaceId),
    ),
    db.select({ value: count() }).from(automation).where(
      and(eq(automation.workspaceId, workspaceId), eq(automation.status, "active")),
    ),
    db.select({ value: count() }).from(followUpTask).where(
      and(
        eq(followUpTask.workspaceId, workspaceId),
        eq(followUpTask.status, "open"),
        lt(followUpTask.dueAt, now),
      ),
    ),
    db.select().from(activityEntry).where(eq(activityEntry.workspaceId, workspaceId))
      .orderBy(desc(activityEntry.createdAt))
      .limit(12),
    getBillingSummary(workspaceId),
  ]);

  return {
    ...analytics,
    teamMembers: membersMetric.value,
    activeAutomations: automationsMetric.value,
    overdueTasks: overdueTasksMetric.value,
    recentActivity,
    billing,
  };
}

