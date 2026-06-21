import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ChartNoAxesCombined,
  CircleAlert,
  ClipboardCheck,
  ContactRound,
  DollarSign,
  History,
  Megaphone,
} from "lucide-react";

import { MetricCard, Panel } from "@/components/shared/module-ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";
import { getDashboardData } from "@/server/queries/dashboard";

export default async function DashboardPage() {
  const context = await requireWorkspacePageContext();
  const data = await getDashboardData(
    context.workspaceId,
    context.role === "sales_rep" ? context.session.user.id : undefined,
  );
  const firstName = context.session.user.name.split(" ")[0];
  const metrics = [
    { label: "Leads this week", value: data.metrics.leadsThisWeek.toString(), icon: ContactRound },
    { label: "Deals in pipeline", value: formatCurrency(data.metrics.openPipelineCents), icon: ChartNoAxesCombined },
    { label: "Revenue forecast", value: formatCurrency(data.metrics.revenueForecastCents), icon: DollarSign },
    { label: "Tasks due today", value: data.metrics.tasksDueToday.toString(), icon: ClipboardCheck },
    { label: "Active campaigns", value: data.metrics.activeCampaigns.toString(), icon: Megaphone },
    { label: "Scheduled posts", value: data.metrics.scheduledPosts.toString(), icon: CalendarClock },
    { label: "Stale deals", value: data.metrics.staleDeals.toString(), icon: CircleAlert },
    { label: "Email drafts", value: data.metrics.emailDrafts.toString(), icon: Megaphone },
  ];
  return (
    <div className="grid gap-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">Revenue workspace</p>
        <h1 className="mt-2 font-display text-6xl font-bold leading-[0.88] tracking-wide">Good to see you, <span className="text-[var(--dashboard-accent)]">{firstName}.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Your workspace command center for CRM, pipeline, follow-ups, and campaign operations.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, i) => (
          <div key={metric.label} className="card-enter" style={{ animationDelay: `${i * 60}ms` }}>
            <MetricCard {...metric} />
          </div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="card-enter rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-wide">Priority follow-ups</h2>
            <Link href="/sales/tasks" className="flex items-center gap-1 text-xs font-bold text-[var(--dashboard-accent)]">Tasks <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-2">
            {data.priorityTasks.map((task, i) => (
              <div key={task.id} className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold">{task.title}</p>
                  <span className="text-[10px] font-bold uppercase text-[var(--dashboard-accent)]">{task.priority}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--dashboard-icon)]">Due {formatDate(task.dueAt)}</p>
              </div>
            ))}
            {data.priorityTasks.length === 0 ? <p className="py-6 text-center text-sm text-[var(--dashboard-icon)]">No open follow-ups.</p> : null}
          </div>
        </article>
        <article className="card-enter rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-wide">Deals needing attention</h2>
            <Link href="/sales/pipeline" className="flex items-center gap-1 text-xs font-bold text-[var(--dashboard-accent)]">Pipeline <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-2">
            {data.staleDeals.map((deal, i) => (
              <Link key={deal.id} href={`/sales/deals/${deal.id}`} className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3 transition hover:border-[var(--dashboard-accent-border)]" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold">{deal.title}</p>
                  <span className="text-xs font-bold text-[var(--dashboard-accent)]">{formatCurrency(deal.valueCents)}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--dashboard-icon)]">Last activity {formatDate(deal.lastActivityAt)}</p>
              </Link>
            ))}
            {data.staleDeals.length === 0 ? <p className="py-6 text-center text-sm text-[var(--dashboard-icon)]">No stale open deals.</p> : null}
          </div>
        </article>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="card-enter" style={{ animationDelay: "160ms" }}>
          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold tracking-wide">Hot leads</h2>
              <Link href="/crm/contacts?status=qualified" className="flex items-center gap-1 text-xs font-bold text-[var(--dashboard-accent)]">CRM <ArrowRight className="size-3.5" /></Link>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--dashboard-icon)]">Based on the manual qualified status only.</p>
            <div className="mt-4 grid gap-2">
              {data.hotLeads.map((lead, i) => (
                <Link key={lead.id} href={`/crm/contacts/${lead.id}`} className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3 transition hover:border-[var(--dashboard-accent-border)]" style={{ animationDelay: `${i * 60 + 160}ms` }}>
                  <p className="text-sm font-bold">{lead.firstName} {lead.lastName}</p>
                  <p className="mt-1 text-xs text-[var(--dashboard-icon)]">{lead.companyName || lead.email || "Qualified contact"}</p>
                </Link>
              ))}
              {data.hotLeads.length === 0 ? <p className="py-6 text-center text-sm text-[var(--dashboard-icon)]">No qualified leads yet.</p> : null}
            </div>
          </Panel>
        </div>
        <div className="card-enter" style={{ animationDelay: "240ms" }}>
          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold tracking-wide">Campaign snapshot</h2>
              <Link href="/marketing/campaigns" className="flex items-center gap-1 text-xs font-bold text-[var(--dashboard-accent)]">Campaigns <ArrowRight className="size-3.5" /></Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3" style={{ animationDelay: "300ms" }}><p className="font-display text-3xl font-bold tracking-wide">{data.metrics.activeCampaigns}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-icon)]">Active campaigns</p></div>
              <div className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3" style={{ animationDelay: "360ms" }}><p className="font-display text-3xl font-bold tracking-wide">{data.metrics.scheduledPosts}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-icon)]">Scheduled posts</p></div>
              <div className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3" style={{ animationDelay: "420ms" }}><p className="font-display text-3xl font-bold tracking-wide">{data.metrics.emailDrafts}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-icon)]">Email drafts</p></div>
            </div>
          </Panel>
        </div>
      </section>
      <div className="card-enter" style={{ animationDelay: "320ms" }}>
        <Panel>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide"><History className="size-5 text-[var(--dashboard-accent)]" /> Recent activity</h2>
          <div className="mt-4 grid gap-2">
            {data.recentActivity.map((entry, i) => (
              <div key={entry.id} className="card-enter flex flex-col justify-between gap-1 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3 sm:flex-row" style={{ animationDelay: `${i * 50 + 320}ms` }}>
                <p className="text-sm text-[var(--dashboard-fg)]">{entry.summary}</p>
                <p className="shrink-0 text-xs text-[var(--dashboard-icon)]">{formatDate(entry.createdAt)}</p>
              </div>
            ))}
            {data.recentActivity.length === 0 ? <p className="py-6 text-center text-sm text-[var(--dashboard-icon)]">Your workspace activity will appear here.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
