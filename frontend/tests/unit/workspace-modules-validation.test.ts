import { describe, expect, it } from "vitest";

import {
  addTeamMemberSchema,
  automationSchema,
  campaignSchema,
  workspaceSettingsSchema,
} from "@/lib/validations/workspace-modules";

describe("workspace module validation", () => {
  it("accepts only deterministic in-app automation rules", () => {
    expect(
      automationSchema.safeParse({
        name: "Proposal follow-up",
        description: "",
        status: "active",
        triggerType: "deal_moved_to_proposal",
        actionType: "create_follow_up_reminder",
      }).success,
    ).toBe(true);
    expect(
      automationSchema.safeParse({
        name: "Unsupported send",
        description: "",
        status: "active",
        triggerType: "deal_moved_to_proposal",
        actionType: "send_external_email",
      }).success,
    ).toBe(false);
  });

  it("rejects negative campaign budgets", () => {
    expect(
      campaignSchema.safeParse({
        name: "Launch",
        channel: "email",
        objective: "",
        status: "draft",
        budgetCents: "-1",
        startsAt: "",
        endsAt: "",
      }).success,
    ).toBe(false);
  });

  it("does not allow adding another workspace owner", () => {
    expect(addTeamMemberSchema.safeParse({ email: "owner@example.com", role: "owner" }).success).toBe(false);
  });

  it("normalizes workspace currency codes", () => {
    const result = workspaceSettingsSchema.parse({
      timezone: "UTC",
      currency: "usd",
      brandVoice: "",
      emailFromName: "",
      requireContentReview: true,
    });
    expect(result.currency).toBe("USD");
  });
});

