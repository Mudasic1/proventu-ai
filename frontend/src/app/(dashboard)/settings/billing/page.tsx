import { CreditCard } from "lucide-react";

import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/shared/module-ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { requirePermission } from "@/lib/permissions/rbac";
import { getBillingSummary } from "@/server/queries/workspace-modules";

export default async function BillingPage() {
  const context = await requirePermission("billing:read");
  const billing = await getBillingSummary(context.workspaceId);
  return <div className="grid gap-5"><PageHeader kicker="Billing" title="Keep subscription status visible to workspace admins." description="The billing record foundation is ready for a payment-provider integration. Checkout and webhook handling are not connected yet." />
    <Panel>{billing ? <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="section-kicker">Current subscription</p><h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.08em]">{billing.planName}</h2><p className="mt-2 text-sm text-[#9eaea8]">{formatCurrency(billing.priceCents)} / {billing.interval}</p>{billing.renewsAt ? <p className="mt-1 text-xs text-[#71817b]">Renews {formatDate(billing.renewsAt)}</p> : null}</div><div className="flex items-center gap-3"><CreditCard className="size-5 text-[#d8ff62]" /><StatusBadge value={billing.status} /></div></div> : <EmptyState title="No subscription record" description="Create billing plans and connect checkout when payment-provider integration is scheduled." />}</Panel>
  </div>;
}
