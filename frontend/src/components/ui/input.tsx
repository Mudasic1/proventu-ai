import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/[0.11] bg-white/[0.055] px-3.5 py-2 text-sm text-[#f4f2ea] shadow-xs outline-none transition placeholder:text-[#71817b] focus-visible:border-[#d8ff62]/60 focus-visible:ring-3 focus-visible:ring-[#d8ff62]/12 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
