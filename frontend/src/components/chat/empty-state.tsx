"use client";

import { Sparkles } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { SUGGESTIONS } from "@/lib/chat/types";

type EmptyStateProps = {
  onSuggestionClick: (text: string) => void;
};

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="flex h-full flex-col items-center justify-center px-4">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--dashboard-accent)] via-[var(--dashboard-accent)] to-orange-500 shadow-2xl shadow-[var(--dashboard-accent)]/30">
              <Sparkles className="size-10 text-white" />
            </div>
            <m.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-4 rounded-3xl bg-[var(--dashboard-accent)]/20 blur-xl"
            />
          </div>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-2 text-2xl font-semibold tracking-tight text-[var(--dashboard-fg)]"
        >
          How can I help you today?
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-sm text-[var(--dashboard-muted)]"
        >
          Ask anything or choose a suggestion to get started
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid w-full max-w-lg gap-2 sm:grid-cols-2"
        >
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className="group rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-4 py-3 text-left text-sm text-[var(--dashboard-muted)] transition-all hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-accent-soft)] hover:text-[var(--dashboard-accent)] hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-[var(--dashboard-control)] text-[10px] font-bold text-[var(--dashboard-subtle)] group-hover:bg-[var(--dashboard-accent-soft)] group-hover:text-[var(--dashboard-accent)]">
                  {i + 1}
                </span>
                {suggestion}
              </span>
            </button>
          ))}
        </m.div>
      </div>
    </LazyMotion>
  );
}
