"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  options: Option[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
};

export function Select({
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  name,
  className,
  disabled,
  required,
  id,
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      required={required}
    >
      <RadixSelect.Trigger
        id={id}
        className={cn(
          "group flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] px-3.5 text-sm text-[var(--dashboard-fg)] outline-none transition focus-visible:border-[var(--dashboard-accent-border)] focus-visible:ring-3 focus-visible:ring-[var(--dashboard-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-[var(--dashboard-subtle)]",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-[var(--dashboard-icon)] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] p-1 shadow-[var(--dashboard-shadow)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="max-h-60 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--dashboard-border)_transparent]">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm text-[var(--dashboard-fg)] outline-none transition-colors",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  "data-[highlighted]:bg-[var(--dashboard-accent)] data-[highlighted]:text-[var(--dashboard-accent-foreground)]",
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto pl-2">
                  <Check className="size-4" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
