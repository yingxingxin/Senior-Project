import type { Theme } from "@/src/db/schema/lessons";

/**
 * Extended Theme Interface for Advanced Theme Editor
 *
 * Extends the base Theme with additional customization options:
 * - Full color token system (8 categories)
 * - Typography controls (3 font families + letter spacing)
 * - Global adjustments (HSL shifts, spacing scale, shadows)
 */

export interface AdvancedTheme extends Theme {
  // Extended Color Tokens (Legacy - kept for backward compatibility)
  base_bg: string | null; // Background
  base_fg: string | null; // Foreground text
  card_bg: string | null;
  card_fg: string | null;
  popover_bg: string | null;
  popover_fg: string | null;
  muted_bg: string | null;
  muted_fg: string | null;
  destructive_bg: string | null;
  destructive_fg: string | null;

  // Unified Theme Colors - Light Mode Variants
  primary_light: string | null;
  secondary_light: string | null;
  accent_light: string | null;
  base_bg_light: string | null;
  base_fg_light: string | null;
  card_bg_light: string | null;
  card_fg_light: string | null;
  popover_bg_light: string | null;
  popover_fg_light: string | null;
  muted_bg_light: string | null;
  muted_fg_light: string | null;
  destructive_bg_light: string | null;
  destructive_fg_light: string | null;

  // Unified Theme Colors - Dark Mode Variants
  primary_dark: string | null;
  secondary_dark: string | null;
  accent_dark: string | null;
  base_bg_dark: string | null;
  base_fg_dark: string | null;
  card_bg_dark: string | null;
  card_fg_dark: string | null;
  popover_bg_dark: string | null;
  popover_fg_dark: string | null;
  muted_bg_dark: string | null;
  muted_fg_dark: string | null;
  destructive_bg_dark: string | null;
  destructive_fg_dark: string | null;

  // Unified Theme Flag
  supports_both_modes: boolean | null;

  // Typography
  font_sans: string | null; // Sans-serif font stack
  font_serif: string | null; // Serif font stack
  font_mono: string | null; // Monospace font stack
  letter_spacing: number | null; // In em units

  // Other/Advanced
  hue_shift: number | null; // -180 to 180 degrees
  saturation_adjust: number | null; // -50 to 50 percent
  lightness_adjust: number | null; // -50 to 50 percent
  spacing_scale: number | null; // 0.75 to 1.5 multiplier
  shadow_strength: "none" | "subtle" | "medium" | "strong" | null;
}

export interface ColorToken {
  key: keyof AdvancedTheme;
  label: string;
  description: string;
  category: "primary" | "semantic" | "surface";
}

export const COLOR_TOKENS: ColorToken[] = [
  // Primary Colors
  {
    key: "primary",
    label: "Primary",
    description: "Main brand color, buttons, links",
    category: "primary",
  },
  {
    key: "secondary",
    label: "Secondary",
    description: "Secondary actions and accents",
    category: "primary",
  },
  {
    key: "accent",
    label: "Accent",
    description: "Highlights and focus states",
    category: "primary",
  },

  // Semantic Colors
  {
    key: "destructive_bg",
    label: "Destructive",
    description: "Error states, danger actions",
    category: "semantic",
  },
  {
    key: "muted_bg",
    label: "Muted",
    description: "Disabled states, subtle backgrounds",
    category: "semantic",
  },

  // Surface Colors
  {
    key: "base_bg",
    label: "Base",
    description: "Page background",
    category: "surface",
  },
  {
    key: "card_bg",
    label: "Card",
    description: "Card and panel backgrounds",
    category: "surface",
  },
  {
    key: "popover_bg",
    label: "Popover",
    description: "Dropdown and tooltip backgrounds",
    category: "surface",
  },
];
