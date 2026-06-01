import { Settings2 } from "lucide-react";

import { BusinessProfileForm } from "@/components/onboarding/business-profile-form";
import { requirePermission } from "@/lib/permissions/rbac";
import { updateWorkspaceProfileAction } from "@/server/actions/onboarding";
import { getWorkspaceProfile } from "@/server/queries/workspaces";

export default async function WorkspaceSettingsPage() {
  const context = await requirePermission("settings:read");
  const { profile, primaryOffer } = await getWorkspaceProfile(
    context.workspaceId,
  );

  return (
    <section>
      <p className="section-kicker">Workspace settings</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.09em]">
        Keep your business context current.
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9eaea8]">
        CRM and pipeline records remain scoped to this workspace. Update the
        shared business profile without changing your existing revenue data.
      </p>

      <div className="mt-7 rounded-[26px] border border-white/[0.09] bg-[#0b1916]/82 p-5 sm:p-7">
        <p className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#d8ff62]">
          <Settings2 className="size-4" />
          Workspace profile
        </p>
        <BusinessProfileForm
          action={updateWorkspaceProfileAction}
          mode="edit"
          defaults={{
            businessName: profile?.businessName,
            industry: profile?.industry,
            targetAudience: profile?.targetAudience,
            brandVoice: profile?.brandVoice,
            productsServices: profile?.productsServices,
            salesProcess: profile?.salesProcess,
            offerName: primaryOffer?.name,
            offerDescription: primaryOffer?.description,
          }}
        />
      </div>
    </section>
  );
}
