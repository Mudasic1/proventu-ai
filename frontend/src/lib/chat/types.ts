export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Fast, versatile flagship model",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Lightweight & cost-efficient",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Balanced intelligence & speed",
  },
  {
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Near-instant responses",
  },
];

export type ToolAction = {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  color: string;
};

export const QUICK_TOOLS: ToolAction[] = [
  {
    id: "pipeline",
    label: "Pipeline",
    icon: "ChartNoAxesCombined",
    prompt: "Analyze my sales pipeline, show me deals at risk and expected revenue",
    color: "from-red-500 to-rose-500",
  },
  {
    id: "campaign",
    label: "Campaign",
    icon: "Megaphone",
    prompt: "Draft a marketing campaign for",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "leads",
    label: "Leads",
    icon: "ContactRound",
    prompt: "Find hot leads that need follow-up",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "email",
    label: "Email",
    icon: "Mail",
    prompt: "Draft a sales email about",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "ClipboardCheck",
    prompt: "Help me organize my tasks and priorities",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "insights",
    label: "Insights",
    icon: "TrendingUp",
    prompt: "What are the key insights from my workspace data",
    color: "from-cyan-500 to-sky-500",
  },
];

export const SUGGESTIONS = [
  "Summarize my pipeline deals",
  "Find hot leads to contact",
  "Draft a campaign email",
  "What tasks are due today?",
  "Analyze my sales data",
  "Create a social post",
];

export type SlashCommand = {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: string;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "pipeline",
    label: "pipeline",
    description: "Analyze deals, risks, and revenue",
    icon: "ChartNoAxesCombined",
    prompt: "Analyze my sales pipeline, show me deals at risk and expected revenue",
  },
  {
    id: "campaign",
    label: "campaign",
    description: "Draft a marketing campaign",
    icon: "Megaphone",
    prompt: "Draft a marketing campaign for",
  },
  {
    id: "leads",
    label: "leads",
    description: "Find hot leads to contact",
    icon: "ContactRound",
    prompt: "Find hot leads that need follow-up",
  },
  {
    id: "email",
    label: "email",
    description: "Draft a sales email",
    icon: "Mail",
    prompt: "Draft a sales email about",
  },
  {
    id: "task",
    label: "task",
    description: "Create or organize tasks",
    icon: "ClipboardCheck",
    prompt: "Create a task for",
  },
  {
    id: "analytics",
    label: "analytics",
    description: "View workspace insights",
    icon: "TrendingUp",
    prompt: "What are the key insights from my workspace data",
  },
  {
    id: "contacts",
    label: "contacts",
    description: "Search your contacts",
    icon: "ContactRound",
    prompt: "Find contacts matching",
  },
  {
    id: "activity",
    label: "activity",
    description: "Recent workspace activity",
    icon: "History",
    prompt: "What's the recent activity in my workspace",
  },
];
