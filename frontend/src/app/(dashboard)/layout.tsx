import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageEntrance } from "@/components/shared/page-entrance";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const context = await requireWorkspacePageContext();
  return (
    <DashboardShell user={context.session.user} workspaceName={context.workspaceName} role={context.role}>
      <PageEntrance>{children}</PageEntrance>
    </DashboardShell>
  );
}
