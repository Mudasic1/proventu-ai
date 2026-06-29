import { Activity, History, Route } from "lucide-react";

import { ActivityWorkbench } from "@/components/crm/activity-workbench";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContactActivities, listContacts } from "@/server/queries/contacts";
import { getGoogleIntegrationStatus } from "@/server/queries/google-integrations";

type ActivityPageProps = {
  searchParams: Promise<{ contactId?: string; type?: string }>;
};

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const context = await requirePermission("contacts:read");
  const filters = await searchParams;
  const canWrite = hasPermission(context.role, "contacts:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;
  const selectedContactId =
    filters.contactId && filters.contactId !== "all"
      ? filters.contactId
      : undefined;

  const [contacts, activities, googleStatus] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    listContactActivities(context.workspaceId, { ownerUserId }),
    getGoogleIntegrationStatus(context.session.user.id),
  ]);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker flex items-center gap-2">
            <Route className="size-3" />
            CRM activity
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[0.9] tracking-wide">
            Activity <span className="text-[var(--dashboard-accent)]">timeline</span>
          </h1>
          <p className="mt-3 text-sm text-[var(--dashboard-muted)]">
            Every touchpoint across {activities.length} activities and{" "}
            {contacts.length} contacts in a chronological feed.
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <History className="size-5 text-[var(--dashboard-icon)]" />
          <Activity className="size-8 text-[var(--dashboard-accent)]" />
        </div>
      </div>

      <div className="mt-7">
        <ActivityWorkbench
          contacts={contacts}
          activities={activities}
          selectedContactId={selectedContactId}
          googleStatus={googleStatus}
          canWrite={canWrite}
        />
      </div>
    </section>
  );
}
