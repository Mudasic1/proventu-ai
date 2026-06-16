"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  StickyNote,
  UsersRound,
} from "lucide-react";

import { GoogleConnectButton } from "@/components/crm/google-connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GoogleIntegrationStatus } from "@/server/queries/google-integrations";
import { createSelectedContactCrmActivityAction } from "@/server/actions/crm-activities";

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  companyName?: string | null;
};

export type ContactActivityRecord = {
  id: string;
  summary: string;
  action: string;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
  contactId: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail?: string | null;
  companyName?: string | null;
};

const activityIcons = {
  note: StickyNote,
  call: Phone,
  meeting: UsersRound,
  email: Mail,
  sms: MessageSquareText,
} as const;

const inputClassName =
  "border-white/[0.08] bg-[#07110f]/82 text-[#f4f2ea] placeholder:text-[#5f716a]";

function activityType(entry: Pick<ContactActivityRecord, "action" | "metadata">) {
  const metadataType = entry.metadata?.type;
  if (
    metadataType === "note" ||
    metadataType === "call" ||
    metadataType === "meeting" ||
    metadataType === "email" ||
    metadataType === "sms"
  ) {
    return metadataType;
  }
  if (entry.action.includes("email")) return "email";
  if (entry.action.includes("meeting")) return "meeting";
  if (entry.action.includes("call")) return "call";
  if (entry.action.includes("sms")) return "sms";
  return "note";
}

function googleStatus(entry: Pick<ContactActivityRecord, "metadata">) {
  const google = entry.metadata?.google;
  if (!google || typeof google !== "object") return [];
  const status = google as Record<string, unknown>;
  return [
    status.calendar === "created" ? "Calendar event created" : null,
    status.gmail === "sent" ? "Gmail sent" : null,
  ].filter(Boolean);
}

function contactName(contact: Pick<ContactOption, "firstName" | "lastName">) {
  return `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed contact";
}

export function ActivityWorkbench({
  contacts,
  activities,
  selectedContactId,
  googleStatus: integrationStatus,
  canWrite,
}: {
  contacts: ContactOption[];
  activities: ContactActivityRecord[];
  selectedContactId?: string;
  googleStatus: GoogleIntegrationStatus;
  canWrite: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createSelectedContactCrmActivityAction,
    { status: "idle" },
  );

  useEffect(() => {
    if (state.status === "success") {
      if (state.message) toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      {canWrite ? (
        <div className="grid content-start gap-4">
          <form
            ref={formRef}
            action={formAction}
            className="grid gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"
          >
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
                Log activity
              </p>
              <p className="mt-1 text-xs leading-5 text-[#71817b]">
                Capture calls, meetings, emails, notes, and SMS touchpoints.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactId">Contact</Label>
              <Select
                id="contactId"
                name="contactId"
                className={inputClassName}
                defaultValue={selectedContactId ?? ""}
                placeholder="Choose contact"
                required
                options={contacts.map((contact) => ({
                  label: `${contactName(contact)}${contact.companyName ? ` - ${contact.companyName}` : ""}`,
                  value: contact.id,
                }))}
              />
              {state.fieldErrors?.contactId ? (
                <p className="text-xs text-red-100">{state.fieldErrors.contactId[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="type">Activity type</Label>
                <Select
                  id="type"
                  name="type"
                  className={inputClassName}
                  defaultValue="note"
                  options={[
                    { label: "Note", value: "note" },
                    { label: "Call", value: "call" },
                    { label: "Meeting", value: "meeting" },
                    { label: "Email", value: "email" },
                    { label: "SMS", value: "sms" },
                  ]}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  id="outcome"
                  name="outcome"
                  className={inputClassName}
                  defaultValue="completed"
                  options={[
                    { label: "Completed", value: "completed" },
                    { label: "Planned", value: "planned" },
                    { label: "No answer", value: "no_answer" },
                    { label: "Left message", value: "left_message" },
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Discovery call follow-up"
                className={inputClassName}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Details</Label>
              <Textarea
                id="body"
                name="body"
                placeholder="What happened, what was promised, and what should happen next?"
                className={inputClassName}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="scheduledAt">Scheduled time</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  className={inputClassName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationMinutes">Duration</Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  placeholder="30"
                  className={inputClassName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendeeEmail">Recipient or attendee</Label>
                <Input
                  id="attendeeEmail"
                  name="attendeeEmail"
                  type="email"
                  placeholder="lead@example.com"
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="grid gap-2 rounded-xl border border-white/[0.08] bg-[#07110f]/52 p-3">
              <label className="flex items-start gap-2 text-xs leading-5 text-[#aebbb6]">
                <input
                  type="checkbox"
                  name="syncToGoogleCalendar"
                  disabled={!integrationStatus.hasCalendarScope}
                  className="mt-1"
                />
                <span>
                  Create a Google Calendar event for meeting activities.
                  {!integrationStatus.hasCalendarScope ? (
                    <span className="block text-[#71817b]">
                      Connect Google with Calendar permission first.
                    </span>
                  ) : null}
                </span>
              </label>
              <label className="flex items-start gap-2 text-xs leading-5 text-[#aebbb6]">
                <input
                  type="checkbox"
                  name="sendWithGmail"
                  disabled={!integrationStatus.hasGmailScope}
                  className="mt-1"
                />
                <span>
                  Send this email activity through Gmail now.
                  {!integrationStatus.hasGmailScope ? (
                    <span className="block text-[#71817b]">
                      Connect Google with Gmail permission first.
                    </span>
                  ) : null}
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-full bg-[#d8ff62] px-4 font-bold text-[#10211c] hover:bg-[#e5ff92]"
            >
              {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Save activity
            </Button>
          </form>

          {!integrationStatus.hasCalendarScope && !integrationStatus.hasGmailScope ? (
            integrationStatus.configured ? (
              <GoogleConnectButton />
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
                  Google not configured
                </p>
                <p className="mt-2 text-sm leading-6 text-[#aebbb6]">
                  Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then configure
                  the Google OAuth callback at /api/auth/callback/google.
                </p>
              </div>
            )
          ) : null}
        </div>
      ) : null}

      <ActivityFeed activities={activities} />
    </div>
  );
}

export function ActivityFeed({ activities }: { activities: ContactActivityRecord[] }) {
  return (
    <div className="grid content-start gap-2">
      {activities.length ? (
        activities.map((entry) => <ActivityCard key={entry.id} entry={entry} />)
      ) : (
        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-6">
          <p className="text-sm font-bold text-[#f4f2ea]">No activity found.</p>
          <p className="mt-2 text-sm leading-6 text-[#9eaea8]">
            Change the filters or log a new contact touchpoint.
          </p>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ entry }: { entry: ContactActivityRecord }) {
  const type = activityType(entry);
  const Icon = activityIcons[type];
  const statuses = googleStatus(entry);
  const scheduledAt =
    typeof entry.metadata?.scheduledAt === "string" && entry.metadata.scheduledAt
      ? entry.metadata.scheduledAt
      : null;
  const displayName = contactName({
    firstName: entry.contactFirstName,
    lastName: entry.contactLastName,
  });

  return (
    <article className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#d8ff62]/10 text-[#d8ff62]">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#d7e0dd]">{entry.summary}</p>
            <Link
              href={`/crm/contacts/${entry.contactId}`}
              className="text-xs font-bold text-[#d8ff62] hover:text-[#e5ff92]"
            >
              {displayName}
            </Link>
          </div>
          <p className="mt-1 text-xs text-[#71817b]">
            {entry.companyName || entry.contactEmail || "Contact profile"}
          </p>
          {scheduledAt ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#9eaea8]">
              <CalendarDays className="size-3.5" />
              {new Date(scheduledAt).toLocaleString()}
            </p>
          ) : null}
          {statuses.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {statuses.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 rounded-full border border-[#d8ff62]/15 bg-[#d8ff62]/8 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d8ff62]"
                >
                  <CheckCircle2 className="size-3" />
                  {status}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#71817b]">
            <Clock3 className="size-3" />
            {entry.action.replace(".", " - ").replaceAll("_", " ")} -{" "}
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </article>
  );
}
