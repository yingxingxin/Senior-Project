/**
 * Theme colors for poster stills
 *
 * Light mode saves ink when printing for posterboards.
 * Dark mode matches the app's default appearance.
 */

export const LIGHT_THEME = {
  // Backgrounds
  background: "#f5f5f5",
  cardBg: "white",
  cardBgSubtle: "rgba(0, 0, 0, 0.02)",
  cardBgHover: "rgba(0, 0, 0, 0.04)",
  inputBg: "#f9fafb",

  // Text
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  textOnAccent: "white",

  // Borders
  border: "rgba(0, 0, 0, 0.1)",
  borderSubtle: "rgba(0, 0, 0, 0.06)",
  borderStrong: "rgba(0, 0, 0, 0.15)",

  // Brand accent (stays same in both themes)
  accent: "#667eea",
  accentSecondary: "#764ba2",
  accentGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  accentBgSubtle: "rgba(102, 126, 234, 0.1)",
  accentBgSelected: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
  accentBorder: "rgba(102, 126, 234, 0.3)",
  accentBorderSelected: "rgba(102, 126, 234, 0.5)",

  // Shadows
  shadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  shadowStrong: "0 4px 20px rgba(0, 0, 0, 0.12)",
  accentShadow: "0 4px 20px rgba(102, 126, 234, 0.25)",

  // Status colors
  success: { bg: "rgba(34, 197, 94, 0.15)", text: "#16a34a" },
  warning: { bg: "rgba(234, 179, 8, 0.15)", text: "#ca8a04" },
  error: { bg: "rgba(239, 68, 68, 0.15)", text: "#dc2626" },

  // Code blocks
  codeBg: "#f8f8f8",
  codeHeaderBg: "#eeeeee",
  codeBorder: "#e5e5e5",
  codeText: "#1f2937",
  codeKeyword: "#8b5cf6",
  codeString: "#b45309",
  codeComment: "#16a34a",
  codeNumber: "#0891b2",

  // Streak/special
  streakColor: "#f97316",

  // Headline gradient (for hero sections)
  headlineGradient: "linear-gradient(135deg, #1f2937 0%, #667eea 100%)",

  // Progress indicators
  progressInactive: "rgba(0, 0, 0, 0.15)",

  // className for dark mode wrapper (empty for light)
  className: "",
};

export const DARK_THEME = {
  // Backgrounds
  background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
  cardBg: "rgba(255, 255, 255, 0.03)",
  cardBgSubtle: "rgba(255, 255, 255, 0.02)",
  cardBgHover: "rgba(255, 255, 255, 0.05)",
  inputBg: "rgba(255, 255, 255, 0.05)",

  // Text
  textPrimary: "white",
  textSecondary: "rgba(255, 255, 255, 0.5)",
  textMuted: "rgba(255, 255, 255, 0.3)",
  textOnAccent: "white",

  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  borderStrong: "rgba(255, 255, 255, 0.15)",

  // Brand accent (stays same in both themes)
  accent: "#667eea",
  accentSecondary: "#764ba2",
  accentGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  accentBgSubtle: "rgba(102, 126, 234, 0.2)",
  accentBgSelected: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
  accentBorder: "rgba(102, 126, 234, 0.3)",
  accentBorderSelected: "rgba(102, 126, 234, 0.5)",

  // Shadows
  shadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  shadowStrong: "0 4px 20px rgba(0, 0, 0, 0.3)",
  accentShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",

  // Status colors
  success: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
  warning: { bg: "rgba(234, 179, 8, 0.2)", text: "#eab308" },
  error: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },

  // Code blocks
  codeBg: "#1e1e1e",
  codeHeaderBg: "#2d2d2d",
  codeBorder: "#374151",
  codeText: "#e0e0e0",
  codeKeyword: "#c586c0",
  codeString: "#ce9178",
  codeComment: "#6a9955",
  codeNumber: "#b5cea8",

  // Streak/special
  streakColor: "#f97316",

  // Headline gradient (for hero sections)
  headlineGradient: "linear-gradient(135deg, #ffffff 0%, #667eea 100%)",

  // Progress indicators
  progressInactive: "rgba(255, 255, 255, 0.2)",

  // className for dark mode wrapper
  className: "dark",
};

export type Theme = typeof LIGHT_THEME;
