import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { requireCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  businessProfile,
  workspace,
  workspaceMember,
} from "@/lib/db/schema";
import { AppError } from "@/lib/errors/app-error";

export async function getWorkspaceContext() {
  const session = await requireCurrentSession();
  const [context] = await db
    .select({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      role: workspaceMember.role,
      profileId: businessProfile.id,
      businessName: businessProfile.businessName,
    })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .leftJoin(businessProfile, eq(businessProfile.workspaceId, workspace.id))
    .where(eq(workspaceMember.userId, session.user.id))
    .limit(1);

  return context ? { ...context, session } : null;
}

export async function requireWorkspaceContext() {
  const context = await getWorkspaceContext();

  if (!context) {
    throw new AppError(
      "FORBIDDEN",
      "Complete workspace setup before accessing this page.",
    );
  }

  return context;
}

export async function requireWorkspacePageContext() {
  try {
    const context = await getWorkspaceContext();
    if (!context) redirect("/onboarding");
    return context;
  } catch (error) {
    if (error instanceof AppError && error.code === "AUTH_REQUIRED") {
      redirect("/signin");
    }
    throw error;
  }
}
