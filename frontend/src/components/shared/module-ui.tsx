import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { updateWorkspaceRecordStatusAction } from "@/server/actions/workspace-modules";
import type { WorkspaceRecordType } from "@/server/mutations/workspace-modules";

export const fieldClassName =
  "h-11 w-full rounded-xl border border-white/[0.11] bg-white/[0.055] px-3.5 text-sm text-[#f4f2ea] outline-none transition placeholder:text-[#71817b] focus:border-[#d8ff62]/60 focus:ring-3 focus:ring-[#d8ff62]/12";

export const textAreaClassName =
  "min-h-28 w-full rounded-xl border border-white/[0.11] bg-white/[0.055] px-3.5 py-3 text-sm text-[#f4f2ea] outline-none transition placeholder:text-[#71817b] focus:border-[#d8ff62]/60 focus:ring-3 focus:ring-[#d8ff62]/12";

export const submitClassName =
  "inline-flex h-11 items-center justify-center rounded-xl bg-[#d8ff62] px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#10211c] transition hover:bg-[#e5ff92]";

type PageHeaderProps = {
  kicker: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function PageHeader({ kicker, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl font-bold leading-[0.9] tracking-[-0.09em]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9eaea8]">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  detail?: string;
}) {
  return (
    <article className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4">
      <Icon className="size-4 text-[#d8ff62]" />
      <p className="mt-8 font-display text-4xl font-bold tracking-[-0.09em]">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#82928c]">
        {label}
      </p>
      {detail ? <p className="mt-2 text-xs text-[#71817b]">{detail}</p> : null}
    </article>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.13] bg-[#0b1916]/70 px-5 py-10 text-center">
      <p className="font-display text-xl font-bold tracking-[-0.06em]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#82928c]">{description}</p>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-[#d8ff62]/20 bg-[#d8ff62]/8 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d8ff62]">
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function StatusControl({
  entityType,
  entityId,
  value,
  options,
}: {
  entityType: WorkspaceRecordType;
  entityId: string;
  value: string;
  options: readonly string[];
}) {
  return (
    <form action={updateWorkspaceRecordStatusAction.bind(null, entityType, entityId)} className="flex gap-2">
      <select name="status" defaultValue={value} className="h-8 min-w-28 rounded-lg border border-white/[0.1] bg-[#10211c] px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#d8ff62]">
        {options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
      </select>
      <button className="rounded-lg border border-[#d8ff62]/25 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#d8ff62]">
        Save
      </button>
    </form>
  );
}

export function RecordCard({
  title,
  metadata,
  children,
}: {
  title: string;
  metadata?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#0b1916] p-4">
      <h3 className="font-display text-xl font-bold tracking-[-0.06em]">{title}</h3>
      {metadata ? <p className="mt-1 text-xs text-[#82928c]">{metadata}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
