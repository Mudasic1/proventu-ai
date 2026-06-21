import { TaskForm } from "@/components/pipeline/task-form";
import { TaskList } from "@/components/pipeline/task-list";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContacts } from "@/server/queries/contacts";
import {
  getDefaultPipeline,
  listFollowUpTasks,
  listPipelineDeals,
} from "@/server/queries/pipeline";

export default async function TasksPage() {
  const context = await requirePermission("tasks:read");
  const canWrite = hasPermission(context.role, "tasks:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;
  const pipeline = await getDefaultPipeline(context.workspaceId);
  const [contacts, deals, tasks] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    pipeline ? listPipelineDeals(context.workspaceId, pipeline.id, ownerUserId) : [],
    listFollowUpTasks(context.workspaceId, undefined, ownerUserId),
  ]);
  return (
    <div className="grid gap-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">Follow-up tasks</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-wide">Keep the next step visible.</h1>
      </section>
      {canWrite ? <details className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[var(--dashboard-accent)]">Add a follow-up</summary>
        <div className="mt-4"><TaskForm contacts={contacts} deals={deals} /></div>
      </details> : null}
      <TaskList tasks={tasks} canWrite={canWrite} />
    </div>
  );
}
