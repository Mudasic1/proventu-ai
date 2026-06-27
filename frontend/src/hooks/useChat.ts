"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useChat as useVercelChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import type { Message, AIModel } from "@/lib/chat/types";
import { AVAILABLE_MODELS } from "@/lib/chat/types";
import { useConversation } from "@/hooks/useConversation";

function uiMessageToMessage(uiMsg: {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
}): Message {
  return {
    id: uiMsg.id,
    role: (uiMsg.role === "assistant" ? "assistant" : "user") as
      | "assistant"
      | "user",
    content: uiMsg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join(""),
    createdAt: new Date(),
  };
}

function messageToParts(
  msg: Message,
): Array<{ type: "text"; text: string }> {
  return [{ type: "text" as const, text: msg.content }];
}

function flattenVercelMessages(
  msgs: Array<{
    id: string;
    role: string;
    parts: Array<{ type: string; text?: string }>;
  }>,
): Message[] {
  return msgs.map(uiMessageToMessage);
}

export function useChat() {
  const {
    conversations,
    createConversation,
    deleteConversation,
    updateConversation,
    togglePin,
    toggleArchive,
    renameConversation,
  } = useConversation();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    AVAILABLE_MODELS[0],
  );
  const [agentMode, setAgentMode] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  const activeConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId)
    : null;

  const vercelMessagesRef = useRef<
    Array<{
      id: string;
      role: string;
      parts: Array<{ type: string; text?: string }>;
    }>
  >([]);

  const {
    messages: vercelMessages,
    setMessages: setVercelMessages,
    sendMessage: vercelSendMessage,
    status,
    stop,
    regenerate: vercelRegenerate,
  } = useVercelChat({
    transport: new TextStreamChatTransport({
      api: "/api/ai/chat",
    }),
    onFinish: () => {
      const id = activeIdRef.current;
      if (!id || syncingRef.current) return;
      const msgs = flattenVercelMessages(vercelMessagesRef.current);
      updateConversation(id, { messages: msgs, updatedAt: new Date() });
    },
  });

  useEffect(() => {
    vercelMessagesRef.current = vercelMessages;
  }, [vercelMessages]);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const saveCurrentMessages = useCallback(() => {
    const id = activeIdRef.current;
    if (!id) return;
    const msgs = flattenVercelMessages(vercelMessagesRef.current);
    updateConversation(id, { messages: msgs, updatedAt: new Date() });
  }, [updateConversation]);

  const selectConversation = useCallback(
    (id: string | null) => {
      syncingRef.current = true;
      saveCurrentMessages();
      setActiveConversationId(id);
      if (id) {
        const conv = conversations.find((c) => c.id === id);
        if (conv && conv.messages.length > 0) {
          setVercelMessages(
            conv.messages.map((m) => ({
              id: m.id,
              role: m.role,
              parts: messageToParts(m),
            })),
          );
        } else {
          setVercelMessages([]);
        }
      } else {
        setVercelMessages([]);
      }
      queueMicrotask(() => {
        syncingRef.current = false;
      });
    },
    [conversations, saveCurrentMessages, setVercelMessages],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      let id = activeConversationId;
      if (!id) {
        id = createConversation();
        setActiveConversationId(id);
      }
      const conv = conversations.find((c) => c.id === id);
      if (conv && conv.title === "New conversation") {
        const title =
          content.length > 60 ? content.slice(0, 60) + "..." : content;
        renameConversation(id, title);
      }
      vercelSendMessage({ text: content }, { body: { agentMode } });
    },
    [
      activeConversationId,
      createConversation,
      vercelSendMessage,
      conversations,
      renameConversation,
      agentMode,
    ],
  );

  const startNewConversation = useCallback(() => {
    const id = createConversation();
    selectConversation(id);
    return id;
  }, [createConversation, selectConversation]);

  const regenerateLast = useCallback(() => {
    vercelRegenerate();
  }, [vercelRegenerate]);

  const clearConversation = useCallback(() => {
    if (activeConversationId) {
      deleteConversation(activeConversationId);
      setActiveConversationId(null);
      syncingRef.current = true;
      setVercelMessages([]);
      queueMicrotask(() => {
        syncingRef.current = false;
      });
    }
  }, [activeConversationId, deleteConversation, setVercelMessages]);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    messages: activeConversation?.messages ?? [],
    isTyping: status === "submitted" || status === "streaming",
    selectedModel,
    agentMode,
    setSelectedModel,
    setAgentMode,
    startNewConversation,
    selectConversation,
    sendMessage,
    regenerateLast,
    stopGeneration: stop,
    clearConversation,
    deleteConversation,
    togglePin,
    toggleArchive,
    renameConversation,
    status,
  };
}
