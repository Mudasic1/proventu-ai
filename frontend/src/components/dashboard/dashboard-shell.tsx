import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  Building2,
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
  Send,
  Settings2,
  UsersRound,
  Workflow,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ToastNotice } from "@/components/dashboard/toast-notice";
import { hasPermission, type Permission } from "@/lib/permissions/rbac";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:read" },
      { href: "/analytics", label: "Analytics", icon: Activity, permission: "analytics:read" },
      { href: "/inbox", label: "Inbox", icon: Inbox, permission: "inbox:read" },
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
  const groups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(role, item.permission as Permission)),
    }))
    .filter((group) => group.items.length);

  return (
    <main className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-fg)] transition-colors duration-300">
      <Suspense><ToastNotice /></Suspense>
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-45" />
      <div className="relative z-10 mx-auto min-h-screen max-w-[1540px] lg:grid lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-[var(--dashboard-border)] bg-[var(--dashboard-sidebar)] px-4 py-4 backdrop-blur-xl transition-colors duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
          <div className="flex items-center justify-between gap-4 px-1 lg:px-2">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-[17px] font-bold tracking-[-0.06em] text-[var(--dashboard-fg)]">Sales<span className="text-[var(--dashboard-accent)]">Easy</span></span>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-32"><ThemeToggle /></div>
              <SignOutButton />
            </div>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:min-h-0 lg:flex-1 lg:grid lg:content-start lg:gap-6 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-4 lg:pr-1 [scrollbar-color:#344b43_transparent] [scrollbar-width:thin]">
            {groups.map((group) => (
              <div key={group.label} className="flex shrink-0 gap-1 lg:grid">
                <p className="hidden px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-subtle)] lg:block">{group.label}</p>
                <div className="flex gap-1 lg:mt-2 lg:grid lg:gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--dashboard-muted)] transition hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-accent)]">
                        <Icon className="size-4 text-[var(--dashboard-icon)]" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-auto hidden shrink-0 border-t border-[var(--dashboard-border)] px-2 pt-4 lg:block">
            <ThemeToggle />
            <div className="mt-4">
            <p className="truncate text-xs font-bold text-[var(--dashboard-fg)]">{user.name}</p>
            <p className="mt-1 truncate text-[11px] text-[var(--dashboard-soft)]">{workspaceName}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]">{role.replaceAll("_", " ")}</p>
            <div className="mt-3"><SignOutButton /></div>
            </div>
          </div>
        </aside>
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </main>
  );
}
