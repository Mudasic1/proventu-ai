import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy, XCircle } from "lucide-react";

import { TaskForm } from "@/components/pipeline/task-form";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { closeDealAction } from "@/server/actions/pipeline";
import { listContacts } from "@/server/queries/contacts";
import {
  getDeal,
  getDefaultPipeline,
  listPipelineDeals,
} from "@/server/queries/pipeline";

export default async function DealPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await params;
  const context = await requirePermission("pipeline:read");
  const canWriteDeals = hasPermission(context.role, "pipeline:write");
  const canWriteTasks = hasPermission(context.role, "tasks:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;
  const record = await getDeal(context.workspaceId, dealId, ownerUserId);
  if (!record) notFound();
  const pipeline = await getDefaultPipeline(context.workspaceId);
  const [contacts, deals] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    pipeline ? listPipelineDeals(context.workspaceId, pipeline.id, ownerUserId) : [],
  ]);
  return (
    <div className="grid gap-5">
      <Link href="/sales/pipeline" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]"><ArrowLeft className="size-4" /> Pipeline</Link>
      <section className="rounded-[24px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dashboard-icon)]">{record.status}</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-wide">{record.title}</h1>
        <div className="mt-5 grid gap-3 text-sm text-[var(--dashboard-muted)] sm:grid-cols-3">
          <p><span className="block text-xs text-[var(--dashboard-icon)]">Value</span>{formatCurrency(record.valueCents)}</p>
          <p><span className="block text-xs text-[var(--dashboard-icon)]">Contact</span>{[record.contactFirstName, record.contactLastName].filter(Boolean).join(" ") || "Unassigned"}</p>
          <p><span className="block text-xs text-[var(--dashboard-icon)]">Expected close</span>{formatDate(record.expectedCloseAt)}</p>
        </div>
        {record.notes ? <p className="mt-5 border-t border-[var(--dashboard-border)] pt-4 text-sm leading-6 text-[var(--dashboard-muted)]">{record.notes}</p> : null}
      </section>
      {canWriteDeals && record.status === "open" ? (
        <section className="grid gap-4 rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 md:grid-cols-2">
          <form action={closeDealAction.bind(null, dealId)}>
            <input type="hidden" name="outcome" value="won" />
            <Button className="h-11 w-full rounded-full bg-[var(--dashboard-accent)] font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]"><Trophy /> Close as won</Button>
          </form>
          <form action={closeDealAction.bind(null, dealId)} className="flex gap-2">
            <input type="hidden" name="outcome" value="lost" />
            <input name="lostReason" required placeholder="Reason deal was lost" className="min-w-0 flex-1 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] px-3 text-sm" />
            <Button variant="destructive" className="h-11 rounded-full"><XCircle /> Close lost</Button>
          </form>
        </section>
      ) : null}
      {canWriteTasks ? <details className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4">
        <summary className="cursor-pointer text-sm font-bold text-[var(--dashboard-accent)]">Add a follow-up for this deal</summary>
        <div className="mt-4"><TaskForm contacts={contacts} deals={deals} defaultDealId={dealId} defaultContactId={record.contactId} /></div>
      </details> : null}
    </div>
  );
}
