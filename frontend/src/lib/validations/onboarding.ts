import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Enter your business name."),
  industry: z.string().trim().min(2, "Enter your industry."),
  targetAudience: z
    .string()
    .trim()
    .min(8, "Describe the customers you want to reach."),
  brandVoice: z.string().trim().min(3, "Describe your brand voice."),
  productsServices: z
    .string()
    .trim()
    .min(8, "Describe the product or service you sell."),
  offerName: z.string().trim().min(2, "Enter your primary offer."),
  offerDescription: z
    .string()
    .trim()
    .min(8, "Describe what the customer receives."),
  salesProcess: z
    .string()
    .trim()
    .min(8, "Describe your current sales process."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
