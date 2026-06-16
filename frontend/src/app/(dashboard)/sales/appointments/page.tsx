import { CalendarClock } from "lucide-react";

import { AppointmentScheduler } from "@/components/crm/appointment-scheduler";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContactAppointments, listContacts } from "@/server/queries/contacts";
import { getGoogleIntegrationStatus } from "@/server/queries/google-integrations";

type AppointmentsPageProps = {
  searchParams: Promise<{ contactId?: string }>;
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const context = await requirePermission("contacts:read");
  const filters = await searchParams;
  const canWrite = hasPermission(context.role, "contacts:write");
  const ownerUserId = context.role === "sales_rep" ? context.session.user.id : undefined;

  const [contacts, appointments, googleStatus] = await Promise.all([
    listContacts(context.workspaceId, { ownerUserId }),
    listContactAppointments(context.workspaceId, ownerUserId),
    getGoogleIntegrationStatus(context.session.user.id),
  ]);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">Sales appointments</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.09em]">
            Book meetings without losing CRM context.
          </h1>
          <p className="mt-3 text-sm text-[#9eaea8]">
            Appointments are planned meeting activities with Google Calendar invites.
          </p>
        </div>
        <CalendarClock className="hidden size-8 text-[#d8ff62] sm:block" />
      </div>

      <div className="mt-7">
        <AppointmentScheduler
          contacts={contacts}
          appointments={appointments}
          googleStatus={googleStatus}
          canWrite={canWrite}
          selectedContactId={filters.contactId}
        />
      </div>
    </section>
  );
}
