import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Variants from the UI kit: ink, lime, outline, ghost (.btn-*).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill border-field border-transparent font-bold text-button transition-[transform,background-color,color] duration-fast ease-out select-none active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "bg-ink text-app",
        lime: "bg-lime text-on-lime",
        outline:
          "h-10 border-ink bg-transparent px-4 text-xs uppercase tracking-wider before:size-1.5 before:rounded-full before:bg-current",
        ghost: "border-line bg-transparent",
      },
      size: {
        default: "h-button px-5.5",
        wide: "h-button w-full px-5.5",
      },
    },
    compoundVariants: [{ variant: "outline", className: "h-10 px-4" }],
    defaultVariants: { variant: "ink", size: "default" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
