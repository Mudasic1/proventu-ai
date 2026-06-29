import { Inbox } from "lucide-react";

import { Select } from "@/components/ui/select";
import { EmptyState, fieldClassName, PageHeader, Panel, RecordCard, StatusBadge, StatusControl, submitClassName, textAreaClassName } from "@/components/shared/module-ui";
import { formatDate } from "@/lib/format";
import { hasPermission, requirePermission } from "@/lib/permissions/rbac";
import { createInboxConversationAction } from "@/server/actions/workspace-modules";
import { listContacts } from "@/server/queries/contacts";
import { listInboxConversations } from "@/server/queries/workspace-modules";

export default async function InboxPage() {
  const context = await requirePermission("inbox:read");
  const [records, contacts] = await Promise.all([listInboxConversations(context.workspaceId), listContacts(context.workspaceId, {})]);
  const canWrite = hasPermission(context.role, "inbox:write");
  return <div className="grid gap-5"><PageHeader kicker="Unified inbox" title="Keep customer conversations visible to the team." description="This inbox currently stores internal conversation records. External email and social integrations are not connected." />
    {canWrite ?     <Panel><h2 className="font-display text-2xl font-bold tracking-wide">Open conversation</h2><form action={createInboxConversationAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input required name="subject" placeholder="Conversation subject" className={fieldClassName} /><Select name="contactId" placeholder="No linked contact" options={contacts.map((item) => ({ value: item.id, label: `${item.firstName} ${item.lastName}` }))} />
      <Select name="priority" defaultValue="normal" options={[{ value: "low", label: "Low priority" }, { value: "normal", label: "Normal priority" }, { value: "high", label: "High priority" }]} /><textarea required name="message" placeholder="Add an internal message" className={`${textAreaClassName} md:col-span-2`} /><button className={submitClassName}>Open conversation</button>
    </form></Panel> : null}
    {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.subject} metadata={`${record.contactFirstName ?? ""} ${record.contactLastName ?? ""}`.trim() || "No linked contact"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="inbox_conversation" entityId={record.id} value={record.status} options={["open", "pending", "closed"]} /> : <StatusBadge value={record.status} />}<Inbox className="size-4 text-[var(--dashboard-icon)]" /></div><p className="mt-3 text-xs text-[var(--dashboard-icon)]">Last updated {formatDate(record.lastMessageAt)}</p></RecordCard>)}</section> : <EmptyState title="Inbox is clear" description="Open an internal conversation to track a customer question or review item." />}</div>;
}
