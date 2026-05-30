import "./envConfig";

import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.DATABASE_DIRECT_URI ?? process.env.DATABASE_URI;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_DIRECT_URI or DATABASE_URI is required to run Drizzle commands.",
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
