import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Stack } from "@/components/ui/spacing";
import { Body } from "@/components/ui/typography";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Palette, Music, User, UserCircle, Settings as SettingsIcon, Sparkles } from "lucide-react";

/**
 * Settings Overview Page
 *
 * Landing page showing all available settings sections as cards.
 * Users can click a card to navigate to that settings section.
 */

const SETTINGS_SECTIONS = [
  {
    title: "Assistant",
    description: "Customize your assistant's appearance and personality",
    href: "/settings/assistant",
    icon: Sparkles,
  },
  {
    title: "Profile",
    description: "Manage your public portfolio profile",
    href: "/settings/profile",
    icon: UserCircle,
  },
  {
    title: "Themes",
    description: "Customize colors, typography, and visual appearance",
    href: "/settings/themes",
    icon: Palette,
  },
  {
    title: "Music",
    description: "Configure background music and audio preferences",
    href: "/settings/music",
    icon: Music,
  },
  {
    title: "Account",
    description: "Manage your profile, email, and account security",
    href: "/settings/account",
    icon: User,
  },
  {
    title: "Preferences",
    description: "Set learning goals, difficulty, and notifications",
    href: "/settings/preferences",
    icon: SettingsIcon,
  },
];

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <Stack gap="default">
      <Body>Choose a settings section to get started.</Body>

      {/* Settings Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{section.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </Stack>
  );
}

