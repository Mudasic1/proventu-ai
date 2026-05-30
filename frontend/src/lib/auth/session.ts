import "server-only";

import { AppError } from "@/lib/errors/app-error";
import { getCurrentSession } from "@/lib/auth-session";

export async function requireCurrentSession() {
  const session = await getCurrentSession();

  if (!session) {
    throw new AppError("AUTH_REQUIRED", "Sign in to continue.");
  }

  return session;
}
