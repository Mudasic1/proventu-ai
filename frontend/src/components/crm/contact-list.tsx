import Link from "next/link";
import { ArrowRight, ContactRound, Mail, Phone } from "lucide-react";

type ContactRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  status: string;
  tags: string[];
};

export function ContactList({ contacts }: { contacts: ContactRecord[] }) {
  if (!contacts.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-8 text-center">
        <ContactRound className="mx-auto size-8 text-[var(--dashboard-accent)]" />
        <h2 className="mt-4 font-display text-3xl font-bold tracking-wide">Your CRM is ready for its first lead.</h2>
        <p className="mt-2 text-sm text-[var(--dashboard-muted)]">Add one manually or import a CSV to start building the revenue picture.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {contacts.map((record) => (
        <Link
          key={record.id}
          href={`/crm/contacts/${record.id}`}
          className="group grid gap-3 rounded-[20px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 transition hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-input)] sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-wide">{record.firstName} {record.lastName}</h2>
              <span className="rounded-full bg-[var(--dashboard-accent-soft)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--dashboard-accent)]">{record.status}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--dashboard-soft)]">{record.companyName || "Independent contact"}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--dashboard-muted)]">
              {record.email ? <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{record.email}</span> : null}
              {record.phone ? <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{record.phone}</span> : null}
            </div>
          </div>
          <ArrowRight className="size-4 text-[var(--dashboard-accent)] transition group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}
