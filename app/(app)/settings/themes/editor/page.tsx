import { redirect } from "next/navigation";

/**
 * Editor Index Page
 *
 * Redirects to /settings/themes/editor/colors (default tab)
 */

export default function EditorIndexPage() {
  redirect("/settings/themes/editor/colors");
}
