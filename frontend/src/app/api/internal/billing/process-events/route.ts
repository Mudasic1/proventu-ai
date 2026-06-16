import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env/server";
import { processPendingStripeWebhookEvents } from "@/server/services/stripe-event-processor";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const expected = serverEnv.INTERNAL_CRON_SECRET
    ? `Bearer ${serverEnv.INTERNAL_CRON_SECRET}`
    : null;

  if (!expected || authorization !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await processPendingStripeWebhookEvents();
  return NextResponse.json(result);
}
