import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

type AuthShellProps = {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: React.ReactNode;
};

const trustSignals = [
  "Review every customer-facing move",
  "Keep your revenue work in one place",
  "Start with a focused daily plan",
];

export function AuthShell({
  children,
  description,
  eyebrow,
  title,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07110f] text-[#f4f2ea]">
      <div className="ambient-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -left-32 top-1/4 size-80 rounded-full bg-[#5de1c1]/8 blur-[110px]" />
      <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-[#d8ff62]/8 blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.06fr_0.94fr]">
        <section className="hidden border-r border-white/[0.08] px-10 py-9 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
              SalesEasy<span className="text-[#d8ff62]">AI</span>
            </span>
          </Link>

          <div className="max-w-xl py-14">
            <div className="eyebrow-pill">
              <span className="size-1.5 rounded-full bg-[#d8ff62] shadow-[0_0_16px_#d8ff62]" />
              Human-approved automation
            </div>
            <h2 className="mt-7 font-display text-[clamp(4.5rem,7vw,7.5rem)] font-bold leading-[0.82] tracking-[-0.11em] text-[#f4f2ea]">
              Make your next
              <span className="block text-[#d8ff62]">move obvious.</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#a8b6b1]">
              Bring the business context. Walk into campaign drafts, warmer
              leads, and follow-ups that are already ready for review.
            </p>
          </div>

          <div className="grid gap-2.5">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.075] bg-white/[0.035] px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#aebbb6]"
              >
                <BadgeCheck className="size-4 text-[#d8ff62]" />
                {signal}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2.5">
                <BrandMark />
                <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
                  SalesEasy<span className="text-[#d8ff62]">AI</span>
                </span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#9aaba5] transition hover:text-[#d8ff62]"
              >
                <ArrowLeft className="size-3.5" />
                Home
              </Link>
            </div>

            <div className="rounded-[28px] border border-white/[0.1] bg-[#0b1916]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between">
                <p className="section-kicker">{eyebrow}</p>
                <span className="flex size-9 items-center justify-center rounded-xl border border-[#d8ff62]/20 bg-[#d8ff62]/8 text-[#d8ff62]">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[0.88] tracking-[-0.09em] text-[#f4f2ea]">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-6 text-[#9eaea8]">
                {description}
              </p>

              <div className="mt-7">{children}</div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#74857f]">
              <Sparkles className="size-3 text-[#d8ff62]" />
              Secure access to your revenue workspace
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
