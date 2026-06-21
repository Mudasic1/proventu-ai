"use client";

import { useRef, useState } from "react";
import { Bot, MessageSquare, SendHorizonal, Sparkles, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestedQuestions = [
  "What campaigns are running this week?",
  "Which leads need follow-up today?",
  "Draft a quick social post for our new feature",
  "Summarize my pipeline status",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function handleSend(content: string) {
    if (!content.trim() || isTyping) return;
    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    const contextIntro = agentMode
      ? "You are an AI sales agent for ProventuAI. You can analyze data, draft campaigns, score leads, and suggest follow-ups. "
      : "You are a helpful assistant for ProventuAI users. ";

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          agentMode,
          contextIntro,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  return (
    <section className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--dashboard-border)] bg-white px-5 py-4 shadow-[var(--dashboard-shadow)]">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg">
            <Bot className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide">
              AI Chat
            </h2>
            <p className="text-xs text-[var(--dashboard-soft)]">
              {agentMode ? "Agent mode · I can take actions" : "Q&A mode · Ask me anything"}
            </p>
          </div>
        </div>

        {/* Agent Mode Toggle */}
        <label className="relative inline-flex cursor-pointer items-center gap-3 group">
          <span className={`text-xs font-extrabold uppercase tracking-[0.1em] transition-colors duration-300 ${agentMode ? "text-[var(--dashboard-accent)]" : "text-[var(--dashboard-soft)]"}`}>
            Agent mode
          </span>
          <input
            type="checkbox"
            checked={agentMode}
            onChange={() => setAgentMode((prev) => !prev)}
            className="peer sr-only"
          />
          <div className="peer relative h-7 w-12 rounded-full bg-gray-200 shadow-inner transition-all duration-300 after:absolute after:start-[3px] after:top-[3px] after:size-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:ease-out after:content-[''] group-hover:after:shadow-lg peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-rose-500 peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Messages */}
      <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-[var(--dashboard-border)] bg-white p-4 shadow-[var(--dashboard-shadow)] sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 text-red-500 shadow-inner">
              <MessageSquare className="size-7" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-wide">
              Ask me anything about your workspace
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--dashboard-soft)]">
              {agentMode
                ? "Agent mode is on — I can draft campaigns, score leads, suggest follow-ups, and summarize pipeline data."
                : "Ask questions about your contacts, campaigns, or tasks. Toggle agent mode above for full workspace actions."}
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="card-enter rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-muted)] transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`msg-enter flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                style={{ animationDelay: `${i === messages.length - 1 ? 0 : i * 30}ms` }}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-red-500 to-rose-500 text-white"
                      : "bg-gray-100 text-[var(--dashboard-soft)]"
                  }`}
                >
                  {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-red-500 to-rose-500 text-white"
                      : "bg-gray-100 text-[var(--dashboard-fg)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="msg-enter flex gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gray-100 text-[var(--dashboard-soft)]">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms] [animation-duration:800ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms] [animation-duration:800ms]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms] [animation-duration:800ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 rounded-2xl border border-[var(--dashboard-border)] bg-white p-3 shadow-[var(--dashboard-shadow)]">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              agentMode
                ? "Tell your agent what to do..."
                : "Ask a question about your workspace..."
            }
            className="flex-1 bg-transparent px-2 text-sm text-[var(--dashboard-fg)] outline-none placeholder:text-[var(--dashboard-subtle)]"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <SendHorizonal className="size-4" />
          </button>
        </div>
        {agentMode && (
          <div className="msg-enter mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]">
            <Sparkles className="size-3" />
            Agent can draft, analyze, and take actions in your workspace
          </div>
        )}
      </div>
    </section>
  );
}
