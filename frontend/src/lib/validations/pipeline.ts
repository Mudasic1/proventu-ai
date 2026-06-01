import { z } from "zod";

const optionalId = z
  .string()
  .trim()
  .transform((value) => value || undefined);

const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || undefined);

export const dealSchema = z.object({
  title: z.string().trim().min(2, "Enter a deal title."),
  contactId: optionalId,
  stageId: z.string().trim().min(1, "Choose a pipeline stage."),
  value: z.coerce.number().min(0, "Enter a positive deal value."),
  expectedCloseAt: optionalDate,
  notes: z.string().trim().optional(),
});

export const moveDealSchema = z.object({
  stageId: z.string().trim().min(1, "Choose a destination stage."),
});

export const closeDealSchema = z
  .object({
    outcome: z.enum(["won", "lost"]),
    lostReason: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.outcome === "lost" && !value.lostReason) {
      context.addIssue({
        code: "custom",
        message: "Add a reason before closing a deal as lost.",
        path: ["lostReason"],
      });
    }
  });

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Enter a follow-up title."),
  contactId: optionalId,
  dealId: optionalId,
  dueAt: z.string().trim().min(1, "Choose a due date."),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().trim().optional(),
});

export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
