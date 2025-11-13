import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PreferencesTab } from "../_components/preferences-tab";

/**
 * Preferences Settings Page
 *
 * Route: /settings/preferences
 * Set learning goals, difficulty, and notifications
 */

export default async function PreferencesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  return <PreferencesTab userId={userId} />;
}
