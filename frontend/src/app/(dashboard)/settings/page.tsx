import Link from "next/link";

import { Building2, CreditCard, Settings2 } from "lucide-react";

import { fieldClassName, PageHeader, Panel, submitClassName, textAreaClassName } from "@/components/shared/module-ui";
import { Button } from "@/components/ui/button";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { saveWorkspaceSettingsAction } from "@/server/actions/workspace-modules";
import { getWorkspaceSettings } from "@/server/queries/workspace-modules";

export default async function SettingsPage() {
  const context = await requirePermission("settings:read");
  const settings = await getWorkspaceSettings(context.workspaceId);
  const canWrite = hasPermission(context.role, "settings:write");
  return <div className="grid gap-5"><PageHeader kicker="Settings" title="Keep workspace preferences explicit." description="Configure normal business settings and content review defaults for this workspace." />
    <section className="grid gap-3 sm:grid-cols-2"><Button asChild variant="outline" className="h-auto justify-start rounded-2xl border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 text-[var(--dashboard-fg)]"><Link href="/settings/workspace"><Building2 className="text-[var(--dashboard-accent)]" /> Business profile</Link></Button><Button asChild variant="outline" className="h-auto justify-start rounded-2xl border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 text-[var(--dashboard-fg)]"><Link href="/settings/billing"><CreditCard className="text-[var(--dashboard-accent)]" /> Billing structure</Link></Button></section>
    <Panel><h2 className="flex items-center gap-2 font-display text-2xl font-bold tracking-wide"><Settings2 className="size-5 text-[var(--dashboard-accent)]" /> Workspace preferences</h2><form action={saveWorkspaceSettingsAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input disabled={!canWrite} name="timezone" defaultValue={settings?.timezone ?? "UTC"} placeholder="Timezone" className={fieldClassName} /><input disabled={!canWrite} name="currency" defaultValue={settings?.currency ?? "USD"} placeholder="Currency" className={fieldClassName} />
      <input disabled={!canWrite} name="emailFromName" defaultValue={settings?.emailFromName ?? ""} placeholder="Default email from name" className={fieldClassName} /><textarea disabled={!canWrite} name="brandVoice" defaultValue={settings?.brandVoice ?? ""} placeholder="Brand voice notes for human writers" className={`${textAreaClassName} md:col-span-2`} />
      <label className="flex items-center gap-3 text-sm text-[var(--dashboard-muted)]"><input disabled={!canWrite} type="checkbox" name="requireContentReview" defaultChecked={settings?.requireContentReview ?? true} className="size-4 accent-[var(--dashboard-accent)]" /> Require content review before manual publishing</label>{canWrite ? <button className={submitClassName}>Save settings</button> : null}
    </form></Panel>
  </div>;
}

