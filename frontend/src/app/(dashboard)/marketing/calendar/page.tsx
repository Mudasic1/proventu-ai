import { CalendarDays } from "lucide-react";

import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/shared/module-ui";
import { formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/permissions/rbac";
import { listEmailCampaigns, listSocialPosts } from "@/server/queries/workspace-modules";

export default async function ContentCalendarPage() {
  const context = await requirePermission("campaigns:read");
  const [posts, emails] = await Promise.all([listSocialPosts(context.workspaceId), listEmailCampaigns(context.workspaceId)]);
  const items = [
    ...posts.filter((item) => item.scheduledAt).map((item) => ({ id: item.id, kind: "Social", title: item.platform, status: item.status, at: item.scheduledAt! })),
    ...emails.filter((item) => item.scheduledAt).map((item) => ({ id: item.id, kind: "Email", title: item.name, status: item.status, at: item.scheduledAt! })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());
  return <div className="grid gap-5"><PageHeader kicker="Content calendar" title="See planned campaign touchpoints in one timeline." description="Calendar items are internal plans for manual review and publishing." />
    <Panel><h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-[-0.07em]"><CalendarDays className="size-5 text-[#d8ff62]" /> Upcoming schedule</h2>
      <div className="mt-4 grid gap-2">{items.map((item) => <article key={`${item.kind}-${item.id}`} className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#0b1916] p-3 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#82928c]">{item.kind}</p><p className="mt-1 text-sm font-bold">{item.title}</p></div><div className="flex items-center gap-3"><StatusBadge value={item.status} /><p className="text-xs text-[#aebbb6]">{formatDate(item.at)}</p></div></article>)}{items.length === 0 ? <EmptyState title="Nothing scheduled" description="Scheduled social and email drafts will appear here." /> : null}</div>
    </Panel></div>;
}

