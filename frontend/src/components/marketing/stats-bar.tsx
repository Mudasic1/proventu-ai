import { ScrollReveal } from "./scroll-reveal";

const stats = [
  { value: "10k+", label: "Leads tracked" },
  { value: "2.4x", label: "Faster follow-ups" },
  { value: "89%", label: "Time saved on campaigns" },
  { value: "34%", label: "More pipeline velocity" },
];

export function StatsBar() {
  return (
    <section className="relative z-10 px-5 py-16 sm:px-7 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center transition duration-300 hover:border-red-200 hover:bg-red-50"
              >
                <p className="font-display text-5xl font-bold tracking-wide bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
