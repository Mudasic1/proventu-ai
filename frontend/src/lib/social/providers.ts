type SocialProviderConfig = {
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
};

export const providerNames = ["linkedin", "facebook", "instagram"] as const;
export type Platform = (typeof providerNames)[number];

export function buildProviders(
  _baseUrl: string,
  env: {
    LINKEDIN_CLIENT_ID?: string;
    LINKEDIN_CLIENT_SECRET?: string;
    FACEBOOK_CLIENT_ID?: string;
    FACEBOOK_CLIENT_SECRET?: string;
  },
): Partial<Record<Platform, SocialProviderConfig>> {
  const providers: Partial<Record<Platform, SocialProviderConfig>> = {};

  if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
    providers.linkedin = {
      name: "LinkedIn",
      authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
      tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
      scopes: ["openid", "profile", "w_member_social", "email"],
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    };
  }

  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    const metaScopes = [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
    ];

    providers.facebook = {
      name: "Facebook",
      authorizeUrl: "https://www.facebook.com/v25.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v25.0/oauth/access_token",
      scopes: metaScopes,
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    };

    providers.instagram = {
      name: "Instagram",
      authorizeUrl: "https://www.facebook.com/v25.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v25.0/oauth/access_token",
      scopes: [
        "instagram_basic",
        "instagram_content_publish",
        "pages_show_list",
        "pages_read_engagement",
      ],
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    };
  }

  return providers;
}
