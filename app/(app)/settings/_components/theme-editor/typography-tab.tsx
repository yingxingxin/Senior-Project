"use client";

import { Stack } from "@/components/ui/spacing";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FieldGroup, FieldTitle, FieldDescription } from "@/components/ui/field";
import { SelectField } from "./select-field";
import type { AdvancedTheme } from "./types";

/**
 * Typography Tab
 *
 * Controls for font families and letter spacing:
 * - Sans-serif font (Inter, System UI, etc.)
 * - Serif font (Source Serif 4, Georgia, etc.)
 * - Monospace font (JetBrains Mono, Fira Code, etc.)
 * - Letter spacing (0 - 0.1em)
 */

interface TypographyTabProps {
  theme: AdvancedTheme;
  onChange: (updates: Partial<AdvancedTheme>) => void;
}

const SANS_SERIF_FONTS = [
  {
    value: "Inter, system-ui, sans-serif",
    label: "Inter",
    style: { fontFamily: "Inter, system-ui, sans-serif" }
  },
  {
    value: "system-ui, sans-serif",
    label: "System UI",
    style: { fontFamily: "system-ui, sans-serif" }
  },
  {
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    label: "Helvetica",
    style: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
  },
];

const SERIF_FONTS = [
  {
    value: "'Source Serif 4', Georgia, serif",
    label: "Source Serif 4",
    style: { fontFamily: "'Source Serif 4', Georgia, serif" }
  },
  {
    value: "Georgia, serif",
    label: "Georgia",
    style: { fontFamily: "Georgia, serif" }
  },
  {
    value: "'Times New Roman', Times, serif",
    label: "Times New Roman",
    style: { fontFamily: "'Times New Roman', Times, serif" }
  },
];

const MONOSPACE_FONTS = [
  {
    value: "'JetBrains Mono', monospace",
    label: "JetBrains Mono",
    style: { fontFamily: "'JetBrains Mono', monospace" }
  },
  {
    value: "'Fira Code', monospace",
    label: "Fira Code",
    style: { fontFamily: "'Fira Code', monospace" }
  },
  {
    value: "Monaco, 'Courier New', monospace",
    label: "Monaco",
    style: { fontFamily: "Monaco, 'Courier New', monospace" }
  },
];

export function TypographyTab({ theme, onChange }: TypographyTabProps) {
  const handleFontChange = (key: keyof AdvancedTheme, value: string) => {
    onChange({ [key]: value });
  };

  const handleLetterSpacingChange = (value: number[]) => {
    onChange({ letter_spacing: value[0] });
  };

  return (
    <Stack gap="default" className="pt-6">
      {/* Sans-Serif Font */}
      <SelectField
        label="Sans-Serif Font"
        description="Used for body text and UI elements"
        value={theme.font_sans ?? "Inter, system-ui, sans-serif"}
        options={SANS_SERIF_FONTS}
        onChange={(value) => handleFontChange("font_sans", value)}
      />

      <Separator />

      {/* Serif Font */}
      <SelectField
        label="Serif Font"
        description="Used for headings and emphasis"
        value={theme.font_serif ?? "'Source Serif 4', Georgia, serif"}
        options={SERIF_FONTS}
        onChange={(value) => handleFontChange("font_serif", value)}
      />

      <Separator />

      {/* Monospace Font */}
      <SelectField
        label="Monospace Font"
        description="Used for code and technical content"
        value={theme.font_mono ?? "'JetBrains Mono', monospace"}
        options={MONOSPACE_FONTS}
        onChange={(value) => handleFontChange("font_mono", value)}
      />

      <Separator />

      {/* Letter Spacing */}
      <FieldGroup>
        <div>
          <FieldTitle>Letter Spacing</FieldTitle>
          <FieldDescription>Adjust spacing between characters</FieldDescription>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Spacing</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {theme.letter_spacing?.toFixed(3) ?? "0.000"}em
            </span>
          </div>

          <Slider
            value={[theme.letter_spacing ?? 0]}
            onValueChange={handleLetterSpacingChange}
            min={0}
            max={0.1}
            step={0.001}
            className="w-full"
          />
        </div>
      </FieldGroup>
    </Stack>
  );
}
