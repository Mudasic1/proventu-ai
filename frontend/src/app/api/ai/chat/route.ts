import { NextRequest, NextResponse } from "next/server";

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
    "Be proactive — suggest specific actions the user can take. " +
    "Keep responses structured and actionable.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, agentMode } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemPrompt = agentMode ? systemPrompts.agent : systemPrompts.default;

    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    if (serverEnv.AI_BACKEND_URL && serverEnv.AI_BACKEND_SHARED_SECRET) {
      const response = await fetch(`${serverEnv.AI_BACKEND_URL}/v1/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-ai-backend-secret": serverEnv.AI_BACKEND_SHARED_SECRET,
        },
        body: JSON.stringify({ messages: llmMessages }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json({ message: data.message });
    }

    // Fallback: use a simple echo when backend is not configured
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const userContent = lastUserMsg?.content || "";

    const fallbackResponses: Record<string, string> = {
      default:
        "Thanks for your question! I'm running in preview mode. " +
        "Connect the AI backend (AI_BACKEND_URL and AI_BACKEND_SHARED_SECRET in .env.local) " +
        "for full chat capabilities. Until then, explore the dashboard to manage your workspace.",
      agent:
        "Agent mode is active! I'm in preview mode. " +
        "To enable full agent capabilities — drafting campaigns, scoring leads, " +
        "and analyzing pipeline — configure the AI backend in your environment. " +
        "Your workspace data is ready and waiting.",
    };

    const prefix = agentMode ? fallbackResponses.agent : fallbackResponses.default;

    const reply = `${prefix}\n\nYou said: "${userContent}"`;

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your message. Please try again." },
      { status: 500 },
    );
  }
}
