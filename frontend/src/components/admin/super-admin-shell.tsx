import Link from "next/link";
import {
  Activity,
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin#workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin#users", label: "Users", icon: UsersRound },
  { href: "/admin#sales", label: "Sales", icon: BarChart3 },
  { href: "/admin#marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin#subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin#activity", label: "Activity", icon: Activity },
];

export function SuperAdminShell({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin: { name: string; email: string };
}) {
  return (
    <main className="min-h-screen bg-[#f2f1ec] text-[#15201d]">
      <div className="mx-auto min-h-screen max-w-[1680px] lg:grid lg:grid-cols-[236px_1fr]">
        <aside className="border-b border-[#d8ded9] bg-[#10211c] px-4 py-4 text-[#eff3ee] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:border-b-0 lg:px-3 lg:py-5">
          <div className="flex items-center justify-between px-1 lg:px-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-[17px] font-bold tracking-[-0.06em]">Sales<span className="text-[#d8ff62]">Easy</span></span>
            </Link>
            <ShieldCheck className="size-4 text-[#d8ff62]" />
          </div>
          <p className="mt-5 px-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#91a49d]">Platform console</p>
          <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:min-h-0 lg:flex-1 lg:grid lg:content-start lg:overflow-x-hidden lg:overflow-y-auto lg:pb-4 lg:pr-1 [scrollbar-color:#4d685f_transparent] [scrollbar-width:thin]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-[#b9c6c1] transition hover:bg-white/[0.07] hover:text-[#e5ff92]"><Icon className="size-4 text-[#91a49d]" />{item.label}</Link>;
            })}
          </nav>
          <div className="mt-5 shrink-0 border-t border-white/[0.1] px-2 pt-4">
            <p className="truncate text-xs font-bold">{admin.name}</p>
            <p className="mt-1 truncate text-[11px] text-[#91a49d]">{admin.email}</p>
            <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#d8ff62]">Super admin</p>
            <div className="mt-3"><SignOutButton /></div>
          </div>
        </aside>
        <div className="min-w-0 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">{children}</div>
      </div>
    </main>
  );
}
