import "server-only";

import {
  createGoogleCalendarEvent,
  getGoogleAccessForUser,
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_GMAIL_SEND_SCOPE,
  sendGmailMessage,
} from "@/lib/google/workspace";
import type { CrmActivityInput } from "@/lib/validations/crm-activities";
import { recordActivity } from "@/server/mutations/activity";
import { getContact } from "@/server/queries/contacts";
import { AppError } from "@/lib/errors/app-error";

type MutationContext = { workspaceId: string; userId: string; role: string };

function ownerScope(context: MutationContext) {
  return context.role === "sales_rep" ? context.userId : undefined;
}

function formatAction(input: CrmActivityInput) {
  return `contact.${input.type}_${input.outcome}`;
}

function defaultDuration(input: CrmActivityInput) {
  if (input.durationMinutes) return input.durationMinutes;
  return input.type === "meeting" ? 30 : 15;
}

export async function createCrmActivity(
  context: MutationContext,
  contactId: string,
  input: CrmActivityInput,
) {
  const contact = await getContact(
    context.workspaceId,
    contactId,
    ownerScope(context),
  );
  if (!contact) throw new AppError("NOT_FOUND", "Contact not found.");

  const recipientEmail = input.attendeeEmail || contact.email || undefined;
  const metadata: Record<string, unknown> = {
    type: input.type,
    outcome: input.outcome,
    scheduledAt: input.scheduledAt,
    durationMinutes: input.durationMinutes,
    attendeeEmail: recipientEmail,
    google: { calendar: "not_requested", gmail: "not_requested" },
  };

  if (input.syncToGoogleCalendar) {
    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      throw new AppError("VALIDATION_ERROR", "Choose a valid meeting time.");
    }
    const access = await getGoogleAccessForUser(context.userId, [
      GOOGLE_CALENDAR_SCOPE,
    ]);
    const duration = defaultDuration(input);
    const event = await createGoogleCalendarEvent({
      accessToken: access.accessToken,
      title: input.subject,
      description: input.body,
      start: scheduledAt,
      end: new Date(scheduledAt.getTime() + duration * 60_000),
      attendeeEmail: recipientEmail,
    });
    metadata.google = {
      ...(metadata.google as Record<string, unknown>),
      calendar: "created",
      calendarEventId: event.id,
      calendarEventLink: event.link,
    };
  }

  if (input.sendWithGmail) {
    if (!recipientEmail) {
      throw new AppError("VALIDATION_ERROR", "Add a recipient email first.");
    }
    const access = await getGoogleAccessForUser(context.userId, [
      GOOGLE_GMAIL_SEND_SCOPE,
    ]);
    const message = await sendGmailMessage({
      accessToken: access.accessToken,
      to: recipientEmail,
      subject: input.subject,
      body: input.body,
    });
    metadata.google = {
      ...(metadata.google as Record<string, unknown>),
      gmail: "sent",
      gmailMessageId: message.id,
      gmailThreadId: message.threadId,
    };
  }

  await recordActivity({
    workspaceId: context.workspaceId,
    actorUserId: context.userId,
    entityType: "contact",
    entityId: contactId,
    action: formatAction(input),
    summary: input.subject,
    metadata,
  });
}
