import { CalendarClock } from "lucide-react";

import { Select } from "@/components/ui/select";
import {
  EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName,
} from "@/components/shared/module-ui";
import { SocialConnectorSection } from "@/components/shared/social-connector-card";
import { formatDate } from "@/lib/format";
import { serverEnv } from "@/lib/env/server";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createSocialPostAction } from "@/server/actions/workspace-modules";
import { listSocialAccounts } from "@/server/queries/social-accounts";
import { listCampaigns, listSocialPosts } from "@/server/queries/workspace-modules";

export default async function SocialPostsPage() {
  const context = await requirePermission("campaigns:read");
  const [records, campaigns, connectedAccounts] = await Promise.all([listSocialPosts(context.workspaceId), listCampaigns(context.workspaceId), listSocialAccounts(context.workspaceId)]);
  const canWrite = hasPermission(context.role, "campaigns:write");
  const configuredPlatforms = {
    linkedin: !!(serverEnv.LINKEDIN_CLIENT_ID && serverEnv.LINKEDIN_CLIENT_SECRET),
    facebook: !!(serverEnv.FACEBOOK_CLIENT_ID && serverEnv.FACEBOOK_CLIENT_SECRET),
    instagram: !!(serverEnv.FACEBOOK_CLIENT_ID && serverEnv.FACEBOOK_CLIENT_SECRET),
  };
  return (
    <div className="grid gap-5">
      <PageHeader kicker="Social posts" title="Draft and schedule posts without hidden publishing." description="Scheduling is an internal planning state. No external network sending is connected." />
      <SocialConnectorSection connectedAccounts={connectedAccounts} workspaceId={context.workspaceId} configuredPlatforms={configuredPlatforms} />
      {canWrite ? <Panel>
        <h2 className="font-display text-2xl font-bold tracking-wide">Add social draft</h2>
        <form action={createSocialPostAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <Select name="campaignId" placeholder="No campaign" options={campaigns.map((item) => ({ value: item.id, label: item.name }))} />
          <Select name="platform" defaultValue="linkedin" options={[{ value: "linkedin", label: "LinkedIn" }, { value: "facebook", label: "Facebook" }, { value: "instagram", label: "Instagram" }, { value: "x", label: "X" }, { value: "other", label: "Other" }]} />
          <Select name="status" defaultValue="draft" options={[{ value: "draft", label: "Draft" }, { value: "scheduled", label: "Scheduled" }, { value: "published", label: "Published manually" }, { value: "cancelled", label: "Cancelled" }]} />
          <input name="scheduledAt" type="datetime-local" className={fieldClassName} />
          <textarea required name="content" placeholder="Write the post copy" className={`${textAreaClassName} md:col-span-2`} />
          <button className={submitClassName}>Save draft</button>
        </form>
      </Panel> : null}
      {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.platform} metadata={record.campaignName || "Independent post"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="social_post" entityId={record.id} value={record.status} options={["draft", "scheduled", "published", "cancelled"]} /> : <StatusBadge value={record.status} />}<CalendarClock className="size-4 text-[var(--dashboard-icon)]" /></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--dashboard-muted)]">{record.content}</p>{record.scheduledAt ? <p className="mt-3 text-xs text-[var(--dashboard-icon)]">Planned {formatDate(record.scheduledAt)}</p> : null}</RecordCard>)}</section> : <EmptyState title="No social drafts" description="Create manually written posts and place them on the content calendar." />}
    </div>
  );
}
