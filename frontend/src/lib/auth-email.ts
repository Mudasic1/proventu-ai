import "server-only";

import { serverEnv } from "@/lib/env/server";

type AuthEmail = {
  kind: "password-reset";
  subject: string;
  text: string;
  to: string;
  url: string;
};

export async function sendAuthEmail(email: AuthEmail) {
  const { AUTH_EMAIL_WEBHOOK_SECRET, AUTH_EMAIL_WEBHOOK_URL } = serverEnv;

  if (!AUTH_EMAIL_WEBHOOK_URL || !AUTH_EMAIL_WEBHOOK_SECRET) {
    if (serverEnv.NODE_ENV !== "production") {
      console.info(`[auth-email:${email.kind}]`, {
        to: email.to,
        url: email.url,
      });
      return;
    }

    throw new Error("Auth email transport is not configured.");
  }

  const response = await fetch(AUTH_EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${AUTH_EMAIL_WEBHOOK_SECRET}`,
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    throw new Error(`Auth email delivery failed with status ${response.status}.`);
  }
}
