"use client";

import { TypographyTab } from "../../../_components/theme-editor/typography-tab";
import { useThemeEditor } from "../layout";

/**
 * Typography Editor Page
 *
 * Route: /settings/themes/editor/typography
 * Allows users to customize font families, letter spacing, and typography settings
 */

export default function TypographyEditorPage() {
  const { theme, onChange } = useThemeEditor();

  return <TypographyTab theme={theme} onChange={onChange} />;
}
