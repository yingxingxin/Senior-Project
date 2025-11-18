"use server";

import { db } from "@/src/db";
import { themes, user_theme_settings } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Server Actions
 *
 * Handles theme selection and customization for users.
 * Updates user_theme_settings table with selected theme or custom theme data.
 */

export async function getAllThemes(): Promise<Theme[]> {
  const allThemes = await db.select().from(themes);
  return allThemes;
}

/**
 * Get a specific theme by ID
 * Used when loading a theme from cookie or user settings
 */
export async function getThemeById(themeId: number): Promise<Theme | null> {
  const [theme] = await db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId));

  return theme ?? null;
}

/**
 * Get a specific theme by slug
 * Used when loading themes by name (e.g., "default-light", "ocean-dark")
 */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const [theme] = await db
    .select()
    .from(themes)
    .where(eq(themes.slug, slug));

  return theme ?? null;
}

/**
 * Get the default theme (unified format with both light/dark variants)
 * The theme contains both *_light and *_dark color fields
 * UI components use theme-utils.ts to extract the correct variant based on mode
 */
export async function getDefaultTheme(): Promise<Theme> {
  // Use base slug "default" (not "default-light" or "default-dark")
  const theme = await getThemeBySlug("default");

  // If theme not found, return hardcoded fallback to prevent crashes
  // Hardcoded fallback includes both light and dark variants
  if (!theme) {
    return {
      id: 0,
      slug: "default",
      name: "Default",

      // Legacy fields (light mode as default)
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

      // Light mode colors
      primary_light: "215 95% 55%",
      secondary_light: "220 15% 92%",
      accent_light: "165 75% 45%",
      base_bg_light: "220 20% 98%",
      base_fg_light: "220 15% 15%",
      card_bg_light: "0 0% 100%",
      card_fg_light: "220 15% 15%",
      popover_bg_light: "0 0% 100%",
      popover_fg_light: "220 15% 15%",
      muted_bg_light: "220 15% 95%",
      muted_fg_light: "220 10% 45%",
      destructive_bg_light: "0 72% 51%",
      destructive_fg_light: "0 0% 100%",

      // Dark mode colors
      primary_dark: "215 95% 60%",
      secondary_dark: "220 15% 18%",
      accent_dark: "165 75% 50%",
      base_bg_dark: "220 20% 10%",
      base_fg_dark: "220 15% 92%",
      card_bg_dark: "220 15% 14%",
      card_fg_dark: "220 15% 92%",
      popover_bg_dark: "220 15% 16%",
      popover_fg_dark: "220 15% 92%",
      muted_bg_dark: "220 15% 18%",
      muted_fg_dark: "220 10% 60%",
      destructive_bg_dark: "0 72% 55%",
      destructive_fg_dark: "0 0% 100%",

      // Typography
      radius: "0.5rem",
      font: "Inter",
      font_sans: "Inter, system-ui, sans-serif",
      font_serif: "Source Serif 4, Georgia, serif",
      font_mono: "JetBrains Mono, monospace",
      letter_spacing: 0,

      // Layout
      hue_shift: 0,
      saturation_adjust: 0,
      lightness_adjust: 0,
      spacing_scale: 1,
      shadow_strength: "medium",

      // Metadata - unified format
      is_dark_mode: false,
      supports_both_modes: true,
      is_built_in: true,
      parent_theme_id: null,
      user_id: null,
    };
  }

  return theme;
}

/**
 * Get user's active theme (unified format)
 * Returns the theme selected by the user, which contains both light and dark variants
 * UI components extract the appropriate colors based on current mode using theme-utils.ts
 */
export async function getUserActiveTheme(userId: number): Promise<Theme> {
  // Get user's theme settings
  const userSettings = await getUserThemeSettings(userId);

  if (!userSettings?.active_theme_id) {
    // No theme selected, return default
    return getDefaultTheme();
  }

  // Load the user's selected theme
  const selectedTheme = await getThemeById(userSettings.active_theme_id);

  if (!selectedTheme) {
    // Theme not found, return default
    return getDefaultTheme();
  }

  // Return the theme as-is (it contains both light/dark variants)
  // The calling code uses theme-utils.ts to extract the correct mode colors
  return selectedTheme;
}

export async function getUserThemeSettings(userId: number) {
  const [userSettings] = await db
    .select()
    .from(user_theme_settings)
    .where(eq(user_theme_settings.user_id, userId));

  return userSettings ?? null;
}

export async function selectTheme(userId: number, themeId: number) {
  // Upsert user theme settings
  await db
    .insert(user_theme_settings)
    .values({
      user_id: userId,
      active_theme_id: themeId,
      wallpaper_url: null, // Clear custom wallpaper when selecting preset
    })
    .onConflictDoUpdate({
      target: user_theme_settings.user_id,
      set: {
        active_theme_id: themeId,
        wallpaper_url: null,
        updated_at: new Date(),
      },
    });

  revalidatePath("/settings");
  revalidatePath("/home");
}

export async function applyCustomTheme(
  userId: number,
  customTheme: Partial<Theme>
) {
  // Create or update custom theme in themes table
  // Respects theme.id to determine if creating new or updating existing
  let customThemeId: number;

  // Check if this is an update to existing theme or creation of new theme
  if (customTheme.id && customTheme.id > 0) {
    // UPDATE existing custom theme
    const [updated] = await db
      .update(themes)
      .set({
        name: customTheme.name ?? "Custom Theme",
        // Legacy color tokens (for backward compatibility)
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        accent: customTheme.accent,
        base_bg: customTheme.base_bg,
        base_fg: customTheme.base_fg,
        card_bg: customTheme.card_bg,
        card_fg: customTheme.card_fg,
        popover_bg: customTheme.popover_bg,
        popover_fg: customTheme.popover_fg,
        muted_bg: customTheme.muted_bg,
        muted_fg: customTheme.muted_fg,
        destructive_bg: customTheme.destructive_bg,
        destructive_fg: customTheme.destructive_fg,
        // Unified theme fields - Light mode
        primary_light: customTheme.primary_light,
        secondary_light: customTheme.secondary_light,
        accent_light: customTheme.accent_light,
        base_bg_light: customTheme.base_bg_light,
        base_fg_light: customTheme.base_fg_light,
        card_bg_light: customTheme.card_bg_light,
        card_fg_light: customTheme.card_fg_light,
        popover_bg_light: customTheme.popover_bg_light,
        popover_fg_light: customTheme.popover_fg_light,
        muted_bg_light: customTheme.muted_bg_light,
        muted_fg_light: customTheme.muted_fg_light,
        destructive_bg_light: customTheme.destructive_bg_light,
        destructive_fg_light: customTheme.destructive_fg_light,
        // Unified theme fields - Dark mode
        primary_dark: customTheme.primary_dark,
        secondary_dark: customTheme.secondary_dark,
        accent_dark: customTheme.accent_dark,
        base_bg_dark: customTheme.base_bg_dark,
        base_fg_dark: customTheme.base_fg_dark,
        card_bg_dark: customTheme.card_bg_dark,
        card_fg_dark: customTheme.card_fg_dark,
        popover_bg_dark: customTheme.popover_bg_dark,
        popover_fg_dark: customTheme.popover_fg_dark,
        muted_bg_dark: customTheme.muted_bg_dark,
        muted_fg_dark: customTheme.muted_fg_dark,
        destructive_bg_dark: customTheme.destructive_bg_dark,
        destructive_fg_dark: customTheme.destructive_fg_dark,
        // Typography
        font: customTheme.font,
        font_sans: customTheme.font_sans,
        font_serif: customTheme.font_serif,
        font_mono: customTheme.font_mono,
        letter_spacing: customTheme.letter_spacing,
        // Layout & styling
        radius: customTheme.radius,
        hue_shift: customTheme.hue_shift,
        saturation_adjust: customTheme.saturation_adjust,
        lightness_adjust: customTheme.lightness_adjust,
        spacing_scale: customTheme.spacing_scale,
        shadow_strength: customTheme.shadow_strength,
        // Metadata
        is_dark_mode: customTheme.is_dark_mode ?? false,
        parent_theme_id: customTheme.parent_theme_id,
        user_id: userId,
        supports_both_modes: customTheme.supports_both_modes ?? true,
      })
      .where(eq(themes.id, customTheme.id))
      .returning();

    customThemeId = updated.id;
  } else {
    // CREATE new custom theme with unique slug
    // Use the slug from the theme object (generated by auto-fork logic)
    // Fall back to timestamp-based slug if not provided
    const themeSlug = customTheme.slug ?? `custom-user-${userId}-${Date.now()}`;

    const [created] = await db
      .insert(themes)
      .values({
        slug: themeSlug,
        name: customTheme.name ?? "Custom Theme",
        // Legacy color tokens (for backward compatibility)
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        accent: customTheme.accent,
        base_bg: customTheme.base_bg,
        base_fg: customTheme.base_fg,
        card_bg: customTheme.card_bg,
        card_fg: customTheme.card_fg,
        popover_bg: customTheme.popover_bg,
        popover_fg: customTheme.popover_fg,
        muted_bg: customTheme.muted_bg,
        muted_fg: customTheme.muted_fg,
        destructive_bg: customTheme.destructive_bg,
        destructive_fg: customTheme.destructive_fg,
        // Unified theme fields - Light mode
        primary_light: customTheme.primary_light,
        secondary_light: customTheme.secondary_light,
        accent_light: customTheme.accent_light,
        base_bg_light: customTheme.base_bg_light,
        base_fg_light: customTheme.base_fg_light,
        card_bg_light: customTheme.card_bg_light,
        card_fg_light: customTheme.card_fg_light,
        popover_bg_light: customTheme.popover_bg_light,
        popover_fg_light: customTheme.popover_fg_light,
        muted_bg_light: customTheme.muted_bg_light,
        muted_fg_light: customTheme.muted_fg_light,
        destructive_bg_light: customTheme.destructive_bg_light,
        destructive_fg_light: customTheme.destructive_fg_light,
        // Unified theme fields - Dark mode
        primary_dark: customTheme.primary_dark,
        secondary_dark: customTheme.secondary_dark,
        accent_dark: customTheme.accent_dark,
        base_bg_dark: customTheme.base_bg_dark,
        base_fg_dark: customTheme.base_fg_dark,
        card_bg_dark: customTheme.card_bg_dark,
        card_fg_dark: customTheme.card_fg_dark,
        popover_bg_dark: customTheme.popover_bg_dark,
        popover_fg_dark: customTheme.popover_fg_dark,
        muted_bg_dark: customTheme.muted_bg_dark,
        muted_fg_dark: customTheme.muted_fg_dark,
        destructive_bg_dark: customTheme.destructive_bg_dark,
        destructive_fg_dark: customTheme.destructive_fg_dark,
        // Typography
        font: customTheme.font,
        font_sans: customTheme.font_sans,
        font_serif: customTheme.font_serif,
        font_mono: customTheme.font_mono,
        letter_spacing: customTheme.letter_spacing,
        // Layout & styling
        radius: customTheme.radius,
        hue_shift: customTheme.hue_shift,
        saturation_adjust: customTheme.saturation_adjust,
        lightness_adjust: customTheme.lightness_adjust,
        spacing_scale: customTheme.spacing_scale,
        shadow_strength: customTheme.shadow_strength,
        // Metadata
        is_dark_mode: customTheme.is_dark_mode ?? false,
        is_built_in: false,
        parent_theme_id: customTheme.parent_theme_id,
        user_id: userId,
        supports_both_modes: customTheme.supports_both_modes ?? true,
      })
      .returning();

    customThemeId = created.id;
  }

  // Link custom theme to user (set as active theme)
  await db
    .insert(user_theme_settings)
    .values({
      user_id: userId,
      active_theme_id: customThemeId,
    })
    .onConflictDoUpdate({
      target: user_theme_settings.user_id,
      set: {
        active_theme_id: customThemeId,
        updated_at: new Date(),
      },
    });

  revalidatePath("/settings");
  revalidatePath("/home");

  return customThemeId;
}

export async function uploadWallpaper(userId: number, wallpaperUrl: string) {
  // Update user theme settings with custom wallpaper
  await db
    .insert(user_theme_settings)
    .values({
      user_id: userId,
      wallpaper_url: wallpaperUrl,
    })
    .onConflictDoUpdate({
      target: user_theme_settings.user_id,
      set: {
        wallpaper_url: wallpaperUrl,
        updated_at: new Date(),
      },
    });

  revalidatePath("/settings");
  revalidatePath("/home");
}
