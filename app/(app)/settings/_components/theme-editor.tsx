"use client";

import { useState } from "react";
import { Stack } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { ThemePreviewCard } from "./theme-preview-card";
import { ThemeCustomizer } from "./theme-customizer";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Editor Component
 *
 * Architecture Decision:
 * - Shows grid of pre-built themes by default
 * - "Create Custom Theme" button toggles customizer panel
 * - Simplified from previous tabbed design
 *
 * This component handles both selecting pre-built themes and creating custom themes.
 * User selections are saved to user_theme_settings table.
 */

interface ThemeEditorProps {
  themes: Theme[];
  currentThemeId?: number | null;
  onThemeSelect: (themeId: number) => Promise<void>;
  onThemeCustomize: (customTheme: Partial<Theme>) => Promise<void>;
}

export function ThemeEditor({
  themes,
  currentThemeId,
  onThemeSelect,
  onThemeCustomize,
}: ThemeEditorProps) {
  const [selectedThemeId, setSelectedThemeId] = useState<number | undefined>(
    currentThemeId ?? themes[0]?.id
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handleThemeSelect = async (themeId: number) => {
    setSelectedThemeId(themeId);
    setIsSaving(true);
    try {
      await onThemeSelect(themeId);
      setShowCustomizer(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomThemeApply = async (customTheme: Partial<Theme>) => {
    setIsSaving(true);
    try {
      await onThemeCustomize(customTheme);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack gap="default">
      <div className="flex items-center justify-between">
        <Body>
          {showCustomizer
            ? "Customize your own theme with colors, fonts, and border radius"
            : "Select from our collection of hand-crafted themes"}
        </Body>
        <Button
          variant={showCustomizer ? "outline" : "default"}
          onClick={() => setShowCustomizer(!showCustomizer)}
        >
          <Paintbrush className="mr-2 h-4 w-4" />
          {showCustomizer ? "Browse Themes" : "Create Custom Theme"}
        </Button>
      </div>

      {showCustomizer ? (
        <ThemeCustomizer
          baseTheme={themes.find((t) => t.id === selectedThemeId)}
          onApply={handleCustomThemeApply}
          isSaving={isSaving}
        />
      ) : (
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
      )}
    </Stack>
  );
}
