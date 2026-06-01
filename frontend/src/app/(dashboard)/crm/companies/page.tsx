import { Building2 } from "lucide-react";

import {
  EmptyState,
  fieldClassName,
  PageHeader,
  Panel,
  RecordCard,
  StatusBadge,
  StatusControl,
  submitClassName,
  textAreaClassName,
} from "@/components/shared/module-ui";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createCompanyAction } from "@/server/actions/workspace-modules";
import { listCompanies } from "@/server/queries/workspace-modules";

export default async function CompaniesPage() {
  const context = await requirePermission("companies:read");
  const records = await listCompanies(context.workspaceId);
  const canWrite = hasPermission(context.role, "companies:write");

  return (
    <div className="grid gap-5">
      <PageHeader
        kicker="CRM companies"
        title="Keep account context attached to the deal."
        description={`${records.length} companies in this workspace. Store account details without duplicating them across contacts.`}
      />
      {canWrite ? (
        <Panel>
          <h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Add company</h2>
          <form action={createCompanyAction} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input required name="name" placeholder="Company name" className={fieldClassName} />
            <input name="domain" placeholder="Website" className={fieldClassName} />
            <input name="email" type="email" placeholder="Account email" className={fieldClassName} />
            <input name="phone" placeholder="Phone" className={fieldClassName} />
            <input name="industry" placeholder="Industry" className={fieldClassName} />
            <select name="status" className={fieldClassName} defaultValue="prospect">
              <option value="prospect">Prospect</option>
              <option value="active">Active</option>
              <option value="customer">Customer</option>
              <option value="inactive">Inactive</option>
            </select>
            <textarea name="notes" placeholder="Account notes" className={`${textAreaClassName} md:col-span-2`} />
            <button className={submitClassName}>Add company</button>
          </form>
        </Panel>
      ) : null}
      {records.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record) => (
            <RecordCard key={record.id} title={record.name} metadata={record.industry || "Industry not set"}>
              <div className="flex items-center justify-between gap-3">
                {canWrite ? <StatusControl entityType="company" entityId={record.id} value={record.status} options={["prospect", "active", "customer", "inactive"]} /> : <StatusBadge value={record.status} />}
                <Building2 className="size-4 text-[#71817b]" />
              </div>
              <p className="mt-3 text-sm text-[#aebbb6]">{record.website || record.email || "No contact details yet."}</p>
            </RecordCard>
          ))}
        </section>
      ) : (
        <EmptyState title="No companies yet" description="Add account records to connect contacts and deals to a shared company profile." />
      )}
    </div>
  );
}
