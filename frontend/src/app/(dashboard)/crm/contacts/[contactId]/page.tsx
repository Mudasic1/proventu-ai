import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, ContactRound, History } from "lucide-react";

import { ContactForm } from "@/components/crm/contact-form";
import { Button } from "@/components/ui/button";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { updateContactAction } from "@/server/actions/contacts";
import { getContact } from "@/server/queries/contacts";

type ContactDetailPageProps = { params: Promise<{ contactId: string }> };

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { contactId } = await params;
  const context = await requirePermission("contacts:read");
  const canWrite = hasPermission(context.role, "contacts:write");
  const record = await getContact(
    context.workspaceId,
    contactId,
    context.role === "sales_rep" ? context.session.user.id : undefined,
  );
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
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full border-white/[0.12] bg-white/[0.035] text-[#d5ddd9]">
          <Link href={`/crm/activity?contactId=${record.id}`}>
            <History />
            View activity
          </Link>
        </Button>
        {canWrite ? (
          <Button asChild className="rounded-full bg-[#d8ff62] font-bold text-[#10211c] hover:bg-[#e5ff92]">
            <Link href={`/sales/appointments?contactId=${record.id}`}>
              <CalendarPlus />
              Schedule appointment
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_360px]">
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
            <ContactRound className="size-4" />
            Profile details
          </p>
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#71817b]">Email</dt>
              <dd className="mt-1 text-[#d7e0dd]">{record.email || "No email"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#71817b]">Phone</dt>
              <dd className="mt-1 text-[#d7e0dd]">{record.phone || "No phone"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#71817b]">Source</dt>
              <dd className="mt-1 text-[#d7e0dd]">{record.source}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#71817b]">Tags</dt>
              <dd className="mt-1 text-[#d7e0dd]">
                {record.tags.length ? record.tags.join(", ") : "No tags"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
