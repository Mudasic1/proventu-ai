import "server-only";

import { eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { stripeWebhookEvent } from "@/lib/db/schema";

function id() {
  return crypto.randomUUID();
}

function getStripeObjectId(event: Stripe.Event) {
  const object = event.data.object as { id?: string };
  return object.id ?? event.id;
}

export async function insertStripeWebhookEvent(event: Stripe.Event) {
  const [inserted] = await db
    .insert(stripeWebhookEvent)
    .values({
      id: id(),
      stripeEventId: event.id,
      eventType: event.type,
      stripeObjectId: getStripeObjectId(event),
      status: "pending",
    })
    .onConflictDoNothing({
      target: stripeWebhookEvent.stripeEventId,
    })
    .returning();

  if (inserted) return inserted;

  const [existing] = await db
    .select()
    .from(stripeWebhookEvent)
    .where(eq(stripeWebhookEvent.stripeEventId, event.id))
    .limit(1);

  return existing;
}
