"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  MailCheck,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PreviewKey = "campaign" | "pipeline" | "followups";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const previewTabs: Record<
  PreviewKey,
  {
    label: string;
    title: string;
    description: string;
    score: string;
    action: string;
    rows: Array<{ title: string; detail: string; tone: string }>;
  }
> = {
  campaign: {
    label: "Campaign",
    title: "Launch a full campaign from one offer",
    description:
      "Turn one service, product, or promotion into posts, emails, and review-ready follow-up tasks.",
    score: "14 drafts",
    action: "Approve campaign plan",
    rows: [
      {
        title: "LinkedIn launch post",
        detail: "Written in your brand voice",
        tone: "bg-emerald-300",
      },
      {
        title: "3-email sales sequence",
        detail: "Personalized for warm leads",
        tone: "bg-cyan-300",
      },
      {
        title: "Proposal follow-up task",
        detail: "Ready for owner approval",
        tone: "bg-violet-300",
      },
    ],
  },
  pipeline: {
    label: "Pipeline",
    title: "See which deals need attention today",
    description:
      "Spot stale opportunities, high-intent buyers, proposal viewers, and deals at risk before momentum disappears.",
    score: "$48.2k",
    action: "Review revenue risks",
    rows: [
      {
        title: "Pricing lead opened twice",
        detail: "Suggested call today",
        tone: "bg-emerald-300",
      },
      {
        title: "Proposal idle for 7 days",
        detail: "Draft follow-up ready",
        tone: "bg-amber-300",
      },
      {
        title: "3 meetings likely this week",
        detail: "Prioritized by buyer intent",
        tone: "bg-cyan-300",
      },
    ],
  },
  followups: {
    label: "Follow-ups",
    title: "Reply faster without sounding generic",
    description:
      "Summarize recent activity, objections, and context into concise messages your team can review.",
    score: "8 replies",
    action: "Review suggested replies",
    rows: [
      {
        title: "Answer pricing question",
        detail: "Includes two meeting options",
        tone: "bg-emerald-300",
      },
      {
        title: "Handle timing objection",
        detail: "Helpful, short, and low pressure",
        tone: "bg-rose-300",
      },
      {
        title: "Create no-reply reminder",
        detail: "Follow up in 3 business days",
        tone: "bg-violet-300",
      },
    ],
  },
};

const outcomes = [
  {
    icon: Clock3,
    title: "Save hours every week",
    copy: "Campaign prep, lead review, follow-up writing, and daily prioritization happen before the team starts guessing.",
  },
  {
    icon: Target,
    title: "Focus on buyers ready now",
    copy: "Intent signals and deal context turn a messy lead list into a clear ranked plan for today.",
  },
  {
    icon: ShieldCheck,
    title: "Stay in control",
    copy: "Posts, emails, and customer replies stay in review until a person approves them.",
  },
];

const steps = [
  "Add your business, offer, and contacts.",
  "SalesEasyAI prepares campaign ideas, lead scores, and follow-ups.",
  "Your team reviews, approves, and moves revenue work forward.",
];

const trustStats = [
  { label: "weekly revenue actions", value: "120+" },
  { label: "draft approval rate", value: "84%" },
  { label: "hours saved per team", value: "10+" },
];

export default function Home() {
  const [activePreview, setActivePreview] = useState<PreviewKey>("campaign");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const preview = previewTabs[activePreview];

  const progressLabel = useMemo(() => {
    const labels = {
      campaign: "Campaign plan is ready for review",
      pipeline: "Revenue risks are ranked by urgency",
      followups: "Reply drafts are waiting for approval",
    };

    return labels[activePreview];
  }, [activePreview]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050507] font-sans text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,#050507_0%,#0b0f14_45%,#050507_100%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050507]/72 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3 text-white"
            aria-label="SalesEasyAI home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-zinc-950 shadow-[0_0_34px_rgba(255,255,255,0.18)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              SalesEasyAI
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/signin"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Sign in
            </a>
            <a
              href="/signup"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Sign up
            </a>
          </div>
        </div>
      </header>

      <section className="px-5 pb-20 pt-20 sm:px-8 lg:pb-28 lg:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease: "easeOut" }}
            variants={fadeUp}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-100">
              <Zap className="h-4 w-4" />
              For small teams that need more revenue work done
            </div>

            <h1 className="max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
              Turn leads into campaigns, follow-ups, and booked calls.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              Plan content, organize contacts, draft emails, spot the best
              opportunities, and move your sales day forward without a bigger
              team.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/signup"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
              >
                Sign up free
                <ArrowRight className="h-4 w-4" />
              </a>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setActivePreview("followups")}
              >
                <Play className="h-4 w-4" />
                Preview workflow
              </Button>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
          >
            <Card className="relative overflow-hidden rounded-[32px] border-white/12 bg-white/[0.07] p-3">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
              <CardContent className="rounded-[24px] border border-white/10 bg-zinc-950/80 p-4">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Revenue workspace
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Today&apos;s execution plan
                    </h2>
                  </div>
                  <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                    {progressLabel}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 rounded-[22px] border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-3">
                  {(Object.keys(previewTabs) as PreviewKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActivePreview(key)}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all",
                        activePreview === key
                          ? "bg-white text-zinc-950 shadow-lg shadow-white/10"
                          : "text-zinc-400 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {previewTabs[key].label}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activePreview}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-5 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]"
                >
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300 text-zinc-950">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-zinc-500">
                      Active preview
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                      {preview.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {preview.description}
                    </p>
                    <div className="mt-6 rounded-2xl bg-white p-4 text-zinc-950">
                      <p className="text-sm font-medium text-zinc-500">
                        Prepared output
                      </p>
                      <p className="mt-1 text-3xl font-semibold">
                        {preview.score}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {preview.rows.map((row, index) => (
                      <motion.div
                        key={row.title}
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.08 }}
                        className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-zinc-900/80 p-4"
                      >
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full shadow-[0_0_24px_currentColor]",
                            row.tone,
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">{row.title}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {row.detail}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-600" />
                      </motion.div>
                    ))}

                    <div className="rounded-[22px] border border-emerald-300/25 bg-emerald-300/10 p-4">
                      <p className="text-sm font-medium text-emerald-200">
                        Recommended next step
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        {preview.action}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6 }}
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              The difference users feel
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
              Less admin. More conversations that move revenue.
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {outcomes.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.28 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  variants={fadeUp}
                >
                  <Card className="h-full rounded-[28px] bg-white/[0.055] transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-white/[0.08]">
                    <CardContent>
                      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-4 leading-7 text-zinc-400">{item.copy}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6 }}
            variants={fadeUp}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              How it works
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
              A simple rhythm for busy teams.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              The product promise stays simple: add your business context,
              review prepared work, and approve what should go out.
            </p>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                variants={fadeUp}
              >
                <Card className="rounded-[26px] bg-zinc-950/70">
                  <CardContent className="flex items-center gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 text-sm font-bold text-zinc-950">
                      {index + 1}
                    </span>
                    <p className="text-lg font-medium text-zinc-100">{step}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65 }}
          variants={fadeUp}
          className="mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.2),rgba(34,211,238,0.12),rgba(168,85,247,0.14))] p-6 shadow-2xl shadow-black/40 sm:p-10 lg:p-14"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Start with one lead list
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
                Build a sales day that tells you exactly what to do next.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                Bring your contacts and offer. SalesEasyAI prepares campaigns,
                follow-ups, and priorities your team can approve before anything
                goes out.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-white/10 bg-zinc-950/75 p-5 backdrop-blur-xl"
            >
              <label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-300"
              >
                Work email
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="you@company.com"
                  className="h-12 min-w-0 flex-1 rounded-full border border-white/10 bg-white px-4 text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/35"
                  required
                />
                <Button type="submit" variant="accent" size="lg">
                  Sign up
                </Button>
              </div>
              <div className="mt-5 flex items-center gap-3 text-sm text-zinc-500">
                <Check className="h-4 w-4 text-emerald-300" />
                No pressure. Start with one campaign and one follow-up queue.
              </div>
              {submitted && (
                <p className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-100">
                  You&apos;re in. We&apos;ll help you turn that lead list into a
                  working sales rhythm.
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center">
          <p className="font-semibold text-white">SalesEasyAI</p>
          <p>AI-assisted sales and marketing execution for growing teams.</p>
          <div className="flex gap-4">
            <MailCheck className="h-4 w-4" />
            <p>&copy; 2026 SalesEasyAI</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
