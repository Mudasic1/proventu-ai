import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-white/[0.11] bg-white/[0.055] px-3.5 py-3 text-sm text-[#f4f2ea] shadow-xs outline-none transition placeholder:text-[#71817b] focus-visible:border-[#d8ff62]/60 focus-visible:ring-3 focus-visible:ring-[#d8ff62]/12 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
