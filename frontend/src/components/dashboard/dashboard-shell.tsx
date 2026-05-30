import Link from "next/link";
import { Suspense } from "react";
import {
  ChartNoAxesCombined,
  ClipboardCheck,
  ContactRound,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { ToastNotice } from "@/components/dashboard/toast-notice";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm/contacts", label: "Contacts", icon: ContactRound },
  { href: "/sales/pipeline", label: "Pipeline", icon: ChartNoAxesCombined },
  { href: "/sales/tasks", label: "Tasks", icon: ClipboardCheck },
  { href: "/settings/workspace", label: "Settings", icon: Settings2 },
];

type DashboardShellProps = {
  children: React.ReactNode;
  user: { name: string; email: string };
  workspaceName: string;
};

export function DashboardShell({
  children,
  user,
  workspaceName,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#07110f] text-[#f4f2ea]">
      <Suspense>
        <ToastNotice />
      </Suspense>
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-55" />
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#07110f]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
              SalesEasy<span className="text-[#d8ff62]">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#dce4e1]">{user.name}</p>
              <p className="text-[11px] text-[#82928c]">{workspaceName}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[210px_1fr] lg:py-7">
        <aside>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#aebbb6] transition hover:border-[#d8ff62]/30 hover:bg-[#d8ff62]/8 hover:text-[#d8ff62]"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}
