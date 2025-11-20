import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack } from "@/components/ui/spacing";
import { Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { ThemeSettings } from "../_components/theme-settings";
import { getAllThemes, getUserThemeSettings } from "../_lib/theme-actions";

/**
 * Themes Page
 *
 * Shows grid of pre-built themes for selection.
 * Users can click "Advanced Editor" to navigate to /settings/themes/editor/colors
 * for full theme customization.
 */

export default async function ThemesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Fetch themes and user theme settings
  const [themes, userThemeSettings] = await Promise.all([
    getAllThemes(),
    getUserThemeSettings(userId),
  ]);

  return (
    <Stack gap="default">
      <div className="flex items-center justify-between">
        <Body>Select from our collection of hand-crafted themes</Body>
        <Link href="/settings/themes/editor/colors">
          <Button variant="outline">
            <Settings2 className="mr-2 h-4 w-4" />
            Advanced Editor
          </Button>
        </Link>
      </div>

      <ThemeSettings
        themes={themes}
        userThemeSettings={userThemeSettings}
        userId={userId}
      />
    </Stack>
  );
}
