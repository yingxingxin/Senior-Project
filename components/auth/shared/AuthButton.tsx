"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const authButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--auth-card)] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)]",
        secondary:
          "border border-[var(--auth-button)] bg-transparent text-[var(--auth-button)] hover:bg-[var(--auth-button)]/10",
        link: "bg-transparent px-0 text-[var(--auth-link)] underline-offset-4 hover:text-[var(--auth-link-hover)] hover:underline focus-visible:ring-offset-0 focus-visible:ring-transparent",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof authButtonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: React.ReactNode
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  spinner?: React.ReactNode
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      startIcon,
      endIcon,
      spinner,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const label = isLoading ? loadingText ?? children : children

    return (
      <Comp
        ref={ref}
        className={cn(authButtonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading || undefined}
        aria-busy={isLoading || undefined}
        {...props}
      >
        <span className="flex min-w-0 items-center justify-center gap-2">
          {isLoading ? spinner ?? <Loader2 className="size-4 animate-spin" aria-hidden /> : startIcon}
          <span>{label}</span>
          {!isLoading && endIcon ? endIcon : null}
        </span>
      </Comp>
    )
  }
)
AuthButton.displayName = "AuthButton"

export { AuthButton, authButtonVariants }
