import { AlertTriangle, CheckCircle2, Megaphone, Sparkles, XCircle } from "lucide-react";

import { Select } from "@/components/ui/select";
import {
  EmptyState,
  fieldClassName,
  PageHeader,
  Panel,
  RecordCard,
  StatusBadge,
  StatusControl,
  submitClassName,
  textAreaClassName,
} from "@/components/shared/module-ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createCampaignAction } from "@/server/actions/workspace-modules";
import {
  decideContentApprovalAction,
  generateCampaignDraftsAction,
} from "@/server/actions/ai-campaigns";
import {
  listActiveOffers,
  listCampaignAiRequests,
  listContentApprovals,
} from "@/server/queries/ai-campaigns";
import { listCampaigns } from "@/server/queries/workspace-modules";

export default async function CampaignsPage() {
  const context = await requirePermission("campaigns:read");
  const [records, offers, aiRequests, approvals] = await Promise.all([
    listCampaigns(context.workspaceId),
    listActiveOffers(context.workspaceId),
    listCampaignAiRequests(context.workspaceId),
    listContentApprovals(context.workspaceId),
  ]);
  const canWrite = hasPermission(context.role, "campaigns:write");
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");

  return (
    <div className="grid gap-5">
      <PageHeader kicker="Campaigns" title="Plan marketing work with a clear owner and finish line." description={`${records.length} manual campaigns across email, social, and content.`} />
      {canWrite && records.length && offers.length ? (
        <Panel className="relative overflow-hidden border-[var(--dashboard-accent-border)] bg-[var(--dashboard-accent-soft)]">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--dashboard-accent-soft)] blur-3xl" />
          <div className="relative grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2 text-[var(--dashboard-accent)]">
                <Sparkles className="size-4" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]">Supervised AI planner</p>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-wide">Turn a campaign brief into drafts your team controls.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">The planner creates editable social posts, email drafts, follow-up tasks, and review items. Nothing is sent or published automatically.</p>
            </div>
            <form action={generateCampaignDraftsAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="requestKey" value={crypto.randomUUID()} />
              <Select required name="campaignId" placeholder="Choose campaign" options={records.map((item) => ({ value: item.id, label: item.name }))} />
              <Select required name="offerId" placeholder="Choose offer" options={offers.map((item) => ({ value: item.id, label: item.name }))} />
              <textarea required name="goal" placeholder="Goal: promote the workshop and book discovery calls this month" className={textAreaClassName} />
              <textarea required name="targetAudience" placeholder="Audience: small service businesses that need a repeatable sales process" className={textAreaClassName} />
              <button className={`${submitClassName} md:col-span-2`}><Sparkles className="mr-2 size-4" />Generate reviewable drafts</button>
            </form>
          </div>
        </Panel>
      ) : null}
      {pendingApprovals.length ? (
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="section-kicker">Approval queue</p><h2 className="mt-2 font-display text-2xl font-bold tracking-wide">Review AI output before it moves.</h2></div>
            <p className="text-xs text-[var(--dashboard-icon)]">{pendingApprovals.length} pending items</p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {pendingApprovals.map((approval) => (
              <article key={approval.id} className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--dashboard-accent)]">{approval.draftType.replaceAll("_", " ")}</p><h3 className="mt-1 font-display text-xl font-bold tracking-wide">{approval.campaignName}</h3></div>
                  {approval.riskFlags.length ? <AlertTriangle className="size-4 text-[#ffca62]" /> : <CheckCircle2 className="size-4 text-[var(--dashboard-accent)]" />}
                </div>
                {approval.riskFlags.length ? <div className="mt-3 grid gap-2">{approval.riskFlags.map((flag) => <p key={`${approval.id}-${flag.code}`} className="rounded-xl border border-[#ffca62]/20 bg-[#ffca62]/[0.06] px-3 py-2 text-xs leading-5 text-[#ffda91]">{flag.message}</p>)}</div> : <p className="mt-3 text-xs leading-5 text-[var(--dashboard-icon)]">No deterministic risk flags were found. Human review is still required.</p>}
                <form action={decideContentApprovalAction} className="mt-4 flex gap-2">
                  <input type="hidden" name="approvalId" value={approval.id} />
                  <button name="decision" value="approved" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--dashboard-accent-border)] px-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--dashboard-accent)]"><CheckCircle2 className="size-3.5" />Approve</button>
                  <button name="decision" value="rejected" className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#ff7f6b]/30 px-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#ff9b8b]"><XCircle className="size-3.5" />Reject</button>
                </form>
              </article>
            ))}
          </div>
        </Panel>
      ) : null}
      {aiRequests.length ? (
        <Panel>
          <p className="section-kicker">AI activity</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {aiRequests.map((request) => <article key={request.id} className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-xl font-bold tracking-wide">{request.campaignName}</h3><StatusBadge value={request.status} /></div><p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">{request.summary || request.safeErrorMessage || "Campaign planning is processing."}</p>{request.recommendedAngle ? <p className="mt-3 border-l border-[var(--dashboard-accent-border)] pl-3 text-xs leading-5 text-[var(--dashboard-icon)]">{request.recommendedAngle}</p> : null}</article>)}
          </div>
        </Panel>
      ) : null}
      {canWrite ? (
        <Panel>
          <h2 className="font-display text-2xl font-bold tracking-wide">Create campaign</h2>
          <form action={createCampaignAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input required name="name" placeholder="Campaign name" className={fieldClassName} />
            <Select name="channel" defaultValue="multi_channel" options={[{ value: "multi_channel", label: "Multi-channel" }, { value: "email", label: "Email" }, { value: "social", label: "Social" }, { value: "content", label: "Content" }]} />
            <Select name="status" defaultValue="draft" options={[{ value: "draft", label: "Draft" }, { value: "planned", label: "Planned" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }]} />
            <input name="budgetCents" type="number" min="0" placeholder="Budget in cents" className={fieldClassName} />
            <input name="startsAt" type="datetime-local" className={fieldClassName} />
            <input name="endsAt" type="datetime-local" className={fieldClassName} />
            <textarea name="objective" placeholder="Objective and audience" className={`${textAreaClassName} md:col-span-2`} />
            <button className={submitClassName}>Create campaign</button>
          </form>
        </Panel>
      ) : null}
      {records.length ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {records.map((record) => (
            <RecordCard key={record.id} title={record.name} metadata={`${record.channel.replaceAll("_", " ")} · ${formatCurrency(record.budgetCents)}`}>
              <div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="campaign" entityId={record.id} value={record.status} options={["draft", "planned", "active", "completed", "archived"]} /> : <StatusBadge value={record.status} />}<Megaphone className="size-4 text-[var(--dashboard-icon)]" /></div>
              <p className="mt-3 text-sm leading-6 text-[var(--dashboard-muted)]">{record.objective || "Objective not documented yet."}</p>
              {record.startsAt ? <p className="mt-3 text-xs text-[var(--dashboard-icon)]">Starts {formatDate(record.startsAt)}</p> : null}
            </RecordCard>
          ))}
        </section>
      ) : <EmptyState title="No campaigns yet" description="Create a campaign brief, then attach manually prepared social and email drafts." />}
    </div>
  );
}
