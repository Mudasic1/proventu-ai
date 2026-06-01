import { Activity, BarChart3, Building2, ContactRound, CreditCard, Megaphone, Send, UsersRound, Workflow } from "lucide-react";

import { MetricCard, Panel } from "@/components/shared/module-ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSuperAdminDashboardData } from "@/server/queries/super-admin";

export default async function SuperAdminDashboardPage() {
  const data = await getSuperAdminDashboardData();
  const { metrics } = data;
  return (
    <div className="grid gap-7">
      <section>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#527065]">Platform overview</p>
        <h1 className="mt-3 max-w-4xl font-display text-6xl font-bold leading-[0.88] tracking-[-0.1em] text-[#10211c]">Application operations,<br /><span className="text-[#547330]">in one view.</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#60706a]">Private application-wide analytics for the SalesEasy platform. Workspace users cannot access this console.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Registered users" value={metrics.users.toString()} icon={UsersRound} />
        <MetricCard label="Workspaces" value={metrics.workspaces.toString()} icon={Building2} />
        <MetricCard label="Subscriptions" value={metrics.subscriptions.toString()} icon={CreditCard} />
        <MetricCard label="Memberships" value={metrics.memberships.toString()} icon={UsersRound} />
      </section>

      <section id="sales" className="scroll-mt-6 grid gap-3">
        <h2 className="font-display text-3xl font-bold tracking-[-0.08em]">Sales footprint</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="CRM contacts" value={metrics.contacts.toString()} icon={ContactRound} />
          <MetricCard label="Companies" value={metrics.companies.toString()} icon={Building2} />
          <MetricCard label="Deals" value={metrics.deals.toString()} icon={BarChart3} />
          <MetricCard label="Open pipeline" value={formatCurrency(metrics.openPipelineCents)} icon={BarChart3} />
        </div>
        <Panel><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#527065]">Won revenue recorded</p><p className="mt-3 font-display text-5xl font-bold tracking-[-0.09em] text-[#10211c]">{formatCurrency(metrics.wonRevenueCents)}</p></Panel>
      </section>

      <section id="marketing" className="scroll-mt-6 grid gap-3">
        <h2 className="font-display text-3xl font-bold tracking-[-0.08em]">Marketing operations</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Campaigns" value={metrics.campaigns.toString()} icon={Megaphone} />
          <MetricCard label="Social posts" value={metrics.posts.toString()} icon={Send} />
          <MetricCard label="Email drafts" value={metrics.emailDrafts.toString()} icon={Megaphone} />
          <MetricCard label="Automations" value={metrics.automations.toString()} icon={Workflow} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel className="scroll-mt-6" ><h2 id="workspaces" className="font-display text-2xl font-bold tracking-[-0.07em]">Recent workspaces</h2><div className="mt-4 grid gap-2">{data.recentWorkspaces.map((item) => <div key={item.id} className="rounded-xl border border-black/[0.07] bg-white/55 p-3"><p className="text-sm font-bold text-[#1c2b27]">{item.name}</p><p className="mt-1 text-xs text-[#6d7c76]">{item.slug} · {formatDate(item.createdAt)}</p></div>)}</div></Panel>
        <Panel className="scroll-mt-6"><h2 id="users" className="font-display text-2xl font-bold tracking-[-0.07em]">Recent users</h2><div className="mt-4 grid gap-2">{data.recentUsers.map((item) => <div key={item.id} className="rounded-xl border border-black/[0.07] bg-white/55 p-3"><p className="text-sm font-bold text-[#1c2b27]">{item.name}</p><p className="mt-1 text-xs text-[#6d7c76]">{item.email} · {formatDate(item.createdAt)}</p></div>)}</div></Panel>
      </section>

      <section className="grid scroll-mt-6 gap-4 xl:grid-cols-[1fr_0.42fr]" id="activity">
        <Panel><h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.07em]"><Activity className="size-5 text-[#547330]" /> Recent platform activity</h2><div className="mt-4 grid gap-2">{data.recentActivity.map((entry) => <div key={entry.id} className="flex flex-col justify-between gap-1 rounded-xl border border-black/[0.07] bg-white/55 p-3 sm:flex-row"><div><p className="text-sm text-[#1c2b27]">{entry.summary}</p><p className="mt-1 text-xs text-[#6d7c76]">{entry.workspaceName} · {entry.action}</p></div><p className="shrink-0 text-xs text-[#6d7c76]">{formatDate(entry.createdAt)}</p></div>)}</div></Panel>
        <Panel className="scroll-mt-6" ><h2 id="subscriptions" className="font-display text-2xl font-bold tracking-[-0.07em]">Subscriptions</h2><p className="mt-4 font-display text-6xl font-bold tracking-[-0.1em] text-[#547330]">{metrics.subscriptions}</p><p className="mt-3 text-sm leading-6 text-[#60706a]">Workspace subscription records currently tracked by the platform.</p></Panel>
      </section>
    </div>
  );
}
