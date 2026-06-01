import { redirect } from "next/navigation";
import { CircleCheck, SkipForward, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { BusinessProfileForm } from "@/components/onboarding/business-profile-form";
import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth-session";
import { getWorkspaceContext } from "@/lib/permissions/workspace";
import {
  createWorkspaceAction,
  skipWorkspaceSetupAction,
} from "@/server/actions/onboarding";

const outcomes = [
  "A workspace scoped to your account",
  "Your first offer and business profile",
  "An eight-stage sales pipeline",
];

export default async function OnboardingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/signin");
  const context = await getWorkspaceContext();

  if (context) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07110f] px-5 py-7 text-[#f4f2ea] sm:px-7 lg:py-10">
      <div className="ambient-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-lg font-bold tracking-[-0.06em]">
            Sales<span className="text-[#d8ff62]">Easy</span>
          </span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <section className="lg:sticky lg:top-10">
            <p className="section-kicker">Workspace onboarding</p>
            <h1 className="mt-5 font-display text-6xl font-bold leading-[0.86] tracking-[-0.1em] sm:text-7xl">
              Give your sales day
              <span className="block text-[#d8ff62]">a clear starting point.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-[#a8b6b1]">
              Add the minimum business context required for CRM, pipeline, and
              dashboard work. Keep the business context clear for your team.
            </p>
            <div className="mt-7 grid gap-2.5">
              {outcomes.map((outcome) => (
                <p
                  key={outcome}
                  className="flex items-center gap-2.5 text-sm text-[#c3ceca]"
                >
                  <CircleCheck className="size-4 text-[#d8ff62]" />
                  {outcome}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/[0.1] bg-[#0b1916]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8ff62]">
              <Sparkles className="size-4" />
              Core context
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.08em]">
              Set up your workspace.
            </h2>
            <p className="mt-3 mb-7 text-sm leading-6 text-[#98a8a2]">
              You can refine these details later from workspace settings.
            </p>
            <BusinessProfileForm action={createWorkspaceAction} />
            <div className="mt-4 border-t border-white/[0.08] pt-4">
              <form action={skipWorkspaceSetupAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full rounded-full text-[#a8b6b1] hover:bg-white/[0.06] hover:text-[#f4f2ea]"
                >
                  <SkipForward className="size-4" />
                  Skip for now
                </Button>
              </form>
              <p className="mt-2 text-center text-xs leading-5 text-[#71817b]">
                We will create a starter workspace. Add your business details later
                from settings.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
