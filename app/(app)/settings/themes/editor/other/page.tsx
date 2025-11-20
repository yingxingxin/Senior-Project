"use client";

import { OtherTab } from "../../../_components/theme-editor/other-tab";
import { useThemeEditor } from "../layout";

/**
 * Other Settings Editor Page
 *
 * Route: /settings/themes/editor/other
 * Allows users to customize border radius, spacing scale, shadows, and color adjustments
 */

export default function OtherEditorPage() {
  const { theme, onChange } = useThemeEditor();

  return <OtherTab theme={theme} onChange={onChange} />;
}
