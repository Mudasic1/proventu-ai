import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env/server";
import { removeSocialAccount } from "@/server/mutations/social-accounts";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const workspaceId = formData.get("workspaceId");
  const platform = formData.get("platform");

  if (typeof workspaceId !== "string" || typeof platform !== "string") {
    return NextResponse.json({ error: "Missing workspaceId or platform" }, { status: 400 });
  }

  await removeSocialAccount(workspaceId, platform);

  return NextResponse.redirect(
    `${serverEnv.BETTER_AUTH_URL}/marketing/posts?toast=${platform}-disconnected`,
  );
}
