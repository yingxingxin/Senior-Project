/**
 * Theme Utilities
 *
 * CSS variable generation and color conversion utilities for the dynamic theme system.
 *
 * Key functions:
 * - hslToOklch: Convert HSL color format to OKLCH for modern color spaces
 * - generateThemeCSS: Generate complete CSS variable declarations from theme
 * - parseThemeFromDB: Convert database theme to AdvancedTheme type
 */

import type { Theme } from '@/src/db/schema/lessons';

/**
 * Convert HSL string to OKLCH format
 *
 * HSL format: "220 70% 50%" (hue saturation lightness)
 * OKLCH format: "oklch(0.6 0.15 220)" (lightness chroma hue)
 *
 * For now, we'll use HSL directly in CSS variables since browser support
 * for OKLCH is good but HSL is more universally supported.
 */
export function hslToOklch(hsl: string): string {
  // For now, return HSL format wrapped in hsl()
  // Can be enhanced later for true OKLCH conversion
  return `hsl(${hsl})`;
}

/**
 * Generate CSS variables for a theme
 *
 * Creates CSS custom properties for all theme tokens.
 * Handles both light and dark mode variants.
 * Supports both unified format (*_light/*_dark fields) and legacy format
 *
 * @param theme - Theme object from database
 * @param mode - 'light' or 'dark' mode
 * @returns CSS string with variable declarations
 */
export function generateThemeCSS(theme: Theme, mode: 'light' | 'dark' = 'light'): string {
  const selector = mode === 'dark'
    ? `.dark[data-theme-id="${theme.slug}"]`
    : `:root[data-theme-id="${theme.slug}"]`;

  // Helper to get color from unified theme or fallback to legacy field
  const getColor = (fieldName: string, defaultValue: string): string => {
    if (theme.supports_both_modes) {
      // Unified format: use *_light or *_dark fields
      const suffix = mode === 'dark' ? '_dark' : '_light';
      const modeField = `${fieldName}${suffix}` as keyof Theme;
      return (theme[modeField] as string) || (theme[fieldName as keyof Theme] as string) || defaultValue;
    }
    // Legacy format: use regular fields
    return (theme[fieldName as keyof Theme] as string) || defaultValue;
  };

  return `
${selector} {
  /* Primary colors */
  --primary: ${hslToOklch(getColor('primary', '220 70% 50%'))};
  --primary-foreground: ${hslToOklch(getColor('base_fg', '0 0% 98%'))};

  --secondary: ${hslToOklch(getColor('secondary', '220 20% 90%'))};
  --secondary-foreground: ${hslToOklch(getColor('base_fg', '0 0% 10%'))};

  --accent: ${hslToOklch(getColor('accent', '220 80% 60%'))};
  --accent-foreground: ${hslToOklch(getColor('base_fg', '0 0% 10%'))};

  /* Background colors */
  --background: ${hslToOklch(getColor('base_bg', '0 0% 100%'))};
  --foreground: ${hslToOklch(getColor('base_fg', '0 0% 10%'))};

  /* Card colors */
  --card: ${hslToOklch(getColor('card_bg', '0 0% 100%'))};
  --card-foreground: ${hslToOklch(getColor('card_fg', '0 0% 10%'))};

  /* Popover colors */
  --popover: ${hslToOklch(getColor('popover_bg', '0 0% 100%'))};
  --popover-foreground: ${hslToOklch(getColor('popover_fg', '0 0% 10%'))};

  /* Muted colors */
  --muted: ${hslToOklch(getColor('muted_bg', '220 20% 96%'))};
  --muted-foreground: ${hslToOklch(getColor('muted_fg', '220 10% 40%'))};

  /* Destructive colors */
  --destructive: ${hslToOklch(getColor('destructive_bg', '0 70% 50%'))};
  --destructive-foreground: ${hslToOklch(getColor('destructive_fg', '0 0% 100%'))};

  /* Border and input */
  --border: ${hslToOklch(getColor('muted_bg', '220 20% 90%'))};
  --input: ${hslToOklch(getColor('muted_bg', '220 20% 90%'))};
  --ring: ${hslToOklch(getColor('primary', '220 70% 50%'))};

  /* Border radius */
  --radius: ${theme.radius || '0.5rem'};

  /* Typography */
  --font-sans: ${theme.font_sans || 'Inter, system-ui, sans-serif'};
  --font-serif: ${theme.font_serif || 'Source Serif 4, Georgia, serif'};
  --font-mono: ${theme.font_mono || 'JetBrains Mono, monospace'};
}
  `.trim();
}

/**
 * Generate complete theme CSS for both light and dark modes
 *
 * Handles both formats:
 * - Unified themes: Pass the same theme for both arguments (or just the first)
 *   generateThemeCSS will extract *_light and *_dark colors automatically
 * - Separate themes: Pass different light and dark theme objects
 *
 * @param lightTheme - Theme object (for unified themes, contains both modes)
 * @param darkTheme - Dark mode theme (optional, defaults to lightTheme for unified format)
 * @returns Complete CSS string with both mode selectors
 */
export function generateCompleteThemeCSS(lightTheme: Theme, darkTheme?: Theme): string {
  // For unified themes (supports_both_modes: true), darkTheme can be the same as lightTheme
  // generateThemeCSS will extract the appropriate *_light or *_dark colors based on mode
  const lightCSS = generateThemeCSS(lightTheme, 'light');
  const darkCSS = darkTheme
    ? generateThemeCSS(darkTheme, 'dark')
    : generateThemeCSS(lightTheme, 'dark'); // Use lightTheme for dark mode (unified format)

  return `${lightCSS}\n\n${darkCSS}`;
}

/**
 * Get the default fallback theme
 * Used when no theme is found or for new users
 */
export function getDefaultThemeValues() {
  return {
    slug: 'default-light',
    name: 'Default (Light)',
    primary: '215 95% 55%',
    secondary: '220 15% 92%',
    accent: '165 75% 45%',
    base_bg: '220 20% 98%',
    base_fg: '220 15% 15%',
    card_bg: '0 0% 100%',
    card_fg: '220 15% 15%',
    popover_bg: '0 0% 100%',
    popover_fg: '220 15% 15%',
    muted_bg: '220 15% 95%',
    muted_fg: '220 10% 45%',
    destructive_bg: '0 72% 51%',
    destructive_fg: '0 0% 100%',
    font_sans: 'Inter, system-ui, sans-serif',
    font_serif: 'Source Serif 4, Georgia, serif',
    font_mono: 'JetBrains Mono, monospace',
    letter_spacing: 0,
    radius: '0.5rem',
    hue_shift: 0,
    saturation_adjust: 0,
    lightness_adjust: 0,
    spacing_scale: 1,
    shadow_strength: 'medium' as const,
    is_dark_mode: false,
    is_built_in: true,
  };
}
