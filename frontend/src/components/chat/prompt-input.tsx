"use client";

import { useRef, useState, useMemo, type KeyboardEvent } from "react";
import {
  SendHorizonal,
  Paperclip,
  Mic,
  ImageUp,
  Bot,
  Sparkles,
  ChartNoAxesCombined,
  Megaphone,
  ContactRound,
  Mail,
  ClipboardCheck,
  TrendingUp,
  History,
  type LucideIcon,
} from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { SLASH_COMMANDS } from "@/lib/chat/types";

const slashIconMap: Record<string, LucideIcon> = {
  ChartNoAxesCombined,
  Megaphone,
  ContactRound,
  Mail,
  ClipboardCheck,
  TrendingUp,
  History,
};

type PromptInputProps = {
  onSend: (content: string) => void;
  isTyping: boolean;
  placeholder?: string;
  agentMode: boolean;
  onAgentModeChange: (enabled: boolean) => void;
};

export function PromptInput({
  onSend,
  isTyping,
  placeholder = "Ask anything about your workspace...",
  agentMode,
  onAgentModeChange,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashRef = useRef<HTMLDivElement>(null);

  const hasValue = value.trim().length > 0;

  const filteredCommands = useMemo(() => {
    if (!slashOpen) return [];
    return SLASH_COMMANDS.filter((cmd) =>
      cmd.label.toLowerCase().includes(slashQuery.toLowerCase()),
    );
  }, [slashOpen, slashQuery]);

  const handleSend = () => {
    if (!hasValue || isTyping) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const applySlashCommand = (prompt: string) => {
    setValue(prompt);
    setSlashOpen(false);
    setSlashQuery("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashOpen && filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySlashCommand(filteredCommands[selectedIndex].prompt);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashOpen(false);
        setSlashQuery("");
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Enter" && e.shiftKey) {
      setTimeout(autoResize, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);

    const slashIndex = next.lastIndexOf("/");
    if (slashIndex >= 0 && (slashIndex === 0 || next[slashIndex - 1] === " ")) {
      const afterSlash = next.slice(slashIndex + 1);
      if (!afterSlash.includes(" ")) {
        setSlashOpen(true);
        setSlashQuery(afterSlash);
        setSelectedIndex(0);
        autoResize();
        return;
      }
    }

    if (slashOpen) {
      setSlashOpen(false);
      setSlashQuery("");
    }
    autoResize();
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="mx-auto w-full max-w-5xl px-6 pb-4">
        <div className="relative rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-[var(--dashboard-shadow)] backdrop-blur-xl transition-all focus-within:border-[var(--dashboard-accent-border)] focus-within:shadow-[var(--dashboard-accent)]/10">
          {/* Slash command dropdown */}
          <AnimatePresence>
            {slashOpen && filteredCommands.length > 0 && (
              <m.div
                ref={slashRef}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-full left-4 z-50 mb-2 w-72 overflow-hidden rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] shadow-2xl"
              >
                <div className="p-1.5">
                  {filteredCommands.map((cmd, i) => {
                    const Icon = slashIconMap[cmd.icon];
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => applySlashCommand(cmd.prompt)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          i === selectedIndex
                            ? "bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]"
                            : "text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                        }`}
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--dashboard-control)]">
                          {Icon && <Icon className="size-3.5" />}
                        </div>
                        <div className="flex-1">
                          <span className="font-mono text-xs font-semibold">
                            /{cmd.label}
                          </span>
                          <p className="text-[11px] text-[var(--dashboard-subtle)]">
                            {cmd.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 p-2">
            <div className="flex items-center gap-1 pl-1">
              <button
                className="rounded-xl p-2 text-[var(--dashboard-icon)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                title="Attach file"
              >
                <Paperclip className="size-4" />
              </button>
              <button
                className="rounded-xl p-2 text-[var(--dashboard-icon)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                title="Voice input"
              >
                <Mic className="size-4" />
              </button>
              <button
                className="rounded-xl p-2 text-[var(--dashboard-icon)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                title="Upload image"
              >
                <ImageUp className="size-4" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="max-h-60 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-[var(--dashboard-fg)] outline-none placeholder:text-[var(--dashboard-subtle)]"
            />

            <button
              onClick={handleSend}
              disabled={!hasValue || isTyping}
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                hasValue && !isTyping
                  ? "bg-[var(--dashboard-accent)] text-white shadow-lg shadow-[var(--dashboard-accent)]/25 hover:scale-105 hover:opacity-90 active:scale-95"
                  : "bg-[var(--dashboard-control)] text-[var(--dashboard-icon)]"
              }`}
            >
              <SendHorizonal className="size-4" />
            </button>
          </div>
        </div>

        {/* Agent Mode toggle */}
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => onAgentModeChange(!agentMode)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
              agentMode
                ? "border-[var(--dashboard-accent)] bg-[var(--dashboard-accent)] text-white shadow-sm"
                : "border-[var(--dashboard-border)] text-[var(--dashboard-subtle)] hover:border-[var(--dashboard-accent-border)] hover:text-[var(--dashboard-accent)]"
            }`}
          >
            <Bot className="size-3.5" />
            {agentMode ? "Agent \u00b7 On" : "Agent \u00b7 Off"}
            {agentMode && <Sparkles className="size-3" />}
          </button>

          <p className="text-[11px] text-[var(--dashboard-subtle)]">
            ProventuAI may produce inaccurate information. Verify important facts.
          </p>
        </div>
      </div>
    </LazyMotion>
  );
}
