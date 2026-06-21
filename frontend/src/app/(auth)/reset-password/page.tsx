import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { AuthShell } from "@/components/auth/auth-shell";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell
      eyebrow="Choose password"
      title={
        <>
          Refresh your
          <span className="block text-red-500">workspace key.</span>
        </>
      }
      description="Choose a new password with at least 12 characters. Existing sessions will be revoked after the change."
    >
      <PasswordResetForm token={token} />
    </AuthShell>
  );
}
