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
      theme_id: themeId,
      wallpaper_url: null, // Clear custom wallpaper when selecting preset
    })
    .onConflictDoUpdate({
      target: user_theme_settings.user_id,
      set: {
        theme_id: themeId,
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
  // Custom themes are per-user and prefixed with user ID
  const customThemeSlug = `custom-user-${userId}`;

  const [existingCustomTheme] = await db
    .select()
    .from(themes)
    .where(eq(themes.slug, customThemeSlug));

  let customThemeId: number;

  if (existingCustomTheme) {
    // Update existing custom theme
    const [updated] = await db
      .update(themes)
      .set({
        name: customTheme.name ?? "Custom Theme",
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        accent: customTheme.accent,
        radius: customTheme.radius,
        font: customTheme.font,
      })
      .where(eq(themes.id, existingCustomTheme.id))
      .returning();

    customThemeId = updated.id;
  } else {
    // Create new custom theme
    const [created] = await db
      .insert(themes)
      .values({
        slug: customThemeSlug,
        name: customTheme.name ?? "Custom Theme",
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        accent: customTheme.accent,
        radius: customTheme.radius,
        font: customTheme.font,
      })
      .returning();

    customThemeId = created.id;
  }

  // Link custom theme to user
  await db
    .insert(user_theme_settings)
    .values({
      user_id: userId,
      theme_id: customThemeId,
    })
    .onConflictDoUpdate({
      target: user_theme_settings.user_id,
      set: {
        theme_id: customThemeId,
        updated_at: new Date(),
      },
    });

  revalidatePath("/settings");
  revalidatePath("/home");
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
