import { notFound } from "next/navigation";
import { ContactRound, History } from "lucide-react";

import { ContactForm } from "@/components/crm/contact-form";
import { ContactTimeline } from "@/components/crm/contact-timeline";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { updateContactAction } from "@/server/actions/contacts";
import { getContact, getContactActivity } from "@/server/queries/contacts";
import { getGoogleIntegrationStatus } from "@/server/queries/google-integrations";

type ContactDetailPageProps = { params: Promise<{ contactId: string }> };

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { contactId } = await params;
  const context = await requirePermission("contacts:read");
  const canWrite = hasPermission(context.role, "contacts:write");
  const [record, activity, googleStatus] = await Promise.all([
    getContact(context.workspaceId, contactId, context.role === "sales_rep" ? context.session.user.id : undefined),
    getContactActivity(context.workspaceId, contactId),
    getGoogleIntegrationStatus(context.session.user.id),
  ]);
  if (!record) notFound();
  const update = updateContactAction.bind(null, contactId);

  return (
    <section>
      <p className="section-kicker">Contact detail</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.09em]">
        {record.firstName} {record.lastName}
      </h1>
      <p className="mt-2 text-sm text-[#9eaea8]">
        {record.companyName || "Independent contact"} - {record.status}
      </p>
      <div className="mt-7 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0b1916]/82 p-5 sm:p-6">
          <p className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#d8ff62]">
            <ContactRound className="size-4" />
            Profile
          </p>
          {canWrite ? (
            <ContactForm action={update} mode="edit" defaults={record} />
          ) : (
            <div className="grid gap-3 text-sm text-[#aebbb6]">
              <p>{record.email || "No email"}</p>
              <p>{record.phone || "No phone"}</p>
              <p>{record.notes || "No notes"}</p>
            </div>
          )}
        </div>
        <div className="rounded-[24px] border border-white/[0.09] bg-[#0b1916]/82 p-5 sm:p-6">
          <p className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#d8ff62]">
            <History className="size-4" />
            Activity timeline
          </p>
          <ContactTimeline
            contactId={contactId}
            activity={activity}
            contactEmail={record.email}
            googleStatus={googleStatus}
            canWrite={canWrite}
          />
        </div>
      </div>
    </section>
  );
}
