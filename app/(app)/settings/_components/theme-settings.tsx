"use client";

import { ThemeEditor } from "./theme-editor";
import { selectTheme, applyCustomTheme } from "../_lib/theme-actions";
import type { Theme, UserThemeSetting } from "@/src/db/schema/lessons";

/**
 * Theme Settings Client Component
 *
 * Wraps ThemeEditor with server action handlers.
 * Receives themes and user settings as props from server component.
 */

interface ThemeSettingsProps {
  themes: Theme[];
  userThemeSettings: UserThemeSetting | null;
  userId: number;
}

export function ThemeSettings({
  themes,
  userThemeSettings,
  userId,
}: ThemeSettingsProps) {
  const handleThemeSelect = async (themeId: number) => {
    await selectTheme(userId, themeId);
  };

  const handleThemeCustomize = async (customTheme: Partial<Theme>) => {
    await applyCustomTheme(userId, customTheme);
  };

  return (
    <ThemeEditor
      themes={themes}
      currentThemeId={userThemeSettings?.theme_id}
      onThemeSelect={handleThemeSelect}
      onThemeCustomize={handleThemeCustomize}
    />
  );
}
