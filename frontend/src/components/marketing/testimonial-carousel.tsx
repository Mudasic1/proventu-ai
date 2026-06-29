import { Star } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";

const testimonials = [
  {
    quote: "We went from scattered spreadsheets to a unified pipeline in one afternoon. The AI follow-ups alone saved us 12 hours a week.",
    name: "Sarah Chen",
    role: "Founder, Northstar Agency",
    initials: "SC",
  },
  {
    quote: "Finally, a tool that doesn't just track leads — it tells me which ones to call first. Our close rate jumped 28% in the first quarter.",
    name: "Marcus Rivera",
    role: "Head of Sales, Atlas Studio",
    initials: "MR",
  },
  {
    quote: "The campaign planner is incredible. I describe my offer, and it drafts emails, social posts, and a content calendar. Feels like having a marketing team.",
    name: "Priya Kapoor",
    role: "Solo Consultant",
    initials: "PK",
  },
];

export function TestimonialCarousel() {
  return (
    <section className="relative z-10 border-y border-gray-200 bg-gray-50 px-5 py-24 sm:px-7 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-[400px] -translate-x-1/2 rounded-full bg-red-300/[0.06] blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-red-500">
              Loved by growing teams
            </p>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[0.92] tracking-wide sm:text-6xl">
              Real teams.
              <span className="block text-gray-300">Real results.</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.name} delay={index * 0.1}>
              <article className="group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 sm:p-8">
                <div>
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-6 text-[15px] leading-7 tracking-wide text-gray-600">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Author */}
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 text-xs font-bold text-red-600 border border-red-200">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-wide text-gray-800">
                      {testimonial.name}
                    </p>
                    <p className="text-[12px] tracking-wide text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
