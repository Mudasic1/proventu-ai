import Link from "next/link";
import {
  ArrowRight,
  Play,
  Pause,
  DraftingCompass,
  Plus,
  Workflow,
} from "lucide-react";

import { Select } from "@/components/ui/select";
import {
  EmptyState,
  fieldClassName,
  Panel,
  submitClassName,
  textAreaClassName,
} from "@/components/shared/module-ui";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { formatDate } from "@/lib/format";
import { createAutomationAction } from "@/server/actions/workspace-modules";
import { listAutomations } from "@/server/queries/workspace-modules";

const triggerLabels: Record<string, string> = {
  new_lead_added: "New lead added",
  deal_moved_to_proposal: "Deal moved to Proposal",
  task_overdue: "Task overdue",
  campaign_completed: "Campaign completed",
  deal_marked_won: "Deal marked won",
};

const actionLabels: Record<string, string> = {
  create_task: "Create task",
  create_follow_up_reminder: "Create follow-up reminder",
  notify_inside_dashboard: "Notify inside dashboard",
  create_review_task: "Create review task",
  create_customer_follow_up_task: "Create customer follow-up task",
};

const statusColors: Record<string, string> = {
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  paused: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  draft: "border-[var(--dashboard-border)] bg-[var(--dashboard-control)] text-[var(--dashboard-icon)]",
};

const statusIcons: Record<string, typeof Play> = {
  active: Play,
  paused: Pause,
  draft: DraftingCompass,
};

export default async function AutomationsPage() {
  const context = await requirePermission("automations:read");
  const records = await listAutomations(context.workspaceId);
  const canWrite = hasPermission(context.role, "automations:write");

  return (
    <div className="grid gap-5">
      <div>
        <p className="section-kicker">Automations</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[0.9] tracking-wide">
          Build rule-based{" "}
          <span className="text-[var(--dashboard-accent)]">workflows</span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--dashboard-muted)]">
          Define triggers, conditions, and actions to automate repetitive sales and
          marketing tasks.
        </p>
      </div>

      {canWrite ? (
        <Panel>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-wide">
                New automation
              </h2>
              <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
                Choose a trigger and action to create an automated workflow.
              </p>
            </div>
          </div>
          <form action={createAutomationAction} className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              required
              name="name"
              placeholder="e.g. Follow up on warm leads"
              className={fieldClassName}
            />
            <Select
              name="status"
              defaultValue="draft"
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
              ]}
            />
            <Select
              name="triggerType"
              required
              placeholder="When this happens..."
              options={[
                { value: "new_lead_added", label: "New lead added" },
                { value: "deal_moved_to_proposal", label: "Deal moved to Proposal" },
                { value: "task_overdue", label: "Task overdue" },
                { value: "campaign_completed", label: "Campaign completed" },
                { value: "deal_marked_won", label: "Deal marked won" },
              ]}
            />
            <Select
              name="actionType"
              required
              placeholder="...do this"
              options={[
                { value: "create_task", label: "Create task" },
                { value: "create_follow_up_reminder", label: "Create follow-up reminder" },
                { value: "notify_inside_dashboard", label: "Notify inside dashboard" },
                { value: "create_review_task", label: "Create review task" },
                { value: "create_customer_follow_up_task", label: "Create customer follow-up task" },
              ]}
            />
            <textarea
              name="description"
              placeholder="Describe when and why this automation should run..."
              className={`${textAreaClassName} md:col-span-2`}
            />
            <button className={`${submitClassName} md:col-span-2`}>
              <Plus className="size-4" />
              Create automation
            </button>
          </form>
        </Panel>
      ) : null}

      {records.length > 0 ? (
        <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {records.map((record, i) => {
            const status = record.status ?? "draft";
            const StatusIcon = statusIcons[status] ?? DraftingCompass;
            return (
              <Link
                key={record.id}
                href={`/automations/${record.id}`}
                className="card-enter group rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-5 transition hover:border-[var(--dashboard-accent-border)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]">
                    <Workflow className="size-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${statusColors[status] ?? statusColors.draft}`}
                  >
                    <StatusIcon className="size-3" />
                    {status}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl font-bold tracking-wide text-[var(--dashboard-fg)]">
                  {record.name}
                </h3>

                {record.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--dashboard-soft)]">
                    {record.description}
                  </p>
                ) : null}

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--dashboard-elevated)] p-3 text-xs">
                  <span className="rounded-lg bg-[var(--dashboard-accent-soft)] px-2 py-1 font-bold text-[var(--dashboard-accent)]">
                    {record.triggerType ? (triggerLabels[record.triggerType] ?? record.triggerType) : "Unknown trigger"}
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-[var(--dashboard-icon)]" />
                  <span className="rounded-lg bg-[var(--dashboard-elevated)] px-2 py-1 font-bold text-[var(--dashboard-fg)]">
                    {record.actionType ? (actionLabels[record.actionType] ?? record.actionType) : "Unknown action"}
                  </span>
                </div>

                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--dashboard-icon)]">
                  Created {formatDate(record.createdAt)}
                </p>
              </Link>
            );
          })}
        </section>
      ) : (
        <EmptyState
          title="No automations yet"
          description="Create your first automation rule to start automating repetitive sales and marketing tasks."
        />
      )}
    </div>
  );
}
