import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Typography Components
// Following Material Design, Apple HIG, and shadcn/ui best practices
// ============================================================================

// ----------------------------------------------------------------------------
// Base Props
// ----------------------------------------------------------------------------

interface BaseTypographyProps {
  className?: string
  children: React.ReactNode
}

// ----------------------------------------------------------------------------
// Display - Hero text for landing pages and major sections
// ----------------------------------------------------------------------------

interface DisplayProps extends BaseTypographyProps {
  level?: 1 | 2
  as?: "h1" | "h2" | "p" | "div"
}

export function Display({
  level = 1,
  as,
  className,
  children,
  ...props
}: DisplayProps & React.HTMLAttributes<HTMLElement>) {
  const Component = as || (level === 1 ? "h1" : "h2")

  const styles = {
    1: "text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight",
    2: "text-3xl sm:text-4xl font-bold leading-tight tracking-tight",
  }

  return (
    <Component
      className={cn(styles[level], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Heading - Structural hierarchy (H1-H6)
// ----------------------------------------------------------------------------

interface HeadingProps extends BaseTypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span"
}

export function Heading({
  level = 1,
  as,
  className,
  children,
  ...props
}: HeadingProps & React.HTMLAttributes<HTMLHeadingElement>) {
  const styles = {
    1: "text-4xl font-semibold leading-tight tracking-tight",
    2: "text-3xl font-semibold leading-snug",
    3: "text-2xl font-semibold leading-snug",
    4: "text-xl font-semibold leading-normal",
    5: "text-lg font-medium leading-normal",
    6: "text-base font-medium leading-normal",
  }

  const headingProps = {
    className: cn(styles[level], className),
    ...props,
  }

  // Use custom component if 'as' is specified
  // TODO: Verify this
  if (as) {
    const Component = as
    return <Component {...headingProps}>{children}</Component>
  }

  // Otherwise use semantic heading tag based on level
  switch (level) {
    case 1:
      return <h1 {...headingProps}>{children}</h1>
    case 2:
      return <h2 {...headingProps}>{children}</h2>
    case 3:
      return <h3 {...headingProps}>{children}</h3>
    case 4:
      return <h4 {...headingProps}>{children}</h4>
    case 5:
      return <h5 {...headingProps}>{children}</h5>
    case 6:
      return <h6 {...headingProps}>{children}</h6>
    default:
      return <h1 {...headingProps}>{children}</h1>
  }
}

// ----------------------------------------------------------------------------
// Body - Primary content and paragraphs
// ----------------------------------------------------------------------------

interface BodyProps extends BaseTypographyProps {
  variant?: "default" | "large" | "small"
  as?: "p" | "span" | "div"
}

export function Body({
  variant = "default",
  as: Component = "p",
  className,
  children,
  ...props
}: BodyProps & React.HTMLAttributes<HTMLElement>) {
  const styles = {
    default: "text-base leading-relaxed",
    large: "text-lg lg:text-xl leading-relaxed",
    small: "text-sm leading-normal",
  }

  return (
    <Component
      className={cn(styles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Muted - Secondary text with muted foreground color
// ----------------------------------------------------------------------------

interface MutedProps extends BaseTypographyProps {
  variant?: "default" | "small" | "tiny"
  as?: "p" | "span" | "div"
}

export function Muted({
  variant = "default",
  as: Component = "p",
  className,
  children,
  ...props
}: MutedProps & React.HTMLAttributes<HTMLElement>) {
  const styles = {
    default: "text-base leading-relaxed text-muted-foreground",
    small: "text-sm leading-normal text-muted-foreground",
    tiny: "text-xs leading-normal text-muted-foreground",
  }

  return (
    <Component
      className={cn(styles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Caption - Labels, badges, and UI chrome
// ----------------------------------------------------------------------------

interface CaptionProps extends BaseTypographyProps {
  variant?: "default" | "uppercase" | "badge"
  as?: "label" | "span" | "div"
}

export function Caption({
  variant = "default",
  as: Component = "span",
  className,
  children,
  ...props
}: CaptionProps & React.HTMLAttributes<HTMLElement>) {
  const styles = {
    default: "text-xs font-medium leading-normal",
    uppercase: "text-xs font-semibold leading-normal uppercase tracking-wider",
    badge: "text-[10px] font-bold leading-normal uppercase tracking-wide",
  }

  return (
    <Component
      className={cn(styles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Code - Monospace text for code snippets (bonus)
// ----------------------------------------------------------------------------

interface CodeProps extends BaseTypographyProps {
  variant?: "inline" | "block"
}

export function Code({
  variant = "inline",
  className,
  children,
  ...props
}: CodeProps & React.HTMLAttributes<HTMLElement>) {
  const Component = variant === "inline" ? "code" : "pre"

  const styles = {
    inline: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
    block: "font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto",
  }

  return (
    <Component
      className={cn(styles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
