import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { LogoTicker } from "@/components/marketing/logo-ticker";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { StatsBar } from "@/components/marketing/stats-bar";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

function LandingBrandMark() {
  return (
    <span className="relative flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_0_40px_rgba(255,92,92,0.35)]">
      <span className="absolute inset-[5px] rounded-[11px] border border-white/25" />
      <Sparkles className="relative size-[18px]" strokeWidth={2.2} />
    </span>
  );
}


const howItWorks = [
  {
    step: "01",
    icon: Rocket,
    title: "Onboard your business",
    description: "Add your offer, audience, and contacts. The workspace learns what you sell and who you're selling to.",
  },
  {
    step: "02",
    icon: Bot,
    title: "AI plans your moves",
    description: "Campaign briefs, follow-up sequences, social drafts, and pipeline insights — generated and ready to review.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "You approve, it executes",
    description: "Every customer-facing action stays in your hands. Review, edit, and send when you're ready.",
  },
];

const trustIndicators = [
  "SOC 2 compliant infrastructure",
  "256-bit AES encryption",
  "99.9% uptime SLA",
  "GDPR ready",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#faf8f5] text-gray-900">
      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[60px] max-w-7xl items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-4 shadow-lg backdrop-blur-2xl sm:px-5"
        >
          <Link
            href="/"
            aria-label="Proventu AI home"
            className="flex items-center gap-2.5"
          >
            <LandingBrandMark />
            <span className="font-display text-[18px] font-bold tracking-wide text-gray-900">
              Proventu<span className="text-red-500">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-[13px] font-medium tracking-wide text-gray-500 md:flex">
            <Link href="#features" className="transition hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="transition hover:text-gray-900">How it works</Link>
            <Link href="#pricing" className="transition hover:text-gray-900">Pricing</Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-xl px-3.5 font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Link href="/signin">Log in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-red-500 px-4 font-bold text-white shadow-[0_0_20px_rgba(255,92,92,0.3)] hover:bg-red-400"
            >
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 px-5 pb-24 pt-36 sm:px-7 sm:pt-44 lg:pb-32">
        {/* Background mesh gradients */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-40 size-[600px] rounded-full bg-red-400/[0.08] blur-[120px]" />
          <div className="absolute -right-20 top-20 size-[500px] rounded-full bg-orange-300/[0.06] blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 size-[400px] rounded-full bg-rose-300/[0.06] blur-[100px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="hero-copy">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-red-400" />
                </span>
                Now in public beta
              </div>

              {/* Headline */}
              <h1 className="mt-8 max-w-[820px] font-display text-[clamp(3.8rem,8.8vw,7.5rem)] font-bold leading-[0.88] tracking-wide">
                Revenue work,
                <span className="block bg-gradient-to-r from-red-500 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                  already moving.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-7 max-w-xl text-[17px] leading-8 tracking-wide text-gray-500">
                Plan content, send emails, manage leads, track deals, and let AI
                agents handle the repetitive sales work — so your team ships
                campaigns before the day gets busy.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="group h-13 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-7 font-bold tracking-wide text-white shadow-[0_4px_30px_rgba(255,92,92,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(255,92,92,0.45)]"
                >
                  <Link href="/signup">
                    Start moving revenue
                    <ArrowRight data-icon="inline-end" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-13 rounded-2xl border border-gray-300 px-6 font-semibold tracking-wide text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Link href="#how-it-works">
                    See how it works
                    <ChevronRight data-icon="inline-end" className="size-4" />
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                {["Human approved", "Revenue focused", "Built for small teams"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <CircleCheck className="size-3.5 text-red-500" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="hero-preview relative lg:-mr-8">
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo Ticker ── */}
      <LogoTicker />

      {/* ── Stats Bar ── */}
      <StatsBar />

      {/* ── Features Bento Grid ── */}
      <section id="features" className="relative z-10 px-5 py-24 sm:px-7 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-1/4 size-[500px] rounded-full bg-red-400/[0.05] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
                Everything you need
              </p>
              <h2 className="mt-5 font-display text-5xl font-bold leading-[0.92] tracking-wide sm:text-7xl">
                One workspace.
                <span className="block text-gray-300">Zero tool sprawl.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 tracking-wide text-gray-500">
                CRM, pipeline, campaigns, email sequences, social scheduling,
                and AI agents — unified in a workspace that knows your business.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-16">
            <FeatureGrid />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="relative z-10 border-y border-gray-200 bg-gray-50 px-5 py-24 sm:px-7 lg:py-32"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 size-[400px] rounded-full bg-orange-300/[0.06] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="max-w-3xl">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
                Simple to start
              </p>
              <h2 className="mt-5 font-display text-5xl font-bold leading-[0.92] tracking-wide sm:text-7xl">
                Strategy in.
                <span className="block bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                  Next steps clear.
                </span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.step} delay={index * 0.12}>
                  <article className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 transition-all duration-500 hover:border-red-200 hover:bg-white sm:p-8">
                    {/* Step watermark */}
                    <span className="absolute -right-2 -top-4 font-display text-[120px] font-bold leading-none tracking-wide text-gray-100">
                      {item.step}
                    </span>
                    <div className="flex size-14 items-center justify-center rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 text-red-500 transition-all duration-300 group-hover:border-red-300 group-hover:shadow-[0_0_24px_rgba(255,92,92,0.15)]">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-8 font-display text-3xl font-bold leading-none tracking-wide">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-7 tracking-wide text-gray-500">
                      {item.description}
                    </p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Revenue loop + review cards */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <ScrollReveal delay={0.1}>
              <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 p-8 text-white shadow-2xl sm:p-10">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-[60px]" />
                <div className="relative">
                  <div className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-red-100/80">
                    <Workflow className="size-4" />
                    The revenue loop
                  </div>
                  <p className="mt-8 max-w-2xl font-display text-4xl font-bold leading-[0.92] tracking-wide sm:text-5xl">
                    Attract. Nurture. Close. Retain.
                    <span className="block text-white/60">Repeat with a clearer plan.</span>
                  </p>
                </div>
              </article>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <article className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 sm:p-10">
                <div className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-red-500">
                  <ShieldCheck className="size-4" />
                  Human-in-the-loop
                </div>
                <div>
                  <p className="mt-8 font-display text-3xl font-bold leading-[0.96] tracking-wide">
                    Your voice. Your call.
                    <span className="block text-gray-300">Every single time.</span>
                  </p>
                    <p className="mt-4 text-[15px] leading-7 tracking-wide text-gray-500">
                      AI proposes; you decide. Every email, post, and follow-up gets
                      your review before it reaches a customer.
                    </p>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialCarousel />

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-5 py-24 sm:px-7 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/3 top-0 size-[500px] rounded-full bg-rose-300/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
                Simple pricing
              </p>
              <h2 className="mt-5 font-display text-5xl font-bold leading-[0.92] tracking-wide sm:text-7xl">
                Start free.
                <span className="block text-gray-300">Scale when ready.</span>
              </h2>
              <p className="mt-5 text-[17px] leading-8 tracking-wide text-gray-500">
                No credit card required. Upgrade only when you see the value.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-14">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 px-5 py-24 sm:px-7 lg:py-32">
        <ScrollReveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-red-200 bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 px-6 py-14 shadow-2xl sm:px-12 sm:py-18 lg:px-16">
            {/* Mesh overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 size-[300px] rounded-full bg-red-400/[0.1] blur-[80px]" />
              <div className="absolute -bottom-16 -right-16 size-[250px] rounded-full bg-orange-300/[0.08] blur-[80px]" />
              <div className="absolute right-1/3 top-1/4 size-[200px] rounded-full bg-rose-300/[0.06] blur-[60px]" />
            </div>

            <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
                  <Send className="size-4" />
                  Start with your next campaign
                </p>
                <h2 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.88] tracking-wide sm:text-7xl">
                  Put your revenue work
                  <span className="block bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                    in motion.
                  </span>
                </h2>
                <p className="mt-5 max-w-2xl text-[17px] leading-8 tracking-wide text-gray-600">
                  Add your business, contacts, and offer. Walk into a workspace
                  that already knows what needs your attention next.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="group h-14 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-7 font-bold text-white shadow-[0_4px_30px_rgba(255,92,92,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(255,92,92,0.5)]"
              >
                <Link href="/signup">
                  Get started free
                  <ArrowRight data-icon="inline-end" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>

            <div className="relative mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-200 pt-6 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">
              {["Set up in minutes", "Draft before send", "Stay in control", "Cancel anytime"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="size-3.5 text-red-500" strokeWidth={3} />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Security trust strip ── */}
      <section className="relative z-10 border-t border-gray-200 bg-[#faf8f5] px-5 py-10 sm:px-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustIndicators.map((item) => (
            <span key={item} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
              <ShieldCheck className="size-3.5 text-red-400" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-gray-200 bg-gray-100 px-5 py-12 sm:px-7">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <LandingBrandMark />
                <span className="font-display text-[17px] font-bold tracking-wide">
                  Proventu<span className="text-red-500">AI</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-[13px] leading-6 text-gray-400">
                The AI-powered revenue workspace for growing teams. Attract leads,
                nurture deals, and close faster.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Product</p>
              <ul className="mt-4 grid gap-2.5 text-[13px] font-medium tracking-wide text-gray-500">
                <li><Link href="#features" className="transition hover:text-gray-900">Features</Link></li>
                <li><Link href="#pricing" className="transition hover:text-gray-900">Pricing</Link></li>
                <li><Link href="#how-it-works" className="transition hover:text-gray-900">How it works</Link></li>
                <li><Link href="/signup" className="transition hover:text-gray-900">Get started</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Company</p>
              <ul className="mt-4 grid gap-2.5 text-[13px] font-medium tracking-wide text-gray-500">
                <li><Link href="#" className="transition hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="transition hover:text-gray-900">Blog</Link></li>
                <li><Link href="#" className="transition hover:text-gray-900">Careers</Link></li>
                <li><Link href="#" className="transition hover:text-gray-900">Contact</Link></li>
              </ul>

            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Legal</p>
              <ul className="mt-4 grid gap-2.5 text-[13px] font-medium tracking-wide text-gray-500">
                <li><Link href="#" className="transition hover:text-gray-900">Privacy policy</Link></li>
                <li><Link href="#" className="transition hover:text-gray-900">Terms of service</Link></li>
                <li><Link href="#" className="transition hover:text-gray-900">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-[12px] tracking-wide text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Proventu AI. All rights reserved.</p>
            <p>Revenue execution for growing teams.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
