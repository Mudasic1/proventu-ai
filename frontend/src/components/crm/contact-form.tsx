"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Save, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContactActionState } from "@/server/actions/contacts";

type Defaults = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  source?: string;
  status?: string;
  tags?: string[];
  notes?: string;
};

type ContactFormProps = {
  action: (state: ContactActionState, data: FormData) => Promise<ContactActionState>;
  defaults?: Defaults;
  mode?: "create" | "edit";
};

export function ContactForm({ action, defaults, mode = "create" }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
  } satisfies ContactActionState);
  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" defaultValue={defaults?.firstName} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={defaults?.lastName} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaults?.email ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Company</Label>
          <Input id="companyName" name="companyName" defaultValue={defaults?.companyName ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" defaultValue={defaults?.source ?? "manual"} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={defaults?.status ?? "lead"} options={[{ value: "lead", label: "Lead" }, { value: "qualified", label: "Qualified" }, { value: "customer", label: "Customer" }, { value: "inactive", label: "Inactive" }]} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" name="tags" defaultValue={defaults?.tags?.join(", ")} placeholder="warm lead, referral" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Contact notes</Label>
        <Textarea id="notes" name="notes" defaultValue={defaults?.notes} />
      </div>
      {state.duplicateName ? (
        <label className="flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-300/8 p-3 text-sm text-amber-50">
          <input type="checkbox" name="confirmDuplicate" value="yes" className="mt-1" />
          Add this contact anyway. Review the existing record for {state.duplicateName}.
        </label>
      ) : null}
      <Button
        type="submit"
        className="h-11 rounded-full bg-[var(--dashboard-accent)] px-5 font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]"
        disabled={pending}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : mode === "create" ? <UserPlus /> : <Save />}
        {pending ? "Saving..." : mode === "create" ? "Add contact" : "Save contact"}
      </Button>
    </form>
  );
}
