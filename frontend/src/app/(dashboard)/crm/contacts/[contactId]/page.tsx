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
      <h1 className="mt-3 font-display text-5xl font-bold tracking-wide">
        {record.firstName} {record.lastName}
      </h1>
      <p className="mt-2 text-sm text-[var(--dashboard-muted)]">
        {record.companyName || "Independent contact"} - {record.status}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full border-[var(--dashboard-border)] bg-[var(--dashboard-control)] text-[var(--dashboard-muted)]">
          <Link href={`/crm/activity?contactId=${record.id}`}>
            <History />
            View activity
          </Link>
        </Button>
        {canWrite ? (
          <Button asChild className="rounded-full bg-[var(--dashboard-accent)] font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]">
            <Link href={`/sales/appointments?contactId=${record.id}`}>
              <CalendarPlus />
              Schedule appointment
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[24px] border border-white/[0.09] bg-[var(--dashboard-control)] shadow-sm/82 p-5 sm:p-6">
          <p className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--dashboard-accent)]">
            <ContactRound className="size-4" />
            Profile
          </p>
          {canWrite ? (
            <ContactForm action={update} mode="edit" defaults={record} />
          ) : (
            <div className="grid gap-3 text-sm text-[var(--dashboard-muted)]">
              <p>{record.email || "No email"}</p>
              <p>{record.phone || "No phone"}</p>
              <p>{record.notes || "No notes"}</p>
            </div>
          )}
        </div>
        <div className="rounded-[24px] border border-white/[0.09] bg-[var(--dashboard-control)] shadow-sm/82 p-5 sm:p-6">
          <p className="mb-5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--dashboard-accent)]">
            <ContactRound className="size-4" />
            Profile details
          </p>
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dashboard-icon)]">Email</dt>
              <dd className="mt-1 text-[var(--dashboard-fg)]">{record.email || "No email"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dashboard-icon)]">Phone</dt>
              <dd className="mt-1 text-[var(--dashboard-fg)]">{record.phone || "No phone"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dashboard-icon)]">Source</dt>
              <dd className="mt-1 text-[var(--dashboard-fg)]">{record.source}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--dashboard-icon)]">Tags</dt>
              <dd className="mt-1 text-[var(--dashboard-fg)]">
                {record.tags.length ? record.tags.join(", ") : "No tags"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
