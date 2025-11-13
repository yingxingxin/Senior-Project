/**
 * Client-side Theme Cookie Management
 *
 * Client-only utilities for managing theme cookies.
 * Used by client components for instant theme updates.
 */

const THEME_COOKIE_NAME = 'active-theme-id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Client-side: Set theme cookie
 *
 * Used by client components for instant theme updates.
 * Must be followed by server action for database persistence.
 */
export function setClientThemeCookie(themeId: number): void {
  if (typeof document === 'undefined') {
    return; // Skip on server
  }

  const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
  document.cookie = `${THEME_COOKIE_NAME}=${themeId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; ${secure}`;
}
