"use client";

import { CreditCard, ExternalLink, Loader2, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency, formatDate } from "@/lib/format";

type Plan = {
  id: string;
  code: string;
  name: string;
  priceCents: number;
  interval: string;
  description: string;
  features: string[];
  monthlyIncludedCredits: number;
};

type TopUp = {
  id: string;
  code: string;
  name: string;
  description: string;
  priceCents: number;
  grantedCredits: number;
};

type Subscription = {
  status: string;
  renewsAt: Date | string | null;
  currentPeriodEnd: Date | string | null;
  cancelAtPeriodEnd: boolean;
  planName: string;
  planCode: string;
  priceCents: number;
  interval: string;
  features: string[];
  monthlyIncludedCredits: number;
} | undefined;

type Wallet = {
  spendableCredits: number;
  reservedCredits: number;
  unresolvedCredits: number;
  spendingBlocked: boolean;
} | undefined;

type Payment = {
  id: string;
  kind: string;
  status: string;
  amountMinor: number;
  currency: string;
  safeSummary: string;
  occurredAt: Date | string;
};

type LedgerEntry = {
  id: string;
  entryType: string;
  spendableDelta: number;
  reservedDelta: number;
  unresolvedDelta: number;
  reason: string;
  createdAt: Date | string;
};

type Props = {
  isOwner: boolean;
  stripeConfigured: boolean;
  plans: Plan[];
  topUps: TopUp[];
  subscription: Subscription;
  wallet: Wallet;
  payments: Payment[];
  ledger: LedgerEntry[];
};

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

async function postBillingAction(endpoint: string, body?: unknown) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as {
    checkoutUrl?: string;
    portalUrl?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Billing action failed.");
  }

  const url = payload.checkoutUrl ?? payload.portalUrl;
  if (!url) {
    throw new Error("Billing action did not return a redirect URL.");
  }

  window.location.assign(url);
}

async function openPaymentInvoice(paymentId: string) {
  const response = await fetch(`/api/billing/invoice/${paymentId}`);
  const payload = (await response.json()) as {
    invoiceUrl?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Invoice is not available yet.");
  }

  if (!payload.invoiceUrl) {
    throw new Error("Invoice is not available yet.");
  }

  window.location.assign(payload.invoiceUrl);
}

export function BillingSettings({
  isOwner,
  stripeConfigured,
  plans,
  topUps,
  subscription,
  wallet,
  payments,
  ledger,
}: Props) {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasActiveSubscription = subscription?.status === "active";
  const currentPlanCode = subscription?.planCode;
  const hasPlanCatalog = plans.length > 0;
  const hasTopUpCatalog = topUps.length > 0;
  const visiblePlans = subscription
    ? plans.filter((plan) => plan.code === currentPlanCode)
    : plans;

  const walletTotals = useMemo(
    () => ({
      spendable: wallet?.spendableCredits ?? 0,
      reserved: wallet?.reservedCredits ?? 0,
      unresolved: wallet?.unresolvedCredits ?? 0,
    }),
    [wallet],
  );

  async function runAction(actionId: string, callback: () => Promise<void>) {
    setBusyAction(actionId);
    setError(null);
    try {
      await callback();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Billing action failed.");
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-5">
      {error ? (
        <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {(!stripeConfigured || !hasPlanCatalog) && isOwner ? (
        <section className="rounded-[22px] border border-amber-300/20 bg-amber-300/10 p-5">
          <p className="section-kicker text-amber-100">Billing setup</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.08em] text-amber-50">
            {!stripeConfigured ? "Stripe configuration is incomplete" : "Plan catalog is empty"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-100/80">
            {!stripeConfigured
              ? "Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to .env.local, then restart the app."
              : "Run the catalog sync after migrations so subscription plans and top-up packages are mapped to Stripe Prices."}
          </p>
          <code className="mt-4 block w-fit rounded-xl bg-[#0b1916] px-3 py-2 text-xs text-[#f4f2ea]">
            npm run billing:sync-catalog
          </code>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="section-kicker">Current plan</p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.08em]">
                {subscription?.planName ?? "No paid plan"}
              </h2>
              <p className="mt-2 text-sm text-[#9eaea8]">
                {subscription
                  ? `${formatCurrency(subscription.priceCents)} / ${subscription.interval}`
                  : "Choose a plan to activate monthly AI credits."}
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#d8ff62]/20 bg-[#d8ff62]/8 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d8ff62]">
              {subscription ? statusLabel(subscription.status) : "not subscribed"}
            </span>
          </div>

          {subscription ? (
            <div className="mt-6 grid gap-3 text-sm text-[#9eaea8] sm:grid-cols-3">
              <div className="rounded-2xl bg-[#0b1916]/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
                  Included credits
                </p>
                <p className="mt-2 text-2xl font-bold text-[#f4f2ea]">
                  {subscription.monthlyIncludedCredits.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-[#0b1916]/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
                  Period end
                </p>
                <p className="mt-2 font-semibold text-[#f4f2ea]">
                  {formatDate(subscription.currentPeriodEnd ?? subscription.renewsAt)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#0b1916]/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
                  Renewal
                </p>
                <p className="mt-2 font-semibold text-[#f4f2ea]">
                  {subscription.cancelAtPeriodEnd ? "Cancels at period end" : "Auto-renews"}
                </p>
              </div>
            </div>
          ) : null}

          {isOwner && subscription ? (
            <button
              type="button"
              disabled={!stripeConfigured || busyAction === "portal"}
              onClick={() =>
                runAction("portal", () => postBillingAction("/api/billing/portal"))
              }
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#d8ff62] px-4 text-xs font-extrabold uppercase tracking-[0.12em] text-[#10211c] transition hover:bg-[#e5ff92] disabled:cursor-wait disabled:opacity-70"
            >
              {busyAction === "portal" ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
              Manage in Stripe
            </button>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
          <WalletCards className="size-5 text-[#d8ff62]" />
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
            Credit wallet
          </p>
          <p className="mt-2 font-display text-5xl font-bold tracking-[-0.09em]">
            {walletTotals.spendable.toLocaleString()}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[#0b1916]/80 p-3">
              <p className="text-[#71817b]">Reserved</p>
              <p className="font-semibold">{walletTotals.reserved.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-[#0b1916]/80 p-3">
              <p className="text-[#71817b]">Unresolved</p>
              <p className="font-semibold">{walletTotals.unresolved.toLocaleString()}</p>
            </div>
          </div>
          {wallet?.spendingBlocked ? (
            <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
              Spending is paused until unresolved credits are reviewed.
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {hasPlanCatalog && visiblePlans.length > 0 ? visiblePlans.map((plan) => {
          const actionId = `plan:${plan.id}`;
          const isCurrent = currentPlanCode === plan.code;
          return (
            <article
              key={plan.id}
              className="rounded-[22px] border border-white/[0.08] bg-[#0b1916] p-5"
            >
              <CreditCard className="size-5 text-[#d8ff62]" />
              <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.08em]">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-[#9eaea8]">
                {formatCurrency(plan.priceCents)} / {plan.interval}
              </p>
              <p className="mt-4 min-h-12 text-sm leading-6 text-[#82928c]">
                {plan.description}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#f4f2ea]">
                {plan.monthlyIncludedCredits.toLocaleString()} monthly credits
              </p>
              {plan.features.length > 0 ? (
                <ul className="mt-4 grid gap-2 text-xs text-[#9eaea8]">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
              {isOwner ? (
                <>
                  <button
                    type="button"
                    disabled={!stripeConfigured || isCurrent || busyAction === actionId}
                    onClick={() =>
                      runAction(actionId, () =>
                        postBillingAction("/api/billing/checkout/subscription", {
                          planId: plan.id,
                          idempotencyKey: `subscription:${plan.id}:${crypto.randomUUID()}`,
                        }),
                      )
                    }
                    className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d8ff62]/25 px-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#d8ff62] transition hover:bg-[#d8ff62]/10 disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:text-[#71817b]"
                  >
                    {busyAction === actionId ? <Loader2 className="size-4 animate-spin" /> : null}
                    {!stripeConfigured
                      ? "Stripe not ready"
                      : isCurrent
                        ? "Current plan"
                        : "Start checkout"}
                  </button>
                  {isCurrent ? (
                    <p className="mt-3 text-xs leading-5 text-[#71817b]">
                      Use Manage in Stripe above for payment method, invoice, cancellation,
                      or plan changes.
                    </p>
                  ) : null}
                </>
              ) : null}
            </article>
          );
        }) : (
          <div className="rounded-[22px] border border-dashed border-white/[0.1] bg-[#0b1916] p-5 text-sm text-[#82928c] lg:col-span-3">
            No active subscription plans are available yet.
          </div>
        )}
      </section>

      <section className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker">Top-ups</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.08em]">
              Add non-expiring credits
            </h2>
          </div>
          {!hasActiveSubscription ? (
            <p className="text-xs text-[#82928c]">Top-ups unlock after a paid plan is active.</p>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {hasTopUpCatalog ? topUps.map((topUp) => {
            const actionId = `top-up:${topUp.id}`;
            return (
              <div key={topUp.id} className="rounded-2xl bg-[#0b1916] p-4">
                <p className="font-semibold">{topUp.name}</p>
                <p className="mt-1 text-sm text-[#9eaea8]">
                  {topUp.grantedCredits.toLocaleString()} credits for{" "}
                  {formatCurrency(topUp.priceCents)}
                </p>
                <p className="mt-3 min-h-10 text-xs leading-5 text-[#71817b]">
                  {topUp.description}
                </p>
                {isOwner ? (
                  <button
                    type="button"
                    disabled={!stripeConfigured || !hasActiveSubscription || busyAction === actionId}
                    onClick={() =>
                      runAction(actionId, () =>
                        postBillingAction("/api/billing/checkout/top-up", {
                          packageId: topUp.id,
                          idempotencyKey: `top-up:${topUp.id}:${crypto.randomUUID()}`,
                        }),
                      )
                    }
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-bold uppercase tracking-[0.1em] text-[#f4f2ea] transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:text-[#71817b]"
                  >
                    {busyAction === actionId ? <Loader2 className="size-4 animate-spin" /> : null}
                    {stripeConfigured ? "Buy top-up" : "Stripe not ready"}
                  </button>
                ) : null}
              </div>
            );
          }) : (
            <p className="rounded-2xl border border-dashed border-white/[0.1] p-5 text-sm text-[#82928c] md:col-span-3">
              No active top-up packages are available yet.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="section-kicker">Payment history</p>
          <div className="mt-4 grid gap-3">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl bg-[#0b1916] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{payment.safeSummary}</p>
                      <p className="mt-1 text-xs text-[#71817b]">
                        {statusLabel(payment.kind)} - {formatDate(payment.occurredAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(payment.amountMinor)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busyAction === `invoice:${payment.id}`}
                    onClick={() =>
                      runAction(`invoice:${payment.id}`, () =>
                        openPaymentInvoice(payment.id),
                      )
                    }
                    className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#d8ff62] transition hover:bg-[#d8ff62]/10 disabled:cursor-wait disabled:text-[#71817b]"
                  >
                    {busyAction === `invoice:${payment.id}` ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="size-3.5" />
                    )}
                    Open invoice
                  </button>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/[0.1] p-5 text-sm text-[#82928c]">
                No reconciled Stripe payments yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="section-kicker">Credit ledger</p>
          <div className="mt-4 grid gap-3">
            {ledger.length > 0 ? (
              ledger.map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-[#0b1916] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{entry.reason}</p>
                      <p className="mt-1 text-xs text-[#71817b]">
                        {statusLabel(entry.entryType)} - {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {entry.spendableDelta > 0 ? "+" : ""}
                      {entry.spendableDelta.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/[0.1] p-5 text-sm text-[#82928c]">
                Credit activity appears here after invoices or top-ups are processed.
              </p>
            )}
          </div>
        </div>
      </section>

      {!isOwner ? (
        <p className="text-sm text-[#82928c]">
          Billing actions are owner-only. You can still view plan, wallet, payment,
          and credit activity for this workspace.
        </p>
      ) : null}
    </div>
  );
}
