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
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="file">CSV contact file</Label>
        <input id="file" name="file" type="file" accept=".csv,text/csv" required className="rounded-xl border border-dashed border-white/[0.14] bg-white/[0.035] p-4 text-sm" />
      </div>
      <p className="text-xs leading-5 text-[#82928c]">Supported headers: firstName, lastName, email, phone, company, source, status, tags, notes.</p>
      <Button className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]" disabled={pending}>
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
            <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-center">
              <p className="font-display text-3xl font-bold text-[#d8ff62]">{count}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#82928c]">{label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}
