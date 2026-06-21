import { Activity, Filter } from "lucide-react";

import { ActivityWorkbench } from "@/components/crm/activity-workbench";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContactActivities, listContacts } from "@/server/queries/contacts";
import { getGoogleIntegrationStatus } from "@/server/queries/google-integrations";

type ActivityPageProps = {
  searchParams: Promise<{ contactId?: string; type?: string }>;
};

const activityTypes = ["all", "note", "call", "meeting", "email", "sms"] as const;

function parseActivityType(type?: string) {
  return activityTypes.includes(type as (typeof activityTypes)[number])
    ? (type as (typeof activityTypes)[number])
    : "all";
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const context = await requirePermission("contacts:read");
  const filters = await searchParams;
  const canWrite = hasPermission(context.role, "contacts:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;
  const selectedType = parseActivityType(filters.type);
  const selectedContactId = filters.contactId && filters.contactId !== "all" ? filters.contactId : undefined;

  const [contacts, activities, googleStatus] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    listContactActivities(context.workspaceId, {
      ownerUserId,
      contactId: selectedContactId,
      type: selectedType,
    }),
    getGoogleIntegrationStatus(context.session.user.id),
  ]);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">CRM activity</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-wide">
            Every touchpoint in one place.
          </h1>
          <p className="mt-3 text-sm text-[var(--dashboard-muted)]">
            {activities.length} visible activities across active contacts.
          </p>
        </div>
        <Activity className="hidden size-8 text-[var(--dashboard-accent)] sm:block" />
      </div>

      <form className="mt-7 grid gap-2 rounded-[20px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-3 sm:grid-cols-[1fr_180px_auto]">
        <Select
          name="contactId"
          defaultValue={selectedContactId ?? "all"}
          options={[
            { label: "All contacts", value: "all" },
            ...contacts.map((contact) => ({
              label: `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed contact",
              value: contact.id,
            })),
          ]}
        />
        <Select
          name="type"
          defaultValue={selectedType}
          options={[
            { label: "All activity", value: "all" },
            { label: "Notes", value: "note" },
            { label: "Calls", value: "call" },
            { label: "Meetings", value: "meeting" },
            { label: "Emails", value: "email" },
            { label: "SMS", value: "sms" },
          ]}
        />
        <Button className="h-11 rounded-xl bg-[var(--dashboard-hover)] px-4 font-bold text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)]">
          <Filter />
          Filter
        </Button>
      </form>

      <div className="mt-5">
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
