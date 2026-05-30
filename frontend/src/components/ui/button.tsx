import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 shadow-[0_0_36px_rgba(255,255,255,0.18)] hover:scale-[1.02] hover:bg-emerald-200",
        accent:
          "bg-emerald-300 text-zinc-950 shadow-[0_0_40px_rgba(110,231,183,0.28)] hover:scale-[1.02] hover:bg-emerald-200",
        ghost:
          "text-zinc-200 hover:bg-white/10 hover:text-white",
        outline:
          "border border-white/12 bg-white/5 text-white backdrop-blur-md hover:scale-[1.02] hover:border-white/25 hover:bg-white/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
