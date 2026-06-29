import { DealForm } from "@/components/pipeline/deal-form";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContacts } from "@/server/queries/contacts";
import {
  getDefaultPipeline,
  listPipelineDeals,
  listPipelineStages,
} from "@/server/queries/pipeline";

export default async function PipelinePage() {
  const context = await requirePermission("pipeline:read");
  const canWrite = hasPermission(context.role, "pipeline:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;
  const pipeline = await getDefaultPipeline(context.workspaceId);
  if (!pipeline) {
    return (
      <div className="grid gap-5">
        <EmptyState
          title="No sales pipeline is configured"
          description="This workspace does not have a default pipeline yet. Review workspace setup before adding deals."
        />
        <Link className="mx-auto text-sm font-bold text-[var(--dashboard-accent)] hover:underline" href="/settings/workspace">
          Review workspace setup
        </Link>
      </div>
    );
  }
  const [contacts, stages, deals] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    listPipelineStages(context.workspaceId, pipeline.id),
    listPipelineDeals(context.workspaceId, pipeline.id, ownerUserId),
  ]);
  return (
    <div className="grid gap-5">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">Sales pipeline</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-wide">Move revenue forward.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">Create deals, move them through active stages, and close outcomes from the deal record with a clear audit trail.</p>
      </section>
      {canWrite ? <details className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[var(--dashboard-accent)]">Add a deal</summary>
        <div className="mt-4"><DealForm contacts={contacts} stages={stages} /></div>
      </details> : null}
      <PipelineBoard stages={stages} deals={deals} canWrite={canWrite} />
    </div>
  );
}
import Link from "next/link";

import { EmptyState } from "@/components/shared/module-ui";
