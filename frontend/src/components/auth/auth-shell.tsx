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
    <main className="relative min-h-screen overflow-hidden bg-[#faf8f5] text-gray-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 size-80 rounded-full bg-red-300/20 blur-[110px]" />
        <div className="absolute right-0 top-0 size-96 rounded-full bg-orange-300/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.06fr_0.94fr]">
        <section className="hidden border-r border-gray-200 px-10 py-9 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-[17px] font-bold tracking-[-0.06em]">
              Proventu<span className="text-red-500">AI</span>
            </span>
          </Link>

          <div className="max-w-xl py-14">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
              <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_16px_rgba(255,92,92,0.5)]" />
              Human-approved automation
            </div>
            <h2 className="mt-7 font-display text-[clamp(4.5rem,7vw,7.5rem)] font-bold leading-[1.0] tracking-wide text-gray-900">
              Make your next
              <span className="block text-red-500">move obvious.</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-7 tracking-wide text-gray-500">
              Bring the business context. Walk into campaign drafts, warmer
              leads, and follow-ups that are already ready for review.
            </p>
          </div>

          <div className="grid gap-2.5">
            {trustSignals.map((signal) => (
              <div
                key={signal}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-gray-500"
              >
                <BadgeCheck className="size-4 text-red-500" />
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
                  Proventu<span className="text-red-500">AI</span>
                </span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 transition hover:text-red-500"
              >
                <ArrowLeft className="size-3.5" />
                Home
              </Link>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.19em] text-red-500">
                  {eyebrow}
                </p>
                <span className="flex size-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-wide text-gray-900">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-6 tracking-wide text-gray-500">
                {description}
              </p>

              <div className="mt-7">{children}</div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
              <Sparkles className="size-3 text-red-400" />
              Secure access to your revenue workspace
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
