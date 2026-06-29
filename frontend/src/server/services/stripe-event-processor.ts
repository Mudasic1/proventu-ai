import "server-only";

import { and, eq, inArray, lte, sql } from "drizzle-orm";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/billing/stripe-client";
import { db } from "@/lib/db";
import {
  billingPlan,
  billingPurchase,
  operationsAuditEntry,
  paymentRecord,
  stripeWebhookEvent,
  topUpPackage,
  workspaceSubscription,
} from "@/lib/db/schema";
import { grantWorkspaceCredits } from "@/server/services/credit-wallet";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type StripeLike = {
  id?: string;
  metadata?: Record<string, string>;
  [key: string]: unknown;
};

const PROCESSABLE_EVENT_TYPES = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

function id() {
  return crypto.randomUUID();
}

function fromUnix(value: unknown) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function objectId(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) return String((value as { id: string }).id);
  return null;
}

function getSubscriptionIdFromInvoice(invoice: StripeLike) {
  const parent = asRecord(invoice.parent);
  const subscriptionDetails = asRecord(parent?.subscription_details);
  const lines = asRecord(invoice.lines);
  const lineData = Array.isArray(lines?.data) ? lines.data : [];
  const firstLine = asRecord(lineData[0]);

  return (
    objectId(invoice.subscription) ??
    objectId(subscriptionDetails?.subscription) ??
    objectId(firstLine?.subscription)
  );
}

function getPriceIdFromSubscription(subscription: StripeLike) {
  const items = asRecord(subscription.items);
  const itemData = Array.isArray(items?.data) ? items.data : [];
  const firstItem = asRecord(itemData[0]);

  return objectId(firstItem?.price);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function stripeLike(value: unknown): StripeLike {
  return value as StripeLike;
}

async function findPlanForSubscription(tx: Transaction, subscription: StripeLike) {
  const metadataPlanId = subscription.metadata?.planId;
  if (metadataPlanId) {
    const [plan] = await tx
      .select()
      .from(billingPlan)
      .where(eq(billingPlan.id, metadataPlanId))
      .limit(1);
    if (plan) return plan;
  }

  const priceId = getPriceIdFromSubscription(subscription);
  if (!priceId) return null;

  const [plan] = await tx
    .select()
    .from(billingPlan)
    .where(eq(billingPlan.stripePriceId, priceId))
    .limit(1);

  return plan ?? null;
}

async function upsertSubscriptionFromStripe(
  tx: Transaction,
  subscription: StripeLike,
) {
  const workspaceId = subscription.metadata?.workspaceId;
  const stripeSubscriptionId = subscription.id as string;
  const stripeCustomerId = objectId(subscription.customer);

  if (!workspaceId || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error("Subscription is missing workspace metadata.");
  }

  const plan = await findPlanForSubscription(tx, subscription);
  if (!plan) {
    throw new Error("Subscription price is not mapped to a local billing plan.");
  }

  const currentPeriodStart = fromUnix(subscription.current_period_start);
  const currentPeriodEnd = fromUnix(subscription.current_period_end);
  const endedAt = fromUnix(subscription.ended_at);
  const status = stringValue(subscription.status, "incomplete");

  const [localSubscription] = await tx
    .insert(workspaceSubscription)
    .values({
      id: id(),
      workspaceId,
      billingPlanId: plan.id,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      renewsAt: currentPeriodEnd,
      cancelAtPeriodEnd: booleanValue(subscription.cancel_at_period_end),
      endedAt,
    })
    .onConflictDoUpdate({
      target: workspaceSubscription.workspaceId,
      set: {
        billingPlanId: plan.id,
        stripeSubscriptionId,
        stripeCustomerId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        renewsAt: currentPeriodEnd,
        cancelAtPeriodEnd: booleanValue(subscription.cancel_at_period_end),
        endedAt,
        updatedAt: new Date(),
      },
    })
    .returning();

  await tx.insert(operationsAuditEntry).values({
    id: id(),
    workspaceId,
    actorKind: "stripe",
    action: "billing.subscription_reconciled",
    entityType: "workspace_subscription",
    entityId: localSubscription.id,
    safeSummary: `Stripe subscription ${stripeSubscriptionId} reconciled as ${localSubscription.status}.`,
    metadata: {
      stripeSubscriptionId,
      stripeCustomerId,
      planCode: plan.code,
    },
  });

  return { localSubscription, plan };
}

async function reconcileCheckoutSession(
  tx: Transaction,
  session: StripeLike,
  options: { includePaidInvoice?: boolean } = {},
) {
  const purchaseId = session.metadata?.purchaseId;
  const workspaceId = session.metadata?.workspaceId;
  const kind = session.metadata?.kind;
  const paymentStatus = stringValue(session.payment_status);

  if (!purchaseId || !workspaceId) {
    throw new Error("Checkout session is missing purchase metadata.");
  }

  await tx
    .update(billingPurchase)
    .set({
      status: paymentStatus === "paid" ? "paid" : "checkout_created",
      stripeCheckoutSessionId: stringValue(session.id),
      stripePaymentIntentId: objectId(session.payment_intent),
      stripeSubscriptionId: objectId(session.subscription),
      updatedAt: new Date(),
    })
    .where(eq(billingPurchase.id, purchaseId));

  if (kind === "subscription" && session.subscription) {
    const subscription = await getStripeClient().subscriptions.retrieve(
      objectId(session.subscription) as string,
    );
    await upsertSubscriptionFromStripe(tx, stripeLike(subscription));

    if (options.includePaidInvoice && paymentStatus === "paid" && session.invoice) {
      const invoice = await getStripeClient().invoices.retrieve(
        objectId(session.invoice) as string,
      );
      await reconcilePaidInvoice(tx, stripeLike(invoice));
    }

    return workspaceId;
  }

  if (kind === "top_up" && paymentStatus === "paid") {
    const [purchase] = await tx
      .select({
        id: billingPurchase.id,
        workspaceId: billingPurchase.workspaceId,
        topUpPackageId: billingPurchase.topUpPackageId,
      })
      .from(billingPurchase)
      .where(eq(billingPurchase.id, purchaseId))
      .limit(1);

    if (!purchase?.topUpPackageId) {
      throw new Error("Top-up checkout is missing package metadata.");
    }

    const [creditPackage] = await tx
      .select()
      .from(topUpPackage)
      .where(eq(topUpPackage.id, purchase.topUpPackageId))
      .limit(1);

    if (!creditPackage) {
      throw new Error("Top-up package was not found.");
    }

    await grantWorkspaceCredits(tx, {
      workspaceId: purchase.workspaceId,
      sourceKind: "top_up",
      sourceId: stringValue(session.id),
      operationKey: `stripe:checkout:${stringValue(session.id)}:top-up`,
      credits: creditPackage.grantedCredits,
      reason: `${creditPackage.name} top-up fulfilled from Stripe Checkout.`,
    });

    await tx
      .update(billingPurchase)
      .set({
        status: "fulfilled",
        fulfilledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(billingPurchase.id, purchase.id));

    const invoiceId = objectId(session.invoice);

    await tx
      .insert(paymentRecord)
      .values({
        id: id(),
        workspaceId: purchase.workspaceId,
        billingPurchaseId: purchase.id,
        kind: "top_up",
        stripeObjectId: invoiceId ?? stringValue(session.id),
        status: "paid",
        amountMinor: numberValue(session.amount_total),
        currency: stringValue(session.currency, "usd"),
        safeSummary: `${creditPackage.name} top-up paid through Stripe Checkout.`,
        occurredAt: fromUnix(session.created) ?? new Date(),
      })
      .onConflictDoNothing({ target: paymentRecord.stripeObjectId });

    return purchase.workspaceId;
  }

  return workspaceId;
}

async function reconcilePaidInvoice(tx: Transaction, invoice: StripeLike) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return null;

  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId);
  const { localSubscription, plan } = await upsertSubscriptionFromStripe(
    tx,
    stripeLike(subscription),
  );

  if (plan.monthlyIncludedCredits > 0) {
    await grantWorkspaceCredits(tx, {
      workspaceId: localSubscription.workspaceId,
      sourceKind: "monthly",
      sourceId: stringValue(invoice.id),
      operationKey: `stripe:invoice:${stringValue(invoice.id)}:monthly`,
      credits: plan.monthlyIncludedCredits,
      expiresAt: localSubscription.currentPeriodEnd,
      reason: `${plan.name} monthly included credits granted from paid invoice.`,
    });
  }

  await tx
    .insert(paymentRecord)
    .values({
      id: id(),
      workspaceId: localSubscription.workspaceId,
      workspaceSubscriptionId: localSubscription.id,
      kind: "subscription_invoice",
      stripeObjectId: stringValue(invoice.id),
      status: "paid",
      amountMinor: numberValue(invoice.amount_paid, numberValue(invoice.total)),
      currency: stringValue(invoice.currency, "usd"),
      safeSummary: `${plan.name} subscription invoice paid.`,
      occurredAt:
        fromUnix(asRecord(invoice.status_transitions)?.paid_at) ?? new Date(),
    })
    .onConflictDoNothing({ target: paymentRecord.stripeObjectId });

  return localSubscription.workspaceId;
}

async function reconcileFailedInvoice(tx: Transaction, invoice: StripeLike) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return null;

  const [subscription] = await tx
    .update(workspaceSubscription)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(eq(workspaceSubscription.stripeSubscriptionId, subscriptionId))
    .returning();

  if (!subscription) return null;

  await tx
    .insert(paymentRecord)
    .values({
      id: id(),
      workspaceId: subscription.workspaceId,
      workspaceSubscriptionId: subscription.id,
      kind: "subscription_invoice",
      stripeObjectId: stringValue(invoice.id),
      status: "payment_failed",
      amountMinor: numberValue(invoice.amount_due, numberValue(invoice.total)),
      currency: stringValue(invoice.currency, "usd"),
      safeSummary: "Stripe subscription invoice payment failed.",
      occurredAt: new Date(),
    })
    .onConflictDoNothing({ target: paymentRecord.stripeObjectId });

  return subscription.workspaceId;
}

async function applyStripeEvent(tx: Transaction, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return reconcileCheckoutSession(tx, stripeLike(event.data.object));
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const { localSubscription } = await upsertSubscriptionFromStripe(
        tx,
        stripeLike(event.data.object),
      );
      return localSubscription.workspaceId;
    }
    case "invoice.paid":
      return reconcilePaidInvoice(tx, stripeLike(event.data.object));
    case "invoice.payment_failed":
      return reconcileFailedInvoice(tx, stripeLike(event.data.object));
    default:
      return null;
  }
}

export async function processStripeWebhookEvent(inboxId: string) {
  const [inbox] = await db
    .select()
    .from(stripeWebhookEvent)
    .where(eq(stripeWebhookEvent.id, inboxId))
    .limit(1);

  if (!inbox || inbox.status === "processed") {
    return { processed: false };
  }

  const event = await getStripeClient().events.retrieve(inbox.stripeEventId);

  if (!PROCESSABLE_EVENT_TYPES.includes(event.type as (typeof PROCESSABLE_EVENT_TYPES)[number])) {
    await db
      .update(stripeWebhookEvent)
      .set({
        status: "processed",
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(stripeWebhookEvent.id, inbox.id));
    return { processed: true };
  }

  try {
    const workspaceId = await db.transaction(async (tx) => {
      await tx
        .update(stripeWebhookEvent)
        .set({
          status: "processing",
          attemptCount: sql`${stripeWebhookEvent.attemptCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(stripeWebhookEvent.id, inbox.id));

      const resolvedWorkspaceId = await applyStripeEvent(tx, event);

      await tx
        .update(stripeWebhookEvent)
        .set({
          workspaceId: resolvedWorkspaceId,
          status: "processed",
          processedAt: new Date(),
          safeErrorCode: null,
          safeErrorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(stripeWebhookEvent.id, inbox.id));

      return resolvedWorkspaceId;
    });

    return { processed: true, workspaceId };
  } catch (error) {
    const nextAttemptAt = new Date(Date.now() + 5 * 60 * 1000);
    const nextStatus = inbox.attemptCount >= 4 ? "dead_letter" : "retry_pending";
    const message =
      error instanceof Error ? error.message.slice(0, 500) : "Unknown Stripe event error.";

    await db
      .update(stripeWebhookEvent)
      .set({
        status: nextStatus,
        nextAttemptAt,
        safeErrorCode: "STRIPE_EVENT_PROCESSING_FAILED",
        safeErrorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(stripeWebhookEvent.id, inbox.id));

    throw error;
  }
}

export async function reconcileStripeCheckoutReturn(input: {
  workspaceId: string;
  sessionId: string;
}) {
  if (!input.sessionId.startsWith("cs_")) {
    return { reconciled: false };
  }

  const session = await getStripeClient().checkout.sessions.retrieve(
    input.sessionId,
  );
  const workspaceId =
    session.metadata?.workspaceId ?? session.client_reference_id ?? null;

  if (workspaceId !== input.workspaceId || session.status !== "complete") {
    return { reconciled: false };
  }

  const resolvedWorkspaceId = await db.transaction((tx) =>
    reconcileCheckoutSession(tx, stripeLike(session), {
      includePaidInvoice: true,
    }),
  );

  return { reconciled: true, workspaceId: resolvedWorkspaceId };
}

export async function processPendingStripeWebhookEvents(limit = 25) {
  const now = new Date();
  const events = await db
    .select({ id: stripeWebhookEvent.id })
    .from(stripeWebhookEvent)
    .where(
      and(
        inArray(stripeWebhookEvent.status, ["pending", "retry_pending"]),
        lte(stripeWebhookEvent.nextAttemptAt, now),
      ),
    )
    .limit(limit);

  let processed = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await processStripeWebhookEvent(event.id);
      processed += 1;
    } catch {
      failed += 1;
    }
  }

  return { processed, failed };
}
