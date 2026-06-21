import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] px-3.5 py-2 text-sm text-[var(--dashboard-fg)] shadow-xs outline-none transition placeholder:text-[var(--dashboard-subtle)] focus-visible:border-[var(--dashboard-accent-border)] focus-visible:ring-3 focus-visible:ring-[var(--dashboard-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
