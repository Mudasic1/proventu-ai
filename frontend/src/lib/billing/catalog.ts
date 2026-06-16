export const BILLING_CATALOG_VERSION = "2026-06-15";
export const BILLING_CURRENCY = "usd";

export type BillingCatalogPlan = {
  id: string;
  code: string;
  lookupKey: string;
  name: string;
  description: string;
  priceCents: number;
  interval: "month";
  monthlyIncludedCredits: number;
  features: string[];
};

export type BillingCatalogTopUp = {
  id: string;
  code: string;
  lookupKey: string;
  name: string;
  description: string;
  priceCents: number;
  grantedCredits: number;
};

export const DEFAULT_BILLING_PLANS = [
  {
    id: "plan_starter_monthly",
    code: "starter",
    lookupKey: "proventu_starter_monthly",
    name: "Starter",
    description: "For small teams starting with AI-assisted sales operations.",
    priceCents: 2900,
    interval: "month",
    monthlyIncludedCredits: 10000,
    features: [
      "10,000 monthly AI credits",
      "CRM contact and activity workflows",
      "Pipeline and task tracking",
      "Email and calendar integrations",
    ],
  },
  {
    id: "plan_growth_monthly",
    code: "growth",
    lookupKey: "proventu_growth_monthly",
    name: "Growth",
    description: "For teams running higher-volume prospecting and follow-up.",
    priceCents: 7900,
    interval: "month",
    monthlyIncludedCredits: 40000,
    features: [
      "40,000 monthly AI credits",
      "Expanded CRM activity capacity",
      "Priority sales workflows",
      "Credit top-ups enabled",
    ],
  },
  {
    id: "plan_scale_monthly",
    code: "scale",
    lookupKey: "proventu_scale_monthly",
    name: "Scale",
    description: "For growing sales teams with sustained automation usage.",
    priceCents: 19900,
    interval: "month",
    monthlyIncludedCredits: 120000,
    features: [
      "120,000 monthly AI credits",
      "Advanced workspace usage visibility",
      "High-volume CRM operations",
      "Credit top-ups enabled",
    ],
  },
] as const satisfies BillingCatalogPlan[];

export const DEFAULT_TOP_UP_PACKAGES = [
  {
    id: "topup_10000",
    code: "credits_10000",
    lookupKey: "proventu_topup_10000",
    name: "10K Credits",
    description: "A small non-expiring credit boost for active paid workspaces.",
    priceCents: 1900,
    grantedCredits: 10000,
  },
  {
    id: "topup_30000",
    code: "credits_30000",
    lookupKey: "proventu_topup_30000",
    name: "30K Credits",
    description: "Additional credits for a busy sales cycle or campaign push.",
    priceCents: 4900,
    grantedCredits: 30000,
  },
  {
    id: "topup_75000",
    code: "credits_75000",
    lookupKey: "proventu_topup_75000",
    name: "75K Credits",
    description: "A larger non-expiring pack for sustained AI usage.",
    priceCents: 9900,
    grantedCredits: 75000,
  },
] as const satisfies BillingCatalogTopUp[];

export function getBillingCatalogSummary() {
  return {
    version: BILLING_CATALOG_VERSION,
    plans: DEFAULT_BILLING_PLANS.length,
    topUps: DEFAULT_TOP_UP_PACKAGES.length,
  };
}
