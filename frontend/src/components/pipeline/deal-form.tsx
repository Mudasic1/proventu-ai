"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
          <Select
            id="contactId"
            name="contactId"
            placeholder="Unassigned"
            options={contacts.map((contact) => ({
              label: `${contact.firstName} ${contact.lastName}`,
              value: contact.id,
            }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stageId">Starting stage</Label>
          <Select
            id="stageId"
            name="stageId"
            required
            options={stages
              .filter((stage) => !stage.terminalKind)
              .map((stage) => ({ label: stage.name, value: stage.id }))}
          />
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
      <Button className="h-11 rounded-full bg-[var(--dashboard-accent)] px-5 font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        {pending ? "Adding..." : "Add deal"}
      </Button>
    </form>
  );
}
