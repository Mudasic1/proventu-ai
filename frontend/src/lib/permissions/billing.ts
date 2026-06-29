import "server-only";

import { AppError } from "@/lib/errors/app-error";
import { requireWorkspaceContext } from "@/lib/permissions/workspace";

export async function requireBillingOwner() {
  const context = await requireWorkspaceContext();

  if (context.role !== "owner") {
    throw new AppError("FORBIDDEN", "Only workspace owners can manage billing.");
  }

  return context;
}
