"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Pin,
  Archive,
  Pencil,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import type { Conversation } from "@/lib/chat/types";

type ChatSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function formatDateLabel(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "Previous 7 days";
  if (days <= 30) return "Earlier this month";
  return "Older";
}

function groupConversations(conversations: Conversation[]) {
  const active = conversations.filter((c) => !c.archived);
  const groups: Record<string, Conversation[]> = {};

  for (const conv of active) {
    const label = formatDateLabel(conv.updatedAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  const order = ["Today", "Yesterday", "Previous 7 days", "Earlier this month", "Older"];
  return order.filter((key) => groups[key]?.length > 0).map((key) => ({ label: key, items: groups[key] }));
}

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onRename,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(conv.title);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
          active
            ? "bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]"
            : "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
        }`}
      >
        <MessageSquare className="size-4 shrink-0" />
        {editing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--dashboard-sidebar-fg)] outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename(editValue);
                  setEditing(false);
                }
                if (e.key === "Escape") {
                  setEditValue(conv.title);
                  setEditing(false);
                }
              }}
            />
            <button
              onClick={() => {
                onRename(editValue);
                setEditing(false);
              }}
              className="rounded p-0.5 text-[var(--dashboard-sidebar-soft)] hover:text-[var(--dashboard-sidebar-fg)]"
            >
              <Check className="size-3.5" />
            </button>
            <button
              onClick={() => {
                setEditValue(conv.title);
                setEditing(false);
              }}
              className="rounded p-0.5 text-[var(--dashboard-sidebar-soft)] hover:text-[var(--dashboard-sidebar-fg)]"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <span className="flex-1 truncate">{conv.title}</span>
        )}
      </button>

      {!editing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <m.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] shadow-2xl"
                >
                  <div className="p-1">
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--dashboard-sidebar-muted)] transition-colors hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
                    >
                      <Pencil className="size-4" />
                      Rename
                    </button>
                    <button
                      onClick={() => { onTogglePin(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--dashboard-sidebar-muted)] transition-colors hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
                    >
                      <Pin className="size-4" />
                      {conv.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => { onToggleArchive(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--dashboard-sidebar-muted)] transition-colors hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
                    >
                      <Archive className="size-4" />
                      Archive
                    </button>
                    <div className="my-1 border-t border-[var(--dashboard-border)]" />
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--dashboard-accent)] transition-colors hover:bg-[var(--dashboard-accent-soft)]"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </m.div>
              </>
            )}
          </AnimatePresence>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="rounded-lg p-1 text-[var(--dashboard-sidebar-soft)] opacity-0 transition-all hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-muted)] group-hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onTogglePin,
  onToggleArchive,
  onRenameConversation,
  collapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const groups = useMemo(
    () => groupConversations(filteredConversations),
    [filteredConversations],
  );

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {collapsed ? (
          <m.aside
            key="collapsed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 0, opacity: 0 }}
            exit={{ width: 280, opacity: 1 }}
            className="hidden h-full lg:block"
          >
            <div className="flex h-full w-0 flex-col overflow-hidden border-r border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)]" />
          </m.aside>
        ) : (
          <m.aside
            key="expanded"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden h-full w-[280px] shrink-0 border-r border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] lg:flex lg:flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--dashboard-border)] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dashboard-accent)] to-orange-500 shadow-lg shadow-[var(--dashboard-accent)]/20">
                  <Sparkles className="size-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-[var(--dashboard-sidebar-fg)]">
                  AI Assistant
                </span>
              </div>
              <button
                onClick={onToggleCollapse}
                className="rounded-lg p-1.5 text-[var(--dashboard-sidebar-soft)] transition-all hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
                title="Close sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </div>

            {/* New Chat */}
            <div className="px-3 pt-3 pb-2">
              <button
                onClick={onNewChat}
                className="flex w-full items-center gap-2.5 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-4 py-2.5 text-sm font-medium text-[var(--dashboard-sidebar-muted)] transition-all hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-accent-soft)] hover:text-[var(--dashboard-accent)]"
              >
                <Plus className="size-4" />
                New conversation
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dashboard-sidebar-soft)]" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] py-2 pl-9 pr-3 text-sm text-[var(--dashboard-sidebar-fg)] outline-none placeholder:text-[var(--dashboard-sidebar-soft)] transition-all focus:border-[var(--dashboard-accent-border)] focus:bg-[var(--dashboard-accent-soft)]"
                />
              </div>
            </div>

            {/* Conversation list */}
            <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--dashboard-border)]">
              {groups.length > 0 ? (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-sidebar-soft)]">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conv={conv}
                            active={conv.id === activeConversationId}
                            onSelect={() => onSelectConversation(conv.id)}
                            onDelete={() => onDeleteConversation(conv.id)}
                            onTogglePin={() => onTogglePin(conv.id)}
                            onToggleArchive={() => onToggleArchive(conv.id)}
                            onRename={(title) =>
                              onRenameConversation(conv.id, title)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-2 size-8 text-[var(--dashboard-sidebar-soft)]" />
                  <p className="text-xs text-[var(--dashboard-sidebar-soft)]">
                    {searchQuery
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
                </div>
              )}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-[var(--dashboard-border)] px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--dashboard-accent)] to-orange-500 text-[10px] font-bold text-white">
                    U
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--dashboard-sidebar-fg)]">User</p>
                    <p className="text-[10px] text-[var(--dashboard-sidebar-soft)]">Free plan</p>
                  </div>
                </div>
                <button
                  className="rounded-lg p-1.5 text-[var(--dashboard-sidebar-soft)] transition-all hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
                  title="Settings"
                >
                  <Settings className="size-4" />
                </button>
              </div>
            </div>
          </m.aside>
        )}
      </AnimatePresence>

      {/* Mobile toggle */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="fixed left-3 top-3 z-30 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] p-2.5 text-[var(--dashboard-sidebar-muted)] shadow-lg transition-all hover:border-[var(--dashboard-accent-border)] hover:text-[var(--dashboard-accent)] lg:left-4 lg:top-4"
          title="Open sidebar"
        >
          <PanelLeft className="size-5" />
        </button>
      )}
    </LazyMotion>
  );
}
