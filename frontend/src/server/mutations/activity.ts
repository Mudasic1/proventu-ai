import "server-only";

import { db } from "@/lib/db";
import { activityEntry } from "@/lib/db/schema";

type ActivityInput = {
  workspaceId: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function recordActivity(input: ActivityInput) {
  await db.insert(activityEntry).values({
    id: crypto.randomUUID(),
    ...input,
  });
}
