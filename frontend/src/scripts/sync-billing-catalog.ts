import path from "node:path";
import process from "node:process";

import { Pool } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import Stripe from "stripe";

import {
  BILLING_CATALOG_VERSION,
  BILLING_CURRENCY,
  DEFAULT_BILLING_PLANS,
  DEFAULT_TOP_UP_PACKAGES,
  type BillingCatalogPlan,
  type BillingCatalogTopUp,
} from "../lib/billing/catalog";
import { billingPlan, topUpPackage } from "../lib/db/schema";

config({ path: path.resolve(process.cwd(), ".env.local"), override: false });
config({ path: path.resolve(process.cwd(), ".env"), override: false });

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function priceMatchesPlan(price: Stripe.Price, plan: BillingCatalogPlan) {
  return (
    price.active &&
    price.currency === BILLING_CURRENCY &&
    price.unit_amount === plan.priceCents &&
    price.recurring?.interval === plan.interval
  );
}

function priceMatchesTopUp(price: Stripe.Price, topUp: BillingCatalogTopUp) {
  return (
    price.active &&
    price.currency === BILLING_CURRENCY &&
    price.unit_amount === topUp.priceCents &&
    price.type === "one_time"
  );
}

async function findExistingPrice(stripe: Stripe, lookupKey: string) {
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  });

  return prices.data[0] ?? null;
}

async function createProduct(
  stripe: Stripe,
  item: BillingCatalogPlan | BillingCatalogTopUp,
  kind: "subscription" | "top_up",
) {
  return stripe.products.create(
    {
      name: `Proventu AI ${item.name}`,
      description: item.description,
      metadata: {
        proventuCatalogVersion: BILLING_CATALOG_VERSION,
        proventuCatalogKind: kind,
        proventuCatalogCode: item.code,
      },
    },
    {
      idempotencyKey: `proventu:product:${kind}:${item.code}:${BILLING_CATALOG_VERSION}`,
    },
  );
}

async function createPrice(
  stripe: Stripe,
  item: BillingCatalogPlan | BillingCatalogTopUp,
  productId: string,
  kind: "subscription" | "top_up",
) {
  const params: Stripe.PriceCreateParams = {
    product: productId,
    unit_amount: item.priceCents,
    currency: BILLING_CURRENCY,
    lookup_key: item.lookupKey,
    metadata: {
      proventuCatalogVersion: BILLING_CATALOG_VERSION,
      proventuCatalogKind: kind,
      proventuCatalogCode: item.code,
    },
  };

  if (kind === "subscription") {
    params.recurring = { interval: (item as BillingCatalogPlan).interval };
  }

  return stripe.prices.create(params, {
    idempotencyKey: `proventu:price:${kind}:${item.code}:${item.priceCents}:${BILLING_CURRENCY}`,
  });
}

async function ensurePlanPrice(
  stripe: Stripe,
  db: ReturnType<typeof drizzle>,
  plan: BillingCatalogPlan,
) {
  const [existingPlan] = await db
    .select({ stripePriceId: billingPlan.stripePriceId })
    .from(billingPlan)
    .where(eq(billingPlan.code, plan.code))
    .limit(1);

  if (existingPlan?.stripePriceId) {
    const price = await stripe.prices.retrieve(existingPlan.stripePriceId);
    if (priceMatchesPlan(price, plan)) return price.id;
  }

  const existingPrice = await findExistingPrice(stripe, plan.lookupKey);
  if (existingPrice && priceMatchesPlan(existingPrice, plan)) {
    return existingPrice.id;
  }

  const product = await createProduct(stripe, plan, "subscription");
  const price = await createPrice(stripe, plan, product.id, "subscription");
  return price.id;
}

async function ensureTopUpPrice(
  stripe: Stripe,
  db: ReturnType<typeof drizzle>,
  topUp: BillingCatalogTopUp,
) {
  const [existingTopUp] = await db
    .select({ stripePriceId: topUpPackage.stripePriceId })
    .from(topUpPackage)
    .where(eq(topUpPackage.code, topUp.code))
    .limit(1);

  if (existingTopUp?.stripePriceId) {
    const price = await stripe.prices.retrieve(existingTopUp.stripePriceId);
    if (priceMatchesTopUp(price, topUp)) return price.id;
  }

  const existingPrice = await findExistingPrice(stripe, topUp.lookupKey);
  if (existingPrice && priceMatchesTopUp(existingPrice, topUp)) {
    return existingPrice.id;
  }

  const product = await createProduct(stripe, topUp, "top_up");
  const price = await createPrice(stripe, topUp, product.id, "top_up");
  return price.id;
}

async function ensureBillingPortalConfiguration(
  stripe: Stripe,
  subscriptionPriceIds: string[],
) {
  const productsById = new Map<string, string[]>();

  for (const priceId of subscriptionPriceIds) {
    const price = await stripe.prices.retrieve(priceId);
    const productId =
      typeof price.product === "string" ? price.product : price.product.id;
    const prices = productsById.get(productId) ?? [];
    prices.push(price.id);
    productsById.set(productId, prices);
  }

  const subscriptionProducts = [...productsById.entries()].map(
    ([product, prices]) => ({
      product,
      prices,
    }),
  );

  const configurationParams: Stripe.BillingPortal.ConfigurationCreateParams = {
    name: "Proventu AI Billing Portal",
    business_profile: {
      headline: "Manage your Proventu AI subscription and billing details.",
    },
    default_return_url: process.env.BETTER_AUTH_URL
      ? `${process.env.BETTER_AUTH_URL.replace(/\/$/, "")}/settings/billing`
      : undefined,
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "name", "tax_id"],
      },
      invoice_history: {
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: [
            "too_expensive",
            "missing_features",
            "switched_service",
            "unused",
            "other",
          ],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
        products: subscriptionProducts,
      },
    },
    metadata: {
      proventuManaged: "true",
      proventuCatalogVersion: BILLING_CATALOG_VERSION,
    },
  };

  const configurations = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 100,
  });
  const existing = configurations.data.find(
    (configuration) => configuration.metadata?.proventuManaged === "true",
  );

  if (existing) {
    const updated =
      await stripe.billingPortal.configurations.update(existing.id, {
        ...configurationParams,
        active: true,
      });
    console.log(`Synced billing portal configuration -> ${updated.id}`);
    return updated.id;
  }

  const created = await stripe.billingPortal.configurations.create(
    configurationParams,
    {
      idempotencyKey: `proventu:billing-portal:${BILLING_CATALOG_VERSION}`,
    },
  );
  console.log(`Created billing portal configuration -> ${created.id}`);
  return created.id;
}

async function syncCatalog() {
  const databaseUri = requiredEnv("DATABASE_URI");
  const stripeSecretKey = requiredEnv("STRIPE_SECRET_KEY");
  const stripe = new Stripe(stripeSecretKey, {
    appInfo: {
      name: "Proventu AI",
    },
  });
  const pool = new Pool({ connectionString: databaseUri });
  const db = drizzle(pool);
  const now = new Date();

  try {
    const subscriptionPriceIds: string[] = [];

    for (const plan of DEFAULT_BILLING_PLANS) {
      const stripePriceId = await ensurePlanPrice(stripe, db, plan);
      subscriptionPriceIds.push(stripePriceId);
      await db
        .insert(billingPlan)
        .values({
          id: plan.id,
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceCents: plan.priceCents,
          interval: plan.interval,
          features: [...plan.features],
          stripePriceId,
          monthlyIncludedCredits: plan.monthlyIncludedCredits,
          isActive: true,
          effectiveFrom: now,
          effectiveTo: null,
        })
        .onConflictDoUpdate({
          target: billingPlan.code,
          set: {
            name: plan.name,
            description: plan.description,
            priceCents: plan.priceCents,
            interval: plan.interval,
            features: [...plan.features],
            stripePriceId,
            monthlyIncludedCredits: plan.monthlyIncludedCredits,
            isActive: true,
            effectiveTo: null,
            updatedAt: now,
          },
        });
      console.log(`Synced plan ${plan.code} -> ${stripePriceId}`);
    }

    await ensureBillingPortalConfiguration(stripe, subscriptionPriceIds);

    for (const topUp of DEFAULT_TOP_UP_PACKAGES) {
      const stripePriceId = await ensureTopUpPrice(stripe, db, topUp);
      await db
        .insert(topUpPackage)
        .values({
          id: topUp.id,
          code: topUp.code,
          name: topUp.name,
          description: topUp.description,
          priceCents: topUp.priceCents,
          stripePriceId,
          grantedCredits: topUp.grantedCredits,
          isActive: true,
          effectiveFrom: now,
          effectiveTo: null,
        })
        .onConflictDoUpdate({
          target: topUpPackage.code,
          set: {
            name: topUp.name,
            description: topUp.description,
            priceCents: topUp.priceCents,
            stripePriceId,
            grantedCredits: topUp.grantedCredits,
            isActive: true,
            effectiveTo: null,
            updatedAt: now,
          },
        });
      console.log(`Synced top-up ${topUp.code} -> ${stripePriceId}`);
    }
  } finally {
    await pool.end();
  }
}

syncCatalog().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown billing catalog error.";
  console.error(`Billing catalog sync failed: ${message}`);
  process.exitCode = 1;
});
