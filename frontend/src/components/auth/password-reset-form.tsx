"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type PasswordResetFormProps = {
  token?: string;
};

export function PasswordResetForm({ token }: PasswordResetFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing a token. Request a new link.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmation = String(formData.get("confirmation"));

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsPending(true);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError(result.error.message ?? "Unable to reset your password.");
      setIsPending(false);
      return;
    }

    router.push("/signin?reset=1");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          placeholder="At least 12 characters"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmation">Confirm password</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          placeholder="Repeat your new password"
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
        {isPending ? "Updating..." : "Set new password"}
      </Button>

      <Link
        href="/forgot-password"
        className="flex items-center justify-center gap-2 text-sm font-bold text-[#b8c5c0] transition hover:text-[#d8ff62]"
      >
        <ArrowLeft className="size-4" />
        Request a new link
      </Link>
    </form>
  );
}
