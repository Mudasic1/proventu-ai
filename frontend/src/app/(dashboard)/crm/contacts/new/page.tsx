import { UserPlus } from "lucide-react";

import { ContactForm } from "@/components/crm/contact-form";
import { requirePermission } from "@/lib/permissions/rbac";
import { createContactAction } from "@/server/actions/contacts";

export default async function NewContactPage() {
  await requirePermission("contacts:write");
  return (
    <section className="max-w-3xl">
      <p className="section-kicker">CRM contacts</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-wide">Add a lead worth following.</h1>
      <div className="mt-7 rounded-[24px] border border-white/[0.09] bg-[var(--dashboard-control)] shadow-sm/82 p-5 sm:p-7">
        <p className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--dashboard-accent)]"><UserPlus className="size-4" />Contact details</p>
        <ContactForm action={createContactAction} />
      </div>
    </section>
  );
}
