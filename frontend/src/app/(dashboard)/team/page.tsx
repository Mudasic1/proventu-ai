import { UsersRound } from "lucide-react";

import { Select } from "@/components/ui/select";
import { EmptyState, fieldClassName, PageHeader, Panel, StatusBadge, submitClassName } from "@/components/shared/module-ui";
import { hasPermission, requirePermission, workspaceRoles } from "@/lib/permissions/rbac";
import { addTeamMemberAction, updateTeamMemberRoleAction } from "@/server/actions/workspace-modules";
import { listTeamMembers } from "@/server/queries/workspace-modules";

export default async function TeamPage() {
  const context = await requirePermission("team:read");
  const members = await listTeamMembers(context.workspaceId);
  const canWrite = hasPermission(context.role, "team:write");
  return <div className="grid gap-5"><PageHeader kicker="Team" title="Give each workspace member the access they need." description="Roles constrain the modules each person can view and change." />
        {canWrite ? <Panel><h2 className="font-display text-2xl font-bold tracking-wide">Add existing account</h2><p className="mt-2 text-sm text-[var(--dashboard-icon)]">The person must create an account before an admin can add them to this workspace.</p><form action={addTeamMemberAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]"><input required type="email" name="email" placeholder="teammate@company.com" className={fieldClassName} /><Select name="role" defaultValue="sales_rep" options={workspaceRoles.filter((role) => role !== "owner").map((r) => ({ value: r, label: r.replaceAll("_", " ") }))} /><button className={submitClassName}>Add member</button></form></Panel> : null}
    <Panel><h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide"><UsersRound className="size-5 text-[var(--dashboard-accent)]" /> Workspace members</h2><div className="mt-4 grid gap-2">{members.map((member) => <article key={member.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] shadow-sm p-3 sm:flex-row sm:items-center"><div><p className="text-sm font-bold">{member.name}</p><p className="mt-1 text-xs text-[var(--dashboard-icon)]">{member.email}</p></div>{canWrite && member.role !== "owner" ? <form action={updateTeamMemberRoleAction} className="flex gap-2"><input type="hidden" name="memberId" value={member.id} /><Select name="role" defaultValue={member.role} options={workspaceRoles.filter((role) => role !== "owner").map((r) => ({ value: r, label: r.replaceAll("_", " ") }))} className="h-9 min-w-40 py-0 text-xs" /><button className="rounded-lg border border-[var(--dashboard-accent-border)] px-3 text-xs font-bold text-[var(--dashboard-accent)]">Update</button></form> : <StatusBadge value={member.role} />}</article>)}{members.length === 0 ? <EmptyState title="No members" description="Add your first teammate after they create an account." /> : null}</div></Panel>
  </div>;
}

