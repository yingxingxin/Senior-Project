"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme as useNextTheme } from "next-themes";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemePreviewDashboard } from "../../_components/theme-editor/theme-preview-dashboard";
import { ThemeSelector } from "../../_components/theme-editor/theme-selector";
import { UnsavedChangesModal } from "../../_components/theme-editor/unsaved-changes-modal";
import { getBuiltInTheme } from "../../_components/theme-editor/built-in-themes";
import { useThemeContext } from "@/hooks/use-theme-context";
import { useSession } from "@/hooks/use-session";
import { getAllThemes, applyCustomTheme } from "../../_lib/theme-actions";
import type { AdvancedTheme } from "../../_components/theme-editor/types";
import type { Theme } from "@/src/db/schema/lessons";

/**
 * Theme Editor Layout
 *
 * Provides split-view layout for advanced theme editor:
 * - Left panel: Editor tabs (navigable via routes)
 * - Right panel: Live preview dashboard
 * - Shared theme state across all editor tabs via React Context
 * - Save button applies theme globally
 *
 * Architecture Decision:
 * - Uses Next.js App Router for tab navigation (colors, typography, other, generate)
 * - React Context shares theme state between layout and route pages
 * - Preview updates in real-time as user edits
 * - Integrates with global theme context to apply themes to entire page
 * - Light/dark mode toggle controls entire app appearance via next-themes
 */

// Theme Editor Context
interface ThemeEditorContextValue {
  theme: AdvancedTheme;
  onChange: (updates: Partial<AdvancedTheme>) => void;
  userId: number | undefined;
}

const ThemeEditorContext = createContext<ThemeEditorContextValue | null>(null);

export function useThemeEditor() {
  const context = useContext(ThemeEditorContext);
  if (!context) {
    throw new Error("useThemeEditor must be used within ThemeEditorProvider");
  }
  return context;
}

const EDITOR_TABS = [
  { label: "Colors", href: "/settings/themes/editor/colors" },
  { label: "Typography", href: "/settings/themes/editor/typography" },
  { label: "Other", href: "/settings/themes/editor/other" },
  { label: "✨ Generate", href: "/settings/themes/editor/generate" },
];

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme, setTheme: setGlobalTheme } = useThemeContext();
  const { theme: nextThemeMode, setTheme: setNextTheme } = useNextTheme();
  const { userId } = useSession();

  const [theme, setTheme] = useState<AdvancedTheme>(convertThemeToAdvanced(currentTheme));
  const [originalTheme, setOriginalTheme] = useState<AdvancedTheme>(convertThemeToAdvanced(currentTheme));
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbThemes, setDbThemes] = useState<Theme[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Load database themes (only current user's custom themes)
  useEffect(() => {
    const loadThemes = async () => {
      if (!userId) return;

      try {
        const themes = await getAllThemes();
        // Only include current user's custom themes (not built-in themes)
        // Built-in themes come from BUILT_IN_THEMES constant instead
        const userCustomThemes = themes.filter(
          t => !t.is_built_in && t.user_id === userId
        );
        setDbThemes(userCustomThemes);
      } catch (error) {
        console.error("Failed to load themes:", error);
      }
    };

    loadThemes();
  }, [userId]);

  // Sync editor theme with global theme when it changes
  useEffect(() => {
    const converted = convertThemeToAdvanced(currentTheme);
    setTheme(converted);
    setOriginalTheme(converted);
    setHasUnsavedChanges(false);
  }, [currentTheme]);

  /**
   * Handle theme property changes (colors, typography, etc.)
   * Maps generic color updates to mode-specific fields (*_light or *_dark)
   * Auto-forks built-in themes on first edit to create custom copy with BOTH variants
   */
  const handleThemeChange = (updates: Partial<AdvancedTheme>) => {
    setTheme((prev) => {
      // Map generic color updates to mode-specific fields based on current mode
      // Example: { primary: "..." } → { primary_light: "..." } in light mode
      //                             → { primary_dark: "..." } in dark mode
      const isDark = nextThemeMode === 'dark';
      const mappedUpdates: Partial<AdvancedTheme> = { ...updates };

      // If theme supports both modes, map color updates to mode-specific fields
      if (prev.supports_both_modes) {
        const colorFields = ['primary', 'secondary', 'accent', 'base_bg', 'base_fg',
                            'card_bg', 'card_fg', 'popover_bg', 'popover_fg',
                            'muted_bg', 'muted_fg', 'destructive_bg', 'destructive_fg'];

        colorFields.forEach(field => {
          if (field in updates) {
            const suffix = isDark ? '_dark' : '_light';
            const targetField = `${field}${suffix}` as keyof AdvancedTheme;
            const value = updates[field as keyof AdvancedTheme];
            (mappedUpdates as Record<string, unknown>)[targetField] = value ?? undefined;

            // Also update the legacy field for backward compatibility
            (mappedUpdates as Record<string, unknown>)[field] = value ?? undefined;
          }
        });
      }

      // Check if this is the first edit of a built-in theme
      // A forked theme will have parent_theme_id set, so only fork if it's null
      if (prev.is_built_in && !prev.parent_theme_id) {
        // Auto-fork: create custom copy of built-in theme with BOTH light and dark variants
        const baseSlug = prev.slug;

        // Generate unique name: "Custom [Original Name] [number]"
        const baseName = prev.name;

        // Find existing custom themes with similar names to determine next number
        const existingCustomThemes = dbThemes.filter(t =>
          t.name?.startsWith(`Custom ${baseName}`) &&
          t.parent_theme_id === prev.id
        );

        // Determine next number in sequence (1, 2, 3, etc.)
        const nextNumber = existingCustomThemes.length + 1;
        const customName = `Custom ${baseName} ${nextNumber}`;

        const customTheme: AdvancedTheme = {
          ...prev, // Copy BOTH light and dark color variants
          ...mappedUpdates, // Apply the current edits
          id: 0, // New theme, will get ID on save
          slug: `${baseSlug}-custom-${userId}-${nextNumber}`,
          name: customName,
          is_built_in: false,
          // Only set parent_theme_id if valid database ID exists (not hardcoded id: 0)
          parent_theme_id: prev.id > 0 ? prev.id : null,
          user_id: userId ?? null,
          supports_both_modes: true, // Forked themes always support both modes
        };

        return customTheme;
      }

      // Normal edit: update existing theme
      return { ...prev, ...mappedUpdates };
    });

    setHasUnsavedChanges(true);
  };

  /**
   * Handle theme selection from theme selector
   * Applies theme globally via theme context (CSS only, doesn't save to DB)
   */
  const handleThemeSelect = async (selectedTheme: AdvancedTheme) => {
    setTheme(selectedTheme);
    setOriginalTheme(selectedTheme);
    setHasUnsavedChanges(false);

    // Convert to Theme format and apply to global theme context
    // Unified themes contain both light and dark variants in one object
    // Pass the same theme for both - generateCompleteThemeCSS extracts variants
    const themeRecord = convertAdvancedToTheme(selectedTheme);
    await setGlobalTheme(themeRecord);
  };

  /**
   * Handle light/dark mode toggle
   * Changes entire page appearance via next-themes
   */
  const handleModeToggle = () => {
    const newMode = nextThemeMode === 'dark' ? 'light' : 'dark';
    setNextTheme(newMode);
  };

  const handleToggleSelector = () => {
    setIsThemeSelectorOpen(!isThemeSelectorOpen);
  };

  /**
   * Save current theme as custom theme
   * Creates or updates a custom theme in the database
   */
  const handleSaveTheme = async () => {
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    setIsSaving(true);
    try {
      await applyCustomTheme(userId, theme);
      console.log("Custom theme saved successfully");
    } catch (error) {
      console.error("Failed to save custom theme:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save theme to database
   * Handles both built-in theme forks and custom theme updates
   */
  const handleSave = async () => {
    if (!userId) {
      console.error("User ID not available - cannot save theme");
      return;
    }

    setIsSaving(true);
    try {
      // Save theme to database (creates new or updates existing)
      // Returns the theme ID after save
      const savedThemeId = await applyCustomTheme(userId, theme);

      // Update local theme state with the saved ID
      // This ensures future edits will update (not create new)
      const updatedTheme = { ...theme, id: savedThemeId };
      setTheme(updatedTheme);
      setOriginalTheme(updatedTheme);

      // After saving, update global theme context with saved theme
      // Unified theme contains both light and dark variants
      const themeRecord = convertAdvancedToTheme(updatedTheme);
      await setGlobalTheme(themeRecord);

      // Mark as saved
      setHasUnsavedChanges(false);

      // Reload database themes to show the new custom theme in selector
      const themes = await getAllThemes();
      const userCustomThemes = themes.filter(
        t => !t.is_built_in && t.user_id === userId
      );
      setDbThemes(userCustomThemes);

      console.log("Theme saved successfully");
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle close button click
   * Shows warning modal if there are unsaved changes
   */
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      router.push('/settings/themes');
    }
  };

  /**
   * Handle discard changes from modal
   * Navigates away without saving
   */
  const handleDiscardChanges = () => {
    setShowUnsavedModal(false);
    router.push('/settings/themes');
  };

  /**
   * Handle save and close from modal
   * Saves theme then navigates away
   */
  const handleSaveAndClose = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    router.push('/settings/themes');
  };

  // Browser refresh/close warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Get current mode (light/dark)
  const isDarkMode = nextThemeMode === 'dark';

  return (
    <ThemeEditorContext.Provider value={{ theme, onChange: handleThemeChange, userId }}>
      <div className="fixed inset-0 z-50 bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-semibold">Advanced Theme Editor</h2>
              <p className="text-sm text-muted-foreground">
                Customize colors, typography, and spacing
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Save Button with visual states */}
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                variant={hasUnsavedChanges ? "default" : "outline"}
              >
                {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Changes •" : "Saved ✓"}
              </Button>

              {/* Close Button with unsaved changes guard */}
              <Button
                variant="ghost"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Split View: Editor (Left) + Preview (Right) */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Left Panel: Editor Tabs
              Scroll Structure: Tabs fixed at top, only content scrolls
              - Tab navigation stays visible during scroll
              - Content area uses flex-1 to fill remaining height
              - Each tab's content scrolls independently */}
          <div className="w-full lg:w-1/2 border-r border-border flex flex-col">
            {/* Theme Selector Trigger Button */}
            <button
              onClick={handleToggleSelector}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Color Dots - Preview of Current Theme */}
                <div className="flex gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-border"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                  <div
                    className="h-5 w-5 rounded-full border-2 border-border"
                    style={{ backgroundColor: `hsl(${theme.secondary})` }}
                  />
                  <div
                    className="h-5 w-5 rounded-full border-2 border-border"
                    style={{ backgroundColor: `hsl(${theme.accent})` }}
                  />
                  <div
                    className="h-5 w-5 rounded-full border-2 border-border"
                    style={{ backgroundColor: `hsl(${theme.base_bg})` }}
                  />
                </div>

                {/* Theme Name */}
                <span className="text-sm font-medium">{theme.name}</span>
              </div>

              {/* Chevron Icon */}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isThemeSelectorOpen && "rotate-180"
                )}
              />
            </button>

            {/* Theme Selector - Conditionally Rendered */}
            {isThemeSelectorOpen && (
              <ThemeSelector
                currentTheme={theme}
                isDarkMode={isDarkMode}
                savedThemes={dbThemes.map(convertThemeToAdvanced)}
                onThemeSelect={handleThemeSelect}
                onModeToggle={handleModeToggle}
                onSaveTheme={handleSaveTheme}
              />
            )}

            {/* Fixed Tab Navigation */}
            <div className="px-6 pt-6">
              <div className="flex gap-1 border-b border-border">
                {EDITOR_TABS.map((tab) => (
                  <Link key={tab.href} href={tab.href}>
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                        pathname === tab.href
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      {tab.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {children}
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div
            className="hidden lg:block w-1/2 overflow-y-auto"
            style={{ backgroundColor: `hsl(${theme.base_bg})` }}
          >
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
              <p className="text-sm font-medium">Live Preview</p>
              <p className="text-xs text-muted-foreground">
                See your changes in real-time
              </p>
            </div>
            <div className="p-6">
              <ThemePreviewDashboard theme={theme} />
            </div>
          </div>
        </div>

        {/* Unsaved Changes Warning Modal */}
        <UnsavedChangesModal
          open={showUnsavedModal}
          onOpenChange={setShowUnsavedModal}
          onDiscard={handleDiscardChanges}
          onSave={handleSaveAndClose}
          isSaving={isSaving}
        />
      </div>
    </ThemeEditorContext.Provider>
  );
}

/**
 * Convert Theme (from database) to AdvancedTheme (editor format)
 * Ensures all required properties exist with sensible defaults
 * Handles both old format (split light/dark) and new unified format
 */
function convertThemeToAdvanced(theme: Theme): AdvancedTheme {
  return {
    id: theme.id ?? 0,
    slug: theme.slug ?? 'custom',
    name: theme.name ?? 'Custom Theme',

    // Legacy color fields (for backward compatibility)
    primary: theme.primary ?? "215 95% 55%",
    secondary: theme.secondary ?? "220 15% 92%",
    accent: theme.accent ?? "165 75% 45%",
    base_bg: theme.base_bg ?? "220 20% 98%",
    base_fg: theme.base_fg ?? "220 15% 15%",
    card_bg: theme.card_bg ?? "0 0% 100%",
    card_fg: theme.card_fg ?? "220 15% 15%",
    popover_bg: theme.popover_bg ?? "0 0% 100%",
    popover_fg: theme.popover_fg ?? "220 15% 15%",
    muted_bg: theme.muted_bg ?? "220 15% 95%",
    muted_fg: theme.muted_fg ?? "220 10% 45%",
    destructive_bg: theme.destructive_bg ?? "0 72% 51%",
    destructive_fg: theme.destructive_fg ?? "0 0% 100%",

    // Unified theme fields - Light mode variants
    primary_light: theme.primary_light ?? theme.primary ?? "215 95% 55%",
    secondary_light: theme.secondary_light ?? theme.secondary ?? "220 15% 92%",
    accent_light: theme.accent_light ?? theme.accent ?? "165 75% 45%",
    base_bg_light: theme.base_bg_light ?? theme.base_bg ?? "220 20% 98%",
    base_fg_light: theme.base_fg_light ?? theme.base_fg ?? "220 15% 15%",
    card_bg_light: theme.card_bg_light ?? theme.card_bg ?? "0 0% 100%",
    card_fg_light: theme.card_fg_light ?? theme.card_fg ?? "220 15% 15%",
    popover_bg_light: theme.popover_bg_light ?? theme.popover_bg ?? "0 0% 100%",
    popover_fg_light: theme.popover_fg_light ?? theme.popover_fg ?? "220 15% 15%",
    muted_bg_light: theme.muted_bg_light ?? theme.muted_bg ?? "220 15% 95%",
    muted_fg_light: theme.muted_fg_light ?? theme.muted_fg ?? "220 10% 45%",
    destructive_bg_light: theme.destructive_bg_light ?? theme.destructive_bg ?? "0 72% 51%",
    destructive_fg_light: theme.destructive_fg_light ?? theme.destructive_fg ?? "0 0% 100%",

    // Unified theme fields - Dark mode variants
    primary_dark: theme.primary_dark ?? "215 95% 60%",
    secondary_dark: theme.secondary_dark ?? "220 15% 18%",
    accent_dark: theme.accent_dark ?? "165 75% 50%",
    base_bg_dark: theme.base_bg_dark ?? "220 20% 10%",
    base_fg_dark: theme.base_fg_dark ?? "220 15% 92%",
    card_bg_dark: theme.card_bg_dark ?? "220 15% 14%",
    card_fg_dark: theme.card_fg_dark ?? "220 15% 92%",
    popover_bg_dark: theme.popover_bg_dark ?? "220 15% 16%",
    popover_fg_dark: theme.popover_fg_dark ?? "220 15% 92%",
    muted_bg_dark: theme.muted_bg_dark ?? "220 15% 18%",
    muted_fg_dark: theme.muted_fg_dark ?? "220 10% 60%",
    destructive_bg_dark: theme.destructive_bg_dark ?? "0 72% 55%",
    destructive_fg_dark: theme.destructive_fg_dark ?? "0 0% 100%",

    // Typography (shared)
    font: theme.font ?? "Inter",
    font_sans: theme.font_sans ?? "Inter, system-ui, sans-serif",
    font_serif: theme.font_serif ?? "Source Serif 4, Georgia, serif",
    font_mono: theme.font_mono ?? "JetBrains Mono, monospace",
    letter_spacing: theme.letter_spacing ?? 0,

    // Layout (shared)
    radius: theme.radius ?? "0.5rem",
    hue_shift: theme.hue_shift ?? 0,
    saturation_adjust: theme.saturation_adjust ?? 0,
    lightness_adjust: theme.lightness_adjust ?? 0,
    spacing_scale: theme.spacing_scale ?? 1,
    shadow_strength: (theme.shadow_strength as "none" | "subtle" | "medium" | "strong" | null) ?? "medium",

    // Metadata
    is_dark_mode: theme.is_dark_mode ?? false,
    parent_theme_id: theme.parent_theme_id ?? null,
    user_id: theme.user_id ?? null,
    is_built_in: theme.is_built_in ?? false,
    supports_both_modes: theme.supports_both_modes ?? false,
  };
}

/**
 * Convert AdvancedTheme (editor format) to Theme (database format)
 * Used when saving themes to database or applying globally
 * Includes both legacy fields and new unified *_light/*_dark fields
 */
function convertAdvancedToTheme(advancedTheme: AdvancedTheme): Theme {
  return {
    id: advancedTheme.id,
    slug: advancedTheme.slug,
    name: advancedTheme.name,

    // Legacy fields
    primary: advancedTheme.primary,
    secondary: advancedTheme.secondary,
    accent: advancedTheme.accent,
    base_bg: advancedTheme.base_bg,
    base_fg: advancedTheme.base_fg,
    card_bg: advancedTheme.card_bg,
    card_fg: advancedTheme.card_fg,
    popover_bg: advancedTheme.popover_bg,
    popover_fg: advancedTheme.popover_fg,
    muted_bg: advancedTheme.muted_bg,
    muted_fg: advancedTheme.muted_fg,
    destructive_bg: advancedTheme.destructive_bg,
    destructive_fg: advancedTheme.destructive_fg,

    // Unified fields - Light mode variants
    primary_light: advancedTheme.primary_light,
    secondary_light: advancedTheme.secondary_light,
    accent_light: advancedTheme.accent_light,
    base_bg_light: advancedTheme.base_bg_light,
    base_fg_light: advancedTheme.base_fg_light,
    card_bg_light: advancedTheme.card_bg_light,
    card_fg_light: advancedTheme.card_fg_light,
    popover_bg_light: advancedTheme.popover_bg_light,
    popover_fg_light: advancedTheme.popover_fg_light,
    muted_bg_light: advancedTheme.muted_bg_light,
    muted_fg_light: advancedTheme.muted_fg_light,
    destructive_bg_light: advancedTheme.destructive_bg_light,
    destructive_fg_light: advancedTheme.destructive_fg_light,

    // Unified fields - Dark mode variants
    primary_dark: advancedTheme.primary_dark,
    secondary_dark: advancedTheme.secondary_dark,
    accent_dark: advancedTheme.accent_dark,
    base_bg_dark: advancedTheme.base_bg_dark,
    base_fg_dark: advancedTheme.base_fg_dark,
    card_bg_dark: advancedTheme.card_bg_dark,
    card_fg_dark: advancedTheme.card_fg_dark,
    popover_bg_dark: advancedTheme.popover_bg_dark,
    popover_fg_dark: advancedTheme.popover_fg_dark,
    muted_bg_dark: advancedTheme.muted_bg_dark,
    muted_fg_dark: advancedTheme.muted_fg_dark,
    destructive_bg_dark: advancedTheme.destructive_bg_dark,
    destructive_fg_dark: advancedTheme.destructive_fg_dark,

    // Typography
    font: advancedTheme.font,
    font_sans: advancedTheme.font_sans,
    font_serif: advancedTheme.font_serif,
    font_mono: advancedTheme.font_mono,
    letter_spacing: advancedTheme.letter_spacing,

    // Layout
    radius: advancedTheme.radius,
    hue_shift: advancedTheme.hue_shift,
    saturation_adjust: advancedTheme.saturation_adjust,
    lightness_adjust: advancedTheme.lightness_adjust,
    spacing_scale: advancedTheme.spacing_scale,
    shadow_strength: advancedTheme.shadow_strength,

    // Metadata
    is_dark_mode: advancedTheme.is_dark_mode ?? false,
    parent_theme_id: advancedTheme.parent_theme_id ?? null,
    user_id: advancedTheme.user_id ?? null,
    is_built_in: advancedTheme.is_built_in ?? false,
    supports_both_modes: advancedTheme.supports_both_modes,
  };
}
