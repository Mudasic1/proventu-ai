"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck2, CalendarDays, LoaderCircle, Mail, UsersRound } from "lucide-react";

import { GoogleConnectButton } from "@/components/crm/google-connect-button";
import type { ContactActivityRecord } from "@/components/crm/activity-workbench";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { scheduleAppointmentAction } from "@/server/actions/crm-activities";
import type { GoogleIntegrationStatus } from "@/server/queries/google-integrations";

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  companyName?: string | null;
};

const inputClassName =
  "border-white/[0.08] bg-[#07110f]/82 text-[#f4f2ea] placeholder:text-[#5f716a]";

function contactName(contact: Pick<ContactOption, "firstName" | "lastName">) {
  return `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed contact";
}

function fieldError(errors: Record<string, string[] | undefined> | undefined, field: string) {
  const message = errors?.[field]?.[0];
  return message ? <p className="text-xs text-red-100">{message}</p> : null;
}

export function AppointmentScheduler({
  contacts,
  appointments,
  googleStatus,
  canWrite,
  selectedContactId: requestedContactId,
}: {
  contacts: ContactOption[];
  appointments: ContactActivityRecord[];
  googleStatus: GoogleIntegrationStatus;
  canWrite: boolean;
  selectedContactId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialContactId = contacts.some((contact) => contact.id === requestedContactId)
    ? requestedContactId
    : contacts[0]?.id ?? "";
  const [selectedContactId, setSelectedContactId] = useState(initialContactId ?? "");
  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId),
    [contacts, selectedContactId],
  );
  const [state, formAction, isPending] = useActionState(scheduleAppointmentAction, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "success") {
      if (state.message) toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const hasGoogleBookingAccess =
    googleStatus.hasCalendarScope && googleStatus.hasGmailScope;
  const canSchedule = canWrite && hasGoogleBookingAccess && contacts.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      {canWrite ? (
        <div className="grid content-start gap-4">
          <form
            ref={formRef}
            action={formAction}
            className="grid gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"
          >
            <input type="hidden" name="syncToGoogleCalendar" value="on" />
            <input type="hidden" name="sendWithGmail" value="on" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
                  Schedule appointment
                </p>
                <p className="mt-1 text-xs leading-5 text-[#71817b]">
                  Creates a Calendar invite and sends the appointment details by Gmail.
                </p>
              </div>
              <CalendarCheck2 className="size-5 text-[#d8ff62]" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactId">Contact</Label>
              <Select
                id="contactId"
                name="contactId"
                className={inputClassName}
                value={selectedContactId}
                onChange={(event) => setSelectedContactId(event.target.value)}
                placeholder="Choose contact"
                required
                options={contacts.map((contact) => ({
                  label: `${contactName(contact)}${contact.companyName ? ` - ${contact.companyName}` : ""}`,
                  value: contact.id,
                }))}
              />
              {fieldError(state.fieldErrors, "contactId")}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Product walkthrough"
                className={inputClassName}
                required
              />
              {fieldError(state.fieldErrors, "subject")}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Details</Label>
              <Textarea
                id="body"
                name="body"
                placeholder="Agenda, context, and any preparation notes."
                className={inputClassName}
                rows={4}
                required
              />
              {fieldError(state.fieldErrors, "body")}
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  className={inputClassName}
                  required
                />
                {fieldError(state.fieldErrors, "scheduledAt")}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  name="appointmentTime"
                  type="time"
                  className={inputClassName}
                  required
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
                  defaultValue={30}
                  className={inputClassName}
                  required
                />
                {fieldError(state.fieldErrors, "durationMinutes")}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendeeEmail">Attendee email</Label>
                <Input
                  key={selectedContactId}
                  id="attendeeEmail"
                  name="attendeeEmail"
                  type="email"
                  defaultValue={selectedContact?.email ?? ""}
                  placeholder="lead@example.com"
                  className={inputClassName}
                  required
                />
                {fieldError(state.fieldErrors, "attendeeEmail")}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!canSchedule || isPending}
              className="h-11 rounded-full bg-[#d8ff62] px-4 font-bold text-[#10211c] hover:bg-[#e5ff92]"
            >
              {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Schedule and send email
            </Button>
            {!contacts.length ? (
              <p className="text-xs text-[#9eaea8]">Add a contact before scheduling appointments.</p>
            ) : !hasGoogleBookingAccess ? (
              <p className="text-xs text-[#9eaea8]">
                Connect Google Calendar and Gmail before scheduling appointments.
              </p>
            ) : null}
          </form>

          {!hasGoogleBookingAccess ? (
            googleStatus.configured ? (
              <GoogleConnectButton capability="crm" callbackURL="/sales/appointments" />
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
                  Google Calendar and Gmail not configured
                </p>
                <p className="mt-2 text-sm leading-6 text-[#aebbb6]">
                  Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to
                  frontend/.env.local, then restart the frontend dev server.
                  Google API keys such as GOOGLE_API_KEY cannot create Calendar
                  invites or send Gmail messages.
                </p>
              </div>
            )
          ) : null}
        </div>
      ) : null}

      <AppointmentList appointments={appointments} />
    </div>
  );
}

function AppointmentList({ appointments }: { appointments: ContactActivityRecord[] }) {
  return (
    <div className="grid content-start gap-3">
      {appointments.length ? (
        appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))
      ) : (
        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-6">
          <p className="text-sm font-bold text-[#f4f2ea]">No appointments scheduled.</p>
          <p className="mt-2 text-sm leading-6 text-[#9eaea8]">
            Future meetings created from this page appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: ContactActivityRecord }) {
  const scheduledAt =
    typeof appointment.metadata?.scheduledAt === "string" && appointment.metadata.scheduledAt
      ? appointment.metadata.scheduledAt
      : null;
  const duration =
    typeof appointment.metadata?.durationMinutes === "number"
      ? appointment.metadata.durationMinutes
      : 30;
  const attendee =
    typeof appointment.metadata?.attendeeEmail === "string"
      ? appointment.metadata.attendeeEmail
      : appointment.contactEmail;
  const google = appointment.metadata?.google;
  const calendarLink =
    google && typeof google === "object" && typeof (google as Record<string, unknown>).calendarEventLink === "string"
      ? ((google as Record<string, unknown>).calendarEventLink as string)
      : null;
  const displayName = `${appointment.contactFirstName} ${appointment.contactLastName}`.trim();

  return (
    <article className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#f4f2ea]">{appointment.summary}</p>
          <Link
            href={`/crm/contacts/${appointment.contactId}`}
            className="mt-1 inline-flex text-xs font-bold text-[#d8ff62] hover:text-[#e5ff92]"
          >
            {displayName || "Contact profile"}
          </Link>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#d8ff62]/15 bg-[#d8ff62]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d8ff62]">
          <UsersRound className="size-3" />
          Meeting
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-[#9eaea8] sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-[#d8ff62]" />
          {scheduledAt ? new Date(scheduledAt).toLocaleString() : "Time not set"}
        </p>
        <p>{duration} minutes</p>
        <p className="flex items-center gap-2 sm:col-span-2">
          <Mail className="size-3.5 text-[#d8ff62]" />
          {attendee || "No attendee email"}
        </p>
      </div>
      {calendarLink ? (
        <a
          href={calendarLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-xs font-bold text-[#d8ff62] hover:text-[#e5ff92]"
        >
          Open Google Calendar event
        </a>
      ) : null}
    </article>
  );
}
