import { z } from "zod";

export const checkoutIdempotencyKeySchema = z
  .string()
  .min(8)
  .max(160)
  .regex(/^[A-Za-z0-9:_-]+$/);

export const subscriptionCheckoutSchema = z.object({
  planId: z.string().min(1),
  idempotencyKey: checkoutIdempotencyKeySchema.optional(),
});

export const topUpCheckoutSchema = z.object({
  packageId: z.string().min(1),
  idempotencyKey: checkoutIdempotencyKeySchema.optional(),
});
