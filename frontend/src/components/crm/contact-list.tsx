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
      <div className="rounded-[24px] border border-dashed border-white/[0.14] bg-white/[0.025] p-8 text-center">
        <ContactRound className="mx-auto size-8 text-[#d8ff62]" />
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.07em]">Your CRM is ready for its first lead.</h2>
        <p className="mt-2 text-sm text-[#98a8a2]">Add one manually or import a CSV to start building the revenue picture.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {contacts.map((record) => (
        <Link
          key={record.id}
          href={`/crm/contacts/${record.id}`}
          className="group grid gap-3 rounded-[20px] border border-white/[0.08] bg-[#0b1916]/82 p-4 transition hover:border-[#d8ff62]/30 hover:bg-[#10211c] sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-[-0.05em]">{record.firstName} {record.lastName}</h2>
              <span className="rounded-full bg-[#d8ff62]/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d8ff62]">{record.status}</span>
            </div>
            <p className="mt-1 text-xs text-[#82928c]">{record.companyName || "Independent contact"}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#aebbb6]">
              {record.email ? <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{record.email}</span> : null}
              {record.phone ? <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{record.phone}</span> : null}
            </div>
          </div>
          <ArrowRight className="size-4 text-[#d8ff62] transition group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}
