import * as React from "react";

import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = Omit<React.ComponentProps<"select">, "children"> & {
  options: SelectOption[];
  placeholder?: string;
};

function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/[0.11] bg-[#10211c] px-3.5 py-2 text-sm text-[#f4f2ea] shadow-xs outline-none transition focus-visible:border-[#d8ff62]/60 focus-visible:ring-3 focus-visible:ring-[#d8ff62]/12 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { Select };
