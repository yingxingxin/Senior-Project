"use client";

import { ColorsTab } from "../../../_components/theme-editor/colors-tab";
import { useThemeEditor } from "../layout";

/**
 * Colors Editor Page
 *
 * Route: /settings/themes/editor/colors
 * Allows users to customize all theme colors (primary, secondary, accent, semantic colors, etc.)
 */

export default function ColorsEditorPage() {
  const { theme, onChange } = useThemeEditor();

  return <ColorsTab theme={theme} onChange={onChange} />;
}
