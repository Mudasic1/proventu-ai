import { Mail } from "lucide-react";

import { EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName } from "@/components/shared/module-ui";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createEmailCampaignAction } from "@/server/actions/workspace-modules";
import { listCampaigns, listEmailCampaigns } from "@/server/queries/workspace-modules";

export default async function EmailCampaignsPage() {
  const context = await requirePermission("campaigns:read");
  const [records, campaigns] = await Promise.all([listEmailCampaigns(context.workspaceId), listCampaigns(context.workspaceId)]);
  const canWrite = hasPermission(context.role, "campaigns:write");
  return <div className="grid gap-5">
    <PageHeader kicker="Email campaigns" title="Write deliberate email drafts before anything is sent." description="Email campaigns are stored as reviewable manual drafts. External delivery is not connected." />
    {canWrite ? <Panel><h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Create email draft</h2><form action={createEmailCampaignAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input required name="name" placeholder="Campaign name" className={fieldClassName} /><select name="campaignId" className={fieldClassName}><option value="">No parent campaign</option>{campaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <input required name="subject" placeholder="Subject" className={fieldClassName} /><input name="previewText" placeholder="Preview text" className={fieldClassName} />
      <select name="status" className={fieldClassName} defaultValue="draft"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sent">Sent manually</option><option value="cancelled">Cancelled</option></select><input name="scheduledAt" type="datetime-local" className={fieldClassName} />
      <textarea required name="body" placeholder="Email body" className={`${textAreaClassName} md:col-span-2`} /><button className={submitClassName}>Save email draft</button>
    </form></Panel> : null}
    {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.name} metadata={record.subject}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="email_campaign" entityId={record.id} value={record.status} options={["draft", "scheduled", "sent", "cancelled"]} /> : <StatusBadge value={record.status} />}<Mail className="size-4 text-[#71817b]" /></div><p className="mt-3 text-sm text-[#aebbb6]">{record.previewText || "No preview text."}</p></RecordCard>)}</section> : <EmptyState title="No email drafts" description="Draft campaign emails manually and keep review status visible to the team." />}
  </div>;
}
