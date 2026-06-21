import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/auth-session";

export default async function SignUpPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title={
        <>
          Start with a
          <span className="block text-red-500">clearer sales day.</span>
        </>
      }
      description="Create your secure account. Your first workspace is where leads, campaigns, and approvals will come together."
    >
      <AuthForm mode="sign-up" />
      <p className="mt-5 text-center text-xs leading-5 text-gray-400">
        By creating an account, you agree to the secure use of your workspace.{" "}
        <Link href="/" className="font-bold text-gray-500 hover:text-red-500">
          Return home
        </Link>
      </p>
    </AuthShell>
  );
}
