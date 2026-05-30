import { TaskForm } from "@/components/pipeline/task-form";
import { TaskList } from "@/components/pipeline/task-list";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";
import { listContacts } from "@/server/queries/contacts";
import {
  getDefaultPipeline,
  listFollowUpTasks,
  listPipelineDeals,
} from "@/server/queries/pipeline";

export default async function TasksPage() {
  const context = await requireWorkspacePageContext();
  const pipeline = await getDefaultPipeline(context.workspaceId);
  const [contacts, deals, tasks] = await Promise.all([
    listContacts(context.workspaceId, {}),
    pipeline ? listPipelineDeals(context.workspaceId, pipeline.id) : [],
    listFollowUpTasks(context.workspaceId),
  ]);
  return (
    <div className="grid gap-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d8ff62]">Follow-up tasks</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-[-0.09em]">Keep the next step visible.</h1>
      </section>
      <details className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#d8ff62]">Add a follow-up</summary>
        <div className="mt-4"><TaskForm contacts={contacts} deals={deals} /></div>
      </details>
      <TaskList tasks={tasks} />
    </div>
  );
}
