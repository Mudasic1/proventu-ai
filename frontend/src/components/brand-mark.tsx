import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <span className="relative flex size-9 items-center justify-center rounded-[13px] bg-[#d8ff62] text-[#10211c] shadow-[0_0_36px_rgba(216,255,98,0.2)]">
      <span className="absolute inset-[5px] rounded-[9px] border border-[#10211c]/15" />
      <Sparkles className="relative size-4" strokeWidth={2.4} />
    </span>
  );
}
