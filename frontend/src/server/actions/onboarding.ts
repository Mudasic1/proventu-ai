"use server";

import { redirect } from "next/navigation";

import { requireCurrentSession } from "@/lib/auth/session";
import {
  type ActionState,
  toActionError,
} from "@/lib/errors/app-error";
import { getWorkspaceContext } from "@/lib/permissions/workspace";
import { hasPermission } from "@/lib/permissions/rbac";
import { onboardingSchema } from "@/lib/validations/onboarding";
import {
  createWorkspaceForUser,
  updateWorkspaceProfile,
} from "@/server/mutations/workspaces";

function parse(formData: FormData) {
  return onboardingSchema.safeParse(Object.fromEntries(formData));
}

export async function createWorkspaceAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = parse(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const session = await requireCurrentSession();
    await createWorkspaceForUser(session.user.id, result.data);
  } catch (error) {
    return toActionError(error);
  }

  redirect("/dashboard?toast=workspace-created");
}

export async function skipWorkspaceSetupAction() {
  const session = await requireCurrentSession();
  const displayName = session.user.name.trim();
  const businessName = displayName ? `${displayName}'s Workspace` : "My Workspace";

  await createWorkspaceForUser(session.user.id, {
    businessName,
    industry: "Not set",
    targetAudience: "Add your ideal customer from workspace settings.",
    brandVoice: "Not set",
    productsServices: "Add your products or services from workspace settings.",
    offerName: "Primary offer",
    offerDescription: "Add your primary offer details from workspace settings.",
    salesProcess: "Add your current sales process from workspace settings.",
  });

  redirect("/dashboard?toast=onboarding-skipped");
}

export async function updateWorkspaceProfileAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = parse(formData);

  if (!result.success) {
    return {
      status: "error",
      message: "Review the highlighted fields.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const context = await getWorkspaceContext();
    if (!context) return { status: "error", message: "Workspace not found." };
    if (!hasPermission(context.role, "settings:write")) {
      return { status: "error", message: "You do not have access to update workspace settings." };
    }
    await updateWorkspaceProfile(
      context.workspaceId,
      context.session.user.id,
      result.data,
    );
    return { status: "success", message: "Workspace profile updated." };
  } catch (error) {
    return toActionError(error);
  }
}
