"use client";

import { useState } from "react";
import { Search, Sun, Moon, Shuffle, Check, Heart } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BUILT_IN_THEMES, getRandomBuiltInTheme } from "./built-in-themes";
import type { AdvancedTheme } from "./types";

/**
 * Theme Selector Component
 *
 * UI for browsing and selecting themes:
 * - Built-in themes (hardcoded, always available)
 * - Saved custom themes (from database)
 * - Search filter
 * - Light/dark mode toggle (controls entire app appearance)
 * - Shuffle for random selection
 * - Save current theme button
 *
 * Architecture: Unified Theme Format
 * - Each theme contains BOTH light and dark color variants (*_light, *_dark fields)
 * - Light/dark mode toggle changes the entire page appearance
 * - Theme selection persists across mode changes (same theme, different colors)
 * - Color dots display mode-specific colors based on current isDarkMode
 * - Active theme shows a checkmark
 * - No filtering by mode - all themes visible in both light/dark modes
 */

interface ThemeSelectorProps {
  currentTheme: AdvancedTheme;
  isDarkMode: boolean;
  savedThemes?: AdvancedTheme[];
  onThemeSelect: (theme: AdvancedTheme) => void;
  onModeToggle: () => void;
  onSaveTheme: () => void;
}

export function ThemeSelector({
  currentTheme,
  isDarkMode,
  savedThemes = [],
  onThemeSelect,
  onModeToggle,
  onSaveTheme,
}: ThemeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all built-in themes (unified format - no separate light/dark)
  // BUILT_IN_THEMES contains unified themes with both light and dark variants
  const builtInThemes = BUILT_IN_THEMES;

  // All themes are now in unified format - no filtering by mode needed
  // Each theme contains both *_light and *_dark color fields
  // The UI extracts the correct colors based on current isDarkMode
  const allThemes = [...builtInThemes, ...savedThemes];

  // Filter themes by search query
  const filteredThemes = allThemes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into sections
  const filteredBuiltIn = filteredThemes.filter((theme) =>
    builtInThemes.some((bt) => bt.slug === theme.slug)
  );
  const filteredSaved = filteredThemes.filter((theme) =>
    savedThemes.some((st) => st.slug === theme.slug)
  );

  const handleShuffle = () => {
    // getRandomBuiltInTheme() now returns unified theme (no mode parameter needed)
    const randomTheme = getRandomBuiltInTheme();
    onThemeSelect(randomTheme);
  };

  /**
   * Check if a theme is active
   * Compare base slug (without -light/-dark suffix) to handle variants
   */
  const isThemeActive = (theme: AdvancedTheme) => {
    const currentBaseSlug = currentTheme.slug.replace(/-light$|-dark$/, '');
    const themeBaseSlug = theme.slug.replace(/-light$|-dark$/, '');
    return currentBaseSlug === themeBaseSlug;
  };

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="px-6 py-4 space-y-4">
        {/* Header Row: Search + Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <InputGroup className="flex-1">
            <InputGroupInput
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>

          {/* Theme Count Badge */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 bg-muted rounded-md">
            <span className="font-medium">{filteredThemes.length}</span>
            <span>themes</span>
          </div>

          {/* Light/Dark Toggle
              Fixed size container prevents layout shift on icon change
              Icon swap animates via opacity for smoother transition */}
          <Button
            variant="outline"
            size="icon"
            onClick={onModeToggle}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="relative"
          >
            <Moon className={cn(
              "h-4 w-4 absolute inset-0 m-auto transition-opacity duration-200",
              isDarkMode ? "opacity-100" : "opacity-0"
            )} />
            <Sun className={cn(
              "h-4 w-4 absolute inset-0 m-auto transition-opacity duration-200",
              isDarkMode ? "opacity-0" : "opacity-100"
            )} />
          </Button>

          {/* Shuffle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleShuffle}
            title="Random theme"
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          {/* Save Theme Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveTheme}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Save
          </Button>
        </div>

        {/* Theme List
            Fixed height container prevents layout shift when themes change
            between light/dark mode. Content scrolls within fixed space. */}
        <div className="space-y-4 h-[300px] overflow-y-auto">
          {/* Built-in Themes Section */}
          {filteredBuiltIn.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                Built-in Themes
              </h3>
              <div className="space-y-1">
                {filteredBuiltIn.map((theme) => (
                  <ThemeListItem
                    key={theme.slug}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    isActive={isThemeActive(theme)}
                    onClick={() => onThemeSelect(theme)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Saved Themes Section */}
          {filteredSaved.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                Saved Themes
              </h3>
              <div className="space-y-1">
                {filteredSaved.map((theme) => (
                  <ThemeListItem
                    key={theme.slug}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    isActive={isThemeActive(theme)}
                    onClick={() => onThemeSelect(theme)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredThemes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No themes found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Theme List Item
 *
 * Displays a single theme with:
 * - 4 color dots (primary, secondary, accent, base_bg) - mode-aware
 * - Theme name (without "(Light)" or "(Dark)" suffix for unified themes)
 * - Checkmark if active
 *
 * For unified themes, extracts colors from *_light or *_dark fields based on current mode
 */
interface ThemeListItemProps {
  theme: AdvancedTheme;
  isDarkMode: boolean;
  isActive: boolean;
  onClick: () => void;
}

function ThemeListItem({ theme, isDarkMode, isActive, onClick }: ThemeListItemProps) {
  // Extract mode-specific colors from unified theme
  // If theme supports both modes, use *_light or *_dark fields
  // Otherwise fallback to legacy fields
  const getColor = (colorName: string): string => {
    if (theme.supports_both_modes) {
      const suffix = isDarkMode ? '_dark' : '_light';
      const modeField = `${colorName}${suffix}` as keyof AdvancedTheme;
      return (theme[modeField] as string) ?? (theme[colorName as keyof AdvancedTheme] as string) ?? "220 70% 50%";
    }
    // Fallback to legacy fields
    return (theme[colorName as keyof AdvancedTheme] as string) ?? "220 70% 50%";
  };

  const primary = getColor('primary');
  const secondary = getColor('secondary');
  const accent = getColor('accent');
  const base_bg = getColor('base_bg');

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
        "hover:bg-muted/50",
        isActive && "bg-primary/10 border-2 border-primary"
      )}
    >
      {/* Color Dots - Show mode-specific colors */}
      <div className="flex gap-1.5">
        <div
          className="h-5 w-5 rounded-full border-2 border-border"
          style={{ backgroundColor: `hsl(${primary})` }}
          title="Primary"
        />
        <div
          className="h-5 w-5 rounded-full border-2 border-border"
          style={{ backgroundColor: `hsl(${secondary})` }}
          title="Secondary"
        />
        <div
          className="h-5 w-5 rounded-full border-2 border-border"
          style={{ backgroundColor: `hsl(${accent})` }}
          title="Accent"
        />
        <div
          className="h-5 w-5 rounded-full border-2 border-border"
          style={{ backgroundColor: `hsl(${base_bg})` }}
          title="Background"
        />
      </div>

      {/* Theme Name */}
      <span className="flex-1 text-sm font-medium">{theme.name}</span>

      {/* Active Checkmark */}
      {isActive && (
        <Check className="h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );
}
