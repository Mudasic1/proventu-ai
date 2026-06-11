import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors/app-error";
export {
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_CRM_SCOPES,
  GOOGLE_GMAIL_SEND_SCOPE,
} from "@/lib/google/scopes";

type GoogleAccess = {
  accessToken: string;
  scopes: string[];
};

export function isGoogleOAuthConfigured() {
  return Boolean(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET);
}

export async function getGoogleAccessForUser(
  userId: string,
  requiredScopes: readonly string[],
): Promise<GoogleAccess> {
  if (!isGoogleOAuthConfigured()) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Google CRM integration is not configured for this environment.",
    );
  }

  const token = await auth.api.getAccessToken({
    body: { providerId: "google", userId },
    headers: await headers(),
  });
  const scopes = token.scopes ?? [];
  const missingScopes = requiredScopes.filter((scope) => !scopes.includes(scope));

  if (missingScopes.length) {
    throw new AppError(
      "FORBIDDEN",
      "Reconnect Google and approve Calendar and Gmail CRM permissions.",
    );
  }

  return {
    accessToken: token.accessToken,
    scopes,
  };
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function assertGoogleResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new AppError("INTERNAL_ERROR", fallbackMessage);
  }
}

export async function createGoogleCalendarEvent(input: {
  accessToken: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendeeEmail?: string;
}) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description,
        start: { dateTime: input.start.toISOString() },
        end: { dateTime: input.end.toISOString() },
        attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : [],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  assertGoogleResponse(response, "Google Calendar could not create the meeting.");
  const data = (await response.json()) as { id?: string; htmlLink?: string };
  return { id: data.id, link: data.htmlLink };
}

export async function sendGmailMessage(input: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
}) {
  const message = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body,
  ].join("\r\n");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodeBase64Url(message) }),
    },
  );
  assertGoogleResponse(response, "Gmail could not send the email.");
  const data = (await response.json()) as { id?: string; threadId?: string };
  return { id: data.id, threadId: data.threadId };
}
