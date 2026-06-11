import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.email("Enter a valid email address.").optional(),
);

const optionalDuration = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.coerce.number().int().min(5).max(480).optional(),
);

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
    sendWithGmail: z
      .union([z.literal("on"), z.literal("yes"), z.literal("true")])
      .optional(),
    syncToGoogleCalendar: z
      .union([z.literal("on"), z.literal("yes"), z.literal("true")])
      .optional(),
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
