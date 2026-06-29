import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center rounded-[13px] bg-[var(--dashboard-accent)] text-[var(--dashboard-accent-foreground)] shadow-[0_0_34px_rgba(255,92,92,0.28)]">
      <span className="absolute inset-[5px] rounded-[9px] border border-white/20" />
      <Sparkles className="relative size-4" strokeWidth={2.4} />
    </span>
  );
}
