import { NextResponse } from "next/server";

import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/lib/billing/stripe-client";
import { insertStripeWebhookEvent } from "@/server/services/stripe-webhook-inbox";
import { processStripeWebhookEvent } from "@/server/services/stripe-event-processor";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();

  try {
    const event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
    const inbox = await insertStripeWebhookEvent(event);

    if (inbox?.status !== "processed") {
      await processStripeWebhookEvent(inbox.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook rejected", error);
    return NextResponse.json({ error: "Invalid Stripe webhook." }, { status: 400 });
  }
}
