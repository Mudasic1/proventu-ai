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
        <Label htmlFor="password" className="tracking-wide">New password</Label>
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
        <Label htmlFor="confirmation" className="tracking-wide">Confirm password</Label>
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
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 font-bold text-white shadow-[0_10px_34px_rgba(255,92,92,0.25)] hover:from-red-400 hover:to-rose-400"
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
        className="flex items-center justify-center gap-2 text-sm font-bold tracking-wide text-gray-500 transition hover:text-red-500"
      >
        <ArrowLeft className="size-4" />
        Request a new link
      </Link>
    </form>
  );
}
