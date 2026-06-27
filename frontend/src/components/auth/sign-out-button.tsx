"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  /** Render as a compact icon-only button (used in collapsed sidebar). */
  iconOnly?: boolean;
};

export function SignOutButton({ iconOnly = false }: SignOutButtonProps) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signOut}
      aria-label="Sign out"
      title="Sign out"
      className={cn(
        "border-white/10 bg-white/[0.045] font-bold",
        "text-[var(--dashboard-sidebar-muted)] transition-colors",
        "hover:border-white/20 hover:bg-white/[0.08] hover:text-[var(--dashboard-sidebar-fg)]",
        iconOnly ? "size-9 rounded-lg p-0 justify-center" : "rounded-full px-4",
      )}
    >
      <LogOut className="size-4 shrink-0" />
      {!iconOnly && <span>Sign out</span>}
    </Button>
  );
}
