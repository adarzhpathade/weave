import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// "night" = field on a forced-dark screen (login); "default" = field on the app surface.
const inputVariants = cva(
  "h-field w-full rounded-sm stroke-field px-4 text-body transition-colors duration-fast outline-none aria-invalid:border-missing",
  {
    variants: {
      tone: {
        default: "border-line bg-app text-ink placeholder:text-muted focus:border-ink",
        night:
          "border-night-line bg-transparent text-on-night placeholder:text-on-night placeholder:opacity-40 focus:border-lime focus-visible:outline-offset-2",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

type InputProps = ComponentProps<"input"> & VariantProps<typeof inputVariants>;

function Input({ className, tone, ...props }: InputProps) {
  return <input className={cn(inputVariants({ tone }), className)} {...props} />;
}

export { Input, inputVariants };
