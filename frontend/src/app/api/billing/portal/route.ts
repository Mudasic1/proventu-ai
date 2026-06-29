import { NextResponse } from "next/server";

import { requireBillingOwner } from "@/lib/permissions/billing";
import { createBillingPortalSession } from "@/server/services/billing-checkout";

import { billingApiError } from "../_errors";

export async function POST() {
  try {
    const context = await requireBillingOwner();
    const result = await createBillingPortalSession({
      workspaceId: context.workspaceId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return billingApiError(error);
  }
}
