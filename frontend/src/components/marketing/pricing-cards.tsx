"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "For solo founders testing the waters.",
    features: [
      "Up to 250 contacts",
      "1 workspace member",
      "Basic CRM & pipeline",
      "5 AI campaign drafts / month",
      "Email & social scheduling",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$39",
    period: "/ month",
    description: "For teams ready to scale revenue operations.",
    features: [
      "Unlimited contacts",
      "5 workspace members",
      "Full CRM, pipeline & tasks",
      "Unlimited AI agent drafts",
      "Email sequences & automations",
      "Analytics dashboard",
      "Priority support",
      "Custom brand voice",
    ],
    cta: "Start 14-day trial",
    href: "/signup",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Scale",
    price: "$99",
    period: "/ month",
    description: "For agencies and growing teams.",
    features: [
      "Everything in Growth",
      "Unlimited members",
      "Advanced automations",
      "Custom AI agent workflows",
      "Dedicated account manager",
      "SSO & advanced security",
      "API access",
      "White-label options",
    ],
    cta: "Contact sales",
    href: "/signup",
    highlight: false,
  },
];

export function PricingCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {plans.map((plan, index) => (
        <ScrollReveal key={plan.name} delay={index * 0.1}>
          <article
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-300 sm:p-8 ${
              plan.highlight
                ? "border-red-200 bg-gradient-to-b from-red-50 to-transparent shadow-[0_0_60px_rgba(255,92,92,0.08)]"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-lg">
                <Sparkles className="size-3" />
                {plan.badge}
              </div>
            )}

            {/* Header */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
                {plan.name}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl font-bold tracking-wide">
                  {plan.price}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  {plan.period}
                </span>
              </div>
              <p className="mt-3 text-[14px] leading-6 tracking-wide text-gray-500">
                {plan.description}
              </p>
            </div>

            {/* Features */}
            <ul className="mt-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[13px] leading-6 tracking-wide text-gray-600"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-red-500" strokeWidth={2.5} />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className={`group w-full rounded-2xl font-bold transition-all hover:-translate-y-0.5 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-[0_4px_20px_rgba(255,92,92,0.3)] hover:shadow-[0_8px_30px_rgba(255,92,92,0.4)]"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight data-icon="inline-end" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}
