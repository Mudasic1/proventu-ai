import { NextResponse } from "next/server";

import { requireBillingOwner } from "@/lib/permissions/billing";
import { topUpCheckoutSchema } from "@/lib/validations/billing";
import { createTopUpCheckout } from "@/server/services/billing-checkout";

import { billingApiError } from "../../_errors";

export async function POST(request: Request) {
  try {
    const context = await requireBillingOwner();
    const input = topUpCheckoutSchema.parse(await request.json());
    const result = await createTopUpCheckout({
      workspaceId: context.workspaceId,
      userId: context.session.user.id,
      packageId: input.packageId,
      idempotencyKey: input.idempotencyKey ?? `top-up:${crypto.randomUUID()}`,
    });

    return NextResponse.json(result);
  } catch (error) {
    return billingApiError(error);
  }
}
