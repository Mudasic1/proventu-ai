import { Workflow } from "lucide-react";

import { Select } from "@/components/ui/select";
import { EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName } from "@/components/shared/module-ui";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createAutomationAction } from "@/server/actions/workspace-modules";
import { listAutomations } from "@/server/queries/workspace-modules";

export default async function AutomationsPage() {
  const context = await requirePermission("automations:read");
  const records = await listAutomations(context.workspaceId);
  const canWrite = hasPermission(context.role, "automations:write");
  return <div className="grid gap-5"><PageHeader kicker="Manual automations" title="Define predictable rules for operational follow-through." description="Rules are limited to deterministic in-app tasks and notifications. External sending remains disconnected." />
    {canWrite ? <Panel><h2 className="font-display text-2xl font-bold tracking-wide">Create rule</h2><form action={createAutomationAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input required name="name" placeholder="Automation name" className={fieldClassName} /><Select name="status" defaultValue="draft" options={[{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "paused", label: "Paused" }]} />
      <Select name="triggerType" required options={[{ value: "new_lead_added", label: "New lead added" }, { value: "deal_moved_to_proposal", label: "Deal moved to Proposal Sent" }, { value: "task_overdue", label: "Task overdue" }, { value: "campaign_completed", label: "Campaign completed" }, { value: "deal_marked_won", label: "Deal marked won" }]} />
      <Select name="actionType" required options={[{ value: "create_task", label: "Create task" }, { value: "create_follow_up_reminder", label: "Create follow-up reminder" }, { value: "notify_inside_dashboard", label: "Notify inside dashboard" }, { value: "create_review_task", label: "Create review task" }, { value: "create_customer_follow_up_task", label: "Create customer follow-up task" }]} />
      <textarea name="description" placeholder="Describe the internal workflow" className={`${textAreaClassName} md:col-span-2`} /><button className={submitClassName}>Create rule</button>
    </form></Panel> : null}
    {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.name} metadata={record.description || "Rule description not set"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="automation" entityId={record.id} value={record.status} options={["draft", "active", "paused"]} /> : <StatusBadge value={record.status} />}<Workflow className="size-4 text-[var(--dashboard-icon)]" /></div><p className="mt-3 text-sm text-[var(--dashboard-muted)]">{record.triggerType?.replaceAll("_", " ")} -&gt; {record.actionType?.replaceAll("_", " ")}</p></RecordCard>)}</section> : <EmptyState title="No automation rules" description="Add a deterministic rule to create internal tasks or dashboard reminders." />}</div>;
}
