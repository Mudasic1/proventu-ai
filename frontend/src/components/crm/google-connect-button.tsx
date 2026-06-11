"use client";

import { useState } from "react";
import { CalendarDays, LoaderCircle, MailPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { GOOGLE_CRM_SCOPES } from "@/lib/google/scopes";

export function GoogleConnectButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    setIsPending(true);
    const result = await authClient.linkSocial({
      provider: "google",
      scopes: [...GOOGLE_CRM_SCOPES],
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
            Connect Google to schedule meetings in Calendar and send approved
            CRM emails through Gmail.
          </p>
        </div>
        <div className="flex gap-1.5 text-[#d8ff62]">
          <CalendarDays className="size-4" />
          <MailPlus className="size-4" />
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
        Connect Google Calendar and Gmail
      </Button>
    </div>
  );
}
