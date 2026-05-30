import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { sendAuthEmail } from "@/lib/auth-email";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { serverEnv } from "@/lib/env/server";

export const auth = betterAuth({
  appName: "SalesEasyAI",
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        kind: "password-reset",
        to: user.email,
        subject: "Reset your SalesEasyAI password",
        text: `Reset your SalesEasyAI password using this secure link: ${url}`,
        url,
      });
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 3 },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: "jwe",
    },
  },
  account: {
    encryptOAuthTokens: true,
  },
  verification: {
    storeIdentifier: "hashed",
  },
  advanced: {
    cookiePrefix: "saleseasyai",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: serverEnv.NODE_ENV === "production",
    },
  },
});
