"use client";

import { useState } from "react";
import {
  Bot,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  User,
} from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import type { Message } from "@/lib/chat/types";

type MessageBubbleProps = {
  message: Message;
  onRegenerate?: () => void;
};

export function MessageBubble({ message, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
            isUser
              ? "bg-[var(--dashboard-accent)] shadow-lg shadow-[var(--dashboard-accent)]/20"
              : "bg-[var(--dashboard-accent-soft)] ring-1 ring-[var(--dashboard-accent-border)]"
          }`}
        >
          {isUser ? (
            <User className="size-4 text-white" />
          ) : (
            <Bot className="size-4 text-[var(--dashboard-accent)]" />
          )}
        </div>

        <div className={`group max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "bg-[var(--dashboard-accent)] text-white shadow-lg shadow-[var(--dashboard-accent)]/20"
                : "bg-[var(--dashboard-elevated)] text-[var(--dashboard-fg)] ring-1 ring-[var(--dashboard-border)]"
            }`}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ChatMarkdown content={message.content} />
            )}
          </div>

          {!isUser && (
            <div className="mt-1 flex items-center gap-1 px-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                onClick={handleCopy}
                className="rounded-lg p-1.5 text-[var(--dashboard-muted)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                title="Copy response"
              >
                {copied ? (
                  <Check className="size-3.5 text-[var(--dashboard-accent)]" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="rounded-lg p-1.5 text-[var(--dashboard-muted)] transition-all hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                  title="Regenerate response"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}

              <div className="mx-1 h-4 w-px bg-[var(--dashboard-border)]" />

              <button
                onClick={() => setFeedback(feedback === "like" ? null : "like")}
                className={`rounded-lg p-1.5 transition-all hover:bg-[var(--dashboard-hover)] ${
                  feedback === "like" ? "text-[var(--dashboard-accent)]" : "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-fg)]"
                }`}
                title="Like"
              >
                <ThumbsUp className="size-3.5" />
              </button>
              <button
                onClick={() => setFeedback(feedback === "dislike" ? null : "dislike")}
                className={`rounded-lg p-1.5 transition-all hover:bg-[var(--dashboard-hover)] ${
                  feedback === "dislike" ? "text-[var(--dashboard-accent)]" : "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-fg)]"
                }`}
                title="Dislike"
              >
                <ThumbsDown className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </m.div>
    </LazyMotion>
  );
}
