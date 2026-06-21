import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/auth-session";

type SignInPageProps = {
  searchParams: Promise<{ created?: string; reset?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getCurrentSession();
  const params = await searchParams;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Pick up the
          <span className="block text-red-500">revenue thread.</span>
        </>
      }
      description="Log in to review your priorities, drafts, and the next customer moves worth making."
    >
      {params.created === "1" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-gray-700">
          Account created. Log in to open your workspace.
        </p>
      ) : null}
      {params.reset === "1" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-gray-700">
          Password updated. Log in with your new password.
        </p>
      ) : null}
      <AuthForm mode="sign-in" />
      <p className="mt-5 text-center text-xs leading-5 text-gray-400">
        By continuing, you agree to keep your account secure.{" "}
        <Link href="/" className="font-bold text-gray-500 hover:text-red-500">
          Return home
        </Link>
      </p>
    </AuthShell>
  );
}
