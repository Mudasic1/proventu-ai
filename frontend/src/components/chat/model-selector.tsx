"use client";

import { useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import type { AIModel } from "@/lib/chat/types";

type ModelSelectorProps = {
  models: AIModel[];
  selected: AIModel;
  onSelect: (model: AIModel) => void;
};

export function ModelSelector({ models, selected, onSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-3.5 py-2 text-sm font-medium text-[var(--dashboard-fg)] transition-all hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-accent-soft)]"
        >
          <Sparkles className="size-4 text-[var(--dashboard-accent)]" />
          <span>{selected.name}</span>
          <ChevronDown
            className={`size-3.5 text-[var(--dashboard-icon)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <m.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] shadow-2xl backdrop-blur-xl"
              >
                <div className="p-1.5">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                        selected.id === model.id
                          ? "bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]"
                          : "text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                      }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          selected.id === model.id
                            ? "bg-[var(--dashboard-accent-soft)]"
                            : "bg-[var(--dashboard-control)]"
                        }`}
                      >
                        <Sparkles
                          className={`size-4 ${
                            selected.id === model.id
                              ? "text-[var(--dashboard-accent)]"
                              : "text-[var(--dashboard-icon)]"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          {selected.id === model.id && (
                            <Check className="size-3.5 text-[var(--dashboard-accent)]" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-[var(--dashboard-subtle)]">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
