/**
 * Theme Context Hook
 *
 * Provides React Context for managing theme state across the application.
 * Handles instant theme updates with CSS injection and cookie management.
 *
 * Features:
 * - Instant CSS injection (no page refresh needed)
 * - Cookie management for SSR consistency
 * - Cross-tab synchronization via storage events
 * - Loading states during theme changes
 *
 * Usage:
 * const { currentTheme, setTheme, isLoading } = useThemeContext();
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { setClientThemeCookie } from '@/lib/theme-cookie.client';
import { generateCompleteThemeCSS } from '@/lib/theme-utils';
import type { Theme } from '@/src/db/schema/lessons';

interface ThemeContextValue {
  currentTheme: Theme;
  setTheme: (theme: Theme, darkVariant?: Theme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  initialTheme: Theme;
  initialDarkTheme?: Theme;
  children: ReactNode;
}

export function ThemeProvider({
  initialTheme,
  initialDarkTheme,
  children
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);
  const [lightTheme, setLightTheme] = useState<Theme>(initialTheme);
  const [darkTheme, setDarkTheme] = useState<Theme | undefined>(initialDarkTheme);
  const [isLoading, setIsLoading] = useState(false);

  // Get current light/dark mode from next-themes
  const { theme: nextTheme } = useNextTheme();

  /**
   * Inject CSS dynamically into the page
   * Creates or updates a style tag in the document head
   */
  const injectThemeCSS = useCallback((theme: Theme, darkVariant?: Theme) => {
    if (typeof document === 'undefined') return;

    let styleEl = document.getElementById('dynamic-theme-css') as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-theme-css';
      document.head.appendChild(styleEl);
    }

    // Generate CSS for both light and dark modes
    const css = generateCompleteThemeCSS(theme, darkVariant);
    styleEl.textContent = css;
  }, []);

  /**
   * Update the data-theme-id attribute on html element
   */
  const updateThemeAttribute = useCallback((theme: Theme) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme-id', theme.slug);
  }, []);

  /**
   * Set new theme
   * - Updates CSS immediately (optimistic)
   * - Sets cookie for SSR
   * - Broadcasts to other tabs
   *
   * Handles both formats:
   * - Unified themes: One theme with *_light and *_dark colors (supports_both_modes: true)
   * - Separate themes: Pass different light and dark theme objects
   */
  const setTheme = useCallback(async (theme: Theme, darkVariant?: Theme) => {
    setIsLoading(true);

    try {
      // Detect unified theme format
      const isUnifiedTheme = theme.supports_both_modes === true;

      // For unified themes, use the same theme for both light and dark
      // The CSS generation will extract the appropriate *_light/*_dark colors
      const effectiveLightTheme = theme;
      const effectiveDarkTheme = isUnifiedTheme ? theme : (darkVariant || undefined);

      // 1. Update local state (store both light and dark variants)
      setLightTheme(effectiveLightTheme);
      setDarkTheme(effectiveDarkTheme);

      // 2. Set current theme to the unified theme (contains all colors)
      // For unified themes, currentTheme IS the theme (not a variant)
      // The UI extracts mode-specific colors using theme-utils.ts
      setCurrentTheme(theme);

      // 3. Update cookie immediately (save theme ID)
      setClientThemeCookie(theme.id);

      // 4. Inject new CSS (both light and dark variants)
      // For unified themes, pass the same theme - generateCompleteThemeCSS extracts variants
      injectThemeCSS(effectiveLightTheme, effectiveDarkTheme);

      // 5. Update HTML attribute with the base theme slug (no -light/-dark suffix)
      updateThemeAttribute(theme);

      // 6. Broadcast to other tabs via localStorage
      // (This triggers storage event in other tabs)
      localStorage.setItem('theme-update', String(Date.now()));

      // Note: Server action call should be done by the component using this hook
      // to maintain separation of concerns and handle errors properly
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setIsLoading(false);
    }
  }, [injectThemeCSS, updateThemeAttribute, nextTheme]);

  /**
   * Listen for theme changes in other tabs
   * When another tab updates the theme, reload to pick up changes
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-update' && e.newValue) {
        // Reload the page to get new theme from cookie
        // This ensures consistency across tabs
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Listen for next-themes mode changes
   * For unified themes: Keep currentTheme the same (CSS selectors handle light/dark)
   * For separate themes: Switch between lightTheme and darkTheme
   */
  useEffect(() => {
    if (!nextTheme) return; // Wait for next-themes to initialize

    // Check if current theme is unified
    const isUnifiedTheme = currentTheme.supports_both_modes === true;

    if (isUnifiedTheme) {
      // Unified theme: currentTheme stays the same, CSS handles mode switching
      // Just ensure the HTML attribute is correct
      updateThemeAttribute(currentTheme);
    } else {
      // Separate themes: Switch between light and dark variants
      const isDark = nextTheme === 'dark';
      const newTheme = (isDark && darkTheme) ? darkTheme : lightTheme;

      if (newTheme.slug !== currentTheme.slug) {
        setCurrentTheme(newTheme);
        updateThemeAttribute(newTheme);
      }
    }
  }, [nextTheme, lightTheme, darkTheme, currentTheme, updateThemeAttribute]);

  /**
   * Initialize CSS on mount
   * This ensures the theme CSS is present even if server-rendered CSS is missing
   */
  useEffect(() => {
    injectThemeCSS(lightTheme, darkTheme);
    updateThemeAttribute(currentTheme);
  }, [lightTheme, darkTheme, currentTheme, injectThemeCSS, updateThemeAttribute]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Throws error if used outside ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
}
