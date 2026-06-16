"use client";

import { useState } from "react";
import { CalendarDays, LoaderCircle, MailPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { GOOGLE_CALENDAR_SCOPE, GOOGLE_CRM_SCOPES } from "@/lib/google/scopes";

type GoogleConnectButtonProps = {
  capability?: "calendar" | "crm";
  callbackURL?: string;
};

const configuredAuthOrigin = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export function GoogleConnectButton({
  capability = "crm",
  callbackURL,
}: GoogleConnectButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCalendarOnly = capability === "calendar";

  async function connect() {
    setError(null);
    if (
      configuredAuthOrigin &&
      window.location.origin !== configuredAuthOrigin
    ) {
      window.location.href = `${configuredAuthOrigin}${window.location.pathname}${window.location.search}`;
      return;
    }

    setIsPending(true);
    const resolvedCallbackURL = callbackURL?.startsWith("http")
      ? callbackURL
      : `${window.location.origin}${callbackURL ?? window.location.pathname}`;
    const result = await authClient.linkSocial({
      provider: "google",
      scopes: isCalendarOnly ? [GOOGLE_CALENDAR_SCOPE] : [...GOOGLE_CRM_SCOPES],
      callbackURL: resolvedCallbackURL,
      errorCallbackURL: resolvedCallbackURL,
      requestSignUp: false,
    });

    if (result.error) {
      setError(result.error.message ?? "Google connection could not start.");
      setIsPending(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-[#d8ff62]/15 bg-[#d8ff62]/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
            Google workspace
          </p>
          <p className="mt-2 text-sm leading-6 text-[#aebbb6]">
            {isCalendarOnly
              ? "Connect Google Calendar to schedule meetings and email attendee invites from Calendar."
              : "Connect Google to schedule meetings in Calendar and send approved CRM emails through Gmail."}
          </p>
        </div>
        <div className="flex gap-1.5 text-[#d8ff62]">
          <CalendarDays className="size-4" />
          {isCalendarOnly ? null : <MailPlus className="size-4" />}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-300/20 bg-red-300/8 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={connect}
        disabled={isPending}
        className="rounded-full bg-[#d8ff62] font-bold text-[#10211c] hover:bg-[#e5ff92]"
      >
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isCalendarOnly ? "Connect Google Calendar" : "Connect Google Calendar and Gmail"}
      </Button>
    </div>
  );
}
