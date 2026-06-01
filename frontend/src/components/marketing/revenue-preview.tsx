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
        tone: "lime",
      },
      {
        icon: CalendarClock,
        title: "Book discovery with Reed",
        detail: "Asked about availability",
        tag: "Follow-up due",
        tone: "mint",
      },
      {
        icon: CircleDollarSign,
        title: "Review Atlas Studio deal",
        detail: "No activity for 6 days",
        tag: "At risk",
        tone: "peach",
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
        tone: "lime",
      },
      {
        icon: Mail,
        title: "Warm lead sequence",
        detail: "Three helpful follow-ups",
        tag: "3 emails",
        tone: "mint",
      },
      {
        icon: CalendarClock,
        title: "Content schedule",
        detail: "Two weeks prepared",
        tag: "7 posts",
        tone: "peach",
      },
    ],
  },
};

type ViewKey = keyof typeof views;

export function RevenuePreview() {
  const [activeView, setActiveView] = useState<ViewKey>("priorities");
  const view = views[activeView];

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <m.div
          initial={{ opacity: 0, y: 22, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[28px] border border-white/[0.13] bg-[#10211c]/90 p-2 shadow-[0_24px_110px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-3"
        >
          <div className="overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#0a1714]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8c9b96]">
                  Revenue desk
                </p>
                <p className="mt-1 font-display text-xl font-bold tracking-[-0.06em] text-[#f4f2ea]">
                  Daily momentum
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#d8ff62]/25 bg-[#d8ff62]/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d8ff62]">
                <span className="size-1.5 rounded-full bg-[#d8ff62] shadow-[0_0_12px_#d8ff62]" />
                Dashboard live
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-white/[0.08] bg-white/[0.025] p-1.5">
              {(Object.keys(views) as ViewKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveView(key)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.12em] transition duration-300",
                    activeView === key
                      ? "bg-[#d8ff62] text-[#10211c]"
                      : "text-[#86958f] hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {views[key].label}
                </button>
              ))}
            </div>

            <m.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="p-3 sm:p-4"
            >
              <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="flex min-h-40 flex-col justify-between rounded-[18px] border border-white/[0.08] bg-[#11251f] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8fa09a]">
                      {view.title}
                    </span>
                    <Clock3 className="size-4 text-[#d8ff62]" />
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold tracking-[-0.1em] text-[#f4f2ea]">
                      {view.total}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#93a39d]">
                      Tracked and waiting for your attention.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {view.rows.map((row, index) => {
                    const Icon = row.icon;

                    return (
                      <m.div
                        key={row.title}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.06 }}
                        className="group flex items-center gap-3 rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 transition duration-300 hover:bg-white/[0.07]"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-xl",
                            row.tone === "lime" && "bg-[#d8ff62] text-[#10211c]",
                            row.tone === "mint" && "bg-[#91e7d2] text-[#10211c]",
                            row.tone === "peach" && "bg-[#ffb48f] text-[#10211c]",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[#f4f2ea]">
                            {row.title}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-[#84948e]">
                            {row.detail}
                          </p>
                        </div>
                        <span className="hidden rounded-full border border-white/[0.08] px-2 py-1 text-[9px] font-bold text-[#a9b7b2] sm:block">
                          {row.tag}
                        </span>
                      </m.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-[16px] border border-[#d8ff62]/20 bg-[#d8ff62]/[0.08] p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d8ff62] text-[#10211c]">
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                  <p className="text-xs font-semibold leading-5 text-[#c7d2ce]">
                    {view.insight}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-[#d8ff62]" />
              </div>
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, x: 16, y: -12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute -right-4 -top-5 hidden items-center gap-2 rounded-full border border-white/[0.14] bg-[#f4f2ea] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#10211c] shadow-lg sm:flex"
          >
            <ArrowUpRight className="size-3.5" strokeWidth={3} />
            Momentum found
          </m.div>
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
}
