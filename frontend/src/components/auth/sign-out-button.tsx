"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
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
      className="rounded-full border-white/[0.1] bg-white/[0.035] px-4 font-bold text-[#d5ddd9] hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      onClick={signOut}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
