import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import {
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_GMAIL_SEND_SCOPE,
  isGoogleOAuthConfigured,
} from "@/lib/google/workspace";

export type GoogleIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  hasCalendarScope: boolean;
  hasGmailScope: boolean;
};

export async function getGoogleIntegrationStatus(
  userId: string,
): Promise<GoogleIntegrationStatus> {
  const configured = isGoogleOAuthConfigured();
  if (!configured) {
    return {
      configured,
      connected: false,
      hasCalendarScope: false,
      hasGmailScope: false,
    };
  }

  const [record] = await db
    .select({ scope: account.scope })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
    .limit(1);

  const scopes = new Set((record?.scope ?? "").split(/\s+/).filter(Boolean));

  return {
    configured,
    connected: Boolean(record),
    hasCalendarScope: scopes.has(GOOGLE_CALENDAR_SCOPE),
    hasGmailScope: scopes.has(GOOGLE_GMAIL_SEND_SCOPE),
  };
}
