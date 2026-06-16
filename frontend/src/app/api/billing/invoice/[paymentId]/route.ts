import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/billing/stripe-client";
import { db } from "@/lib/db";
import { paymentRecord } from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";
import { requirePermission } from "@/lib/permissions/rbac";
import { and, eq } from "drizzle-orm";

import { billingApiError } from "../../_errors";

type InvoiceRouteContext = {
  params: Promise<{ paymentId: string }>;
};

async function getInvoiceId(stripeObjectId: string) {
  if (stripeObjectId.startsWith("in_")) {
    return stripeObjectId;
  }

  if (stripeObjectId.startsWith("cs_")) {
    const session = await getStripeClient().checkout.sessions.retrieve(
      stripeObjectId,
    );
    const invoice = session.invoice;
    if (typeof invoice === "string") return invoice;
    if (invoice && typeof invoice === "object") return invoice.id;
  }

  return null;
}

export async function GET(_request: Request, context: InvoiceRouteContext) {
  try {
    const [{ paymentId }, workspace] = await Promise.all([
      context.params,
      requirePermission("billing:read"),
    ]);

    const [payment] = await db
      .select({
        stripeObjectId: paymentRecord.stripeObjectId,
      })
      .from(paymentRecord)
      .where(
        and(
          eq(paymentRecord.id, paymentId),
          eq(paymentRecord.workspaceId, workspace.workspaceId),
        ),
      )
      .limit(1);

    if (!payment) {
      throw new AppError("NOT_FOUND", "Payment record was not found.");
    }

    const invoiceId = await getInvoiceId(payment.stripeObjectId);
    if (!invoiceId) {
      throw new AppError("NOT_FOUND", "No Stripe invoice is available for this payment.");
    }

    const invoice = await getStripeClient().invoices.retrieve(invoiceId);
    const invoiceUrl = invoice.hosted_invoice_url ?? invoice.invoice_pdf;

    if (!invoiceUrl) {
      throw new AppError("NOT_FOUND", "Stripe has not published this invoice yet.");
    }

    return NextResponse.json({ invoiceUrl });
  } catch (error) {
    return billingApiError(error);
  }
}
