import { CalendarClock } from "lucide-react";

import {
  EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName,
} from "@/components/shared/module-ui";
import { formatDate } from "@/lib/format";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createSocialPostAction } from "@/server/actions/workspace-modules";
import { listCampaigns, listSocialPosts } from "@/server/queries/workspace-modules";

export default async function SocialPostsPage() {
  const context = await requirePermission("campaigns:read");
  const [records, campaigns] = await Promise.all([listSocialPosts(context.workspaceId), listCampaigns(context.workspaceId)]);
  const canWrite = hasPermission(context.role, "campaigns:write");
  return (
    <div className="grid gap-5">
      <PageHeader kicker="Social posts" title="Draft and schedule posts without hidden publishing." description="Scheduling is an internal planning state. No external network sending is connected." />
      {canWrite ? <Panel>
        <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Add social draft</h2>
        <form action={createSocialPostAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="campaignId" className={fieldClassName}><option value="">No campaign</option>{campaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select name="platform" className={fieldClassName} defaultValue="linkedin"><option value="linkedin">LinkedIn</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="x">X</option><option value="other">Other</option></select>
          <select name="status" className={fieldClassName} defaultValue="draft"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published manually</option><option value="cancelled">Cancelled</option></select>
          <input name="scheduledAt" type="datetime-local" className={fieldClassName} />
          <textarea required name="content" placeholder="Write the post copy" className={`${textAreaClassName} md:col-span-2`} />
          <button className={submitClassName}>Save draft</button>
        </form>
      </Panel> : null}
      {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.platform} metadata={record.campaignName || "Independent post"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="social_post" entityId={record.id} value={record.status} options={["draft", "scheduled", "published", "cancelled"]} /> : <StatusBadge value={record.status} />}<CalendarClock className="size-4 text-[#71817b]" /></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#aebbb6]">{record.content}</p>{record.scheduledAt ? <p className="mt-3 text-xs text-[#71817b]">Planned {formatDate(record.scheduledAt)}</p> : null}</RecordCard>)}</section> : <EmptyState title="No social drafts" description="Create manually written posts and place them on the content calendar." />}
    </div>
  );
}
