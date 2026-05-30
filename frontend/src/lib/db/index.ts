import "server-only";

import { drizzle } from "drizzle-orm/neon-http";

import { serverEnv } from "@/lib/env/server";

export const db = drizzle(serverEnv.DATABASE_URI);
