"use client";

import { Bell, Search, TrendingUp, BookOpen, Award } from "lucide-react";
import type { AdvancedTheme } from "./types";

/**
 * Theme Preview Dashboard
 *
 * Shows a miniature dashboard with real UI components
 * that update in real-time as theme settings change.
 *
 * Demonstrates:
 * - All color tokens in context
 * - Typography with selected fonts
 * - Spacing and radius
 * - Shadows and elevation
 */

interface ThemePreviewDashboardProps {
  theme: AdvancedTheme;
}

export function ThemePreviewDashboard({ theme }: ThemePreviewDashboardProps) {
  // Apply theme CSS variables to preview container
  const themeStyles = {
    "--preview-primary": `hsl(${theme.primary})`,
    "--preview-secondary": `hsl(${theme.secondary})`,
    "--preview-accent": `hsl(${theme.accent})`,
    "--preview-base-bg": `hsl(${theme.base_bg})`,
    "--preview-base-fg": `hsl(${theme.base_fg})`,
    "--preview-card-bg": `hsl(${theme.card_bg})`,
    "--preview-muted-bg": `hsl(${theme.muted_bg})`,
    "--preview-destructive": `hsl(${theme.destructive_bg})`,
    "--preview-radius": theme.radius,
    "--preview-font-sans": theme.font_sans,
    fontFamily: theme.font_sans ?? undefined,
    letterSpacing: `${theme.letter_spacing}em`,
  } as React.CSSProperties;

  return (
    <div style={themeStyles} className="space-y-6 rounded-lg">
      {/* Dashboard Header */}
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: "var(--preview-card-bg)",
          borderRadius: "var(--preview-radius)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-semibold"
              style={{ color: "var(--preview-base-fg)" }}
            >
              Dashboard
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--preview-base-fg)", opacity: 0.7 }}
            >
              Live theme preview
            </p>
          </div>
          <button
            className="p-2 rounded-full"
            style={{
              backgroundColor: "var(--preview-muted-bg)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: "var(--preview-base-bg)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            <Search className="h-4 w-4 opacity-50" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--preview-base-fg)" }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: "Points", value: "1,234" },
          { icon: BookOpen, label: "Lessons", value: "12" },
          { icon: Award, label: "Streak", value: "7d" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--preview-card-bg)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{
                backgroundColor: "var(--preview-primary)",
                borderRadius: "var(--preview-radius)",
              }}
            >
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs opacity-70">{stat.label}</p>
            <p className="text-lg font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Button Showcase */}
      <div
        className="p-6 rounded-lg space-y-4"
        style={{
          backgroundColor: "var(--preview-card-bg)",
          borderRadius: "var(--preview-radius)",
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{
              backgroundColor: "var(--preview-primary)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            Primary
          </button>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              backgroundColor: "var(--preview-secondary)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{
              backgroundColor: "var(--preview-muted-bg)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            Muted
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white rounded-lg"
            style={{
              backgroundColor: "var(--preview-destructive)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            Destructive
          </button>
        </div>
      </div>

      {/* Typography Sample */}
      <div
        className="p-6 rounded-lg space-y-3"
        style={{
          backgroundColor: "var(--preview-card-bg)",
          borderRadius: "var(--preview-radius)",
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Typography</h3>
        <div className="space-y-2">
          <p
            className="text-xl font-semibold"
            style={{ fontFamily: theme.font_sans ?? undefined }}
          >
            Sans-Serif Heading
          </p>
          <p
            className="text-lg"
            style={{ fontFamily: theme.font_serif ?? undefined }}
          >
            Serif Body Text
          </p>
          <code
            className="text-sm block"
            style={{
              fontFamily: theme.font_mono ?? undefined,
              backgroundColor: "var(--preview-muted-bg)",
              padding: "0.5rem",
              borderRadius: "var(--preview-radius)",
            }}
          >
            const code = &quot;monospace&quot;;
          </code>
        </div>
      </div>

      {/* Badge Showcase */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "var(--preview-card-bg)",
          borderRadius: "var(--preview-radius)",
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            style={{
              backgroundColor: "var(--preview-primary)",
              color: "white",
              borderRadius: "9999px",
            }}
          >
            Primary
          </span>
          <span
            className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            style={{
              backgroundColor: "var(--preview-accent)",
              color: "white",
              borderRadius: "9999px",
            }}
          >
            Accent
          </span>
          <span
            className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            style={{
              backgroundColor: "var(--preview-muted-bg)",
              borderRadius: "9999px",
            }}
          >
            Muted
          </span>
        </div>
      </div>
    </div>
  );
}
