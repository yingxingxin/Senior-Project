"use client";

import { ThemeEditor } from "./theme-editor";
import { selectTheme } from "../_lib/theme-actions";
import type { Theme } from "@/src/db/schema/lessons";
import type { UserThemeSetting } from "@/src/db/schema/preferences";

/**
 * Theme Settings Client Component
 *
 * Wraps ThemeEditor with server action handlers.
 * Receives themes and user settings as props from server component.
 * Advanced theme customization is handled via /settings/themes/editor routes.
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

  return (
    <ThemeEditor
      themes={themes}
      currentThemeId={userThemeSettings?.active_theme_id}
      onThemeSelect={handleThemeSelect}
    />
  );
}
