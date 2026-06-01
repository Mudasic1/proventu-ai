import { Clock3, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addContactNoteAction, removeContactAction } from "@/server/actions/contacts";

type Activity = { id: string; summary: string; action: string; createdAt: Date };

export function ContactTimeline({
  contactId,
  activity,
  canWrite = true,
}: {
  contactId: string;
  activity: Activity[];
  canWrite?: boolean;
}) {
  const addNote = addContactNoteAction.bind(null, contactId);
  const remove = removeContactAction.bind(null, contactId);

  return (
    <div className="grid gap-5">
      {canWrite ? (
        <form action={addNote} className="flex gap-2">
          <Input name="note" placeholder="Add a dated note..." required />
          <Button className="rounded-full bg-[#d8ff62] px-4 font-bold text-[#10211c] hover:bg-[#e5ff92]">
            Add note
          </Button>
        </form>
      ) : null}
      <div className="grid gap-2">
        {activity.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <p className="text-sm text-[#d7e0dd]">{entry.summary}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
              <Clock3 className="size-3" />
              {entry.action.replace(".", " - ")} - {entry.createdAt.toLocaleString()}
            </p>
          </article>
        ))}
      </div>
      {canWrite ? (
        <form action={remove} className="rounded-xl border border-red-300/15 bg-red-300/5 p-3">
          <label className="flex items-center gap-2 text-xs text-red-100">
            <input type="checkbox" name="confirmation" value="remove" required />
            Confirm removal. The audit entry remains available.
          </label>
          <Button variant="destructive" className="mt-3 rounded-full">
            <Trash2 />
            Remove contact
          </Button>
        </form>
      ) : null}
    </div>
  );
}
