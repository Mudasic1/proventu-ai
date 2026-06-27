"use client";

import {
  ChartNoAxesCombined,
  Megaphone,
  ContactRound,
  Mail,
  ClipboardCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { QUICK_TOOLS } from "@/lib/chat/types";

const iconMap: Record<string, LucideIcon> = {
  ChartNoAxesCombined,
  Megaphone,
  ContactRound,
  Mail,
  ClipboardCheck,
  TrendingUp,
};

type ToolCardsProps = {
  onToolSelect: (prompt: string) => void;
};

export function ToolCards({ onToolSelect }: ToolCardsProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-5xl px-6 pb-3"
      >
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {QUICK_TOOLS.map((tool) => {
            const Icon = iconMap[tool.icon];
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.prompt)}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-2 py-3 text-center transition-all hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-accent-soft)] hover:shadow-lg"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color} shadow-lg`}
                >
                  {Icon && <Icon className="size-4 text-white" />}
                </div>
                <span className="text-[11px] font-medium leading-tight text-[var(--dashboard-muted)] transition-colors group-hover:text-[var(--dashboard-fg)]">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </m.div>
    </LazyMotion>
  );
}
