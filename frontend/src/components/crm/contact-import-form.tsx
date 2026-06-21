"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  importContactsAction,
  type ContactActionState,
} from "@/server/actions/contacts";

export function ContactImportForm() {
  const [state, formAction, pending] = useActionState(importContactsAction, {
    status: "idle",
  } satisfies ContactActionState);
  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} encType="multipart/form-data" className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="file">CSV contact file</Label>
        <input id="file" name="file" type="file" accept=".csv,text/csv" required className="rounded-xl border border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 text-sm" />
      </div>
      <p className="text-xs leading-5 text-[var(--dashboard-soft)]">Supported headers: firstName, lastName, email, phone, company, source, status, tags, notes.</p>
      <Button className="h-11 rounded-full bg-[var(--dashboard-accent)] px-5 font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Upload />}
        {pending ? "Processing..." : "Process import"}
      </Button>
      {state.importSummary ? (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries({
            Accepted: state.importSummary.acceptedCount,
            Rejected: state.importSummary.rejectedCount,
            Duplicates: state.importSummary.duplicateCount,
          }).map(([label, count]) => (
            <div key={label} className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-3 text-center">
              <p className="font-display text-3xl font-bold text-[var(--dashboard-accent)]">{count}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--dashboard-soft)]">{label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}
