import { Megaphone } from "lucide-react";

import {
  EmptyState,
  fieldClassName,
  PageHeader,
  Panel,
  RecordCard,
  StatusBadge,
  StatusControl,
  submitClassName,
  textAreaClassName,
} from "@/components/shared/module-ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createCampaignAction } from "@/server/actions/workspace-modules";
import { listCampaigns } from "@/server/queries/workspace-modules";

export default async function CampaignsPage() {
  const context = await requirePermission("campaigns:read");
  const records = await listCampaigns(context.workspaceId);
  const canWrite = hasPermission(context.role, "campaigns:write");

  return (
    <div className="grid gap-5">
      <PageHeader kicker="Campaigns" title="Plan marketing work with a clear owner and finish line." description={`${records.length} manual campaigns across email, social, and content.`} />
      {canWrite ? (
        <Panel>
          <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Create campaign</h2>
          <form action={createCampaignAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input required name="name" placeholder="Campaign name" className={fieldClassName} />
            <select name="channel" className={fieldClassName} defaultValue="multi_channel">
              <option value="multi_channel">Multi-channel</option><option value="email">Email</option><option value="social">Social</option><option value="content">Content</option>
            </select>
            <select name="status" className={fieldClassName} defaultValue="draft">
              <option value="draft">Draft</option><option value="planned">Planned</option><option value="active">Active</option><option value="completed">Completed</option>
            </select>
            <input name="budgetCents" type="number" min="0" placeholder="Budget in cents" className={fieldClassName} />
            <input name="startsAt" type="datetime-local" className={fieldClassName} />
            <input name="endsAt" type="datetime-local" className={fieldClassName} />
            <textarea name="objective" placeholder="Objective and audience" className={`${textAreaClassName} md:col-span-2`} />
            <button className={submitClassName}>Create campaign</button>
          </form>
        </Panel>
      ) : null}
      {records.length ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {records.map((record) => (
            <RecordCard key={record.id} title={record.name} metadata={`${record.channel.replaceAll("_", " ")} · ${formatCurrency(record.budgetCents)}`}>
              <div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="campaign" entityId={record.id} value={record.status} options={["draft", "planned", "active", "completed", "archived"]} /> : <StatusBadge value={record.status} />}<Megaphone className="size-4 text-[#71817b]" /></div>
              <p className="mt-3 text-sm leading-6 text-[#aebbb6]">{record.objective || "Objective not documented yet."}</p>
              {record.startsAt ? <p className="mt-3 text-xs text-[#71817b]">Starts {formatDate(record.startsAt)}</p> : null}
            </RecordCard>
          ))}
        </section>
      ) : <EmptyState title="No campaigns yet" description="Create a campaign brief, then attach manually prepared social and email drafts." />}
    </div>
  );
}
