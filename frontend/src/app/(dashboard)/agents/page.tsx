import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const agents = [
  {
    name: "Campaign Agent",
    description:
      "Drafts complete campaigns — social posts, email sequences, and follow-ups — based on your offer and audience. Review, tweak, and approve before anything goes live.",
    icon: Bot,
    href: "/marketing/campaigns",
    status: "active" as const,
    color: "from-red-500 to-rose-500",
  },
  {
    name: "Lead Scorer",
    description:
      "Analyzes engagement, intent signals, and deal history to rank leads by readiness. Knows who to call first, every morning.",
    icon: Target,
    href: "#",
    status: "coming-soon" as const,
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Follow-up Writer",
    description:
      "Generates personalized follow-up messages that match your brand voice. Suggests timing based on when each lead is most responsive.",
    icon: MessageSquare,
    href: "#",
    status: "coming-soon" as const,
    color: "from-red-400 to-rose-400",
  },
  {
    name: "Insight Agent",
    description:
      "Surfaces pipeline risks, stalled deals, and revenue patterns. Delivers a daily briefing so nothing slips through the cracks.",
    icon: TrendingUp,
    href: "#",
    status: "coming-soon" as const,
    color: "from-orange-500 to-red-500",
  },
];

function AgentCard({
  name,
  description,
  icon: Icon,
  href,
  status,
  color,
  style,
}: (typeof agents)[number] & { style?: React.CSSProperties }) {
  return (
    <article className="card-enter group relative overflow-hidden rounded-3xl border border-[var(--dashboard-border)] bg-white p-6 shadow-[var(--dashboard-shadow)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-8" style={style}>
      {status === "coming-soon" && (
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gray-100 blur-[40px]" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
        >
          <Icon className="size-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
            status === "active"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-gray-50 text-gray-400 border border-gray-200"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              status === "active" ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          {status === "active" ? "Active" : "Coming soon"}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold tracking-wide">
        {name}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--dashboard-soft)]">
        {description}
      </p>
      <div className="mt-6">
        {status === "active" ? (
          <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${color} px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-lg transition-all hover:opacity-90`}
          >
            <Sparkles className="size-3.5" />
            Open agent
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-gray-400">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}

export default function AgentsPage() {
  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--dashboard-accent)]">
            AI-powered productivity
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-wide">
            Your AI Agents
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--dashboard-muted)]">
            Autonomous agents that draft, score, write, and surface insights —{" "}
            all awaiting your review before any customer-facing action.
          </p>
        </div>
        <Bot className="hidden size-8 text-[var(--dashboard-accent)] sm:block" />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {agents.map((agent, i) => (
          <AgentCard key={agent.name} {...agent} style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </section>
  );
}
