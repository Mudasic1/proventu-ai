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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d8ff62]">Revenue workspace</p>
        <h1 className="mt-2 font-display text-6xl font-bold leading-[0.88] tracking-[-0.1em]">Good to see you, <span className="text-[#d8ff62]">{firstName}.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9eaea8]">Your workspace command center for CRM, pipeline, follow-ups, and campaign operations.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          return <MetricCard key={metric.label} {...metric} />;
        })}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Priority follow-ups</h2>
            <Link href="/sales/tasks" className="flex items-center gap-1 text-xs font-bold text-[#d8ff62]">Tasks <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-2">
            {data.priorityTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold">{task.title}</p>
                  <span className="text-[10px] font-bold uppercase text-[#d8ff62]">{task.priority}</span>
                </div>
                <p className="mt-1 text-xs text-[#82928c]">Due {formatDate(task.dueAt)}</p>
              </div>
            ))}
            {data.priorityTasks.length === 0 ? <p className="py-6 text-center text-sm text-[#82928c]">No open follow-ups.</p> : null}
          </div>
        </article>
        <article className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Deals needing attention</h2>
            <Link href="/sales/pipeline" className="flex items-center gap-1 text-xs font-bold text-[#d8ff62]">Pipeline <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-2">
            {data.staleDeals.map((deal) => (
              <Link key={deal.id} href={`/sales/deals/${deal.id}`} className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3 transition hover:border-[#d8ff62]/25">
                <div className="flex justify-between gap-3">
                  <p className="text-sm font-bold">{deal.title}</p>
                  <span className="text-xs font-bold text-[#d8ff62]">{formatCurrency(deal.valueCents)}</span>
                </div>
                <p className="mt-1 text-xs text-[#82928c]">Last activity {formatDate(deal.lastActivityAt)}</p>
              </Link>
            ))}
            {data.staleDeals.length === 0 ? <p className="py-6 text-center text-sm text-[#82928c]">No stale open deals.</p> : null}
          </div>
        </article>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Hot leads</h2>
            <Link href="/crm/contacts?status=qualified" className="flex items-center gap-1 text-xs font-bold text-[#d8ff62]">CRM <ArrowRight className="size-3.5" /></Link>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#82928c]">Based on the manual qualified status only.</p>
          <div className="mt-4 grid gap-2">
            {data.hotLeads.map((lead) => (
              <Link key={lead.id} href={`/crm/contacts/${lead.id}`} className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3 transition hover:border-[#d8ff62]/25">
                <p className="text-sm font-bold">{lead.firstName} {lead.lastName}</p>
                <p className="mt-1 text-xs text-[#82928c]">{lead.companyName || lead.email || "Qualified contact"}</p>
              </Link>
            ))}
            {data.hotLeads.length === 0 ? <p className="py-6 text-center text-sm text-[#82928c]">No qualified leads yet.</p> : null}
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Campaign snapshot</h2>
            <Link href="/marketing/campaigns" className="flex items-center gap-1 text-xs font-bold text-[#d8ff62]">Campaigns <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3"><p className="font-display text-3xl font-bold tracking-[-0.08em]">{data.metrics.activeCampaigns}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#82928c]">Active campaigns</p></div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3"><p className="font-display text-3xl font-bold tracking-[-0.08em]">{data.metrics.scheduledPosts}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#82928c]">Scheduled posts</p></div>
            <div className="rounded-xl border border-white/[0.06] bg-[#0b1916] p-3"><p className="font-display text-3xl font-bold tracking-[-0.08em]">{data.metrics.emailDrafts}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#82928c]">Email drafts</p></div>
          </div>
        </Panel>
      </section>
      <Panel>
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.07em]"><History className="size-5 text-[#d8ff62]" /> Recent activity</h2>
        <div className="mt-4 grid gap-2">
          {data.recentActivity.map((entry) => (
            <div key={entry.id} className="flex flex-col justify-between gap-1 rounded-xl border border-white/[0.06] bg-[#0b1916] p-3 sm:flex-row">
              <p className="text-sm text-[#dce4e1]">{entry.summary}</p>
              <p className="shrink-0 text-xs text-[#71817b]">{formatDate(entry.createdAt)}</p>
            </div>
          ))}
          {data.recentActivity.length === 0 ? <p className="py-6 text-center text-sm text-[#82928c]">Your workspace activity will appear here.</p> : null}
        </div>
      </Panel>
    </div>
  );
}
