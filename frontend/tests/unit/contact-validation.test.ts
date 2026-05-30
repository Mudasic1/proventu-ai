import { describe, expect, it } from "vitest";

import {
  contactSchema,
  normalizeEmail,
  normalizePhone,
  splitTags,
} from "@/lib/validations/contacts";

describe("contact validation", () => {
  it("normalizes duplicate lookup values", () => {
    expect(normalizeEmail("  OWNER@Example.COM ")).toBe("owner@example.com");
    expect(normalizePhone("+1 (555) 120-7788")).toBe("+15551207788");
  });

  it("deduplicates trimmed tags", () => {
    expect(splitTags(" referral, warm, referral ")).toEqual(["referral", "warm"]);
  });

  it("rejects malformed email addresses", () => {
    const result = contactSchema.safeParse({
      firstName: "Avery",
      lastName: "",
      email: "not-an-email",
      phone: "",
      companyName: "",
      source: "manual",
      status: "lead",
      tags: "",
      notes: "",
    });
    expect(result.success).toBe(false);
  });
});
