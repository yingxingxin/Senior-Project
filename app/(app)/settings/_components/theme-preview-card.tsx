"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Body, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Preview Card Component
 *
 * Shows a visual preview of a theme with:
 * - Theme name
 * - Color swatches (primary, secondary, accent)
 * - Selected state indicator
 *
 * Using inline styles to preview theme colors without applying globally.
 */

interface ThemePreviewCardProps {
  theme: Theme;
  isSelected: boolean;
}

export function ThemePreviewCard({ theme, isSelected }: ThemePreviewCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        "hover:shadow-lg hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Theme Preview */}
      <div className="p-4">
        <div className="mb-3">
          <Body className="font-semibold">{theme.name}</Body>
          <Muted variant="small">{theme.slug}</Muted>
        </div>

        {/* Color Swatches */}
        <div className="flex gap-2">
          {theme.primary && (
            <div
              className="h-12 w-full rounded-md border border-border"
              style={{ backgroundColor: `hsl(${theme.primary})` }}
              title="Primary color"
            />
          )}
          {theme.secondary && (
            <div
              className="h-12 w-full rounded-md border border-border"
              style={{ backgroundColor: `hsl(${theme.secondary})` }}
              title="Secondary color"
            />
          )}
          {theme.accent && (
            <div
              className="h-12 w-full rounded-md border border-border"
              style={{ backgroundColor: `hsl(${theme.accent})` }}
              title="Accent color"
            />
          )}
        </div>

        {/* Theme Properties */}
        <div className="mt-3 flex gap-4 text-xs">
          {theme.radius && (
            <Muted variant="small">
              Radius: <span className="text-foreground">{theme.radius}</span>
            </Muted>
          )}
          {theme.font && (
            <Muted variant="small">
              Font: <span className="text-foreground">{theme.font}</span>
            </Muted>
          )}
        </div>
      </div>
    </Card>
  );
}
