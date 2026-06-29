import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { socialAccount } from "@/lib/db/schema";

function id() {
  return crypto.randomUUID();
}

type SocialAccountInput = {
  workspaceId: string;
  platform: string;
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenExpiresAt?: Date | null;
};

export async function upsertSocialAccount(input: SocialAccountInput) {
  const existing = await db
    .select({ id: socialAccount.id })
    .from(socialAccount)
    .where(
      and(
        eq(socialAccount.workspaceId, input.workspaceId),
        eq(socialAccount.platform, input.platform),
      ),
    )
    .limit(1);

  if (existing.length) {
    await db
      .update(socialAccount)
      .set({
        accountName: input.accountName,
        accountId: input.accountId,
        accessToken: input.accessToken,
        refreshToken: input.refreshToken ?? null,
        tokenExpiresAt: input.tokenExpiresAt ?? null,
      })
      .where(
        and(
          eq(socialAccount.workspaceId, input.workspaceId),
          eq(socialAccount.platform, input.platform),
        ),
      );
    return existing[0].id;
  }

  const socialAccountId = id();
  await db.insert(socialAccount).values({
    id: socialAccountId,
    workspaceId: input.workspaceId,
    platform: input.platform,
    accountName: input.accountName,
    accountId: input.accountId,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? null,
    tokenExpiresAt: input.tokenExpiresAt ?? null,
  });
  return socialAccountId;
}

export async function removeSocialAccount(workspaceId: string, platform: string) {
  await db
    .delete(socialAccount)
    .where(
      and(
        eq(socialAccount.workspaceId, workspaceId),
        eq(socialAccount.platform, platform),
      ),
    );
}
