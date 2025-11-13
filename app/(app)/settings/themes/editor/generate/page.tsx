"use client";

import { Chat } from "../../../_components/theme-editor/chat";
import { useThemeEditor } from "../layout";

/**
 * AI Theme Generator Page
 *
 * Route: /settings/themes/editor/generate
 * AI-powered theme generation via chat interface using the Vercel AI SDK
 */

export default function GenerateEditorPage() {
  const { onChange } = useThemeEditor();

  return <Chat onThemeGenerated={onChange} />;
}
