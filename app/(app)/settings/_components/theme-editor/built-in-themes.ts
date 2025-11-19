/**
 * Built-in Theme Library - Unified Format
 *
 * Curated collection of professional themes with light and dark variants.
 * Each theme contains BOTH light and dark color values in a single object.
 *
 * Architecture Decision:
 * - Unified format: One theme object with *_light and *_dark color fields
 * - Hardcoded here (not in database) for reliability and version control
 * - HSL color format for easy manipulation
 * - Complete typography and layout settings
 * - Single theme supports both light and dark modes
 */

import type { AdvancedTheme } from "./types";

/**
 * Built-in themes collection
 * Each theme contains both light and dark color variants in one object
 */
export const BUILT_IN_THEMES: AdvancedTheme[] = [
  {
    id: 0,
    slug: "default",
    name: "Default",

    // Light mode colors
    primary_light: "215 95% 55%", // Vibrant blue
    secondary_light: "220 15% 92%", // Soft blue-gray
    accent_light: "165 75% 45%", // Teal accent
    base_bg_light: "220 20% 98%", // Warm white
    base_fg_light: "220 15% 15%", // Near black with blue tint
    card_bg_light: "0 0% 100%", // Pure white
    card_fg_light: "220 15% 15%",
    popover_bg_light: "0 0% 100%",
    popover_fg_light: "220 15% 15%",
    muted_bg_light: "220 15% 95%", // Subtle gray
    muted_fg_light: "220 10% 45%",
    destructive_bg_light: "0 72% 51%", // Red
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "215 95% 60%", // Brighter blue for dark mode
    secondary_dark: "220 15% 18%", // Dark gray
    accent_dark: "165 75% 50%", // Brighter teal
    base_bg_dark: "220 20% 10%", // Dark blue-gray
    base_fg_dark: "220 15% 92%", // Light text
    card_bg_dark: "220 15% 14%", // Slightly lighter than base
    card_fg_dark: "220 15% 92%",
    popover_bg_dark: "220 15% 16%",
    popover_fg_dark: "220 15% 92%",
    muted_bg_dark: "220 15% 18%",
    muted_fg_dark: "220 10% 60%",
    destructive_bg_dark: "0 72% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields (for backward compatibility)
    primary: "215 95% 55%",
    secondary: "220 15% 92%",
    accent: "165 75% 45%",
    base_bg: "220 20% 98%",
    base_fg: "220 15% 15%",
    card_bg: "0 0% 100%",
    card_fg: "220 15% 15%",
    popover_bg: "0 0% 100%",
    popover_fg: "220 15% 15%",
    muted_bg: "220 15% 95%",
    muted_fg: "220 10% 45%",
    destructive_bg: "0 72% 51%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.5rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "medium",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "ocean",
    name: "Ocean",

    // Light mode colors
    primary_light: "200 85% 50%", // Ocean blue
    secondary_light: "195 20% 88%", // Light blue-gray
    accent_light: "180 70% 45%", // Cyan
    base_bg_light: "195 30% 97%", // Very light blue
    base_fg_light: "200 20% 15%",
    card_bg_light: "195 30% 100%",
    card_fg_light: "200 20% 15%",
    popover_bg_light: "195 30% 100%",
    popover_fg_light: "200 20% 15%",
    muted_bg_light: "195 20% 92%",
    muted_fg_light: "200 15% 40%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "200 85% 55%",
    secondary_dark: "200 25% 15%",
    accent_dark: "180 75% 50%",
    base_bg_dark: "200 30% 8%", // Deep ocean
    base_fg_dark: "195 20% 90%",
    card_bg_dark: "200 25% 12%",
    card_fg_dark: "195 20% 90%",
    popover_bg_dark: "200 25% 14%",
    popover_fg_dark: "195 20% 90%",
    muted_bg_dark: "200 20% 16%",
    muted_fg_dark: "195 15% 55%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "200 85% 50%",
    secondary: "195 20% 88%",
    accent: "180 70% 45%",
    base_bg: "195 30% 97%",
    base_fg: "200 20% 15%",
    card_bg: "195 30% 100%",
    card_fg: "200 20% 15%",
    popover_bg: "195 30% 100%",
    popover_fg: "200 20% 15%",
    muted_bg: "195 20% 92%",
    muted_fg: "200 15% 40%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.75rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "medium",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "forest",
    name: "Forest",

    // Light mode colors
    primary_light: "145 60% 45%", // Forest green
    secondary_light: "140 20% 88%", // Light sage
    accent_light: "30 75% 50%", // Warm orange
    base_bg_light: "140 25% 97%",
    base_fg_light: "145 25% 15%",
    card_bg_light: "140 20% 100%",
    card_fg_light: "145 25% 15%",
    popover_bg_light: "140 20% 100%",
    popover_fg_light: "145 25% 15%",
    muted_bg_light: "140 15% 92%",
    muted_fg_light: "145 15% 40%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "145 65% 50%",
    secondary_dark: "145 25% 15%",
    accent_dark: "30 80% 55%",
    base_bg_dark: "145 25% 9%",
    base_fg_dark: "140 15% 90%",
    card_bg_dark: "145 20% 13%",
    card_fg_dark: "140 15% 90%",
    popover_bg_dark: "145 20% 15%",
    popover_fg_dark: "140 15% 90%",
    muted_bg_dark: "145 15% 17%",
    muted_fg_dark: "140 10% 55%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "145 60% 45%",
    secondary: "140 20% 88%",
    accent: "30 75% 50%",
    base_bg: "140 25% 97%",
    base_fg: "145 25% 15%",
    card_bg: "140 20% 100%",
    card_fg: "145 25% 15%",
    popover_bg: "140 20% 100%",
    popover_fg: "145 25% 15%",
    muted_bg: "140 15% 92%",
    muted_fg: "145 15% 40%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.5rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "subtle",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "sunset",
    name: "Sunset",

    // Light mode colors
    primary_light: "25 90% 55%", // Warm orange
    secondary_light: "30 25% 90%", // Warm beige
    accent_light: "340 75% 55%", // Pink
    base_bg_light: "30 40% 97%",
    base_fg_light: "25 20% 15%",
    card_bg_light: "30 30% 100%",
    card_fg_light: "25 20% 15%",
    popover_bg_light: "30 30% 100%",
    popover_fg_light: "25 20% 15%",
    muted_bg_light: "30 20% 92%",
    muted_fg_light: "25 15% 40%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "25 95% 60%",
    secondary_dark: "30 20% 16%",
    accent_dark: "340 75% 60%",
    base_bg_dark: "25 25% 10%",
    base_fg_dark: "30 15% 90%",
    card_bg_dark: "25 20% 14%",
    card_fg_dark: "30 15% 90%",
    popover_bg_dark: "25 20% 16%",
    popover_fg_dark: "30 15% 90%",
    muted_bg_dark: "25 15% 18%",
    muted_fg_dark: "30 10% 55%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "25 90% 55%",
    secondary: "30 25% 90%",
    accent: "340 75% 55%",
    base_bg: "30 40% 97%",
    base_fg: "25 20% 15%",
    card_bg: "30 30% 100%",
    card_fg: "25 20% 15%",
    popover_bg: "30 30% 100%",
    popover_fg: "25 20% 15%",
    muted_bg: "30 20% 92%",
    muted_fg: "25 15% 40%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.75rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "medium",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "lavender",
    name: "Lavender",

    // Light mode colors
    primary_light: "270 60% 60%", // Soft purple
    secondary_light: "270 20% 90%", // Light lavender
    accent_light: "200 70% 55%", // Sky blue
    base_bg_light: "270 30% 98%",
    base_fg_light: "270 15% 15%",
    card_bg_light: "270 25% 100%",
    card_fg_light: "270 15% 15%",
    popover_bg_light: "270 25% 100%",
    popover_fg_light: "270 15% 15%",
    muted_bg_light: "270 18% 94%",
    muted_fg_light: "270 12% 42%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "270 65% 65%",
    secondary_dark: "270 20% 16%",
    accent_dark: "200 75% 60%",
    base_bg_dark: "270 25% 10%",
    base_fg_dark: "270 15% 92%",
    card_bg_dark: "270 20% 14%",
    card_fg_dark: "270 15% 92%",
    popover_bg_dark: "270 20% 16%",
    popover_fg_dark: "270 15% 92%",
    muted_bg_dark: "270 15% 18%",
    muted_fg_dark: "270 10% 58%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "270 60% 60%",
    secondary: "270 20% 90%",
    accent: "200 70% 55%",
    base_bg: "270 30% 98%",
    base_fg: "270 15% 15%",
    card_bg: "270 25% 100%",
    card_fg: "270 15% 15%",
    popover_bg: "270 25% 100%",
    popover_fg: "270 15% 15%",
    muted_bg: "270 18% 94%",
    muted_fg: "270 12% 42%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "1rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "subtle",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "midnight",
    name: "Midnight",

    // Light mode colors
    primary_light: "250 70% 55%", // Royal purple
    secondary_light: "250 15% 88%", // Light purple-gray
    accent_light: "45 90% 55%", // Gold
    base_bg_light: "250 20% 97%",
    base_fg_light: "250 15% 15%",
    card_bg_light: "250 15% 100%",
    card_fg_light: "250 15% 15%",
    popover_bg_light: "250 15% 100%",
    popover_fg_light: "250 15% 15%",
    muted_bg_light: "250 12% 92%",
    muted_fg_light: "250 10% 40%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "250 75% 60%",
    secondary_dark: "250 20% 14%",
    accent_dark: "45 95% 60%",
    base_bg_dark: "250 30% 7%", // Very dark purple
    base_fg_dark: "250 12% 92%",
    card_bg_dark: "250 25% 11%",
    card_fg_dark: "250 12% 92%",
    popover_bg_dark: "250 25% 13%",
    popover_fg_dark: "250 12% 92%",
    muted_bg_dark: "250 20% 15%",
    muted_fg_dark: "250 10% 58%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "250 70% 55%",
    secondary: "250 15% 88%",
    accent: "45 90% 55%",
    base_bg: "250 20% 97%",
    base_fg: "250 15% 15%",
    card_bg: "250 15% 100%",
    card_fg: "250 15% 15%",
    popover_bg: "250 15% 100%",
    popover_fg: "250 15% 15%",
    muted_bg: "250 12% 92%",
    muted_fg: "250 10% 40%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.5rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "strong",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
  {
    id: 0,
    slug: "monochrome",
    name: "Monochrome",

    // Light mode colors
    primary_light: "0 0% 20%", // Dark gray
    secondary_light: "0 0% 88%", // Light gray
    accent_light: "0 0% 35%", // Medium gray
    base_bg_light: "0 0% 98%",
    base_fg_light: "0 0% 10%",
    card_bg_light: "0 0% 100%",
    card_fg_light: "0 0% 10%",
    popover_bg_light: "0 0% 100%",
    popover_fg_light: "0 0% 10%",
    muted_bg_light: "0 0% 92%",
    muted_fg_light: "0 0% 42%",
    destructive_bg_light: "0 70% 50%",
    destructive_fg_light: "0 0% 100%",

    // Dark mode colors
    primary_dark: "0 0% 85%",
    secondary_dark: "0 0% 16%",
    accent_dark: "0 0% 65%",
    base_bg_dark: "0 0% 8%",
    base_fg_dark: "0 0% 92%",
    card_bg_dark: "0 0% 12%",
    card_fg_dark: "0 0% 92%",
    popover_bg_dark: "0 0% 14%",
    popover_fg_dark: "0 0% 92%",
    muted_bg_dark: "0 0% 16%",
    muted_fg_dark: "0 0% 58%",
    destructive_bg_dark: "0 70% 55%",
    destructive_fg_dark: "0 0% 100%",

    // Legacy fields
    primary: "0 0% 20%",
    secondary: "0 0% 88%",
    accent: "0 0% 35%",
    base_bg: "0 0% 98%",
    base_fg: "0 0% 10%",
    card_bg: "0 0% 100%",
    card_fg: "0 0% 10%",
    popover_bg: "0 0% 100%",
    popover_fg: "0 0% 10%",
    muted_bg: "0 0% 92%",
    muted_fg: "0 0% 42%",
    destructive_bg: "0 70% 50%",
    destructive_fg: "0 0% 100%",

    // Typography
    font: "Inter",
    font_sans: "Inter, system-ui, sans-serif",
    font_serif: "Source Serif 4, Georgia, serif",
    font_mono: "JetBrains Mono, monospace",
    letter_spacing: 0,

    // Layout
    radius: "0.3rem",
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: "none",

    // Metadata
    user_id: null,
    is_dark_mode: false,
    parent_theme_id: null,
    is_built_in: true,
    supports_both_modes: true,
  },
];

/**
 * Get built-in theme by slug
 * Returns unified theme with both light and dark colors
 */
export function getBuiltInTheme(slug: string): AdvancedTheme | undefined {
  return BUILT_IN_THEMES.find((t) => t.slug === slug);
}

/**
 * Get all built-in themes
 * Returns array of unified themes (each supports both modes)
 */
export function getAllBuiltInThemes(): AdvancedTheme[] {
  return BUILT_IN_THEMES;
}

/**
 * Get random built-in theme
 * Returns unified theme with both light and dark colors
 */
export function getRandomBuiltInTheme(): AdvancedTheme {
  const randomIndex = Math.floor(Math.random() * BUILT_IN_THEMES.length);
  return BUILT_IN_THEMES[randomIndex];
}
