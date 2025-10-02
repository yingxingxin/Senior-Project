import type React from "react"
import { cn } from "@/lib/utils"

/**
 * Auth Layout Components
 *
 * These components allow pages to override the default layout structure
 * when needed (e.g., for multi-step onboarding flows with progress indicators).
 *
 * Most auth pages don't need these - the layout provides sensible defaults.
 * Use these when you need:
 * - Custom header content (progress bars, navigation)
 * - Different content widths (lg, xl, 2xl)
 * - Footer navigation (back/next buttons)
 */

/**
 * AuthLayoutHeader
 * Optional header for auth pages (e.g., progress indicators)
 */
export function AuthLayoutHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("w-full pb-6 md:pb-8", className)}
      {...props}
    >
      {children}
    </header>
  )
}

/**
 * AuthLayoutContent
 * Main content area with configurable width and centering
 */
type ContentWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full"

interface AuthLayoutContentProps extends React.HTMLAttributes<HTMLElement> {
  width?: ContentWidth
  center?: boolean
}

export function AuthLayoutContent({
  children,
  width = "md",
  center = true,
  className,
  ...props
}: AuthLayoutContentProps) {
  const widthClasses: Record<ContentWidth, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  }

  return (
    <main
      className={cn(
        "flex-1 w-full",
        center && "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <div className={cn("w-full", widthClasses[width])}>
        {children}
      </div>
    </main>
  )
}

/**
 * AuthLayoutFooter
 * Optional footer for auth pages (e.g., navigation buttons)
 */
export function AuthLayoutFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn("w-full pt-6 md:pt-8", className)}
      {...props}
    >
      {children}
    </footer>
  )
}
