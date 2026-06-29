"use client";

import { useRef, useEffect } from "react";
import {
  Settings,
  BarChart3,
  Bot,
  Square,
} from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ModelSelector } from "@/components/chat/model-selector";
import { MessageBubble } from "@/components/chat/message-bubble";
import { PromptInput } from "@/components/chat/prompt-input";
import { EmptyState } from "@/components/chat/empty-state";
import { ToolCards } from "@/components/chat/tool-cards";
import { AVAILABLE_MODELS } from "@/lib/chat/types";
import type { Message, AIModel } from "@/lib/chat/types";

type ChatWorkspaceProps = {
  messages: Message[];
  isTyping: boolean;
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
  onSend: (content: string) => void;
  onStopGeneration: () => void;
  onSuggestionClick: (text: string) => void;
  onToolSelect: (prompt: string) => void;
  onRegenerate: () => void;
  agentMode: boolean;
  onAgentModeChange: (enabled: boolean) => void;
};

function TypingIndicator() {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex size-8 items-center justify-center rounded-xl bg-[var(--dashboard-accent-soft)] ring-1 ring-[var(--dashboard-accent-border)]">
        <Bot className="size-4 text-[var(--dashboard-accent)]" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl bg-[var(--dashboard-control)] px-4 py-3.5 ring-1 ring-[var(--dashboard-border)]">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="size-2 rounded-full bg-[var(--dashboard-accent)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </m.div>
  );
}

export function ChatWorkspace({
  messages,
  isTyping,
  selectedModel,
  onModelSelect,
  onSend,
  onStopGeneration,
  onSuggestionClick,
  onToolSelect,
  onRegenerate,
  agentMode,
  onAgentModeChange,
}: ChatWorkspaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="flex h-full flex-col">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between border-b border-[var(--dashboard-border)] px-6 py-3"
        >
          <div className="flex items-center gap-3">
            <ModelSelector
              models={AVAILABLE_MODELS}
              selected={selectedModel}
              onSelect={onModelSelect}
            />
            <span className="flex items-center gap-1.5 rounded-full bg-[var(--dashboard-accent-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--dashboard-accent)]">
              <span className="size-1.5 rounded-full bg-[var(--dashboard-accent)]" />
              Online
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl p-2 text-[var(--dashboard-icon)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]">
              <BarChart3 className="size-4" />
            </button>
            <button className="rounded-xl p-2 text-[var(--dashboard-icon)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]">
              <Settings className="size-4" />
            </button>
          </div>
        </m.div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--dashboard-border)]">
          {!hasMessages ? (
            <EmptyState onSuggestionClick={onSuggestionClick} />
          ) : (
            <div className="mx-auto w-full max-w-5xl space-y-4 px-6 py-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={
                    msg.role === "assistant" && !isTyping
                      ? onRegenerate
                      : undefined
                  }
                />
              ))}
              {isTyping && <TypingIndicator />}

              {!isTyping && (
                <div className="pt-4">
                  <ToolCards onToolSelect={onToolSelect} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Stop generation button */}
        {isTyping && (
          <div className="flex justify-center pb-2">
            <button
              onClick={onStopGeneration}
              className="flex items-center gap-2 rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-4 py-2 text-xs font-medium text-[var(--dashboard-muted)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
            >
              <Square className="size-3" />
              Stop generating
            </button>
          </div>
        )}

        {/* Tool cards in empty state */}
        {!hasMessages && !isTyping && (
          <div className="pb-2">
            <ToolCards onToolSelect={onToolSelect} />
          </div>
        )}

        {/* Prompt input */}
        <PromptInput
          onSend={onSend}
          isTyping={isTyping}
          agentMode={agentMode}
          onAgentModeChange={onAgentModeChange}
        />
      </div>
    </LazyMotion>
  );
}
