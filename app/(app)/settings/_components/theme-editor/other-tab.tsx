"use client";

import { Stack } from "@/components/ui/spacing";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FieldGroup, FieldTitle, FieldDescription, Field } from "@/components/ui/field";
import { SelectField } from "./select-field";
import type { AdvancedTheme } from "./types";

/**
 * Other Tab
 *
 * Advanced theme adjustments:
 * - HSL adjustments (hue shift, saturation, lightness)
 * - Border radius
 * - Spacing scale
 * - Shadow strength
 */

interface OtherTabProps {
  theme: AdvancedTheme;
  onChange: (updates: Partial<AdvancedTheme>) => void;
}

const RADIUS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "0.3rem", label: "Small" },
  { value: "0.5rem", label: "Medium" },
  { value: "0.75rem", label: "Large" },
  { value: "1rem", label: "X-Large" },
];

const SPACING_OPTIONS = [
  { value: "0.75", label: "Compact (0.75x)" },
  { value: "1", label: "Default (1x)" },
  { value: "1.25", label: "Comfortable (1.25x)" },
  { value: "1.5", label: "Spacious (1.5x)" },
];

const SHADOW_OPTIONS = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
];

export function OtherTab({ theme, onChange }: OtherTabProps) {
  return (
    <Stack gap="default" className="pt-6">
      {/* HSL Adjustments */}
      <FieldGroup>
        <div>
          <FieldTitle>HSL Adjustments</FieldTitle>
          <FieldDescription>
            Global color modifiers applied to all colors
          </FieldDescription>
        </div>

        {/* Hue Shift */}
        <Field>
          <div className="flex items-center justify-between mb-2">
            <Label>Hue Shift</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {theme.hue_shift ?? 0}°
            </span>
          </div>
          <Slider
            value={[theme.hue_shift ?? 0]}
            onValueChange={(value) => onChange({ hue_shift: value[0] })}
            min={-180}
            max={180}
            step={1}
          />
          <FieldDescription>
            Rotate all colors on the color wheel (-180° to +180°)
          </FieldDescription>
        </Field>

        {/* Saturation */}
        <Field>
          <div className="flex items-center justify-between mb-2">
            <Label>Saturation</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {theme.saturation_adjust ?? 0}%
            </span>
          </div>
          <Slider
            value={[theme.saturation_adjust ?? 0]}
            onValueChange={(value) => onChange({ saturation_adjust: value[0] })}
            min={-50}
            max={50}
            step={1}
          />
          <FieldDescription>
            Increase or decrease color intensity (-50% to +50%)
          </FieldDescription>
        </Field>

        {/* Lightness */}
        <Field>
          <div className="flex items-center justify-between mb-2">
            <Label>Lightness</Label>
            <span className="text-sm font-mono text-muted-foreground">
              {theme.lightness_adjust ?? 0}%
            </span>
          </div>
          <Slider
            value={[theme.lightness_adjust ?? 0]}
            onValueChange={(value) => onChange({ lightness_adjust: value[0] })}
            min={-50}
            max={50}
            step={1}
          />
          <FieldDescription>
            Make colors lighter or darker (-50% to +50%)
          </FieldDescription>
        </Field>
      </FieldGroup>

      <Separator />

      {/* Border Radius */}
      <SelectField
        label="Border Radius"
        description="Roundness of corners and borders"
        value={theme.radius ?? "0.5rem"}
        options={RADIUS_OPTIONS}
        onChange={(value) => onChange({ radius: value })}
      />

      <Separator />

      {/* Spacing Scale */}
      <SelectField
        label="Spacing Scale"
        description="Multiplier for gaps between components"
        value={theme.spacing_scale?.toString() ?? "1"}
        options={SPACING_OPTIONS}
        onChange={(value) => onChange({ spacing_scale: parseFloat(value) })}
      />

      <Separator />

      {/* Shadow Strength */}
      <SelectField
        label="Shadow Strength"
        description="Intensity of drop shadows"
        value={theme.shadow_strength ?? "medium"}
        options={SHADOW_OPTIONS}
        onChange={(value) =>
          onChange({
            shadow_strength: value as "none" | "subtle" | "medium" | "strong",
          })
        }
      />
    </Stack>
  );
}
