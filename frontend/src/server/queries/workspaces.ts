import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { businessProfile, offer } from "@/lib/db/schema";

export async function getWorkspaceProfile(workspaceId: string) {
  const [profile] = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.workspaceId, workspaceId))
    .limit(1);
  const [primaryOffer] = await db
    .select()
    .from(offer)
    .where(eq(offer.workspaceId, workspaceId))
    .limit(1);

  return { profile, primaryOffer };
}
