import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { moveDealAction } from "@/server/actions/pipeline";

type PipelineBoardProps = {
  canWrite?: boolean;
  stages: {
    id: string;
    name: string;
    terminalKind: string | null;
  }[];
  deals: {
    id: string;
    title: string;
    valueCents: number;
    status: string;
    stageId: string;
    contactFirstName: string | null;
    contactLastName: string | null;
    expectedCloseAt: Date | null;
  }[];
};

export function PipelineBoard({ stages, deals, canWrite = true }: PipelineBoardProps) {
  const activeStages = stages.filter((stage) => !stage.terminalKind);
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {activeStages.map((stage) => {
        const stageDeals = deals.filter(
          (deal) => deal.stageId === stage.id && deal.status === "open",
        );
        return (
          <section key={stage.id} className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between px-1 pb-3">
              <h2 className="font-display text-xl font-bold tracking-[-0.06em]">{stage.name}</h2>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-[#a8b6b1]">{stageDeals.length}</span>
            </div>
            <div className="grid gap-2.5">
              {stageDeals.map((deal) => (
                <article key={deal.id} className="rounded-2xl border border-white/[0.08] bg-[#0b1916] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/sales/deals/${deal.id}`} className="font-bold text-[#f4f2ea] hover:text-[#d8ff62]">
                      {deal.title}
                    </Link>
                    <span className="text-xs font-bold text-[#d8ff62]">{formatCurrency(deal.valueCents)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#82928c]">
                    {[deal.contactFirstName, deal.contactLastName].filter(Boolean).join(" ") || "No contact assigned"}
                  </p>
                  <p className="mt-3 flex items-center gap-1 text-[11px] text-[#9eaea8]">
                    <CalendarClock className="size-3.5" />
                    {formatDate(deal.expectedCloseAt)}
                  </p>
                  {canWrite ? <form action={moveDealAction.bind(null, deal.id)} className="mt-3 flex gap-2">
                    <select name="stageId" defaultValue={stage.id} aria-label={`Move ${deal.title} to stage`} className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-[#10211c] px-2 text-xs">
                      {activeStages.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <Button size="icon-sm" variant="outline" aria-label={`Move ${deal.title}`}>
                      <ArrowRight />
                    </Button>
                  </form> : null}
                </article>
              ))}
              {stageDeals.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/[0.09] p-4 text-center text-xs text-[#71817b]">No open deals</p>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
