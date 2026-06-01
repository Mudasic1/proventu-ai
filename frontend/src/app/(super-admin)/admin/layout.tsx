import { SuperAdminShell } from "@/components/admin/super-admin-shell";
import { requireSuperAdminPageContext } from "@/lib/permissions/super-admin";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireSuperAdminPageContext();
  return <SuperAdminShell admin={account}>{children}</SuperAdminShell>;
}

