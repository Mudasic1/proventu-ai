import "server-only";

import Stripe from "stripe";

import { serverEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors/app-error";

let stripe: Stripe | null = null;

export function getStripeClient() {
  if (!serverEnv.STRIPE_SECRET_KEY) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Stripe billing is not configured for this environment.",
    );
  }

  stripe ??= new Stripe(serverEnv.STRIPE_SECRET_KEY, {
    appInfo: {
      name: "Proventu AI",
    },
  });

  return stripe;
}

export function isStripeBillingConfigured() {
  return Boolean(serverEnv.STRIPE_SECRET_KEY && serverEnv.STRIPE_WEBHOOK_SECRET);
}

export function getStripeWebhookSecret() {
  if (!serverEnv.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Stripe webhook verification is not configured for this environment.",
    );
  }

  return serverEnv.STRIPE_WEBHOOK_SECRET;
}

export function getBillingBaseUrl() {
  return serverEnv.BETTER_AUTH_URL.replace(/\/$/, "");
}
