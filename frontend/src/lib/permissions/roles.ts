export const workspaceRoles = [
  "owner",
  "admin",
  "sales_manager",
  "sales_rep",
  "marketer",
  "client",
  "viewer",
] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

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
  "agents:read",
  "chat:read",
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
    "agents:read",
    "chat:read",
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
    "agents:read",
    "chat:read",
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
    "agents:read",
    "chat:read",
  ]),
  client: new Set(["dashboard:read", "campaigns:read", "analytics:read", "agents:read", "chat:read"]),
  viewer: new Set(["dashboard:read", "analytics:read", "agents:read", "chat:read"]),
};

export function normalizeWorkspaceRole(role: string): WorkspaceRole {
  return workspaceRoles.includes(role as WorkspaceRole)
    ? (role as WorkspaceRole)
    : "viewer";
}

export function hasPermission(role: string, permission: Permission) {
  return permissionsByRole[normalizeWorkspaceRole(role)].has(permission);
}

export function isWorkspaceAdmin(role: string) {
  const normalizedRole = normalizeWorkspaceRole(role);
  return normalizedRole === "owner" || normalizedRole === "admin";
}

