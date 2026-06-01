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
          <span className="block text-[#d8ff62]">clearer sales day.</span>
        </>
      }
      description="Create your secure account. Your first workspace is where leads, campaigns, and approvals will come together."
    >
      <AuthForm mode="sign-up" />
      <p className="mt-5 text-center text-xs leading-5 text-[#74857f]">
        By creating an account, you agree to the secure use of your workspace.{" "}
        <Link href="/" className="font-bold text-[#aebbb6] hover:text-[#d8ff62]">
          Return home
        </Link>
      </p>
    </AuthShell>
  );
}
