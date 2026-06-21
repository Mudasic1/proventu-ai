import { ListOrdered } from "lucide-react";

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
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createEmailSequenceAction } from "@/server/actions/workspace-modules";
import { listCampaigns, listEmailSequences } from "@/server/queries/workspace-modules";

export default async function EmailSequencesPage() {
  const context = await requirePermission("campaigns:read");
  const [records, campaigns] = await Promise.all([
    listEmailSequences(context.workspaceId),
    listCampaigns(context.workspaceId),
  ]);
  const canWrite = hasPermission(context.role, "campaigns:write");
  return (
    <div className="grid gap-5">
      <PageHeader
        kicker="Email sequences"
        title="Structure follow-up sequences for team review."
        description="Sequence structure is available now. Automated external sends remain intentionally disconnected."
      />
      {canWrite ? (
        <Panel>
          <h2 className="font-display text-2xl font-bold tracking-wide">Create sequence</h2>
          <form action={createEmailSequenceAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <input required name="name" placeholder="Sequence name" className={fieldClassName} />
            <select name="campaignId" className={fieldClassName}>
              <option value="">No parent campaign</option>
              {campaigns.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select name="status" className={fieldClassName} defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="active">Active structure</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
            <textarea
              name="description"
              placeholder="Describe the cadence and intended audience"
              className={`${textAreaClassName} md:col-span-2`}
            />
            <button className={submitClassName}>Create sequence</button>
          </form>
        </Panel>
      ) : null}
      {records.length ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              title={record.name}
              metadata={record.campaignName || "Independent sequence"}
            >
              <div className="flex items-center justify-between gap-3">
                {canWrite ? (
                  <StatusControl
                    entityType="email_sequence"
                    entityId={record.id}
                    value={record.status}
                    options={["draft", "active", "paused", "archived"]}
                  />
                ) : <StatusBadge value={record.status} />}
                <ListOrdered className="size-4 text-[var(--dashboard-icon)]" />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">
                {record.description || "No cadence notes yet."}
              </p>
            </RecordCard>
          ))}
        </section>
      ) : <EmptyState title="No sequences" description="Define manual email sequence structures and document the intended cadence." />}
    </div>
  );
}
