import { Inbox } from "lucide-react";

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
    {canWrite ? <Panel><h2 className="font-display text-2xl font-bold tracking-[-0.07em]">Open conversation</h2><form action={createInboxConversationAction} className="mt-4 grid gap-3 md:grid-cols-2">
      <input required name="subject" placeholder="Conversation subject" className={fieldClassName} /><select name="contactId" className={fieldClassName}><option value="">No linked contact</option>{contacts.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select>
      <select name="priority" className={fieldClassName} defaultValue="normal"><option value="low">Low priority</option><option value="normal">Normal priority</option><option value="high">High priority</option></select><textarea required name="message" placeholder="Add an internal message" className={`${textAreaClassName} md:col-span-2`} /><button className={submitClassName}>Open conversation</button>
    </form></Panel> : null}
    {records.length ? <section className="grid gap-3 lg:grid-cols-2">{records.map((record) => <RecordCard key={record.id} title={record.subject} metadata={`${record.contactFirstName ?? ""} ${record.contactLastName ?? ""}`.trim() || "No linked contact"}><div className="flex items-center justify-between gap-3">{canWrite ? <StatusControl entityType="inbox_conversation" entityId={record.id} value={record.status} options={["open", "pending", "closed"]} /> : <StatusBadge value={record.status} />}<Inbox className="size-4 text-[#71817b]" /></div><p className="mt-3 text-xs text-[#71817b]">Last updated {formatDate(record.lastMessageAt)}</p></RecordCard>)}</section> : <EmptyState title="Inbox is clear" description="Open an internal conversation to track a customer question or review item." />}</div>;
}
