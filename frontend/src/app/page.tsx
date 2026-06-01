import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Check,
  ChevronRight,
  CircleCheck,
  Megaphone,
  MessagesSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RevenuePreview } from "@/components/marketing/revenue-preview";

const outcomes = [
  {
    icon: Target,
    number: "01",
    title: "Know where revenue is hiding.",
    copy: "See the warm leads, stale deals, and overdue follow-ups that deserve your attention today.",
  },
  {
    icon: Megaphone,
    number: "02",
    title: "Turn one offer into a campaign.",
    copy: "Plan social posts, email drafts, and a clear campaign angle in one workspace.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Move fast without losing control.",
    copy: "Review every customer-facing action before it goes live. Automation stays useful and supervised.",
  },
];

const executionSteps = [
  {
    icon: ClipboardList,
    title: "Add the business context",
    copy: "Bring your offer, audience, and contacts. Your workspace learns what you sell and who needs it.",
  },
  {
    icon: ClipboardList,
    title: "Plan the work with your team",
    copy: "Document campaign briefs, follow-up tasks, and the next actions in a focused daily plan.",
  },
  {
    icon: BadgeCheck,
    title: "Approve the moves that matter",
    copy: "Your team reviews the work, sends the right messages, and keeps every deal moving forward.",
  },
];

const revenueLoop = [
  "Lead tracking",
  "Campaign planning",
  "Social drafts",
  "Email follow-ups",
  "Pipeline clarity",
  "Team review",
];

function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center rounded-[13px] bg-[#d8ff62] text-[#10211c] shadow-[0_0_36px_rgba(216,255,98,0.2)]">
      <span className="absolute inset-[5px] rounded-[9px] border border-[#10211c]/15" />
      <Sparkles className="relative size-4" strokeWidth={2.4} />
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07110f] text-[#f4f2ea]">
      <div className="ambient-grid pointer-events-none fixed inset-0 z-0 opacity-70" />

      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[20px] border border-white/[0.09] bg-[#07110f]/78 px-3 shadow-[0_16px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-4"
        >
          <Link
            href="/"
            aria-label="SalesEasy home"
            className="flex items-center gap-2.5 rounded-xl px-1 py-1"
          >
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
              Sales<span className="text-[#d8ff62]">Easy</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full px-3 font-semibold text-[#d5ddd9] hover:bg-white/[0.08] hover:text-white"
            >
              <Link href="/signin">Log in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-[#d8ff62] px-4 font-bold text-[#10211c] shadow-[0_0_24px_rgba(216,255,98,0.12)] hover:bg-[#e5ff92]"
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <section className="relative z-10 px-5 pb-20 pt-36 sm:px-7 sm:pt-44 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <div className="hero-copy">
              <div className="eyebrow-pill">
                <span className="size-1.5 rounded-full bg-[#d8ff62] shadow-[0_0_16px_#d8ff62]" />
                Revenue work, ready for review
              </div>

              <h1 className="mt-7 max-w-[850px] font-display text-[clamp(4.2rem,9.2vw,8.3rem)] font-bold leading-[0.84] tracking-[-0.105em] text-[#f4f2ea]">
                Your sales day,
                <span className="block text-[#d8ff62]">already moving.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#b5c2bd] sm:text-lg sm:leading-8">
                Turn your offer and lead list into campaigns, clear priorities,
                and follow-ups your team can review before the day gets busy.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-[#d8ff62] px-6 font-bold text-[#10211c] shadow-[0_12px_40px_rgba(216,255,98,0.13)] hover:-translate-y-0.5 hover:bg-[#e5ff92]"
                >
                  <Link href="/signup">
                    Start moving revenue
                    <ArrowRight data-icon="inline-end" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/[0.13] bg-white/[0.035] px-6 font-semibold text-[#eef2ed] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                >
                  <Link href="#how-it-works">
                    See how it works
                    <ChevronRight data-icon="inline-end" className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-bold uppercase tracking-[0.13em] text-[#8f9f99]">
                {["Human approved", "Revenue focused", "Built for small teams"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <CircleCheck className="size-3.5 text-[#d8ff62]" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="hero-preview relative lg:-mr-14">
              <div className="absolute -left-10 -top-12 size-56 rounded-full bg-[#d8ff62]/10 blur-[90px]" />
              <div className="absolute -bottom-8 right-4 size-52 rounded-full bg-[#5de1c1]/10 blur-[90px]" />
              <RevenuePreview />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Revenue workflow capabilities"
        className="relative z-10 overflow-hidden border-y border-white/[0.08] bg-white/[0.025] py-4"
      >
        <div className="revenue-marquee flex w-max items-center gap-7 whitespace-nowrap">
          {[...revenueLoop, ...revenueLoop].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-7 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#b6c3be]"
            >
              {item}
              <Sparkles className="size-3.5 text-[#d8ff62]" />
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 py-24 sm:px-7 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div>
              <p className="section-kicker">One clear workspace</p>
              <h2 className="mt-5 max-w-md font-display text-5xl font-bold leading-[0.92] tracking-[-0.085em] text-[#f4f2ea] sm:text-6xl">
                Make the next move obvious.
              </h2>
              <p className="mt-6 max-w-md leading-7 text-[#98a8a2]">
                Stop piecing together your sales day from scattered notes,
                half-finished drafts, and deals that went quiet.
              </p>
            </div>

            <div className="grid gap-3">
              {outcomes.map((outcome) => {
                const Icon = outcome.icon;

                return (
                  <article
                    key={outcome.number}
                    className="group grid gap-4 rounded-[24px] border border-white/[0.09] bg-[#0b1916]/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#d8ff62]/35 hover:bg-[#0f201c] sm:grid-cols-[56px_1fr_auto] sm:items-center sm:p-6"
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.045] text-[#d8ff62] transition duration-300 group-hover:bg-[#d8ff62] group-hover:text-[#10211c]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-[-0.05em] text-[#f4f2ea] sm:text-2xl">
                        {outcome.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#98a8a2]">
                        {outcome.copy}
                      </p>
                    </div>
                    <span className="hidden font-display text-3xl font-bold tracking-[-0.08em] text-white/[0.14] sm:block">
                      {outcome.number}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-y border-white/[0.08] bg-[#0a1714] px-5 py-24 sm:px-7 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker">A calmer way to grow</p>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[0.92] tracking-[-0.085em] text-[#f4f2ea] sm:text-7xl">
              Strategy in. Next steps clear.
              <span className="text-[#d8ff62]"> Your team stays aligned.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {executionSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#07110f] p-6 sm:p-7"
                >
                  <span className="absolute right-5 top-4 font-display text-7xl font-bold tracking-[-0.14em] text-white/[0.035]">
                    0{index + 1}
                  </span>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#d8ff62] text-[#10211c]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-10 max-w-xs font-display text-3xl font-bold leading-none tracking-[-0.075em] text-[#f4f2ea]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#98a8a2]">
                    {step.copy}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-white/[0.09] bg-[#d8ff62] p-7 text-[#10211c] sm:p-8">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em]">
                <Workflow className="size-4" />
                The revenue loop
              </div>
              <p className="mt-8 max-w-2xl font-display text-4xl font-bold leading-[0.92] tracking-[-0.085em] sm:text-5xl">
                Attract. Nurture. Close. Retain. Repeat with a clearer plan.
              </p>
            </article>

            <article className="rounded-[28px] border border-white/[0.09] bg-white/[0.04] p-7 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d8ff62]">
                <MessagesSquare className="size-4" />
                Team review stays on
              </div>
              <p className="mt-8 font-display text-3xl font-bold leading-[0.96] tracking-[-0.075em] text-[#f4f2ea]">
                Your voice. Your call. Every time.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-24 sm:px-7 lg:py-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-[#d8ff62]/35 bg-[#d8ff62] px-6 py-10 text-[#10211c] shadow-[0_25px_100px_rgba(0,0,0,0.25)] sm:px-10 sm:py-12 lg:px-14">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em]">
                <Send className="size-4" />
                Start with your next campaign
              </p>
              <h2 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.88] tracking-[-0.09em] sm:text-7xl">
                Put your revenue work in motion.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[#27413a]">
                Add your business, contacts, and offer. Walk into a workspace
                that already knows what needs your attention next.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-13 rounded-full bg-[#10211c] px-6 font-bold text-[#f4f2ea] shadow-[0_10px_30px_rgba(16,33,28,0.18)] hover:-translate-y-0.5 hover:bg-[#1a3830]"
            >
              <Link href="/signup">
                Get started free
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#10211c]/15 pt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#365148]">
            {["Set up in minutes", "Draft before send", "Stay in control"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="size-3.5" strokeWidth={3} />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-7 sm:px-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#82928c] sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#d5ddd9]">
            <BrandMark />
            SalesEasy
          </Link>
          <p>Revenue execution for growing teams.</p>
          <p>&copy; 2026 SalesEasy</p>
        </div>
      </footer>
    </main>
  );
}
