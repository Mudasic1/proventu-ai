import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { serverEnv } from "@/lib/env/server";
import { buildProviders } from "@/lib/social/providers";
import { upsertSocialAccount } from "@/server/mutations/social-accounts";

async function exchangeLinkedInToken(
  code: string,
  config: { clientId: string; clientSecret: string; redirectUri: string },
) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    throw new Error(`LinkedIn userinfo failed: ${err}`);
  }

  const userData = await userRes.json();

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? null,
    expiresIn: tokenData.expires_in,
    accountName: userData.name ?? "LinkedIn User",
    accountId: userData.sub,
  };
}

async function exchangeMetaToken(
  code: string,
  config: { clientId: string; clientSecret: string; redirectUri: string },
  platform: string,
) {
  const tokenUrl = new URL("https://graph.facebook.com/v25.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", config.clientId);
  tokenUrl.searchParams.set("client_secret", config.clientSecret);
  tokenUrl.searchParams.set("redirect_uri", config.redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Meta token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();
  const userAccessToken = tokenData.access_token;

  // Get user profile
  const meRes = await fetch(
    `https://graph.facebook.com/v25.0/me?fields=id,name&access_token=${userAccessToken}`,
  );

  if (!meRes.ok) {
    const err = await meRes.text();
    throw new Error(`Meta me endpoint failed: ${err}`);
  }

  const meData = await meRes.json();

  if (platform === "instagram") {
    // Get pages to find the linked Instagram account
    const pagesRes = await fetch(
      `https://graph.facebook.com/v25.0/${meData.id}/accounts?fields=id,name,instagram_business_account&access_token=${userAccessToken}`,
    );

    if (!pagesRes.ok) {
      const err = await pagesRes.text();
      throw new Error(`Meta pages list failed: ${err}`);
    }

    const pagesData = await pagesRes.json();
    const firstPage = pagesData.data?.[0];
    const igAccount = firstPage?.instagram_business_account;

    return {
      accessToken: userAccessToken,
      refreshToken: null,
      expiresIn: tokenData.expires_in,
      accountName: igAccount ? `Instagram: ${firstPage.name}` : meData.name,
      accountId: igAccount?.id ?? meData.id,
    };
  }

  return {
    accessToken: userAccessToken,
    refreshToken: null,
    expiresIn: tokenData.expires_in,
    accountName: meData.name,
    accountId: meData.id,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const platform = (await params).platform;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=${platform}_auth_denied`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=missing_params`,
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("social_oauth_state")?.value;
  cookieStore.delete("social_oauth_state");

  // Decode state to get CSRF token and workspaceId
  let decoded: string;
  try {
    decoded = Buffer.from(state, "base64").toString("utf-8");
  } catch {
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=invalid_state`,
    );
  }

  const colonIdx = decoded.indexOf(":");
  const csrfToken = decoded.slice(0, colonIdx);
  const workspaceId = decoded.slice(colonIdx + 1);

  if (!storedState || storedState !== csrfToken) {
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=csrf_mismatch`,
    );
  }

  const providers = buildProviders(serverEnv.BETTER_AUTH_URL, {
    LINKEDIN_CLIENT_ID: serverEnv.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: serverEnv.LINKEDIN_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: serverEnv.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: serverEnv.FACEBOOK_CLIENT_SECRET,
  });

  const config = providers[platform as keyof typeof providers];
  if (!config) {
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=platform_not_configured`,
    );
  }

  const redirectUri = `${serverEnv.BETTER_AUTH_URL}/api/social/callback/${platform}`;

  try {
    let result: {
      accessToken: string;
      refreshToken: string | null;
      expiresIn: number;
      accountName: string;
      accountId: string;
    };

    if (platform === "linkedin") {
      result = await exchangeLinkedInToken(code, {
        ...config,
        redirectUri,
      });
    } else {
      result = await exchangeMetaToken(code, { ...config, redirectUri }, platform);
    }

    const tokenExpiresAt = result.expiresIn
      ? new Date(Date.now() + result.expiresIn * 1000)
      : null;

    await upsertSocialAccount({
      workspaceId,
      platform,
      accountName: result.accountName,
      accountId: result.accountId,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiresAt,
    });
  } catch (err) {
    console.error(`Social callback error (${platform}):`, err);
    return NextResponse.redirect(
      `${serverEnv.BETTER_AUTH_URL}/marketing/posts?error=${platform}_token_exchange_failed`,
    );
  }

  return NextResponse.redirect(
    `${serverEnv.BETTER_AUTH_URL}/marketing/posts?toast=${platform}-connected`,
  );
}
