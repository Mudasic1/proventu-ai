import "server-only";

import { serverEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors/app-error";
import {
  campaignPlanResponseSchema,
  type CampaignPlanResponse,
} from "@/lib/validations/ai-campaigns";

type CampaignPlanBackendRequest = {
  request_key: string;
  workspace_id: string;
  user_id: string;
  campaign_id: string;
  goal: string;
  target_audience: string;
  business_profile: {
    business_name: string;
    industry: string;
    target_audience: string;
    brand_voice: string;
    products_services: string;
    sales_process: string;
  };
  offer: {
    id: string;
    name: string;
    description: string;
  };
};

export async function requestCampaignPlan(
  payload: CampaignPlanBackendRequest,
): Promise<CampaignPlanResponse> {
  if (!serverEnv.AI_BACKEND_URL || !serverEnv.AI_BACKEND_SHARED_SECRET) {
    throw new AppError(
      "INTERNAL_ERROR",
      "AI campaign planning is not configured yet.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${serverEnv.AI_BACKEND_URL}/v1/campaign-plans`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ai-backend-secret": serverEnv.AI_BACKEND_SHARED_SECRET,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new AppError(
      "INTERNAL_ERROR",
      "AI campaign planning is temporarily unavailable. Try again shortly.",
    );
  }

  if (!response.ok) {
    throw new AppError(
      "INTERNAL_ERROR",
      "AI campaign planning did not complete. Review the inputs and try again.",
    );
  }

  const parsed = campaignPlanResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "AI campaign planning returned an invalid result. Try again shortly.",
    );
  }
  return parsed.data;
}
