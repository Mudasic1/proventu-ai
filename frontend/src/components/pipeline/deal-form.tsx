"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/errors/app-error";
import { createDealAction } from "@/server/actions/pipeline";

type DealFormProps = {
  contacts: { id: string; firstName: string; lastName: string }[];
  stages: { id: string; name: string; terminalKind: string | null }[];
};

export function DealForm({ contacts, stages }: DealFormProps) {
  const [state, formAction, pending] = useActionState(
    createDealAction,
    initialActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">Deal title</Label>
          <Input id="title" name="title" required placeholder="Annual services agreement" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" type="number" min="0" step="0.01" defaultValue="0" required />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="contactId">Contact</Label>
          <select id="contactId" name="contactId" className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            <option value="">Unassigned</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stageId">Starting stage</Label>
          <select id="stageId" name="stageId" className="h-11 rounded-xl border border-white/[0.11] bg-[#10211c] px-3 text-sm">
            {stages.filter((stage) => !stage.terminalKind).map((stage) => (
              <option key={stage.id} value={stage.id}>{stage.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expectedCloseAt">Expected close</Label>
          <Input id="expectedCloseAt" name="expectedCloseAt" type="date" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Commercial context and next step" />
      </div>
      <Button className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        {pending ? "Adding..." : "Add deal"}
      </Button>
    </form>
  );
}
