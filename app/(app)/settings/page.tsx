import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSettings } from "./_components/theme-settings";
import { MusicSettingsTab } from "./_components/music-settings-tab";
import { AccountSettingsTab } from "./_components/account-settings-tab";
import { PreferencesTab } from "./_components/preferences-tab";
import { getAllThemes, getUserThemeSettings } from "./_lib/theme-actions";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const user = session.user;

  // Fetch themes and user theme settings
  const [themes, userThemeSettings] = await Promise.all([
    getAllThemes(),
    getUserThemeSettings(userId),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Stack gap="loose">
        {/* Page Header */}
        <div>
          <Heading level={1}>Settings</Heading>
          <Muted>Manage your account and preferences</Muted>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="mt-6">
            <ThemeSettings
              themes={themes}
              userThemeSettings={userThemeSettings}
              userId={userId}
            />
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <MusicSettingsTab userId={userId} />
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <AccountSettingsTab user={user} userId={userId} />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <PreferencesTab userId={userId} />
          </TabsContent>
        </Tabs>
      </Stack>
    </main>
  );
}

