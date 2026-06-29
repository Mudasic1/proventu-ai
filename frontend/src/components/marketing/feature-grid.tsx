"use client";

import {
  BarChart3,
  Bot,
  CalendarDays,
  ContactRound,
  Globe,
  Inbox,
  Mail,
  Workflow,
} from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

const features = [
  {
    icon: ContactRound,
    title: "CRM & Contacts",
    description: "Import, segment, and manage your entire lead database. Track every interaction, note, and deal stage in one place.",
    span: "lg:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Sales Pipeline",
    description: "Visual deal tracking with drag-and-drop stages. Forecast revenue, flag stale deals, and never lose a follow-up.",
    span: "lg:col-span-1",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Autonomous agents draft campaigns, write follow-ups, score leads, and surface insights — all awaiting your review.",
    span: "lg:col-span-1",
    highlight: true,
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description: "Design email sequences, A/B test subject lines, and automate drip campaigns that nurture leads into customers.",
    span: "lg:col-span-1",
  },
  {
    icon: Globe,
    title: "Social Scheduling",
    description: "Plan, draft, and schedule posts across platforms with a visual calendar. AI generates content ideas from your brand voice.",
    span: "lg:col-span-2",
  },
  {
    icon: Workflow,
    title: "Automations",
    description: "Build multi-step workflows that trigger actions across your pipeline. When a deal moves, the right follow-up fires automatically.",
    span: "lg:col-span-1",
  },
  {
    icon: Inbox,
    title: "Unified Inbox",
    description: "Every conversation across email and social in one chronological stream. Reply, tag, and route without switching tabs.",
    span: "lg:col-span-1",
  },
  {
    icon: CalendarDays,
    title: "Appointments",
    description: "Share booking links, sync with Google Calendar, and let prospects schedule discovery calls directly from campaigns.",
    span: "lg:col-span-1",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <ScrollReveal key={feature.title} delay={index * 0.06} className={feature.span}>
            <article
              className={`group relative h-full overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1 sm:p-7 ${
                feature.highlight
                  ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300 hover:shadow-[0_0_40px_rgba(255,92,92,0.12)]"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {/* Corner accent for highlighted card */}
              {feature.highlight && (
                <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-red-100 blur-[40px]" />
              )}

              <div
                className={`relative flex size-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  feature.highlight
                    ? "border-red-300 bg-red-100 text-red-600 group-hover:shadow-[0_0_20px_rgba(255,92,92,0.2)]"
                    : "border-gray-200 bg-gray-50 text-gray-500 group-hover:border-red-200 group-hover:text-red-500"
                }`}
              >
                <Icon className="size-5" />
              </div>

              <h3 className="relative mt-5 font-display text-2xl font-bold tracking-wide">
                {feature.title}
              </h3>
              <p className="relative mt-3 text-[14px] leading-7 tracking-wide text-gray-500">
                {feature.description}
              </p>
            </article>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
