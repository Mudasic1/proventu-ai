import { Upload } from "lucide-react";

import { ContactImportForm } from "@/components/crm/contact-import-form";

export default function ImportContactsPage() {
  return (
    <section className="max-w-2xl">
      <p className="section-kicker">CRM import</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.09em]">Bring your lead list with you.</h1>
      <p className="mt-3 text-sm leading-6 text-[#9eaea8]">Rows are classified before they enter the CRM. Invalid and duplicate rows remain visible in the import summary.</p>
      <div className="mt-7 rounded-[24px] border border-white/[0.09] bg-[#0b1916]/82 p-5 sm:p-7">
        <p className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#d8ff62]"><Upload className="size-4" />Structured CSV import</p>
        <ContactImportForm />
      </div>
    </section>
  );
}
