import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.string().email("Enter a valid email address.").optional());

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().default(""),
  email: optionalEmail,
  phone: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  source: z.string().trim().min(1, "Choose a source."),
  status: z.enum(["lead", "qualified", "customer", "inactive"]),
  tags: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  confirmDuplicate: z.string().optional(),
});

export const noteSchema = z.object({
  note: z.string().trim().min(2, "Enter a note."),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() || null;
}

export function normalizePhone(value?: string) {
  const normalized = value?.replace(/[^\d+]/g, "");
  return normalized || null;
}

export function splitTags(value?: string) {
  return [...new Set((value ?? "").split(",").map((tag) => tag.trim()).filter(Boolean))];
}
