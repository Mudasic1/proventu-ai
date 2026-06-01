import "server-only";

import { AppError } from "@/lib/errors/app-error";
import { requireWorkspaceContext } from "@/lib/permissions/workspace";
import { workspaceRoles, type WorkspaceRole } from "@/lib/permissions/roles";

export { workspaceRoles };

export const permissions = [
  "dashboard:read",
  "contacts:read",
  "contacts:write",
  "companies:read",
  "companies:write",
  "pipeline:read",
  "pipeline:write",
  "tasks:read",
  "tasks:write",
  "campaigns:read",
  "campaigns:write",
  "inbox:read",
  "inbox:write",
  "automations:read",
  "automations:write",
  "analytics:read",
  "team:read",
  "team:write",
  "settings:read",
  "settings:write",
  "billing:read",
  "billing:write",
  "admin:read",
] as const;

export type Permission = (typeof permissions)[number];

const ownerPermissions = new Set<Permission>(permissions);
const adminPermissions = new Set<Permission>(permissions);

const permissionsByRole: Record<WorkspaceRole, ReadonlySet<Permission>> = {
  owner: ownerPermissions,
  admin: adminPermissions,
  sales_manager: new Set([
    "dashboard:read",
    "contacts:read",
    "contacts:write",
    "companies:read",
    "companies:write",
    "pipeline:read",
    "pipeline:write",
    "tasks:read",
    "tasks:write",
    "analytics:read",
    "team:read",
  ]),
  sales_rep: new Set([
    "dashboard:read",
    "contacts:read",
    "contacts:write",
    "companies:read",
    "pipeline:read",
    "pipeline:write",
    "tasks:read",
    "tasks:write",
  ]),
  marketer: new Set([
    "dashboard:read",
    "contacts:read",
    "companies:read",
    "campaigns:read",
    "campaigns:write",
    "inbox:read",
    "inbox:write",
    "automations:read",
    "analytics:read",
  ]),
  client: new Set(["dashboard:read", "campaigns:read", "analytics:read"]),
  viewer: new Set(["dashboard:read", "analytics:read"]),
};

export function normalizeWorkspaceRole(role: string): WorkspaceRole {
  return workspaceRoles.includes(role as WorkspaceRole)
    ? (role as WorkspaceRole)
    : "viewer";
}

export function hasPermission(role: string, permission: Permission) {
  return permissionsByRole[normalizeWorkspaceRole(role)].has(permission);
}

export async function requirePermission(permission: Permission) {
  const context = await requireWorkspaceContext();

  if (!hasPermission(context.role, permission)) {
    throw new AppError("FORBIDDEN", "You do not have access to this workspace action.");
  }

  return context;
}

export function isWorkspaceAdmin(role: string) {
  const normalizedRole = normalizeWorkspaceRole(role);
  return normalizedRole === "owner" || normalizedRole === "admin";
}
