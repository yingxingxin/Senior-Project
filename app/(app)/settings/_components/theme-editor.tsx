"use client";

import { useState } from "react";
import { Stack } from "@/components/ui/spacing";
import { Muted } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemePreviewCard } from "./theme-preview-card";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Editor Component
 *
 * Simplified theme selection grid.
 * Shows pre-built themes that users can select from.
 * Advanced customization is available via /settings/themes/editor route.
 *
 * User selections are saved to user_theme_settings table.
 */

interface ThemeEditorProps {
  themes: Theme[];
  currentThemeId?: number | null;
  onThemeSelect: (themeId: number) => Promise<void>;
}

export function ThemeEditor({
  themes,
  currentThemeId,
  onThemeSelect,
}: ThemeEditorProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<number | undefined>(
    currentThemeId ?? themes[0]?.id
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeSelect = async (themeId: number) => {
    setSelectedThemeId(themeId);
    setIsSaving(true);
    try {
      await onThemeSelect(themeId);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack gap="default">
      {/* Theme Grid */}
      <RadioGroup
        value={selectedThemeId?.toString()}
        onValueChange={(value) => handleThemeSelect(Number(value))}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {themes.map((theme) => (
          <Label
            key={theme.id}
            htmlFor={`theme-${theme.id}`}
            className="cursor-pointer"
          >
            <RadioGroupItem
              value={theme.id.toString()}
              id={`theme-${theme.id}`}
              className="sr-only"
            />
            <ThemePreviewCard
              theme={theme}
              isSelected={selectedThemeId === theme.id}
            />
          </Label>
        ))}
      </RadioGroup>

      {isSaving && (
        <Muted variant="small" className="text-center">
          Applying theme...
        </Muted>
      )}
    </Stack>
  );
}
