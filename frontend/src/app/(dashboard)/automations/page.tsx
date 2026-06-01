import { Workflow } from "lucide-react";

import { EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName } from "@/components/shared/module-ui";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createAutomationAction } from "@/server/actions/workspace-modules";
import { listAutomations } from "@/server/queries/workspace-modules";

export default async function AutomationsPage() {
  const context = await requirePermission("automations:read");
  const records = await listAutomations(context.workspaceId);
  const canWrite = hasPermission(context.role, "automations:write");
  return <div className="grid gap-5"><PageHeader kicker="Manual automations" title="Define predictable rules for operational follow-through." description="Rules are limited to deterministic in-app tasks and notifications. External sending remains disconnected." />
    {canWrite ? <Panel><h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Create rule</h2><form action={createAutomationAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input required name="name" placeholder="Automation name" className={fieldClassName} /><select name="status" className={fieldClassName} defaultValue="draft"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select>
      <select required name="triggerType" className={fieldClassName}><option value="new_lead_added">New lead added</option><option value="deal_moved_to_proposal">Deal moved to Proposal Sent</option><option value="task_overdue">Task overdue</option><option value="campaign_completed">Campaign completed</option><option value="deal_marked_won">Deal marked won</option></select>
      <select required name="actionType" className={fieldClassName}><option value="create_task">Create task</option><option value="create_follow_up_reminder">Create follow-up reminder</option><option value="notify_inside_dashboard">Notify inside dashboard</option><option value="create_review_task">Create review task</option><option value="create_customer_follow_up_task">Create customer follow-up task</option></select>
      <textarea name="description" placeholder="Describe the internal workflow" className={`${textAreaClassName} md:col-span-2`} /><button className={submitClassName}>Create rule</button>
    </form></Panel> : null}
    {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.name} metadata={record.description || "Rule description not set"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="automation" entityId={record.id} value={record.status} options={["draft", "active", "paused"]} /> : <StatusBadge value={record.status} />}<Workflow className="size-4 text-[#71817b]" /></div><p className="mt-3 text-sm text-[#aebbb6]">{record.triggerType?.replaceAll("_", " ")} -&gt; {record.actionType?.replaceAll("_", " ")}</p></RecordCard>)}</section> : <EmptyState title="No automation rules" description="Add a deterministic rule to create internal tasks or dashboard reminders." />}</div>;
}
