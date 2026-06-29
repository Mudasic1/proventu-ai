import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.email("Enter a valid email address.").optional(),
);

const requiredEmail = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.email("Enter a valid attendee email address."),
);

const optionalDuration = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.coerce.number().int().min(5).max(480).optional(),
);

const requiredDuration = z.coerce.number().int().min(5).max(480);

const googleSyncValue = z.union([
  z.literal("on"),
  z.literal("yes"),
  z.literal("true"),
]);

export const crmActivityTypes = [
  "note",
  "call",
  "meeting",
  "email",
  "sms",
] as const;

export const crmActivitySchema = z
  .object({
    type: z.enum(crmActivityTypes),
    subject: z.string().trim().min(2, "Add a short subject.").max(160),
    body: z.string().trim().min(2, "Add activity details.").max(8_000),
    outcome: z.enum(["planned", "completed", "no_answer", "left_message"]).default("completed"),
    scheduledAt: optionalText,
    durationMinutes: optionalDuration,
    attendeeEmail: optionalEmail,
    sendWithGmail: googleSyncValue.optional(),
    syncToGoogleCalendar: googleSyncValue.optional(),
  })
  .superRefine((value, context) => {
    if (value.syncToGoogleCalendar && value.type !== "meeting") {
      context.addIssue({
        code: "custom",
        message: "Only meetings can be synced to Google Calendar.",
        path: ["syncToGoogleCalendar"],
      });
    }

    if (value.sendWithGmail && value.type !== "email") {
      context.addIssue({
        code: "custom",
        message: "Only email activities can be sent with Gmail.",
        path: ["sendWithGmail"],
      });
    }

    if (value.scheduledAt) {
      const parsedDate = new Date(value.scheduledAt);
      if (Number.isNaN(parsedDate.getTime())) {
        context.addIssue({
          code: "custom",
          message: "Enter a valid date and time.",
          path: ["scheduledAt"],
        });
      }
    }

    if (value.outcome === "planned") {
      if (!value.scheduledAt) {
        context.addIssue({
          code: "custom",
          message: "Choose a scheduled time for planned activities.",
          path: ["scheduledAt"],
        });
      } else {
        const parsedDate = new Date(value.scheduledAt);
        if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() <= Date.now()) {
          context.addIssue({
            code: "custom",
            message: "Scheduled time must be in the future.",
            path: ["scheduledAt"],
          });
        }
      }
    }

    if (value.type === "meeting" && value.syncToGoogleCalendar && !value.scheduledAt) {
      context.addIssue({
        code: "custom",
        message: "Choose a meeting time before syncing to Google Calendar.",
        path: ["scheduledAt"],
      });
    }

    if (value.type === "email" && value.sendWithGmail && !value.attendeeEmail) {
      context.addIssue({
        code: "custom",
        message: "Add a recipient email before sending with Gmail.",
        path: ["attendeeEmail"],
      });
    }
  });

export type CrmActivityInput = z.infer<typeof crmActivitySchema>;

export const appointmentScheduleSchema = z
  .object({
    contactId: z.string().trim().min(1, "Choose a contact."),
    subject: z.string().trim().min(2, "Add a short subject.").max(160),
    body: z.string().trim().min(2, "Add appointment details.").max(8_000),
    scheduledAt: z.string().trim().min(1, "Choose a date and time."),
    durationMinutes: requiredDuration,
    attendeeEmail: requiredEmail,
    syncToGoogleCalendar: googleSyncValue,
    sendWithGmail: googleSyncValue,
  })
  .superRefine((value, context) => {
    const parsedDate = new Date(value.scheduledAt);
    if (Number.isNaN(parsedDate.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid date and time.",
        path: ["scheduledAt"],
      });
      return;
    }

    if (parsedDate.getTime() <= Date.now()) {
      context.addIssue({
        code: "custom",
        message: "Appointment time must be in the future.",
        path: ["scheduledAt"],
      });
    }
  })
  .transform((value) => ({
    contactId: value.contactId,
    activity: {
      type: "meeting" as const,
      outcome: "planned" as const,
      subject: value.subject,
      body: value.body,
      scheduledAt: value.scheduledAt,
      durationMinutes: value.durationMinutes,
      attendeeEmail: value.attendeeEmail,
      syncToGoogleCalendar: value.syncToGoogleCalendar,
      sendWithGmail: value.sendWithGmail,
    },
  }));

export type AppointmentScheduleInput = z.infer<typeof appointmentScheduleSchema>;
