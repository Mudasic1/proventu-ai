import "server-only";

import { and, desc, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  billingPlan,
  creditLedgerEntry,
  creditWallet,
  paymentRecord,
  topUpPackage,
  workspaceSubscription,
} from "@/lib/db/schema";

function isCurrentlyAvailable<T extends { effectiveFrom: Date; effectiveTo: Date | null }>(
  item: T,
) {
  const now = Date.now();
  return item.effectiveFrom.getTime() <= now && (!item.effectiveTo || item.effectiveTo.getTime() > now);
}

export async function getBillingDashboard(workspaceId: string) {
  const now = new Date();

  const [plans, topUps, [subscription], [wallet], payments, ledger] =
    await Promise.all([
      db
        .select()
        .from(billingPlan)
        .where(
          and(
            eq(billingPlan.isActive, true),
            or(isNull(billingPlan.effectiveTo), gt(billingPlan.effectiveTo, now)),
          ),
        ),
      db
        .select()
        .from(topUpPackage)
        .where(
          and(
            eq(topUpPackage.isActive, true),
            or(isNull(topUpPackage.effectiveTo), gt(topUpPackage.effectiveTo, now)),
          ),
        ),
      db
        .select({
          id: workspaceSubscription.id,
          status: workspaceSubscription.status,
          renewsAt: workspaceSubscription.renewsAt,
          currentPeriodEnd: workspaceSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: workspaceSubscription.cancelAtPeriodEnd,
          planName: billingPlan.name,
          planCode: billingPlan.code,
          priceCents: billingPlan.priceCents,
          interval: billingPlan.interval,
          features: billingPlan.features,
          monthlyIncludedCredits: billingPlan.monthlyIncludedCredits,
        })
        .from(workspaceSubscription)
        .innerJoin(billingPlan, eq(workspaceSubscription.billingPlanId, billingPlan.id))
        .where(eq(workspaceSubscription.workspaceId, workspaceId))
        .limit(1),
      db
        .select()
        .from(creditWallet)
        .where(eq(creditWallet.workspaceId, workspaceId))
        .limit(1),
      db
        .select()
        .from(paymentRecord)
        .where(eq(paymentRecord.workspaceId, workspaceId))
        .orderBy(desc(paymentRecord.occurredAt))
        .limit(10),
      db
        .select()
        .from(creditLedgerEntry)
        .where(eq(creditLedgerEntry.workspaceId, workspaceId))
        .orderBy(desc(creditLedgerEntry.createdAt))
        .limit(10),
    ]);

  return {
    plans: plans.filter(isCurrentlyAvailable),
    topUps: topUps.filter(isCurrentlyAvailable),
    subscription,
    wallet,
    payments,
    ledger,
  };
}
