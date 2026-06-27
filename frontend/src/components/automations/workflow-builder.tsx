"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ContactRound,
  Edit3,
  FileCheck,
  LoaderCircle,
  Mail,
  MessageSquare,
  PenLine,
  Rabbit,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateAutomationAction } from "@/server/actions/workspace-modules";
import { deleteAutomationAction } from "@/server/actions/workspace-modules";

type Trigger = {
  id: string;
  type: string;
  config: Record<string, string>;
};

type Condition = {
  id: string;
  field: string;
  operator: string;
  value: string;
  position: number;
};

type Action = {
  id: string;
  type: string;
  config: Record<string, string>;
  position: number;
};

type AutomationData = {
  id: string;
  name: string;
  description: string;
  status: string;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
};

const TRIGGER_OPTIONS = [
  { value: "new_lead_added", label: "New lead added", icon: ContactRound, color: "emerald" },
  { value: "deal_moved_to_proposal", label: "Deal moved to Proposal", icon: TrendingUp, color: "emerald" },
  { value: "task_overdue", label: "Task overdue", icon: Clock, color: "emerald" },
  { value: "campaign_completed", label: "Campaign completed", icon: Target, color: "emerald" },
  { value: "deal_marked_won", label: "Deal marked won", icon: CheckCircle2, color: "emerald" },
];

const ACTION_OPTIONS = [
  { value: "create_task", label: "Create task", icon: FileCheck, color: "blue" },
  { value: "create_follow_up_reminder", label: "Follow-up reminder", icon: Bell, color: "blue" },
  { value: "notify_inside_dashboard", label: "Notify in dashboard", icon: Activity, color: "blue" },
  { value: "create_review_task", label: "Create review task", icon: Edit3, color: "blue" },
  { value: "create_customer_follow_up_task", label: "Customer follow-up", icon: Users, color: "blue" },
  { value: "send_email", label: "Send email", icon: Mail, color: "violet" },
  { value: "send_sms", label: "Send SMS", icon: MessageSquare, color: "violet" },
  { value: "add_tag", label: "Add tag", icon: PenLine, color: "blue" },
  { value: "move_pipeline_stage", label: "Move pipeline stage", icon: TrendingUp, color: "violet" },
];

const nodeColors: Record<string, { border: string; bg: string; icon: string }> = {
  emerald: {
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
    icon: "text-emerald-400",
  },
  amber: {
    border: "border-amber-400/30",
    bg: "bg-amber-400/10",
    icon: "text-amber-400",
  },
  blue: {
    border: "border-sky-400/30",
    bg: "bg-sky-400/10",
    icon: "text-sky-400",
  },
  violet: {
    border: "border-violet-400/30",
    bg: "bg-violet-400/10",
    icon: "text-violet-400",
  },
};

const triggerLabels: Record<string, string> = {
  new_lead_added: "New lead added",
  deal_moved_to_proposal: "Deal moved to Proposal",
  task_overdue: "Task overdue",
  campaign_completed: "Campaign completed",
  deal_marked_won: "Deal marked won",
};

const actionLabels: Record<string, string> = {
  create_task: "Create task",
  create_follow_up_reminder: "Follow-up reminder",
  notify_inside_dashboard: "Notify in dashboard",
  create_review_task: "Create review task",
  create_customer_follow_up_task: "Customer follow-up",
  send_email: "Send email",
  send_sms: "Send SMS",
  add_tag: "Add tag",
  move_pipeline_stage: "Move pipeline stage",
};

function getTriggerMeta(type: string) {
  return TRIGGER_OPTIONS.find((o) => o.value === type) ?? TRIGGER_OPTIONS[0];
}

function getActionMeta(type: string) {
  return ACTION_OPTIONS.find((o) => o.value === type) ?? ACTION_OPTIONS[0];
}

export function WorkflowBuilder({
  automation,
}: {
  automation: AutomationData;
}) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [optimistic] = useOptimistic(automation);

  const hasConditions = optimistic.conditions.length > 0;

  function getCurrentTrigger() {
    return optimistic.triggers[0] ?? { id: "", type: "", config: {} };
  }

  function getCurrentAction() {
    return optimistic.actions[0] ?? { id: "", type: "", config: {}, position: 0 };
  }

  const trigger = getCurrentTrigger();
  const action = getCurrentAction();
  const triggerMeta = getTriggerMeta(trigger.type);
  const actionMeta = getActionMeta(action.type);

  async function handleSubmit(formData: FormData) {
    formData.set("id", automation.id);
    startTransition(async () => {
      try {
        await updateAutomationAction(formData);
        toast.success("Automation saved");
      } catch {
        toast.error("Failed to save automation");
      }
    });
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set("id", automation.id);
    startTransition(async () => {
      try {
        await deleteAutomationAction(fd);
      } catch {
        toast.error("Failed to delete automation");
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* ── Canvas ── */}
      <div className="grid content-start gap-4">
        {/* Status bar */}
        <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]">
              <Workflow className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-wide text-[var(--dashboard-fg)]">
                {optimistic.name}
              </h2>
              {optimistic.description ? (
                <p className="mt-0.5 text-sm text-[var(--dashboard-soft)]">
                  {optimistic.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
                optimistic.status === "active"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : optimistic.status === "paused"
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                    : "border-[var(--dashboard-border)] bg-[var(--dashboard-control)] text-[var(--dashboard-icon)]"
              }`}
            >
              {optimistic.status === "active" ? (
                <Rabbit className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              {optimistic.status}
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex size-8 items-center justify-center rounded-lg text-[var(--dashboard-icon)] transition hover:bg-red-400/10 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Flow canvas */}
        <div className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-0">
            {/* TRIGGER */}
            <NodeCard
              icon={triggerMeta.icon}
              label="TRIGGER"
              title={triggerLabels[trigger.type] ?? trigger.type}
              color={triggerMeta.color}
              isMain
            />

            {/* Connector */}
            <div className="flex h-8 w-0.5 items-center justify-center bg-[var(--dashboard-border)]">
              <div className="size-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]" />
            </div>

            {/* CONDITIONS (optional) */}
            <AnimatePresence>
              {hasConditions ? (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center overflow-hidden"
                >
                  <ConditionBlock conditions={optimistic.conditions} />
                  <div className="flex h-8 w-0.5 items-center justify-center bg-[var(--dashboard-border)]">
                    <div className="size-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]" />
                  </div>
                </m.div>
              ) : null}
            </AnimatePresence>

            {/* ACTION */}
            <NodeCard
              icon={actionMeta.icon}
              label="ACTION"
              title={actionLabels[action.type] ?? action.type}
              color={actionMeta.color}
              isMain
            />
          </div>
        </div>
      </div>

      {/* ── Config panel ── */}
      <div className="grid content-start gap-4">
        <div className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-icon)]">
            Automation settings
          </p>

          <form ref={formRef} action={handleSubmit} className="mt-4 grid gap-4">
            <input type="hidden" name="id" value={automation.id} />

            <div className="grid gap-2">
              <Label htmlFor="wf_name">Name</Label>
              <Input
                id="wf_name"
                name="name"
                defaultValue={automation.name}
                className="border-[var(--dashboard-border)] bg-[var(--dashboard-input)] text-[var(--dashboard-fg)] placeholder:text-[var(--dashboard-subtle)]"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wf_desc">Description</Label>
              <Textarea
                id="wf_desc"
                name="description"
                defaultValue={automation.description}
                className="border-[var(--dashboard-border)] bg-[var(--dashboard-input)] text-[var(--dashboard-fg)] placeholder:text-[var(--dashboard-subtle)]"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="wf_status">Status</Label>
              <Select
                id="wf_status"
                name="status"
                defaultValue={automation.status}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                ]}
              />
            </div>

            <div className="border-t border-[var(--dashboard-border)] pt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">
                Trigger
              </p>
              <div className="mt-3 grid gap-2">
                <Label htmlFor="wf_trigger">When this happens</Label>
                <Select
                  id="wf_trigger"
                  name="triggerType"
                  defaultValue={trigger.type}
                  options={TRIGGER_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </div>
            </div>

            <div className="border-t border-[var(--dashboard-border)] pt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">
                Action
              </p>
              <div className="mt-3 grid gap-2">
                <Label htmlFor="wf_action">...do this</Label>
                <Select
                  id="wf_action"
                  name="actionType"
                  defaultValue={action.type}
                  options={ACTION_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-full bg-[var(--dashboard-accent)] font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]"
            >
              {isPending ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 size-4" />
              )}
              Save changes
            </Button>
          </form>
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm ? (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <m.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="mx-4 w-full max-w-sm rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-6 shadow-[var(--dashboard-shadow)]"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-400">
                <AlertTriangle className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-wide text-[var(--dashboard-fg)]">
                Delete automation?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-soft)]">
                This will permanently remove {'\u201C'}{automation.name}{'\u201D'} and its
                trigger, conditions, and actions. This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] py-2.5 text-sm font-bold text-[var(--dashboard-fg)] transition hover:bg-[var(--dashboard-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NodeCard({
  icon: Icon,
  label,
  title,
  color = "emerald",
  isMain = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  color: string;
  isMain?: boolean;
}) {
  const colors = nodeColors[color] ?? nodeColors.emerald;
  return (
    <div
      className={`w-full max-w-sm rounded-2xl border ${colors.border} ${colors.bg} p-4 ${
        isMain ? "shadow-sm" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.icon}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-icon)]">
            {label}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-[var(--dashboard-fg)]">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConditionBlock({ conditions }: { conditions: Condition[] }) {
  return (
    <div className="flex flex-col items-center gap-0">
      {conditions.map((condition, i) => (
        <div key={condition.id} className="flex flex-col items-center">
          {i > 0 ? (
            <div className="flex h-6 w-0.5 items-center justify-center bg-[var(--dashboard-border)]">
              <div className="size-1.5 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]" />
            </div>
          ) : null}
          <div
            className={`w-full max-w-sm rounded-2xl border ${
              i === 0
                ? "border-amber-400/30 bg-amber-400/10"
                : "border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)]"
            } p-4`}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-icon)]">
                  Condition {i + 1}
                  {i === 0 ? " (if)" : " (and)"}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-[var(--dashboard-fg)]">
                  {condition.field.replaceAll("_", " ")} {condition.operator.replaceAll("_", " ")}{" "}
                  {condition.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
