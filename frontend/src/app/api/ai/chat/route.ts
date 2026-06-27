import { NextRequest } from "next/server";

import { serverEnv } from "@/lib/env/server";

const systemPrompts: Record<string, string> = {
  default:
    "You are a helpful AI assistant for ProventuAI, an AI-powered revenue workspace. " +
    "Answer questions about sales, marketing, CRM, and productivity. " +
    "Keep responses concise and actionable. If you don't know something, say so clearly.",

  agent:
    "You are an AI sales agent for ProventuAI. You have access to the user's workspace data " +
    "including contacts, campaigns, pipeline deals, and tasks. " +
    "You can analyze data, draft campaigns, score leads, and suggest follow-ups. " +
    "Be proactive \u2014 suggest specific actions the user can take. " +
    "Keep responses structured and actionable.",
};

function extractTextContent(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p: unknown): p is { type: string; text?: string } =>
      typeof p === "object" && p !== null && "type" in p,
    )
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

function buildFallbackReply(
  userContent: string,
  agentMode: boolean,
  backendConfigured: boolean,
): string {
  const fallbackResponses: Record<string, string> = {
    default: backendConfigured
      ? "The AI backend is configured but not reachable right now. " +
        "Make sure the backend service is running (uv run uvicorn main:app --port 8000) " +
        "and that AI_BACKEND_URL in .env.local points to the correct address."
      : "Thanks for your question! I'm running in preview mode. " +
        "Connect the AI backend (AI_BACKEND_URL and AI_BACKEND_SHARED_SECRET in .env.local) " +
        "for full chat capabilities. Until then, explore the dashboard to manage your workspace.",
    agent: backendConfigured
      ? "Agent mode is active but the AI backend is not reachable right now. " +
        "Start the backend service and try again."
      : "Agent mode is active! I'm in preview mode. " +
        "To enable full agent capabilities \u2014 drafting campaigns, scoring leads, " +
        "and analyzing pipeline \u2014 configure the AI backend in your environment. " +
        "Your workspace data is ready and waiting.",
  };

  const prefix = agentMode
    ? fallbackResponses.agent
    : fallbackResponses.default;

  return `${prefix}\n\nYou said: "${userContent}"`;
}

function createTextStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < words.length) {
        const chunk = index === 0 ? words[index] : ` ${words[index]}`;
        controller.enqueue(encoder.encode(chunk));
        index++;
        await new Promise((r) => setTimeout(r, 20));
      } else {
        controller.close();
      }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, agentMode } = body;

    const rawMessages = Array.isArray(messages) ? messages : [];

    const extractMsg = (m: unknown) => {
      if (!m || typeof m !== "object") return null;
      const msg = m as Record<string, unknown>;
      const role =
        msg.role === "user" || msg.role === "assistant" ? msg.role : null;
      if (!role) return null;
      const content = Array.isArray(msg.parts)
        ? extractTextContent(msg.parts)
        : typeof msg.content === "string"
          ? msg.content
          : "";
      return { role, content };
    };

    const llmMessages = rawMessages
      .map(extractMsg)
      .filter(Boolean) as { role: string; content: string }[];

    const lastUserMsg = [...llmMessages]
      .reverse()
      .find((m) => m.role === "user");
    const userContent = lastUserMsg?.content || "";

    const systemPrompt = agentMode
      ? systemPrompts.agent
      : systemPrompts.default;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...llmMessages,
    ];

    if (serverEnv.AI_BACKEND_URL && serverEnv.AI_BACKEND_SHARED_SECRET) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60_000);

        const response = await fetch(`${serverEnv.AI_BACKEND_URL}/v1/chat`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-ai-backend-secret": serverEnv.AI_BACKEND_SHARED_SECRET,
          },
          body: JSON.stringify({ messages: fullMessages }),
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI backend returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply: string =
          typeof data.message === "string"
            ? data.message
            : (data.message?.content ?? "");

        const stream = createTextStream(reply);
        return new Response(stream, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      } catch (backendError) {
        const isAbort =
          backendError instanceof Error && backendError.name === "AbortError";
        console.warn(
          isAbort
            ? "Chat API: AI backend request timed out \u2014 returning streaming fallback."
            : "Chat API: AI backend unreachable \u2014 returning streaming fallback.",
          backendError,
        );
      }
    }

    const backendConfigured =
      !!serverEnv.AI_BACKEND_URL && !!serverEnv.AI_BACKEND_SHARED_SECRET;
    const reply = buildFallbackReply(userContent, !!agentMode, backendConfigured);
    const stream = createTextStream(reply);
    return new Response(stream, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const fallback = createTextStream(
      "I'm having trouble processing your request. Please try again.",
    );
    return new Response(fallback, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
