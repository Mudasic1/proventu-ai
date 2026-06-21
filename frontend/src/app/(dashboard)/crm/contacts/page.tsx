import Link from "next/link";
import { Search, Upload, UserPlus } from "lucide-react";

import { ContactList } from "@/components/crm/contact-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { listContacts } from "@/server/queries/contacts";

type ContactsPageProps = {
  searchParams: Promise<{ query?: string; status?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const context = await requirePermission("contacts:read");
  const filters = await searchParams;
  const contacts = await listContacts(context.workspaceId, {
    ...filters,
    ownerUserId: context.role === "sales_rep" ? context.session.user.id : undefined,
  });
  const canWrite = hasPermission(context.role, "contacts:write");

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">CRM contacts</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-wide">Keep every lead within reach.</h1>
          <p className="mt-3 text-sm text-[var(--dashboard-muted)]">{contacts.length} visible contacts in this workspace.</p>
        </div>
        {canWrite ? <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full border-[var(--dashboard-border)] bg-[var(--dashboard-control)] text-[var(--dashboard-muted)]">
            <Link href="/crm/contacts/import"><Upload />Import CSV</Link>
          </Button>
          <Button asChild className="rounded-full bg-[var(--dashboard-accent)] font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]">
            <Link href="/crm/contacts/new"><UserPlus />Add contact</Link>
          </Button>
        </div> : null}
      </div>

      <form className="mt-7 grid gap-2 rounded-[20px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-3 sm:grid-cols-[1fr_180px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-[var(--dashboard-icon)]" />
          <Input name="query" defaultValue={filters.query} placeholder="Search contacts..." className="pl-9" />
        </label>
        <Select name="status" defaultValue={filters.status ?? "all"} options={[{ value: "all", label: "All statuses" }, { value: "lead", label: "Leads" }, { value: "qualified", label: "Qualified" }, { value: "customer", label: "Customers" }, { value: "inactive", label: "Inactive" }]} />
        <Button className="h-11 rounded-xl bg-[var(--dashboard-hover)] px-4 font-bold text-[var(--dashboard-fg)] hover:bg-[var(--dashboard-hover)]">Filter</Button>
      </form>

      <div className="mt-5"><ContactList contacts={contacts} /></div>
    </section>
  );
}
