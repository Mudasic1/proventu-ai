"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Activity,
  Building2,
  MessageSquare,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ContactRound,
  CreditCard,
  Inbox,
  LayoutDashboard,
  ListOrdered,
  Mail,
  Megaphone,
  History,
  Menu,
  Send,
  Settings2,
  UsersRound,
  Workflow,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ToastNotice } from "@/components/dashboard/toast-notice";
import { cn } from "@/lib/utils";
import { hasPermission, type Permission } from "@/lib/permissions/roles";

// ── Navigation tree ────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:read",
      },
      {
        href: "/analytics",
        label: "Analytics",
        icon: Activity,
        permission: "analytics:read",
      },
      { href: "/inbox", label: "Inbox", icon: Inbox, permission: "inbox:read" },
      {
        href: "/chat",
        label: "AI Chat",
        icon: MessageSquare,
        permission: "chat:read",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        href: "/crm/contacts",
        label: "Contacts",
        icon: ContactRound,
        permission: "contacts:read",
      },
      {
        href: "/crm/activity",
        label: "Activity",
        icon: History,
        permission: "contacts:read",
      },
      {
        href: "/sales/appointments",
        label: "Appointments",
        icon: CalendarClock,
        permission: "contacts:read",
      },
      {
        href: "/crm/companies",
        label: "Companies",
        icon: Building2,
        permission: "companies:read",
      },
      {
        href: "/sales/pipeline",
        label: "Pipeline",
        icon: ChartNoAxesCombined,
        permission: "pipeline:read",
      },
      {
        href: "/sales/tasks",
        label: "Tasks",
        icon: ClipboardCheck,
        permission: "tasks:read",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        href: "/marketing/campaigns",
        label: "Campaigns",
        icon: Megaphone,
        permission: "campaigns:read",
      },
      {
        href: "/marketing/calendar",
        label: "Calendar",
        icon: CalendarDays,
        permission: "campaigns:read",
      },
      {
        href: "/marketing/posts",
        label: "Social posts",
        icon: Send,
        permission: "campaigns:read",
      },
      {
        href: "/marketing/email-campaigns",
        label: "Email drafts",
        icon: Mail,
        permission: "campaigns:read",
      },
      {
        href: "/marketing/email-sequences",
        label: "Sequences",
        icon: ListOrdered,
        permission: "campaigns:read",
      },
      {
        href: "/automations",
        label: "Automations",
        icon: Workflow,
        permission: "automations:read",
      },
    ],
  },
  {
    label: "Manage",
    items: [
      {
        href: "/team",
        label: "Team",
        icon: UsersRound,
        permission: "team:read",
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings2,
        permission: "settings:read",
      },
      {
        href: "/settings/billing",
        label: "Billing",
        icon: CreditCard,
        permission: "billing:read",
      },
    ],
  },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────────

type NavGroup = {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission: string;
  }[];
};

type SidebarInnerProps = {
  isCollapsed: boolean;
  user: { name: string; email: string };
  workspaceName: string;
  role: string;
  groups: NavGroup[];
  isActive: (href: string) => boolean;
  onCloseMobile: () => void;
};

// ── SidebarInner — declared outside DashboardShell to avoid re-creation ────────

function SidebarInner({
  isCollapsed,
  user,
  workspaceName,
  role,
  groups,
  isActive,
  onCloseMobile,
}: SidebarInnerProps) {
  return (
    <div className="flex h-full flex-col">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      {/* When collapsed: just the centered logo icon.
          When expanded: logo left + mobile X button right (desktop toggle is outside). */}
      <div
        className={cn(
          "flex items-center border-b border-[var(--dashboard-border)] py-[18px]",
          isCollapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {/* Brand link — icon always visible, wordmark fades on collapse */}
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            isCollapsed && "justify-center",
          )}
          aria-label="Go to dashboard"
          onClick={onCloseMobile}
        >
          <BrandMark />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap font-display text-[17px] font-bold tracking-wide",
              "text-[var(--dashboard-sidebar-fg)] transition-[max-width,opacity] duration-300 ease-in-out",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
            )}
            aria-hidden={isCollapsed}
          >
            Proventu<span className="text-[var(--dashboard-accent)]">AI</span>
          </span>
        </Link>

        {/* Mobile close button — only visible on small screens, not on desktop */}
        <button
          onClick={onCloseMobile}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors lg:hidden",
            "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)]",
            "hover:text-[var(--dashboard-sidebar-fg)]",
            isCollapsed && "hidden",
          )}
          aria-label="Close sidebar"
        >
          <X className="size-4.5" />
        </button>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4",
          isCollapsed ? "px-2" : "px-3",
          "scrollbar-thin [scrollbar-color:var(--dashboard-sidebar-soft)_transparent]",
        )}
        aria-label="Main navigation"
      >
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Group label — fades + collapses in icon-only mode */}
              <div
                className={cn(
                  "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                  isCollapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100",
                )}
                aria-hidden={isCollapsed}
              >
                <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-sidebar-soft)]">
                  {group.label}
                </p>
              </div>

              {/* Nav items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg py-2 text-xs font-semibold transition-colors",
                        isCollapsed ? "justify-center px-2" : "px-3",
                        active
                          ? "bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]"
                          : "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]",
                      )}
                      title={isCollapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          active
                            ? "text-[var(--dashboard-accent)]"
                            : "text-[var(--dashboard-sidebar-soft)]",
                        )}
                      />
                      {/* Animated label text */}
                      <span
                        className={cn(
                          "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ease-in-out",
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-[180px] opacity-100",
                        )}
                        aria-hidden={isCollapsed}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "mt-auto shrink-0 border-t border-[var(--dashboard-border)] pt-3 pb-4",
          isCollapsed ? "px-2" : "px-3",
        )}
      >
        <ThemeToggle iconOnly={isCollapsed} />

        {/* User info — fades when collapsed */}
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-24 opacity-100",
          )}
          aria-hidden={isCollapsed}
        >
          <div className="mt-3">
            <p className="truncate text-xs font-bold text-[var(--dashboard-sidebar-fg)]">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--dashboard-sidebar-muted)]">
              {workspaceName}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]">
              {role.replaceAll("_", " ")}
            </p>
          </div>
        </div>

        <div className={cn("mt-3", isCollapsed && "flex justify-center")}>
          <SignOutButton iconOnly={isCollapsed} />
        </div>
      </div>
    </div>
  );
}

// ── DashboardShell ─────────────────────────────────────────────────────────────

type DashboardShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string };
  workspaceName: string;
  role: string;
};

export function DashboardShell({
  children,
  user,
  workspaceName,
  role,
}: DashboardShellProps) {
  const pathname = usePathname();

  const isChat = pathname.startsWith("/chat");

  // Desktop: sidebar in icon-only mode
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: drawer visible
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const allNavHrefs = navGroups.flatMap((g) => g.items.map((i) => i.href));

  const groups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(role, item.permission as Permission),
      ),
    }))
    .filter((group) => group.items.length > 0) as NavGroup[];

  function isActive(href: string) {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      if (allNavHrefs.some((h) => h !== href && pathname === h)) return false;
      return true;
    }
    return false;
  }

  const sharedProps: Omit<SidebarInnerProps, "isCollapsed"> = {
    user,
    workspaceName,
    role,
    groups,
    isActive,
    onCloseMobile: () => setMobileOpen(false),
  };

  return (
    <main className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-fg)] transition-colors duration-300">
      <Suspense>
        <ToastNotice />
      </Suspense>
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-70" />

      <div className={cn("relative z-10 mx-auto min-h-screen lg:flex", isChat ? "max-w-full" : "max-w-[1540px]")}>
        {/* ── Mobile top bar ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5 transition-colors",
              "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)]",
              "hover:text-[var(--dashboard-sidebar-fg)]",
            )}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-wide text-[var(--dashboard-sidebar-fg)]">
              Proventu<span className="text-[var(--dashboard-accent)]">AI</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle iconOnly />
            <SignOutButton />
          </div>
        </header>

        {/* ── Mobile drawer overlay ────────────────────────────────────────── */}
        <div
          id="mobile-sidebar"
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            !mobileOpen && "pointer-events-none",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding drawer panel */}
          <aside
            className={cn(
              "absolute inset-y-0 left-0 w-68 flex flex-col",
              "bg-[var(--dashboard-sidebar)] text-[var(--dashboard-sidebar-fg)]",
              "border-r border-[var(--dashboard-border)] shadow-2xl",
              "transition-transform duration-300 ease-in-out",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <SidebarInner {...sharedProps} isCollapsed={false} />
          </aside>
        </div>

        {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
        {/* Wrapper is `relative` so the floating toggle button can overflow the
            sidebar's right edge without being clipped by the aside's overflow:hidden */}
        <div
          className={cn(
            "relative hidden shrink-0 lg:block",
            "transition-[width] duration-300 ease-in-out",
            collapsed ? "lg:w-[68px]" : "lg:w-64",
          )}
        >
          <aside
            className={cn(
              "flex flex-col",
              "sticky top-0 h-screen w-full overflow-hidden",
              "bg-[var(--dashboard-sidebar)] text-[var(--dashboard-sidebar-fg)]",
              "border-r border-[var(--dashboard-border)] shadow-[var(--dashboard-shadow)]",
            )}
          >
            <SidebarInner {...sharedProps} isCollapsed={collapsed} />
          </aside>

          {/* Floating collapse toggle — sits exactly on the sidebar's right border */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "absolute top-[52px] right-0 translate-x-1/2 z-20",
              "flex size-6 items-center justify-center",
              "rounded-full border border-[var(--dashboard-border)]",
              "bg-[var(--dashboard-sidebar)] shadow-md",
              "text-[var(--dashboard-sidebar-muted)] hover:text-[var(--dashboard-sidebar-fg)]",
              "transition-all duration-200 hover:scale-110 hover:shadow-lg",
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </button>
        </div>

        {/* ── Main content area ────────────────────────────────────────────── */}
        <div className={cn("min-w-0 flex-1", isChat ? "px-0 py-0" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
          {children}
        </div>
      </div>
    </main>
  );
}
