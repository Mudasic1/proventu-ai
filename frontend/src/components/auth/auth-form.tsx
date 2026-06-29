"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const result = isSignUp
      ? await authClient.signUp.email({
          email,
          name: String(formData.get("name")),
          password,
        })
      : await authClient.signIn.email({
          email,
          password,
        });

    if (result.error) {
      setError(result.error.message ?? "Unable to continue. Please try again.");
      setIsPending(false);
      return;
    }

    router.push(isSignUp ? "/signin?created=1" : "/dashboard");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {isSignUp ? (
        <div className="grid gap-2">
          <Label htmlFor="name" className="tracking-wide">Your name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Jordan Lee"
            required
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email" className="tracking-wide">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="tracking-wide">Password</Label>
          {!isSignUp ? (
            <Link
              href="/forgot-password"
              className="text-xs font-bold tracking-wide text-red-500 transition hover:text-red-400"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={12}
          placeholder={isSignUp ? "At least 12 characters" : "Enter your password"}
          required
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-11 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 font-bold text-white shadow-[0_10px_34px_rgba(255,92,92,0.25)] hover:from-red-400 hover:to-rose-400"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ArrowRight data-icon="inline-end" className="size-4" />
        )}
        {isPending
          ? "Working..."
          : isSignUp
            ? "Create workspace access"
            : "Open your workspace"}
      </Button>

      <p className="text-center text-sm tracking-wide text-gray-500">
        {isSignUp ? "Already have access?" : "New to Proventu AI?"}{" "}
        <Link
          href={isSignUp ? "/signin" : "/signup"}
          className="font-bold tracking-wide text-red-500 transition hover:text-red-400"
        >
          {isSignUp ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
