import { describe, expect, it } from "vitest";

import {
  closeDealSchema,
  dealSchema,
  taskSchema,
} from "@/lib/validations/pipeline";

describe("pipeline validation", () => {
  it("requires a loss reason for lost deals", () => {
    expect(closeDealSchema.safeParse({ outcome: "lost", lostReason: "" }).success).toBe(false);
    expect(closeDealSchema.safeParse({ outcome: "lost", lostReason: "Budget paused" }).success).toBe(true);
  });

  it("rejects negative deal values", () => {
    expect(
      dealSchema.safeParse({
        title: "Annual support",
        contactId: "",
        stageId: "stage-1",
        value: "-10",
        expectedCloseAt: "",
        notes: "",
      }).success,
    ).toBe(false);
  });

  it("requires a due date for follow-up tasks", () => {
    expect(
      taskSchema.safeParse({
        title: "Call prospect",
        contactId: "",
        dealId: "",
        dueAt: "",
        priority: "high",
        notes: "",
      }).success,
    ).toBe(false);
  });
});
