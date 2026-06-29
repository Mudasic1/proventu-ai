"use client";

import { CheckCircle2, ExternalLink, Plug, Unplug } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConnectedAccount = {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  tokenExpiresAt: Date | null;
  createdAt: Date;
};

type Props = {
  connectedAccounts: ConnectedAccount[];
  workspaceId: string;
  configuredPlatforms: Record<string, boolean>;
};

const platforms = [
  {
    key: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    description: "Post to your profile or company page",
  },
  {
    key: "facebook",
    name: "Facebook",
    color: "#1877F2",
    description: "Publish to your Facebook Page",
  },
  {
    key: "instagram",
    name: "Instagram",
    color: "#E4405F",
    description: "Share to your professional account",
  },
] as const;

function LinkedinLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" className="size-8 shrink-0">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className="size-8 shrink-0">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 shrink-0">
      <defs>
        <linearGradient id="ig-logo" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F58529" />
          <stop offset="0.25" stopColor="#DD2A7B" />
          <stop offset="0.5" stopColor="#8134AF" />
          <stop offset="0.75" stopColor="#515BD4" />
          <stop stopColor="#1877F2" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-logo)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

const logoMap: Record<string, React.FC> = {
  linkedin: LinkedinLogo,
  facebook: FacebookLogo,
  instagram: InstagramLogo,
};

export function SocialConnectorSection({
  connectedAccounts,
  workspaceId,
  configuredPlatforms,
}: Props) {
  const connectedMap = new Map(connectedAccounts.map((a) => [a.platform, a]));

  return (
    <section className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-control)] p-4 shadow-[var(--dashboard-shadow)] backdrop-blur sm:p-5">
      <div>
        <p className="section-kicker">Connected accounts</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-wide">
          Link your social platforms for direct publishing.
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
          Authenticate once to publish posts directly from Proventu AI.
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const account = connectedMap.get(platform.key);
          const isConfigured = configuredPlatforms[platform.key];
          const isConnected = !!account;
          const Logo = logoMap[platform.key];

          return (
            <article
              key={platform.key}
              className="relative flex flex-col rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-input)] p-4 shadow-sm transition hover:shadow-md"
            >
              {isConnected ? (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-green-400">
                  <CheckCircle2 className="size-3" />
                  Connected
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                {Logo ? <Logo /> : null}
                <div>
                  <h3 className="font-display text-lg font-bold tracking-wide" style={{ color: platform.color }}>
                    {platform.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-tight text-[var(--dashboard-subtle)]">
                    {platform.description}
                  </p>
                </div>
              </div>
              {isConnected && account ? (
                <div className="mt-3 space-y-1.5 border-t border-[var(--dashboard-border)] pt-3">
                  <p className="truncate text-xs text-[var(--dashboard-icon)]">
                    <span className="font-medium text-[var(--dashboard-fg)]">Account:</span>{" "}
                    {account.accountName}
                  </p>
                  {account.tokenExpiresAt ? (
                    <p className="text-xs text-[var(--dashboard-subtle)]">
                      Token expires{" "}
                      {new Date(account.tokenExpiresAt).toLocaleDateString()}
                    </p>
                  ) : null}
                  <form action="/api/social/disconnect" method="POST" className="mt-2">
                    <input type="hidden" name="workspaceId" value={workspaceId} />
                    <input type="hidden" name="platform" value={platform.key} />
                    <Button type="submit" variant="destructive" size="sm" className="w-full text-[10px] font-extrabold uppercase tracking-[0.08em]">
                      <Unplug className="size-3" />
                      Disconnect
                    </Button>
                  </form>
                </div>
              ) : isConfigured ? (
                <Button asChild variant="default" size="sm" className="mt-2 w-full text-[10px] font-extrabold uppercase tracking-[0.08em]">
                  <a href={`/api/social/connect/${platform.key}?workspaceId=${workspaceId}`}>
                    <Plug className="size-3" />
                    Connect {platform.name}
                  </a>
                </Button>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-control)] px-3 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--dashboard-subtle)]">
                    <ExternalLink className="mr-1 inline size-3 align-text-top" />
                    Configure{" "}
                    <span className="text-[var(--dashboard-icon)]">
                      {platform.key === "linkedin"
                        ? "LINKEDIN_CLIENT_ID"
                        : "FACEBOOK_CLIENT_ID"}
                    </span>{" "}
                    in env
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
