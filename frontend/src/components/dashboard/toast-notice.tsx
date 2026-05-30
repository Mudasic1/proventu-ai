"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const messages: Record<string, string> = {
  "workspace-created": "Workspace ready. Your revenue dashboard is live.",
  "contact-created": "Contact added.",
  "contact-removed": "Contact removed.",
  "deal-created": "Deal added to the pipeline.",
  "task-created": "Follow-up task created.",
};

export function ToastNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const messageKey = params.get("toast");

  useEffect(() => {
    if (!messageKey || !messages[messageKey]) return;
    toast.success(messages[messageKey]);
    const next = new URLSearchParams(params.toString());
    next.delete("toast");
    router.replace(next.size ? `?${next}` : "?");
  }, [messageKey, params, router]);

  return null;
}
