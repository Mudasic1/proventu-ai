import "../../envConfig";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/neon-http";
import { betterAuth } from "better-auth";

const databaseUrl = process.env.DATABASE_URI;

if (!databaseUrl) {
  throw new Error("DATABASE_URI is required to generate the Better Auth schema.");
}

// The CLI cannot load modules guarded by `server-only`, so keep this schema-only
// config aligned with the database-backed features enabled in the runtime config.
export const auth = betterAuth({
  database: drizzleAdapter(drizzle(databaseUrl), {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    storage: "database",
  },
});
