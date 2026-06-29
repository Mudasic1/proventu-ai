import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] px-3.5 py-3 text-sm text-[var(--dashboard-fg)] shadow-xs outline-none transition placeholder:text-[var(--dashboard-subtle)] focus-visible:border-[var(--dashboard-accent-border)] focus-visible:ring-3 focus-visible:ring-[var(--dashboard-accent-soft)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
