import Link from "next/link";
import { Search, Upload, UserPlus } from "lucide-react";

import { ContactList } from "@/components/crm/contact-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireWorkspacePageContext } from "@/lib/permissions/workspace";
import { listContacts } from "@/server/queries/contacts";

type ContactsPageProps = {
  searchParams: Promise<{ query?: string; status?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const context = await requireWorkspacePageContext();
  const filters = await searchParams;
  const contacts = await listContacts(context.workspaceId, filters);

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">CRM contacts</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.09em]">Keep every lead within reach.</h1>
          <p className="mt-3 text-sm text-[#9eaea8]">{contacts.length} visible contacts in this workspace.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full border-white/[0.12] bg-white/[0.035] text-[#d5ddd9]">
            <Link href="/crm/contacts/import"><Upload />Import CSV</Link>
          </Button>
          <Button asChild className="rounded-full bg-[#d8ff62] font-bold text-[#10211c] hover:bg-[#e5ff92]">
            <Link href="/crm/contacts/new"><UserPlus />Add contact</Link>
          </Button>
        </div>
      </div>

      <form className="mt-7 grid gap-2 rounded-[20px] border border-white/[0.08] bg-white/[0.025] p-3 sm:grid-cols-[1fr_180px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[#71817b]" />
          <Input name="query" defaultValue={filters.query} placeholder="Search contacts..." className="pl-9" />
        </label>
        <select name="status" defaultValue={filters.status ?? "all"} className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="lead">Leads</option>
          <option value="qualified">Qualified</option>
          <option value="customer">Customers</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button className="h-11 rounded-xl bg-white/[0.08] px-4 font-bold text-[#f4f2ea] hover:bg-white/[0.14]">Filter</Button>
      </form>

      <div className="mt-5"><ContactList contacts={contacts} /></div>
    </section>
  );
}
