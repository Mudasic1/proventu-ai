import { Building2, CalendarClock, ChartNoAxesCombined, ClipboardCheck, ContactRound, Megaphone } from "lucide-react";

import { MetricCard, PageHeader, Panel } from "@/components/shared/module-ui";
import { formatCurrency } from "@/lib/format";
import { requirePermission } from "@/lib/permissions/rbac";
import { getAnalyticsSummary } from "@/server/queries/workspace-modules";

export default async function AnalyticsPage() {
  const context = await requirePermission("analytics:read");
  const data = await getAnalyticsSummary(context.workspaceId);
  const metrics = [
    ["CRM contacts", data.contacts.toString(), ContactRound], ["Companies", data.companies.toString(), Building2], ["Deals in pipeline", data.openDeals.toString(), ChartNoAxesCombined], ["Pipeline value", formatCurrency(data.pipelineCents), ChartNoAxesCombined], ["Active campaigns", data.activeCampaigns.toString(), Megaphone], ["Scheduled posts", data.scheduledPosts.toString(), CalendarClock], ["Pending tasks", data.pendingTasks.toString(), ClipboardCheck],
  ] as const;
  return <div className="grid gap-5"><PageHeader kicker="Analytics" title="Read the operating picture without a black box." description="Reports are calculated directly from workspace CRM, pipeline, task, and campaign records." />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, icon]) => <MetricCard key={label} label={label} value={value} icon={icon} />)}</section>
    <Panel><p className="section-kicker">Won revenue this week</p><p className="mt-3 font-display text-6xl font-bold tracking-[-0.1em] text-[#d8ff62]">{formatCurrency(data.wonRevenueThisWeekCents)}</p><p className="mt-3 text-sm text-[#9eaea8]">Based on deals marked won during the last seven days.</p></Panel>
  </div>;
}

