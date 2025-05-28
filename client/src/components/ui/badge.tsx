
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary ring-1 ring-primary/20",
        secondary: "border-transparent bg-secondary/10 text-orange-700 ring-1 ring-secondary/20",
        destructive: "border-transparent bg-destructive/10 text-red-700 ring-1 ring-destructive/20",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-500/10 text-green-700 ring-1 ring-green-500/20",
        warning: "border-transparent bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20",
        info: "border-transparent bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20",
        // Game status specific variants
        win: "border-transparent bg-green-500/10 text-green-700 ring-1 ring-green-500/20 font-bold",
        loss: "border-transparent bg-red-500/10 text-red-700 ring-1 ring-red-500/20 font-bold",
        draw: "border-transparent bg-neutral-500/10 text-neutral-700 ring-1 ring-neutral-500/20 font-bold",
        upcoming: "border-transparent bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20",
        "in-progress": "border-transparent bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/20 animate-pulse",
        completed: "border-transparent bg-green-500/10 text-green-700 ring-1 ring-green-500/20",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
