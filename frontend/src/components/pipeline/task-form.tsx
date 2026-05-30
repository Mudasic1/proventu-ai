"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/errors/app-error";
import { createTaskAction } from "@/server/actions/pipeline";

type TaskFormProps = {
  contacts: { id: string; firstName: string; lastName: string }[];
  deals: { id: string; title: string }[];
  defaultDealId?: string;
  defaultContactId?: string | null;
};

export function TaskForm({ contacts, deals, defaultDealId, defaultContactId }: TaskFormProps) {
  const [state, formAction, pending] = useActionState(
    createTaskAction,
    initialActionState,
  );
  useEffect(() => {
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Follow-up</Label>
        <Input id="title" name="title" required placeholder="Call to confirm proposal review" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contactId">Contact</Label>
          <select id="contactId" name="contactId" defaultValue={defaultContactId ?? ""} className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="">Unassigned</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dealId">Deal</Label>
          <select id="dealId" name="dealId" defaultValue={defaultDealId ?? ""} className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="">Unassigned</option>
            {deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dueAt">Due date</Label>
          <Input id="dueAt" name="dueAt" type="date" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" defaultValue="medium" className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      <Button className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        {pending ? "Adding..." : "Add follow-up"}
      </Button>
    </form>
  );
}
