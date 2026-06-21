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
          className="relative rounded-[28px] border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur-xl sm:p-3"
        >
          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Revenue desk
                </p>
                <p className="mt-1 font-display text-xl font-bold tracking-wide text-slate-900">
                  Daily momentum
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                <span className="size-1.5 rounded-full bg-blue-600 shadow-[0_0_12px_#2563eb]" />
                Dashboard live
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-200 bg-white p-1.5">
              {(Object.keys(views) as ViewKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveView(key)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.12em] transition duration-300",
                    activeView === key
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
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
                <div className="flex min-h-40 flex-col justify-between rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                      {view.title}
                    </span>
                    <Clock3 className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-display text-4xl font-bold tracking-wide text-slate-900">
                      {view.total}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
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
                        className="group flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 p-3 transition duration-300 hover:bg-slate-100"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-xl",
                            row.tone === "lime" && "bg-blue-100 text-blue-600",
                            row.tone === "mint" && "bg-teal-100 text-teal-600",
                            row.tone === "peach" && "bg-orange-100 text-orange-600",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {row.title}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-slate-500">
                            {row.detail}
                          </p>
                        </div>
                        <span className="hidden rounded-full border border-slate-200 px-2 py-1 text-[9px] font-bold text-slate-500 sm:block">
                          {row.tag}
                        </span>
                      </m.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-[16px] border border-blue-200 bg-blue-50 p-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </div>
                  <p className="text-xs font-semibold leading-5 text-slate-700">
                    {view.insight}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-blue-600" />
              </div>
            </m.div>
          </div>

          <m.div
            initial={{ opacity: 0, x: 16, y: -12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute -right-4 -top-5 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-900 shadow-lg sm:flex"
          >
            <ArrowUpRight className="size-3.5" strokeWidth={3} />
            Momentum found
          </m.div>
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
}
