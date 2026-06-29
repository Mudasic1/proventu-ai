"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Mail,
  Megaphone,
  TrendingUp,
} from "lucide-react";
import { LazyMotion, MotionConfig, m } from "framer-motion";

import { cn } from "@/lib/utils";

const loadMotionFeatures = () =>
  import("./motion-features").then((module) => module.default);

const views = {
  priorities: {
    label: "Priorities",
    title: "Today",
    total: "7 actions",
    insight: "Three warm leads are ready for a personal follow-up.",
    rows: [
      {
        icon: Mail,
        title: "Reply to Maya at Northstar",
        detail: "Opened proposal twice",
        tag: "Hot lead",
        tone: "primary" as const,
      },
      {
        icon: CalendarClock,
        title: "Book discovery with Reed",
        detail: "Asked about availability",
        tag: "Follow-up due",
        tone: "warm" as const,
      },
      {
        icon: CircleDollarSign,
        title: "Review Atlas Studio deal",
        detail: "No activity for 6 days",
        tag: "At risk",
        tone: "accent" as const,
      },
    ],
  },
  campaign: {
    label: "Campaign",
    title: "Spring offer",
    total: "12 drafts",
    insight: "Your spring campaign is ready for a final review.",
    rows: [
      {
        icon: Megaphone,
        title: "Launch announcement",
        detail: "LinkedIn and Instagram",
        tag: "2 drafts",
        tone: "primary" as const,
      },
      {
        icon: Mail,
        title: "Warm lead sequence",
        detail: "Three helpful follow-ups",
        tag: "3 emails",
        tone: "warm" as const,
      },
      {
        icon: CalendarClock,
        title: "Content schedule",
        detail: "Two weeks prepared",
        tag: "7 posts",
        tone: "accent" as const,
      },
    ],
  },
};

type ViewKey = keyof typeof views;

const toneMap = {
  primary: "bg-red-100 text-red-600 border-red-200",
  warm: "bg-orange-100 text-orange-600 border-orange-200",
  accent: "bg-rose-100 text-rose-600 border-rose-200",
};

export function HeroPreview() {
  const [activeView, setActiveView] = useState<ViewKey>("priorities");
  const view = views[activeView];

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <m.div
          initial={{ opacity: 0, y: 28, rotateX: 4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl border border-gray-200 bg-white p-2.5 shadow-[0_32px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-3"
        >
          <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-gray-400">
                  Revenue desk
                </p>
                <p className="mt-1 font-display text-xl font-bold tracking-wide text-gray-900">
                  Daily momentum
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-red-600">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-red-400" />
                </span>
                Live
              </div>
            </div>

            {/* View tabs */}
            <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50 p-1.5">
              {(Object.keys(views) as ViewKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveView(key)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.14em] transition duration-300",
                    activeView === key
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
                  )}
                >
                  {views[key].label}
                </button>
              ))}
            </div>

            {/* Content */}
            <m.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="p-3 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                {/* Stat card */}
                <div className="flex min-h-40 flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400">
                      {view.title}
                    </span>
                    <Clock3 className="size-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold tracking-wide text-gray-900">
                      {view.total}
                    </p>
                    <p className="mt-2 text-xs leading-5 tracking-wide text-gray-400">
                      Tracked and waiting for your attention.
                    </p>
                  </div>
                </div>

                {/* Row items */}
                <div className="space-y-2">
                  {view.rows.map((row, index) => {
                    const Icon = row.icon;
                    return (
                      <m.div
                        key={row.title}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.07 }}
                        className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition duration-300 hover:bg-gray-50"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                            toneMap[row.tone],
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold tracking-wide text-gray-800">
                          {row.title}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] tracking-wide text-gray-400">
                          {row.detail}
                        </p>
                        </div>
            <span className="hidden rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[9px] font-bold tracking-wide text-gray-500 sm:block">
              {row.tag}
            </span>
                      </m.div>
                    );
                  })}
                </div>
              </div>

              {/* Insight bar */}
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                  <p className="text-xs font-semibold leading-5 tracking-wide text-gray-700">
                    {view.insight}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-red-500" />
              </div>
            </m.div>
          </div>

          {/* Floating badge */}
          <m.div
            initial={{ opacity: 0, x: 16, y: -12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute -right-3 -top-4 hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-800 shadow-xl sm:flex"
          >
            <TrendingUp className="size-3.5 text-red-500" strokeWidth={2.5} />
            +34% pipeline velocity
          </m.div>

          {/* Mini stat badge bottom-left */}
          <m.div
            initial={{ opacity: 0, x: -16, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute -bottom-3 -left-3 hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-800 shadow-xl sm:flex"
          >
            <ArrowUpRight className="size-3.5 text-orange-500" strokeWidth={2.5} />
            12 leads this week
          </m.div>
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
}
