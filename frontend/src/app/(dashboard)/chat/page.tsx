"use client";

import { useCallback, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    isTyping,
    selectedModel,
    agentMode,
    startNewConversation,
    selectConversation,
    sendMessage,
    regenerateLast,
    stopGeneration,
    deleteConversation,
    togglePin,
    toggleArchive,
    renameConversation,
    setSelectedModel,
    setAgentMode,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNewChat = useCallback(() => {
    startNewConversation();
  }, [startNewConversation]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      selectConversation(id);
    },
    [selectConversation],
  );

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSend(text);
    },
    [handleSend],
  );

  const handleToolSelect = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const handleRegenerate = useCallback(() => {
    regenerateLast();
  }, [regenerateLast]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--dashboard-bg)]">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        onTogglePin={togglePin}
        onToggleArchive={toggleArchive}
        onRenameConversation={renameConversation}
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex flex-1 flex-col bg-[var(--dashboard-elevated)]">
        <ChatWorkspace
          messages={messages}
          isTyping={isTyping}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          onSend={handleSend}
          onStopGeneration={stopGeneration}
          onSuggestionClick={handleSuggestionClick}
          onToolSelect={handleToolSelect}
          onRegenerate={handleRegenerate}
          agentMode={agentMode}
          onAgentModeChange={setAgentMode}
        />
      </div>
    </div>
  );
}
