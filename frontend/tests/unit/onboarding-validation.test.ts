import { describe, expect, it } from "vitest";

import { onboardingSchema } from "@/lib/validations/onboarding";

const validProfile = {
  businessName: "Northstar Studio",
  industry: "Design services",
  targetAudience: "Small teams launching new products",
  brandVoice: "Clear and practical",
  productsServices: "Brand strategy and web design retainers",
  offerName: "Launch Sprint",
  offerDescription: "A focused four-week launch package",
  salesProcess: "Discovery call, proposal, review, and close",
};

describe("onboardingSchema", () => {
  it("accepts a complete business profile", () => {
    expect(onboardingSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects incomplete revenue context", () => {
    const result = onboardingSchema.safeParse({
      ...validProfile,
      targetAudience: "SMBs",
      salesProcess: "",
    });
    expect(result.success).toBe(false);
  });
});
