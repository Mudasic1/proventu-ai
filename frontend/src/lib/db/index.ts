import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "@/lib/db/schema";
import { serverEnv } from "@/lib/env/server";

const pool = new Pool({ connectionString: serverEnv.DATABASE_URI });
export const db = drizzle(pool, { schema });

