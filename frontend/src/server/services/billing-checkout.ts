import "server-only";

import { and, eq } from "drizzle-orm";

import { getBillingBaseUrl, getStripeClient } from "@/lib/billing/stripe-client";
import { db } from "@/lib/db";
import {
  billingPlan,
  billingPurchase,
  topUpPackage,
  user,
  workspace,
  workspaceBillingAccount,
  workspaceSubscription,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";

function id() {
  return crypto.randomUUID();
}

function isAvailable(effectiveFrom: Date, effectiveTo: Date | null) {
  const now = Date.now();
  return effectiveFrom.getTime() <= now && (!effectiveTo || effectiveTo.getTime() > now);
}

async function ensureStripeCustomer(workspaceId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(workspaceBillingAccount)
    .where(eq(workspaceBillingAccount.workspaceId, workspaceId))
    .limit(1);

  if (existing) return existing;

  const [[workspaceRecord], [userRecord]] = await Promise.all([
    db.select().from(workspace).where(eq(workspace.id, workspaceId)).limit(1),
    db.select().from(user).where(eq(user.id, userId)).limit(1),
  ]);

  if (!workspaceRecord || !userRecord) {
    throw new AppError("NOT_FOUND", "Workspace billing identity could not be created.");
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create(
    {
      email: userRecord.email,
      name: workspaceRecord.name,
      metadata: {
        workspaceId,
      },
    },
    { idempotencyKey: `customer:${workspaceId}` },
  );

  const [created] = await db
    .insert(workspaceBillingAccount)
    .values({
      id: id(),
      workspaceId,
      stripeCustomerId: customer.id,
      billingEmail: userRecord.email,
    })
    .onConflictDoUpdate({
      target: workspaceBillingAccount.workspaceId,
      set: {
        stripeCustomerId: customer.id,
        billingEmail: userRecord.email,
        updatedAt: new Date(),
      },
    })
    .returning();

  return created;
}

async function getOrCreatePurchase(input: {
  workspaceId: string;
  userId: string;
  kind: "subscription" | "top_up";
  billingPlanId?: string;
  topUpPackageId?: string;
  idempotencyKey: string;
}) {
  const [existing] = await db
    .select()
    .from(billingPurchase)
    .where(
      and(
        eq(billingPurchase.workspaceId, input.workspaceId),
        eq(billingPurchase.idempotencyKey, input.idempotencyKey),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(billingPurchase)
    .values({
      id: id(),
      workspaceId: input.workspaceId,
      kind: input.kind,
      billingPlanId: input.billingPlanId,
      topUpPackageId: input.topUpPackageId,
      requestedByUserId: input.userId,
      idempotencyKey: input.idempotencyKey,
    })
    .returning();

  return created;
}

async function reuseCheckoutUrl(stripeCheckoutSessionId: string | null) {
  if (!stripeCheckoutSessionId) return null;
  const session = await getStripeClient().checkout.sessions.retrieve(
    stripeCheckoutSessionId,
  );
  return session.url;
}

async function getBillingPortalConfigurationId() {
  const configurations = await getStripeClient().billingPortal.configurations.list({
    active: true,
    limit: 100,
  });

  const managedConfiguration =
    configurations.data.find(
      (configuration) => configuration.metadata?.proventuManaged === "true",
    ) ?? configurations.data[0];

  if (!managedConfiguration) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Stripe Billing Portal is not configured. Run npm run billing:sync-catalog.",
    );
  }

  return managedConfiguration.id;
}

export async function createSubscriptionCheckout(input: {
  workspaceId: string;
  userId: string;
  planId: string;
  idempotencyKey: string;
}) {
  const [plan] = await db
    .select()
    .from(billingPlan)
    .where(and(eq(billingPlan.id, input.planId), eq(billingPlan.isActive, true)))
    .limit(1);

  if (!plan || !plan.stripePriceId || !isAvailable(plan.effectiveFrom, plan.effectiveTo)) {
    throw new AppError("NOT_FOUND", "This billing plan is not available.");
  }

  const customer = await ensureStripeCustomer(input.workspaceId, input.userId);
  const purchase = await getOrCreatePurchase({
    workspaceId: input.workspaceId,
    userId: input.userId,
    kind: "subscription",
    billingPlanId: plan.id,
    idempotencyKey: input.idempotencyKey,
  });

  const reusedUrl = await reuseCheckoutUrl(purchase.stripeCheckoutSessionId);
  if (reusedUrl) return { checkoutUrl: reusedUrl };

  const baseUrl = getBillingBaseUrl();
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer: customer.stripeCustomerId,
      client_reference_id: input.workspaceId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/settings/billing?checkout=cancelled`,
      metadata: {
        workspaceId: input.workspaceId,
        purchaseId: purchase.id,
        planId: plan.id,
        kind: "subscription",
      },
      subscription_data: {
        metadata: {
          workspaceId: input.workspaceId,
          purchaseId: purchase.id,
          planId: plan.id,
        },
      },
    },
    { idempotencyKey: `checkout:subscription:${purchase.id}` },
  );

  if (!session.url) {
    throw new AppError("INTERNAL_ERROR", "Stripe did not return a Checkout URL.");
  }

  await db
    .update(billingPurchase)
    .set({
      status: "checkout_created",
      stripeCheckoutSessionId: session.id,
      updatedAt: new Date(),
    })
    .where(eq(billingPurchase.id, purchase.id));

  return { checkoutUrl: session.url };
}

export async function createTopUpCheckout(input: {
  workspaceId: string;
  userId: string;
  packageId: string;
  idempotencyKey: string;
}) {
  const [[activeSubscription], [creditPackage]] = await Promise.all([
    db
      .select()
      .from(workspaceSubscription)
      .where(
        and(
          eq(workspaceSubscription.workspaceId, input.workspaceId),
          eq(workspaceSubscription.status, "active"),
        ),
      )
      .limit(1),
    db
      .select()
      .from(topUpPackage)
      .where(and(eq(topUpPackage.id, input.packageId), eq(topUpPackage.isActive, true)))
      .limit(1),
  ]);

  if (!activeSubscription) {
    throw new AppError("FORBIDDEN", "Top-ups require an active paid subscription.");
  }

  if (!creditPackage || !isAvailable(creditPackage.effectiveFrom, creditPackage.effectiveTo)) {
    throw new AppError("NOT_FOUND", "This top-up package is not available.");
  }

  const customer = await ensureStripeCustomer(input.workspaceId, input.userId);
  const purchase = await getOrCreatePurchase({
    workspaceId: input.workspaceId,
    userId: input.userId,
    kind: "top_up",
    topUpPackageId: creditPackage.id,
    idempotencyKey: input.idempotencyKey,
  });

  const reusedUrl = await reuseCheckoutUrl(purchase.stripeCheckoutSessionId);
  if (reusedUrl) return { checkoutUrl: reusedUrl };

  const baseUrl = getBillingBaseUrl();
  const session = await getStripeClient().checkout.sessions.create(
    {
      mode: "payment",
      customer: customer.stripeCustomerId,
      client_reference_id: input.workspaceId,
      line_items: [{ price: creditPackage.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/settings/billing?top_up=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/settings/billing?top_up=cancelled`,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${creditPackage.name} credit top-up`,
          metadata: {
            workspaceId: input.workspaceId,
            purchaseId: purchase.id,
            topUpPackageId: creditPackage.id,
            kind: "top_up",
          },
        },
      },
      metadata: {
        workspaceId: input.workspaceId,
        purchaseId: purchase.id,
        topUpPackageId: creditPackage.id,
        kind: "top_up",
      },
    },
    { idempotencyKey: `checkout:top-up:${purchase.id}` },
  );

  if (!session.url) {
    throw new AppError("INTERNAL_ERROR", "Stripe did not return a Checkout URL.");
  }

  await db
    .update(billingPurchase)
    .set({
      status: "checkout_created",
      stripeCheckoutSessionId: session.id,
      updatedAt: new Date(),
    })
    .where(eq(billingPurchase.id, purchase.id));

  return { checkoutUrl: session.url };
}

export async function createBillingPortalSession(input: {
  workspaceId: string;
}) {
  const [account] = await db
    .select()
    .from(workspaceBillingAccount)
    .where(eq(workspaceBillingAccount.workspaceId, input.workspaceId))
    .limit(1);

  if (!account) {
    throw new AppError("NOT_FOUND", "No Stripe billing account exists yet.");
  }

  const session = await getStripeClient().billingPortal.sessions.create({
    customer: account.stripeCustomerId,
    configuration: await getBillingPortalConfigurationId(),
    return_url: `${getBillingBaseUrl()}/settings/billing`,
  });

  return { portalUrl: session.url };
}
