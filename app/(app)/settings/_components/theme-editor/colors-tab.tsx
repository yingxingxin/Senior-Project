"use client";

import { useState } from "react";
import { Stack } from "@/components/ui/spacing";
import { Muted } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { ColorPickerItem } from "./color-picker-item";
import { COLOR_TOKENS, type AdvancedTheme } from "./types";

/**
 * Colors Tab - Mode-Aware Color Editor
 *
 * Displays all color tokens organized by category:
 * - Primary colors (primary, secondary, accent)
 * - Semantic colors (destructive, muted)
 * - Surface colors (base, card, popover)
 *
 * Mode Awareness:
 * - Shows indicator for current light/dark mode
 * - Edits apply to mode-specific color fields (*_light or *_dark)
 * - Layout handles mapping generic updates to mode-specific fields
 *
 * Each color is editable via inline expandable color picker.
 * Accordion behavior: only one color picker expanded at a time.
 */

interface ColorsTabProps {
  theme: AdvancedTheme;
  onChange: (updates: Partial<AdvancedTheme>) => void;
}

export function ColorsTab({ theme, onChange }: ColorsTabProps) {
  const [expandedColorKey, setExpandedColorKey] = useState<string | null>(null);

  const handleColorChange = (key: keyof AdvancedTheme, value: string) => {
    onChange({ [key]: value });
  };

  const handleToggleExpanded = (key: string) => {
    setExpandedColorKey(expandedColorKey === key ? null : key);
  };

  const primaryColors = COLOR_TOKENS.filter((t) => t.category === "primary");
  const semanticColors = COLOR_TOKENS.filter((t) => t.category === "semantic");
  const surfaceColors = COLOR_TOKENS.filter((t) => t.category === "surface");

  return (
    <Stack gap="default" className="pt-6">
      {/* Mode Indicator */}
      <div className="px-4 py-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Editing: <span className="text-primary">
                <span className="dark:hidden">Light</span>
                <span className="hidden dark:inline">Dark</span>
                {' '}Mode Colors
              </span>
            </p>
            <Muted variant="small">
              Toggle the theme mode to edit colors for the other variant
            </Muted>
          </div>
          <div className="h-3 w-3 rounded-full bg-yellow-400 dark:bg-slate-700" />
        </div>
      </div>

      {/* Primary Colors */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Primary Colors</h3>
        <div className="space-y-2">
          {primaryColors.map((color) => (
            <ColorPickerItem
              key={color.key}
              colorKey={color.key}
              label={color.label}
              description={color.description}
              value={(theme[color.key] as string) ?? "220 70% 50%"}
              onChange={(value) => handleColorChange(color.key, value)}
              isExpanded={expandedColorKey === color.key}
              onToggleExpanded={() => handleToggleExpanded(color.key)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Semantic Colors */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Semantic Colors</h3>
        <div className="space-y-2">
          {semanticColors.map((color) => (
            <ColorPickerItem
              key={color.key}
              colorKey={color.key}
              label={color.label}
              description={color.description}
              value={(theme[color.key] as string) ?? "220 70% 50%"}
              onChange={(value) => handleColorChange(color.key, value)}
              isExpanded={expandedColorKey === color.key}
              onToggleExpanded={() => handleToggleExpanded(color.key)}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Surface Colors */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Surface Colors</h3>
        <Muted variant="small" className="mb-4">
          Background colors for different UI surfaces
        </Muted>
        <div className="space-y-2">
          {surfaceColors.map((color) => (
            <ColorPickerItem
              key={color.key}
              colorKey={color.key}
              label={color.label}
              description={color.description}
              value={(theme[color.key] as string) ?? "0 0% 100%"}
              onChange={(value) => handleColorChange(color.key, value)}
              isExpanded={expandedColorKey === color.key}
              onToggleExpanded={() => handleToggleExpanded(color.key)}
            />
          ))}
        </div>
      </div>
    </Stack>
  );
}
