"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  initialActionState,
  type ActionState,
} from "@/lib/errors/app-error";

type ProfileDefaults = {
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  brandVoice?: string;
  productsServices?: string;
  offerName?: string;
  offerDescription?: string;
  salesProcess?: string;
};

type BusinessProfileFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: ProfileDefaults;
  mode?: "create" | "edit";
  readOnly?: boolean;
};

function FieldError({
  errors,
  name,
}: {
  errors?: Record<string, string[] | undefined>;
  name: string;
}) {
  const message = errors?.[name]?.[0];
  return message ? <p className="text-xs text-red-200">{message}</p> : null;
}

export function BusinessProfileForm({
  action,
  defaults,
  mode = "create",
  readOnly = false,
}: BusinessProfileFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            name="businessName"
            defaultValue={defaults?.businessName}
            placeholder="Northstar Studio"
            required
            disabled={readOnly}
          />
          <FieldError errors={state.fieldErrors} name="businessName" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            defaultValue={defaults?.industry}
            placeholder="Web design services"
            required
            disabled={readOnly}
          />
          <FieldError errors={state.fieldErrors} name="industry" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="targetAudience">Ideal customer</Label>
        <Textarea
          id="targetAudience"
          name="targetAudience"
          defaultValue={defaults?.targetAudience}
          placeholder="Small service businesses that need a clearer website and lead flow."
          required
          disabled={readOnly}
        />
        <FieldError errors={state.fieldErrors} name="targetAudience" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="brandVoice">Brand voice</Label>
          <Input
            id="brandVoice"
            name="brandVoice"
            defaultValue={defaults?.brandVoice}
            placeholder="Clear, expert, practical"
            required
            disabled={readOnly}
          />
          <FieldError errors={state.fieldErrors} name="brandVoice" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="offerName">Primary offer</Label>
          <Input
            id="offerName"
            name="offerName"
            defaultValue={defaults?.offerName}
            placeholder="Website growth sprint"
            required
            disabled={readOnly}
          />
          <FieldError errors={state.fieldErrors} name="offerName" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="productsServices">Products or services</Label>
        <Textarea
          id="productsServices"
          name="productsServices"
          defaultValue={defaults?.productsServices}
          placeholder="Conversion-focused websites, landing pages, and optimization."
          required
          disabled={readOnly}
        />
        <FieldError errors={state.fieldErrors} name="productsServices" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="offerDescription">Offer details</Label>
        <Textarea
          id="offerDescription"
          name="offerDescription"
          defaultValue={defaults?.offerDescription}
          placeholder="A two-week sprint that includes strategy, design, and launch support."
          required
          disabled={readOnly}
        />
        <FieldError errors={state.fieldErrors} name="offerDescription" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="salesProcess">Current sales process</Label>
        <Textarea
          id="salesProcess"
          name="salesProcess"
          defaultValue={defaults?.salesProcess}
          placeholder="Lead arrives, discovery call, proposal, negotiation, close."
          required
          disabled={readOnly}
        />
        <FieldError errors={state.fieldErrors} name="salesProcess" />
      </div>

      {readOnly ? null : <Button
        type="submit"
        size="lg"
        className="h-11 rounded-full bg-[#d8ff62] px-5 font-bold text-[#10211c] hover:bg-[#e5ff92]"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : mode === "create" ? (
          <Sparkles className="size-4" />
        ) : (
          <Save className="size-4" />
        )}
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Create revenue workspace"
            : "Save workspace profile"}
      </Button>}
    </form>
  );
}
