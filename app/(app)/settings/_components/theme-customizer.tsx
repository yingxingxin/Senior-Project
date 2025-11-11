"use client";

import { useState } from "react";
import { Stack } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Customizer Component
 *
 * Architecture Decision:
 * - Color inputs use HSL format stored as strings (e.g., "220 70% 50%")
 * - Live preview updates as user modifies values
 * - Apply button commits changes to database
 *
 * Trade-offs:
 * - Using text inputs for HSL instead of visual color picker (simpler, more precise)
 * - Could enhance with visual color picker library later
 */

interface ThemeCustomizerProps {
  baseTheme?: Theme;
  onApply: (theme: Partial<Theme>) => Promise<void>;
  isSaving: boolean;
}

const RADIUS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "0.3rem", label: "Small" },
  { value: "0.5rem", label: "Medium" },
  { value: "0.75rem", label: "Large" },
  { value: "1rem", label: "X-Large" },
];

const FONT_OPTIONS = [
  { value: "system-ui", label: "System" },
  { value: "ui-serif", label: "Serif" },
  { value: "ui-monospace", label: "Monospace" },
  { value: "ui-sans-serif", label: "Sans-Serif" },
];

export function ThemeCustomizer({
  baseTheme,
  onApply,
  isSaving,
}: ThemeCustomizerProps) {
  const [customTheme, setCustomTheme] = useState<Partial<Theme>>({
    name: baseTheme?.name ?? "Custom Theme",
    slug: baseTheme?.slug ?? "custom",
    primary: baseTheme?.primary ?? "220 70% 50%",
    secondary: baseTheme?.secondary ?? "220 20% 90%",
    accent: baseTheme?.accent ?? "220 80% 60%",
    radius: baseTheme?.radius ?? "0.5rem",
    font: baseTheme?.font ?? "system-ui",
  });

  const handleUpdate = (field: keyof Theme, value: string) => {
    setCustomTheme((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = async () => {
    await onApply(customTheme);
  };

  return (
    <Stack gap="default">
      <Body>
        Customize your theme by adjusting colors, fonts, and border radius.
        Colors use HSL format (Hue Saturation Lightness).
      </Body>

      {/* Preview Card */}
      <Card className="p-4">
        <Stack gap="tight">
          <Muted variant="small">Live Preview</Muted>
          <div className="flex gap-2">
            <div
              className="h-16 w-full rounded-md border border-border flex items-center justify-center"
              style={{
                backgroundColor: `hsl(${customTheme.primary})`,
                borderRadius: customTheme.radius,
              }}
            >
              <span className="text-white text-sm font-medium">Primary</span>
            </div>
            <div
              className="h-16 w-full rounded-md border border-border flex items-center justify-center"
              style={{
                backgroundColor: `hsl(${customTheme.secondary})`,
                borderRadius: customTheme.radius,
              }}
            >
              <span className="text-foreground text-sm font-medium">
                Secondary
              </span>
            </div>
            <div
              className="h-16 w-full rounded-md border border-border flex items-center justify-center"
              style={{
                backgroundColor: `hsl(${customTheme.accent})`,
                borderRadius: customTheme.radius,
              }}
            >
              <span className="text-white text-sm font-medium">Accent</span>
            </div>
          </div>
        </Stack>
      </Card>

      {/* Color Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primary-color">Primary Color</Label>
          <Input
            id="primary-color"
            value={customTheme.primary ?? ""}
            onChange={(e) => handleUpdate("primary", e.target.value)}
            placeholder="220 70% 50%"
          />
          <Muted variant="small">HSL format: hue saturation% lightness%</Muted>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondary-color">Secondary Color</Label>
          <Input
            id="secondary-color"
            value={customTheme.secondary ?? ""}
            onChange={(e) => handleUpdate("secondary", e.target.value)}
            placeholder="220 20% 90%"
          />
          <Muted variant="small">HSL format: hue saturation% lightness%</Muted>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent Color</Label>
          <Input
            id="accent-color"
            value={customTheme.accent ?? ""}
            onChange={(e) => handleUpdate("accent", e.target.value)}
            placeholder="220 80% 60%"
          />
          <Muted variant="small">HSL format: hue saturation% lightness%</Muted>
        </div>
      </div>

      {/* Font and Radius Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={customTheme.font ?? "system-ui"}
            onValueChange={(value) => handleUpdate("font", value)}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="border-radius">Border Radius</Label>
          <Select
            value={customTheme.radius ?? "0.5rem"}
            onValueChange={(value) => handleUpdate("radius", value)}
          >
            <SelectTrigger id="border-radius">
              <SelectValue placeholder="Select radius" />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Apply Button */}
      <Button onClick={handleApply} disabled={isSaving} className="w-full">
        {isSaving ? "Applying..." : "Apply Custom Theme"}
      </Button>

      <Muted variant="small" className="text-center">
        Custom themes are saved to your profile and sync across devices
      </Muted>
    </Stack>
  );
}
