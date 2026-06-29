"use client";

import { useState, useCallback } from "react";
import type { Conversation, Message } from "@/lib/chat/types";

const STORAGE_KEY = "proventuai-conversations";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw, (key, value) => {
      if (key === "createdAt" || key === "updatedAt") return new Date(value);
      return value;
    });
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    console.warn("Failed to persist conversations");
  }
}

let idCounter = 0;
function genId() {
  return `conv_${Date.now()}_${++idCounter}`;
}

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);

  const persist = useCallback(
    (updater: (prev: Conversation[]) => Conversation[]) => {
      setConversations((prev) => {
        const next = updater(prev);
        saveConversations(next);
        return next;
      });
    },
    [],
  );

  const createConversation = useCallback(
    (title?: string): string => {
      const now = new Date();
      const id = genId();
      persist((prev) => [
        {
          id,
          title: title || "New conversation",
          messages: [],
          createdAt: now,
          updatedAt: now,
          pinned: false,
          archived: false,
        },
        ...prev,
      ]);
      return id;
    },
    [persist],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      persist((prev) => prev.filter((c) => c.id !== id));
    },
    [persist],
  );

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      persist((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [persist],
  );

  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      persist((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, message],
                updatedAt: new Date(),
                title:
                  c.title === "New conversation" && message.role === "user"
                    ? message.content.slice(0, 60) + (message.content.length > 60 ? "..." : "")
                    : c.title,
              }
            : c,
        ),
      );
    },
    [persist],
  );

  const togglePin = useCallback(
    (id: string) => {
      persist((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
      );
    },
    [persist],
  );

  const toggleArchive = useCallback(
    (id: string) => {
      persist((prev) =>
        prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
      );
    },
    [persist],
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      persist((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      );
    },
    [persist],
  );

  return {
    conversations,
    createConversation,
    deleteConversation,
    updateConversation,
    addMessage,
    togglePin,
    toggleArchive,
    renameConversation,
  };
}
