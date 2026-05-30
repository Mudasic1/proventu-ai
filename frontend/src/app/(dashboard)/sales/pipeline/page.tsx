import { DealForm } from "@/components/pipeline/deal-form";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";
import { listContacts } from "@/server/queries/contacts";
import {
  getDefaultPipeline,
  listPipelineDeals,
  listPipelineStages,
} from "@/server/queries/pipeline";

export default async function PipelinePage() {
  const context = await requireWorkspacePageContext();
  const pipeline = await getDefaultPipeline(context.workspaceId);
  if (!pipeline) return null;
  const [contacts, stages, deals] = await Promise.all([
    listContacts(context.workspaceId, {}),
    listPipelineStages(context.workspaceId, pipeline.id),
    listPipelineDeals(context.workspaceId, pipeline.id),
  ]);
  return (
    <div className="grid gap-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d8ff62]">Sales pipeline</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-[-0.09em]">Move revenue forward.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9eaea8]">Create deals, move them through active stages, and close outcomes from the deal record with a clear audit trail.</p>
      </section>
      <details className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[#d8ff62]">Add a deal</summary>
        <div className="mt-4"><DealForm contacts={contacts} stages={stages} /></div>
      </details>
      <PipelineBoard stages={stages} deals={deals} />
    </div>
  );
}
