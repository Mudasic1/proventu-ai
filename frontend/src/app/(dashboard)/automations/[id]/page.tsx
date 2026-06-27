import Link from "next/link";
import { ArrowLeft, Workflow } from "lucide-react";

import { WorkflowBuilder } from "@/components/automations/workflow-builder";
import { requirePermission } from "@/lib/permissions/rbac";
import { getAutomation } from "@/server/queries/workspace-modules";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AutomationDetailPage({ params }: Props) {
  const { id } = await params;
  const context = await requirePermission("automations:read");
  const automation = await getAutomation(context.workspaceId, id);

  if (!automation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Workflow className="size-12 text-[var(--dashboard-icon)]" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-wide text-[var(--dashboard-fg)]">
          Automation not found
        </h1>
        <p className="mt-2 text-sm text-[var(--dashboard-soft)]">
          This automation does not exist or was deleted.
        </p>
        <Link
          href="/automations"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--dashboard-accent)] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--dashboard-accent-foreground)] transition hover:bg-[var(--dashboard-accent-hover)]"
        >
          <ArrowLeft className="size-4" />
          Back to automations
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <Link
          href="/automations"
          className="section-kicker mb-3 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-3" />
          Automations
        </Link>
        <h1 className="font-display text-5xl font-bold leading-[0.9] tracking-wide">
          Workflow <span className="text-[var(--dashboard-accent)]">builder</span>
        </h1>
        <p className="mt-3 text-sm text-[var(--dashboard-muted)]">
          Configure your trigger, conditions, and action for this automation.
        </p>
      </div>

      <WorkflowBuilder automation={automation} />
    </div>
  );
}
