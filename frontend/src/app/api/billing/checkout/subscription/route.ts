import { NextResponse } from "next/server";

import { requireBillingOwner } from "@/lib/permissions/billing";
import { subscriptionCheckoutSchema } from "@/lib/validations/billing";
import { createSubscriptionCheckout } from "@/server/services/billing-checkout";

import { billingApiError } from "../../_errors";

export async function POST(request: Request) {
  try {
    const context = await requireBillingOwner();
    const input = subscriptionCheckoutSchema.parse(await request.json());
    const result = await createSubscriptionCheckout({
      workspaceId: context.workspaceId,
      userId: context.session.user.id,
      planId: input.planId,
      idempotencyKey:
        input.idempotencyKey ?? `subscription:${crypto.randomUUID()}`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return billingApiError(error);
  }
}
