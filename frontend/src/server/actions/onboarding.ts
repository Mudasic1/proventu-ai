"use server";

import { redirect } from "next/navigation";

import { requireCurrentSession } from "@/lib/auth/session";
import {
  type ActionState,
  toActionError,
} from "@/lib/errors/app-error";
import { getWorkspaceContext } from "@/lib/permissions/workspace";
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
