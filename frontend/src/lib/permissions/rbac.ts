import "server-only";

import { AppError } from "@/lib/errors/app-error";
import { requireWorkspaceContext } from "@/lib/permissions/workspace";
import {
  hasPermission,
  isWorkspaceAdmin,
  normalizeWorkspaceRole,
  permissions,
  type Permission,
  workspaceRoles,
  type WorkspaceRole,
} from "@/lib/permissions/roles";

export { hasPermission, isWorkspaceAdmin, normalizeWorkspaceRole, permissions, workspaceRoles };
export type { Permission, WorkspaceRole };

export async function requirePermission(permission: Permission) {
  const context = await requireWorkspaceContext();

  if (!hasPermission(context.role, permission)) {
    throw new AppError("FORBIDDEN", "You do not have access to this workspace action.");
  }

  return context;
}
