"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { Palette, Paintbrush, Music, User, UserCircle, Settings as SettingsIcon, Sparkles } from "lucide-react";

/**
 * Settings Layout
 *
 * Provides consistent layout for all settings pages with:
 * - Left sidebar navigation
 * - Hierarchical menu structure (main items + sub-items for theme editor)
 * - Active state highlighting
 * - Responsive design (stack on mobile, sidebar on desktop)
 */

const SETTINGS_NAV = [
  {
    label: "Assistant",
    href: "/settings/assistant",
    icon: Sparkles,
  },
  {
    label: "Profile",
    href: "/settings/profile",
    icon: UserCircle,
  },
  {
    label: "Themes",
    href: "/settings/themes",
    icon: Palette,
    subItems: [
      { label: "Theme Editor", href: "/settings/themes/editor" },
    ],
  },
  {
    label: "Music",
    href: "/settings/music",
    icon: Music,
  },
  {
    label: "Account",
    href: "/settings/account",
    icon: User,
  },
  {
    label: "Preferences",
    href: "/settings/preferences",
    icon: SettingsIcon,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/settings/themes") {
      // Match /settings/themes and all sub-routes (including editor)
      return pathname?.startsWith("/settings/themes");
    }
    return pathname?.startsWith(href);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Stack gap="loose">
        {/* Page Header */}
        <div>
          <Heading level={1}>Settings</Heading>
          <Muted>Manage your account and preferences</Muted>
        </div>

        {/* Settings Content with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {SETTINGS_NAV.map((item) => {
                const Icon = item.icon;
                const itemActive = isActive(item.href);
                const showSubItems = item.subItems && itemActive;

                return (
                  <div key={item.href}>
                    {/* Main Nav Item */}
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        itemActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>

                    {/* Sub-items (Theme Editor tabs) */}
                    {showSubItems && (
                      <div className="ml-7 mt-1 space-y-1 border-l-2 border-border pl-3">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-muted text-foreground font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </Stack>
    </main>
  );
}
