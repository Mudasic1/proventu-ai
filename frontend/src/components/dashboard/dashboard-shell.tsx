"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Activity,
  Bot,
  Building2,
  MessageSquare,
  CalendarClock,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  ContactRound,
  CreditCard,
  Inbox,
  LayoutDashboard,
  ListOrdered,
  Mail,
  Megaphone,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Settings2,
  UsersRound,
  Workflow,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ToastNotice } from "@/components/dashboard/toast-notice";
import { cn } from "@/lib/utils";
import { hasPermission, type Permission } from "@/lib/permissions/roles";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:read" },
      { href: "/analytics", label: "Analytics", icon: Activity, permission: "analytics:read" },
      { href: "/inbox", label: "Inbox", icon: Inbox, permission: "inbox:read" },
      { href: "/agents", label: "AI Agents", icon: Bot, permission: "agents:read" },
      { href: "/chat", label: "AI Chat", icon: MessageSquare, permission: "chat:read" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/crm/contacts", label: "Contacts", icon: ContactRound, permission: "contacts:read" },
      { href: "/crm/activity", label: "Activity", icon: History, permission: "contacts:read" },
      { href: "/sales/appointments", label: "Appointments", icon: CalendarClock, permission: "contacts:read" },
      { href: "/crm/companies", label: "Companies", icon: Building2, permission: "companies:read" },
      { href: "/sales/pipeline", label: "Pipeline", icon: ChartNoAxesCombined, permission: "pipeline:read" },
      { href: "/sales/tasks", label: "Tasks", icon: ClipboardCheck, permission: "tasks:read" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/marketing/campaigns", label: "Campaigns", icon: Megaphone, permission: "campaigns:read" },
      { href: "/marketing/calendar", label: "Calendar", icon: CalendarDays, permission: "campaigns:read" },
      { href: "/marketing/posts", label: "Social posts", icon: Send, permission: "campaigns:read" },
      { href: "/marketing/email-campaigns", label: "Email drafts", icon: Mail, permission: "campaigns:read" },
      { href: "/marketing/email-sequences", label: "Sequences", icon: ListOrdered, permission: "campaigns:read" },
      { href: "/automations", label: "Automations", icon: Workflow, permission: "automations:read" },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/team", label: "Team", icon: UsersRound, permission: "team:read" },
      { href: "/settings", label: "Settings", icon: Settings2, permission: "settings:read" },
      { href: "/settings/billing", label: "Billing", icon: CreditCard, permission: "billing:read" },
    ],
  },
] as const;

type DashboardShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string };
  workspaceName: string;
  role: string;
};

export function DashboardShell({ children, user, workspaceName, role }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const allNavHrefs = navGroups.flatMap((g) => g.items.map((i) => i.href));

  const groups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(role, item.permission as Permission)),
    }))
    .filter((group) => group.items.length);

  function isActive(href: string) {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) {
      if (allNavHrefs.some((h) => h !== href && pathname === h)) return false;
      return true;
    }
    return false;
  }

  return (
    <main className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-fg)] transition-colors duration-300">
      <Suspense><ToastNotice /></Suspense>
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-70" />
      <div className="relative z-10 mx-auto min-h-screen max-w-[1540px] lg:flex">
        <aside className={cn("border-b border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] px-4 py-4 text-[var(--dashboard-sidebar-fg)] shadow-[var(--dashboard-shadow)] backdrop-blur-xl transition-all duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r lg:py-5", collapsed ? "lg:w-[62px] lg:px-2" : "lg:w-[248px] lg:px-3")}>
          <div className={cn("flex items-center justify-between gap-4 px-1", collapsed ? "lg:justify-center lg:px-0" : "lg:px-2")}>
            <Link href="/dashboard" className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center lg:gap-0")}>
              <BrandMark />
              <span className={cn("font-display text-[17px] font-bold tracking-wide text-[var(--dashboard-sidebar-fg)]", collapsed && "lg:hidden")}>Proventu<span className="text-[var(--dashboard-accent)]">AI</span></span>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-32"><ThemeToggle /></div>
              <SignOutButton />
            </div>
          </div>
          <nav className={cn("mt-4 flex gap-1 overflow-x-auto pb-1 lg:min-h-0 lg:flex-1 lg:grid lg:content-start lg:gap-6 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-4 lg:pr-1 [scrollbar-color:var(--dashboard-sidebar-soft)_transparent] [scrollbar-width:thin]", collapsed ? "lg:mt-6 lg:gap-4" : "lg:mt-8")}>
            {groups.map((group) => (
              <div key={group.label} className="flex shrink-0 gap-1 lg:grid">
                <p className={cn("hidden px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-sidebar-soft)] lg:block", collapsed && "lg:sr-only")}>{group.label}</p>
                <div className="flex gap-1 lg:mt-2 lg:grid lg:gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition", collapsed && "lg:justify-center lg:px-1.5", active ? "bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]" : "text-[var(--dashboard-sidebar-muted)] hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]")}>
                        <Icon className={cn("size-4 shrink-0 transition", active ? "text-[var(--dashboard-accent)]" : "text-[var(--dashboard-sidebar-soft)]")} />
                        <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className={cn("mt-auto hidden shrink-0 border-t border-[var(--dashboard-border)] pt-4 lg:block", collapsed ? "lg:px-1" : "lg:px-2")}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--dashboard-sidebar-muted)] transition hover:bg-[var(--dashboard-sidebar-hover)] hover:text-[var(--dashboard-sidebar-fg)]"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              <span className={cn(collapsed && "lg:hidden")}>{collapsed ? "Expand" : "Collapse"}</span>
            </button>
            <div className={cn(collapsed && "lg:flex lg:flex-col lg:items-center")}>
              <ThemeToggle />
            </div>
            <div className={cn("mt-4", collapsed && "lg:flex lg:flex-col lg:items-center")}>
            <p className={cn("truncate text-xs font-bold text-[var(--dashboard-sidebar-fg)]", collapsed && "lg:hidden")}>{user.name}</p>
            <p className={cn("mt-1 truncate text-[11px] text-[var(--dashboard-sidebar-muted)]", collapsed && "lg:hidden")}>{workspaceName}</p>
            <p className={cn("mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]", collapsed && "lg:hidden")}>{role.replaceAll("_", " ")}</p>
            <div className="mt-3"><SignOutButton /></div>
            </div>
          </div>
        </aside>
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </main>
  );
}
