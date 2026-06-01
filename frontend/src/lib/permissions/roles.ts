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

