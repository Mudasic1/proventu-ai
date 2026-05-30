import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";

export default async function ProductLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const context = await requireWorkspacePageContext();

  return (
    <DashboardShell
      user={context.session.user}
      workspaceName={context.workspaceName}
    >
      {children}
    </DashboardShell>
  );
}
