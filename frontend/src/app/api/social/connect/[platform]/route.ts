import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { serverEnv } from "@/lib/env/server";
import { buildProviders } from "@/lib/social/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }
  const providers = buildProviders(serverEnv.BETTER_AUTH_URL, {
    LINKEDIN_CLIENT_ID: serverEnv.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: serverEnv.LINKEDIN_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: serverEnv.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: serverEnv.FACEBOOK_CLIENT_SECRET,
  });

  const config = providers[platform as keyof typeof providers];
  if (!config) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csrfToken = crypto.randomUUID();
  const state = Buffer.from(`${csrfToken}:${workspaceId}`).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set("social_oauth_state", csrfToken, {
    httpOnly: true,
    secure: serverEnv.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const redirectUri = `${serverEnv.BETTER_AUTH_URL}/api/social/callback/${platform}`;
  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", config.scopes.join(" "));
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl.toString());
}
