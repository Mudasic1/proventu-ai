"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function PasswordRequestForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await authClient.requestPasswordReset({
      email: String(formData.get("email")),
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? "Unable to request a reset link.");
      return;
    }

    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="grid gap-4">
        <p className="rounded-xl border border-[#d8ff62]/18 bg-[#d8ff62]/7 px-3 py-3 text-sm leading-6 text-[#d7e2de]">
          If that address belongs to an account, a reset link is on its way.
          Check your inbox and follow the link within 30 minutes.
        </p>
        <Link
          href="/signin"
          className="flex items-center justify-center gap-2 text-sm font-bold text-[#d8ff62] transition hover:text-[#e5ff92]"
        >
          <ArrowLeft className="size-4" />
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">Account email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-300/20 bg-red-300/8 px-3 py-2.5 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowRight data-icon="inline-end" className="size-4" />
        )}
        {isPending ? "Preparing link..." : "Send reset link"}
      </Button>

      <Link
        href="/signin"
        className="flex items-center justify-center gap-2 text-sm font-bold text-[#b8c5c0] transition hover:text-[#d8ff62]"
      >
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
    </form>
  );
}
