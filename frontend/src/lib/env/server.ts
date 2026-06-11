import "server-only";

import { z } from "zod";

const serverEnvSchema = z
  .object({
    DATABASE_URI: z.string().url().startsWith("postgresql://"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    AUTH_EMAIL_WEBHOOK_URL: z.string().url().optional(),
    AUTH_EMAIL_WEBHOOK_SECRET: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    AI_BACKEND_URL: z.string().url().optional(),
    AI_BACKEND_SHARED_SECRET: z.string().min(32).optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production" && env.BETTER_AUTH_SECRET.length < 32) {
      context.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_SECRET"],
        message: "BETTER_AUTH_SECRET must be at least 32 characters in production.",
      });
    }

    if (
      Boolean(env.AUTH_EMAIL_WEBHOOK_URL) !==
      Boolean(env.AUTH_EMAIL_WEBHOOK_SECRET)
    ) {
      context.addIssue({
        code: "custom",
        path: ["AUTH_EMAIL_WEBHOOK_URL"],
        message:
          "Configure both AUTH_EMAIL_WEBHOOK_URL and AUTH_EMAIL_WEBHOOK_SECRET, or leave both unset.",
      });
    }

    if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
      context.addIssue({
        code: "custom",
        path: ["GOOGLE_CLIENT_ID"],
        message:
          "Configure both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or leave both unset.",
      });
    }

    if (
      Boolean(env.AI_BACKEND_URL) !==
      Boolean(env.AI_BACKEND_SHARED_SECRET)
    ) {
      context.addIssue({
        code: "custom",
        path: ["AI_BACKEND_URL"],
        message:
          "Configure both AI_BACKEND_URL and AI_BACKEND_SHARED_SECRET, or leave both unset.",
      });
    }
  });

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URI: process.env.DATABASE_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  AUTH_EMAIL_WEBHOOK_URL: process.env.AUTH_EMAIL_WEBHOOK_URL || undefined,
  AUTH_EMAIL_WEBHOOK_SECRET:
    process.env.AUTH_EMAIL_WEBHOOK_SECRET || undefined,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || undefined,
  AI_BACKEND_URL: process.env.AI_BACKEND_URL || undefined,
  AI_BACKEND_SHARED_SECRET:
    process.env.AI_BACKEND_SHARED_SECRET || undefined,
  NODE_ENV: process.env.NODE_ENV,
});
