import { z } from "zod";
import type { AdvancedTheme } from "../_components/theme-editor/types";

const hslValue = z
  .string()
  .min(3)
  .describe("HSL color value in the format `h s% l%` (e.g. `220 70% 50%`).");

const numericAdjustment = z
  .coerce.number()
  .refine((value) => Number.isFinite(value), "Must be a valid number.");

export const themeGenerationSchema = z.object({
  name: z.string().min(3).max(60),
  primary: hslValue,
  secondary: hslValue,
  accent: hslValue,
  base_bg: hslValue,
  base_fg: hslValue,
  card_bg: hslValue,
  card_fg: hslValue,
  popover_bg: hslValue,
  popover_fg: hslValue,
  muted_bg: hslValue,
  muted_fg: hslValue,
  destructive_bg: hslValue,
  destructive_fg: hslValue,
  font_sans: z.string().min(3),
  font_serif: z.string().min(3),
  font_mono: z.string().min(3),
  radius: z.string().min(2),
  letter_spacing: numericAdjustment,
  hue_shift: numericAdjustment,
  saturation_adjust: numericAdjustment,
  lightness_adjust: numericAdjustment,
  spacing_scale: numericAdjustment,
  shadow_strength: z.enum(["none", "subtle", "medium", "strong"]),
});

export type ThemeGenerationPayload = z.infer<typeof themeGenerationSchema>;

export function parseGeneratedTheme(
  payload: unknown
): Partial<AdvancedTheme> | null {
  const parsed = themeGenerationSchema.safeParse(payload);

  if (!parsed.success) {
    console.error("Invalid theme payload:", parsed.error);
    console.error("Payload:", payload);
    return null;
  }

  const {
    name,
    font_sans,
    font_serif,
    font_mono,
    letter_spacing,
    hue_shift,
    saturation_adjust,
    lightness_adjust,
    spacing_scale,
    shadow_strength,
    ...colorsAndRadius
  } = parsed.data;

  return {
    name,
    font: font_sans,
    font_sans,
    font_serif,
    font_mono,
    letter_spacing,
    hue_shift,
    saturation_adjust,
    lightness_adjust,
    spacing_scale,
    shadow_strength,
    ...colorsAndRadius,
  };
}
