import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// Spacing Components
// Following our typography system patterns for consistency
// ============================================================================

// ----------------------------------------------------------------------------
// Base Props
// ----------------------------------------------------------------------------

interface BaseSpacingProps {
  className?: string
  children: React.ReactNode
}

// ----------------------------------------------------------------------------
// Stack - Vertical spacing between elements
// Purpose: Replaces raw space-y-* utilities with semantic component
// ----------------------------------------------------------------------------

interface StackProps extends BaseSpacingProps {
  gap?: "tight" | "default" | "loose" | "section"
  as?: "div" | "section" | "article" | "main" | "aside" | "nav" | "header" | "footer" | "fieldset"
}

export function Stack({
  gap = "default",
  as: Component = "div",
  className,
  children,
  ...props
}: StackProps & React.HTMLAttributes<HTMLElement>) {
  const styles = {
    tight: "space-y-4 sm:space-y-3",     // Header groups, element pairs that should be close
    default: "space-y-6",                 // Component-level spacing (forms, cards, etc)
    loose: "space-y-8",                   // Section-level spacing (page sections)
    section: "space-y-12",                // Page-level major sections (large breaks)
  }

  return (
    <Component
      className={cn(styles[gap], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Inline - Horizontal spacing between elements
// Purpose: Flex-based horizontal layouts with consistent gaps
// ----------------------------------------------------------------------------

interface InlineProps extends BaseSpacingProps {
  gap?: "tight" | "default" | "loose"
  as?: "div" | "span"
  align?: "start" | "center" | "end"
}

export function Inline({
  gap = "default",
  as: Component = "div",
  align = "start",
  className,
  children,
  ...props
}: InlineProps & React.HTMLAttributes<HTMLElement>) {
  const gaps = {
    tight: "gap-2",
    default: "gap-4",
    loose: "gap-6",
  }

  const alignments = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  }

  return (
    <Component
      className={cn("flex flex-wrap", gaps[gap], alignments[align], className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ----------------------------------------------------------------------------
// Grid - Grid layout with responsive columns and gaps
// Purpose: Consistent grid patterns across the app
// ----------------------------------------------------------------------------

interface GridProps extends BaseSpacingProps {
  gap?: "tight" | "default" | "loose"
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  as?: "div" | "section" | "ul"
}

export function Grid({
  gap = "default",
  cols = 1,
  as: Component = "div",
  className,
  children,
  ...props
}: GridProps & React.HTMLAttributes<HTMLElement>) {
  const gaps = {
    tight: "gap-4",
    default: "gap-6",
    loose: "gap-8",
  }

  const columns = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-12",
  }

  return (
    <Component
      className={cn("grid", columns[cols], gaps[gap], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
