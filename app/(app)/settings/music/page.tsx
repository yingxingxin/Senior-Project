import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MusicSettingsTab } from "../_components/music-settings-tab";

/**
 * Music Settings Page
 *
 * Route: /settings/music
 * Configure background music and audio preferences
 */

export default async function MusicPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  return <MusicSettingsTab userId={userId} />;
}
