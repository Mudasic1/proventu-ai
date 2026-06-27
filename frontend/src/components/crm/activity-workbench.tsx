"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  Plus,
  Search,
  StickyNote,
  UsersRound,
  X,
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

const ACTIVITY_TYPES = [
  { value: "all", label: "All", icon: null },
  { value: "note", label: "Notes", icon: StickyNote },
  { value: "call", label: "Calls", icon: Phone },
  { value: "meeting", label: "Meetings", icon: UsersRound },
  { value: "email", label: "Emails", icon: Mail },
  { value: "sms", label: "SMS", icon: MessageSquareText },
] as const;

const activityIcons = {
  note: StickyNote,
  call: Phone,
  meeting: UsersRound,
  email: Mail,
  sms: MessageSquareText,
} as const;

const inputClassName =
  "border-[var(--dashboard-border)] bg-[var(--dashboard-input)] text-[var(--dashboard-fg)] placeholder:text-[var(--dashboard-subtle)]";

function resolveActivityType(entry: Pick<ContactActivityRecord, "action" | "metadata">) {
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

function googleBadges(entry: Pick<ContactActivityRecord, "metadata">) {
  const google = entry.metadata?.google;
  if (!google || typeof google !== "object") return [];
  const status = google as Record<string, unknown>;
  return [
    status.calendar === "created" ? { label: "Calendar event created", icon: CalendarDays } : null,
    status.gmail === "sent" ? { label: "Gmail sent", icon: Mail } : null,
  ].filter((b): b is { label: string; icon: typeof CalendarDays } => b !== null);
}

function contactName(contact: Pick<ContactOption, "firstName" | "lastName">) {
  return `${contact.firstName} ${contact.lastName}`.trim() || "Unnamed contact";
}

function formatGroupLabel(raw: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === yesterday.getTime()) return "Yesterday";

  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 7) return "Earlier this week";
  if (diffDays <= 14) return "Last week";
  return raw.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupActivities(activities: ContactActivityRecord[]) {
  const groups: { label: string; activities: ContactActivityRecord[] }[] = [];
  let currentLabel: string | null = null;
  for (const activity of activities) {
    const label = formatGroupLabel(new Date(activity.createdAt));
    if (label !== currentLabel) {
      groups.push({ label, activities: [activity] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].activities.push(activity);
    }
  }
  return groups;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [presetType, setPresetType] = useState("note");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createSelectedContactCrmActivityAction,
    { status: "idle" },
  );

  const prevStatus = useRef(state.status);
  useEffect(() => {
    if (state.status === "success" && prevStatus.current !== "success") {
      if (state.message) toast.success(state.message);
      formRef.current?.reset();
      prevStatus.current = state.status;
    } else if (state.status === "error" && state.message) {
      toast.error(state.message);
      prevStatus.current = state.status;
    }
  }, [state]);

  const filtered = useMemo(() => {
    let result = activities;
    if (activeType !== "all") {
      result = result.filter((a) => resolveActivityType(a) === activeType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.summary.toLowerCase().includes(q) ||
          a.contactFirstName.toLowerCase().includes(q) ||
          a.contactLastName.toLowerCase().includes(q) ||
          (a.companyName ?? "").toLowerCase().includes(q) ||
          (a.contactEmail ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [activities, activeType, searchQuery]);

  const grouped = useMemo(() => groupActivities(filtered), [filtered]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: activities.length };
    for (const t of ["note", "call", "meeting", "email", "sms"] as const) {
      map[t] = activities.filter((a) => resolveActivityType(a) === t).length;
    }
    return map;
  }, [activities]);

  function openForm(type: string) {
    setPresetType(type);
    setShowForm(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* ── Timeline feed ── */}
      <div className="grid content-start gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--dashboard-icon)]" />
          <input
            type="text"
            placeholder="Search activities, contacts, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] pl-10 pr-4 text-sm text-[var(--dashboard-fg)] outline-none placeholder:text-[var(--dashboard-subtle)] transition focus:border-[var(--dashboard-accent-border)]"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-icon)] hover:text-[var(--dashboard-fg)]"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {ACTIVITY_TYPES.map((type) => {
            const isActive = activeType === type.value;
            const count = counts[type.value] ?? 0;
            return (
              <button
                key={type.value}
                onClick={() => setActiveType(type.value)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold tracking-wide transition ${
                  isActive
                    ? "border-[var(--dashboard-accent-border)] bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]"
                    : "border-[var(--dashboard-border)] bg-[var(--dashboard-control)] text-[var(--dashboard-soft)] hover:bg-[var(--dashboard-hover)] hover:text-[var(--dashboard-fg)]"
                }`}
              >
                {type.icon ? <type.icon className="size-3.5" /> : null}
                {type.label}
                <span className="ml-0.5 rounded-md bg-[var(--dashboard-elevated)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <AnimatePresence mode="popLayout">
          {grouped.length > 0 ? (
            grouped.map((group, gi) => (
              <m.div
                key={group.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.04, ease: "easeOut" }}
              >
                <div className="sticky top-0 z-10 -mx-1 mb-2 rounded-xl bg-[var(--dashboard-bg)]/85 px-3 py-2 backdrop-blur-md">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--dashboard-icon)]">
                    {group.label}
                  </p>
                </div>
                <div className="relative ml-4 border-l-2 border-[var(--dashboard-border)] pl-6">
                  {group.activities.map((entry) => (
                    <ActivityTimelineCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </m.div>
            ))
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-8 text-center"
            >
              <p className="font-display text-2xl font-bold tracking-wide text-[var(--dashboard-fg)]">
                {searchQuery || activeType !== "all"
                  ? "No matching activities"
                  : "No activity yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                {searchQuery || activeType !== "all"
                  ? "Try adjusting your search or filters."
                  : "Log your first call, meeting, note, or email to start tracking touchpoints."}
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sidebar ── */}
      <div className="grid content-start gap-4">
        {/* Quick actions */}
        {canWrite ? (
          <div>
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">
              Quick actions
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton icon={Phone} label="Log call" onClick={() => openForm("call")} />
              <ActionButton icon={StickyNote} label="Add note" onClick={() => openForm("note")} />
              <ActionButton icon={UsersRound} label="Meeting" onClick={() => openForm("meeting")} />
              <ActionButton icon={Mail} label="Send email" onClick={() => openForm("email")} />
            </div>
          </div>
        ) : null}

        {/* Activity form */}
        <AnimatePresence>
          {canWrite && showForm ? (
            <m.form
              ref={formRef}
              action={formAction}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden rounded-[22px] border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 sm:p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">
                  Log activity
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-[var(--dashboard-icon)] transition hover:text-[var(--dashboard-fg)]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="wf_contact">Contact</Label>
                  <Select
                    id="wf_contact"
                    name="contactId"
                    className={inputClassName}
                    defaultValue={selectedContactId ?? ""}
                    placeholder="Choose contact"
                    required
                    options={contacts.map((c) => ({
                      label: `${contactName(c)}${c.companyName ? ` - ${c.companyName}` : ""}`,
                      value: c.id,
                    }))}
                  />
                  {state.fieldErrors?.contactId ? (
                    <p className="text-xs text-red-100">{state.fieldErrors.contactId[0]}</p>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="wf_type">Type</Label>
                    <Select
                      id="wf_type"
                      name="type"
                      className={inputClassName}
                      defaultValue={presetType}
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
                    <Label htmlFor="wf_outcome">Outcome</Label>
                    <Select
                      id="wf_outcome"
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
                  <Label htmlFor="wf_subject">Subject</Label>
                  <Input
                    id="wf_subject"
                    name="subject"
                    placeholder="Discovery call follow-up"
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="wf_body">Details</Label>
                  <Textarea
                    id="wf_body"
                    name="body"
                    placeholder="What happened, what was promised, and what should happen next?"
                    className={inputClassName}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="wf_scheduledAt">Scheduled time</Label>
                    <Input
                      id="wf_scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      className={inputClassName}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wf_duration">Duration (min)</Label>
                    <Input
                      id="wf_duration"
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
                    <Label htmlFor="wf_attendee">Attendee email</Label>
                    <Input
                      id="wf_attendee"
                      name="attendeeEmail"
                      type="email"
                      placeholder="lead@example.com"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-elevated)] p-3">
                  <label className="flex items-start gap-2 text-xs leading-5 text-[var(--dashboard-muted)]">
                    <input
                      type="checkbox"
                      name="syncToGoogleCalendar"
                      disabled={!integrationStatus.hasCalendarScope}
                      className="mt-1"
                    />
                    <span>
                      Create a Google Calendar event for meeting activities.
                      {!integrationStatus.hasCalendarScope ? (
                        <span className="mt-0.5 block text-[var(--dashboard-icon)]">
                          Connect Google with Calendar permission first.
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-xs leading-5 text-[var(--dashboard-muted)]">
                    <input
                      type="checkbox"
                      name="sendWithGmail"
                      disabled={!integrationStatus.hasGmailScope}
                      className="mt-1"
                    />
                    <span>
                      Send this email activity through Gmail now.
                      {!integrationStatus.hasGmailScope ? (
                        <span className="mt-0.5 block text-[var(--dashboard-icon)]">
                          Connect Google with Gmail permission first.
                        </span>
                      ) : null}
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-11 rounded-full bg-[var(--dashboard-accent)] font-bold text-[var(--dashboard-accent-foreground)] hover:bg-[var(--dashboard-accent-hover)]"
                >
                  {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Plus className="mr-1.5 size-4" />}
                  Save activity
                </Button>
              </div>
            </m.form>
          ) : null}
        </AnimatePresence>

        {/* Google connect */}
        {!integrationStatus.hasCalendarScope && !integrationStatus.hasGmailScope ? (
          integrationStatus.configured ? (
            <GoogleConnectButton />
          ) : (
            <div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--dashboard-accent)]">
                Google not configured
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
                Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, then configure the Google
                OAuth callback at /api/auth/callback/google.
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-3 py-2.5 text-xs font-bold text-[var(--dashboard-soft)] transition hover:border-[var(--dashboard-accent-border)] hover:bg-[var(--dashboard-accent-soft)] hover:text-[var(--dashboard-accent)]"
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  );
}

function ActivityTimelineCard({ entry }: { entry: ContactActivityRecord }) {
  const type = resolveActivityType(entry);
  const Icon = activityIcons[type] ?? StickyNote;
  const badges = googleBadges(entry);
  const scheduledAt =
    typeof entry.metadata?.scheduledAt === "string" && entry.metadata.scheduledAt
      ? entry.metadata.scheduledAt
      : null;
  const outcome =
    typeof entry.metadata?.outcome === "string" ? entry.metadata.outcome : null;
  const duration =
    typeof entry.metadata?.durationMinutes === "number" ? entry.metadata.durationMinutes : null;
  const bodyText =
    typeof entry.metadata?.body === "string" && entry.metadata.body.length > 0
      ? entry.metadata.body
      : null;
  const [expanded, setExpanded] = useState(false);
  const displayName = contactName({
    firstName: entry.contactFirstName,
    lastName: entry.contactLastName,
  });

  return (
    <m.article
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative mb-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-3 transition hover:border-[var(--dashboard-accent-border)]"
    >
      <div className="absolute -left-[26px] top-4 size-2.5 rounded-full border-2 border-[var(--dashboard-accent-border)] bg-[var(--dashboard-bg)]" />

      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--dashboard-accent-soft)] text-[var(--dashboard-accent)]">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--dashboard-fg)]">
                {entry.summary}
              </p>
              <Link
                href={`/crm/contacts/${entry.contactId}`}
                className="mt-0.5 inline-block truncate text-xs font-bold text-[var(--dashboard-accent)] transition hover:text-[var(--dashboard-accent-hover)]"
              >
                {displayName}
                {entry.companyName ? (
                  <span className="font-normal text-[var(--dashboard-soft)]">
                    {" "}· {entry.companyName}
                  </span>
                ) : null}
              </Link>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[11px] font-bold tabular-nums text-[var(--dashboard-icon)]">
              {new Date(entry.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--dashboard-icon)]">
            {outcome ? (
              <span className="inline-flex items-center gap-1 capitalize">
                <CheckCircle2 className="size-3" />
                {outcome.replace("_", " ")}
              </span>
            ) : null}
            {duration ? <span>{duration} min</span> : null}
            {scheduledAt ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                {new Date(scheduledAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}{" "}
                {new Date(scheduledAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            ) : null}
          </div>

          {/* Google badges */}
          {badges.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--dashboard-accent-border)] bg-[var(--dashboard-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--dashboard-accent)]"
                >
                  <badge.icon className="size-3" />
                  {badge.label}
                </span>
              ))}
            </div>
          ) : null}

          {/* Expandable body */}
          {bodyText ? (
            <>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--dashboard-accent)] transition hover:text-[var(--dashboard-accent-hover)]"
              >
                {expanded ? "Hide details" : "Show details"}
              </button>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <m.p
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 overflow-hidden text-sm leading-6 text-[var(--dashboard-muted)]"
                  >
                    {bodyText}
                  </m.p>
                ) : null}
              </AnimatePresence>
            </>
          ) : null}

          {/* Action label */}
          <p className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dashboard-icon)] opacity-50">
            <Clock3 className="size-3" />
            {entry.action.replace(/\./g, " - ").replaceAll("_", " ")}
          </p>
        </div>
      </div>
    </m.article>
  );
}
