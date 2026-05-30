import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CircleDot,
  Clock3,
  Mail,
  Megaphone,
  Sparkles,
  Target,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth-session";

const workflowCards = [
  {
    icon: Target,
    title: "Bring in your leads",
    copy: "Add the contacts and deal context that deserve a focused next move.",
  },
  {
    icon: Megaphone,
    title: "Shape your campaign",
    copy: "Turn one clear offer into an approval-ready campaign direction.",
  },
  {
    icon: Mail,
    title: "Review the follow-ups",
    copy: "Keep every customer-facing message supervised before it goes out.",
  },
];

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07110f] text-[#f4f2ea]">
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-65" />

      <header className="relative z-10 border-b border-white/[0.08] bg-[#07110f]/80 px-5 py-4 backdrop-blur-xl sm:px-7">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
              SalesEasy<span className="text-[#d8ff62]">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#dce4e1]">
                {session.user.name}
              </p>
              <p className="text-[11px] text-[#82928c]">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="relative z-10 px-5 py-12 sm:px-7 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="eyebrow-pill">
                <CircleDot className="size-3.5" />
                Workspace access confirmed
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.86] tracking-[-0.1em] text-[#f4f2ea] sm:text-8xl">
                Good to see you,
                <span className="block text-[#d8ff62]">
                  {session.user.name.split(" ")[0]}.
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#a8b6b1]">
                Your secure revenue workspace is ready. The phase-one workflow
                starts by bringing your business context, leads, and campaign
                direction into one reviewable place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#9eaea8]">
              <Clock3 className="size-4 text-[#d8ff62]" />
              Session protected
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {workflowCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="group relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b1916]/82 p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d8ff62]/30 hover:bg-[#0f201c]"
                >
                  <span className="absolute right-5 top-4 font-display text-6xl font-bold tracking-[-0.14em] text-white/[0.035]">
                    0{index + 1}
                  </span>
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#d8ff62] text-[#10211c]">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-10 font-display text-3xl font-bold leading-none tracking-[-0.075em]">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#98a8a2]">
                    {card.copy}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
            <section className="rounded-[26px] border border-[#d8ff62]/30 bg-[#d8ff62] p-6 text-[#10211c] sm:p-7">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em]">
                <Sparkles className="size-4" />
                Start the workspace setup
              </p>
              <h2 className="mt-7 max-w-2xl font-display text-4xl font-bold leading-[0.9] tracking-[-0.085em] sm:text-5xl">
                Give the system enough context to make the next move useful.
              </h2>
              <Button
                className="mt-7 h-11 rounded-full bg-[#10211c] px-5 font-bold text-[#f4f2ea] hover:bg-[#1a3830]"
                disabled
              >
                Workspace onboarding comes next
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </section>

            <section className="rounded-[26px] border border-white/[0.09] bg-white/[0.035] p-6 sm:p-7">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
                <BadgeCheck className="size-4" />
                Auth foundation active
              </p>
              <p className="mt-8 font-display text-4xl font-bold leading-[0.92] tracking-[-0.08em]">
                Your account is in. The revenue system can build from here.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
