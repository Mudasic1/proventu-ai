import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  creditGrant,
  creditLedgerEntry,
  creditWallet,
} from "@/lib/db/schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function id() {
  return crypto.randomUUID();
}

async function ensureWallet(tx: Transaction, workspaceId: string) {
  const [existing] = await tx
    .select()
    .from(creditWallet)
    .where(eq(creditWallet.workspaceId, workspaceId))
    .limit(1);

  if (existing) return existing;

  const [created] = await tx
    .insert(creditWallet)
    .values({ id: id(), workspaceId })
    .returning();

  return created;
}

export async function grantWorkspaceCredits(
  tx: Transaction,
  input: {
    workspaceId: string;
    sourceKind: "monthly" | "top_up" | "manual" | "migration";
    sourceId: string;
    operationKey: string;
    credits: number;
    expiresAt?: Date | null;
    reason: string;
  },
) {
  const existing = await tx
    .select({ id: creditGrant.id })
    .from(creditGrant)
    .where(eq(creditGrant.operationKey, input.operationKey))
    .limit(1);

  if (existing.length > 0) {
    return { applied: false };
  }

  const wallet = await ensureWallet(tx, input.workspaceId);

  const [updatedWallet] = await tx
    .update(creditWallet)
    .set({
      spendableCredits: sql`${creditWallet.spendableCredits} + ${input.credits}`,
      version: sql`${creditWallet.version} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(creditWallet.id, wallet.id))
    .returning();

  await tx.insert(creditGrant).values({
    id: id(),
    workspaceId: input.workspaceId,
    walletId: wallet.id,
    sourceKind: input.sourceKind,
    sourceId: input.sourceId,
    operationKey: input.operationKey,
    grantedCredits: input.credits,
    availableCredits: input.credits,
    expiresAt: input.expiresAt ?? null,
  });

  await tx.insert(creditLedgerEntry).values({
    id: id(),
    workspaceId: input.workspaceId,
    walletId: wallet.id,
    entryType: "grant",
    operationKey: `${input.operationKey}:ledger`,
    spendableDelta: input.credits,
    spendableAfter: updatedWallet.spendableCredits,
    reservedAfter: updatedWallet.reservedCredits,
    unresolvedAfter: updatedWallet.unresolvedCredits,
    sourceType: input.sourceKind,
    sourceId: input.sourceId,
    reason: input.reason,
  });

  return { applied: true };
}
