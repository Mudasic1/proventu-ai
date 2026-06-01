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

function FieldError({
  errors,
  name,
}: {
  errors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = errors?.[name]?.[0];
  return message ? <p className="text-xs text-red-200">{message}</p> : null;
}

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
        <FieldError errors={state.fieldErrors} name="title" />
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
          <FieldError errors={state.fieldErrors} name="contactId" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dealId">Deal</Label>
          <select id="dealId" name="dealId" defaultValue={defaultDealId ?? ""} className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="">Unassigned</option>
            {deals.map((deal) => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
          </select>
          <FieldError errors={state.fieldErrors} name="dealId" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dueAt">Due date</Label>
          <Input id="dueAt" name="dueAt" type="date" required />
          <FieldError errors={state.fieldErrors} name="dueAt" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" defaultValue="medium" className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <FieldError errors={state.fieldErrors} name="priority" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
        <FieldError errors={state.fieldErrors} name="notes" />
      </div>
      <Button className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        {pending ? "Adding..." : "Add follow-up"}
      </Button>
    </form>
  );
}
