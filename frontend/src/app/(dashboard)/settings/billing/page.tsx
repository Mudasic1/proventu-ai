import { BillingSettings } from "@/components/billing/billing-settings";
import { isStripeBillingConfigured } from "@/lib/billing/stripe-client";
import { PageHeader } from "@/components/shared/module-ui";
import { requirePermission } from "@/lib/permissions/rbac";
import { getBillingDashboard } from "@/server/queries/billing";
import { reconcileStripeCheckoutReturn } from "@/server/services/stripe-event-processor";

type BillingPageProps = {
  searchParams: Promise<{
    checkout?: string;
    top_up?: string;
    session_id?: string;
  }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const context = await requirePermission("billing:read");
  const params = await searchParams;

  if (
    params.session_id &&
    (params.checkout === "success" || params.top_up === "success")
  ) {
    try {
      await reconcileStripeCheckoutReturn({
        workspaceId: context.workspaceId,
        sessionId: params.session_id,
      });
    } catch (error) {
      console.error("Stripe checkout return reconciliation failed", error);
    }
  }

  const billing = await getBillingDashboard(context.workspaceId);

  return (
    <div className="grid gap-5">
      <PageHeader
        kicker="Billing"
        title="Manage subscription credits and Stripe billing."
        description="Hosted Checkout, billing portal access, payment history, and credit grants are reconciled from verified Stripe events."
      />
      <BillingSettings
        isOwner={context.role === "owner"}
        stripeConfigured={isStripeBillingConfigured()}
        plans={billing.plans}
        topUps={billing.topUps}
        subscription={billing.subscription}
        wallet={billing.wallet}
        payments={billing.payments}
        ledger={billing.ledger}
      />
    </div>
  );
}
