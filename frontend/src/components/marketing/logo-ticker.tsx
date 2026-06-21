import { Sparkles } from "lucide-react";

const capabilities = [
  "Lead tracking",
  "Campaign planning",
  "Social drafts",
  "Email follow-ups",
  "Pipeline clarity",
  "Team review",
  "AI agents",
  "Automation",
];

export function LogoTicker() {
  return (
    <section
      aria-label="Revenue workflow capabilities"
      className="relative z-10 overflow-hidden border-y border-gray-200 bg-gray-50 py-4"
    >
      <div className="revenue-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {[...capabilities, ...capabilities].map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gray-400"
          >
            {item}
            <Sparkles className="size-3.5 text-red-400" />
          </div>
        ))}
      </div>
    </section>
  );
}
