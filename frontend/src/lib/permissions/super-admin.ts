import "server-only";

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export async function requireSuperAdminPageContext() {
  const session = await getCurrentSession();
  if (!session) redirect("/signin");

  const [account] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!account?.isSuperAdmin) notFound();

  return { session, account };
}

