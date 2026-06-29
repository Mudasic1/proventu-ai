import { Check, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { completeTaskAction } from "@/server/actions/pipeline";

type TaskListProps = {
  canWrite?: boolean;
  tasks: {
    id: string;
    title: string;
    dueAt: Date;
    priority: string;
    status: string;
    notes: string;
    dealTitle: string | null;
    contactFirstName: string | null;
    contactLastName: string | null;
  }[];
};

export function TaskList({ tasks, canWrite = true }: TaskListProps) {
  return (
    <div className="grid gap-2.5">
      {tasks.map((task) => (
        <article key={task.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`font-bold ${task.status === "completed" ? "text-[var(--dashboard-soft)] line-through" : "text-[var(--dashboard-fg)]"}`}>{task.title}</h3>
              <span className="rounded-full bg-[var(--dashboard-accent-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--dashboard-accent)]">{task.priority}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--dashboard-soft)]">
              {[task.contactFirstName, task.contactLastName].filter(Boolean).join(" ") || task.dealTitle || "General workspace follow-up"}
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--dashboard-muted)]"><Clock3 className="size-3.5" /> Due {formatDate(task.dueAt)}</p>
          </div>
          {canWrite && task.status !== "completed" ? (
            <form action={completeTaskAction.bind(null, task.id)}>
              <Button variant="outline" className="rounded-full"><Check /> Complete</Button>
            </form>
          ) : null}
        </article>
      ))}
      {tasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--dashboard-border)] p-6 text-center text-sm text-[var(--dashboard-soft)]">No follow-up tasks yet.</p>
      ) : null}
    </div>
  );
}
