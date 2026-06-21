import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { socialAccount } from "@/lib/db/schema";

export async function listSocialAccounts(workspaceId: string) {
  return db
    .select({
      id: socialAccount.id,
      platform: socialAccount.platform,
      accountName: socialAccount.accountName,
      accountId: socialAccount.accountId,
      tokenExpiresAt: socialAccount.tokenExpiresAt,
      createdAt: socialAccount.createdAt,
    })
    .from(socialAccount)
    .where(eq(socialAccount.workspaceId, workspaceId));
}
