import { PasswordRequestForm } from "@/components/auth/password-request-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title={
        <>
          Find your way
          <span className="block text-[#d8ff62]">back in.</span>
        </>
      }
      description="Enter your account email. If it matches an account, we will send a time-limited link to choose a new password."
    >
      <PasswordRequestForm />
    </AuthShell>
  );
}
