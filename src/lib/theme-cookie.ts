/**
 * Server-side Theme Cookie Management
 *
 * Server-only utilities for managing theme ID in cookies.
 * Prevents FOUC (Flash of Unstyled Content) by allowing root layout to know
 * the user's active theme before rendering.
 *
 * Cookie strategy:
 * - Name: 'active-theme-id'
 * - Max-Age: 1 year
 * - Path: '/' (site-wide)
 * - SameSite: 'lax' (security)
 *
 * Note: For client-side cookie operations, use theme-cookie.client.ts
 */

import { cookies } from 'next/headers';

const THEME_COOKIE_NAME = 'active-theme-id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Server-side: Get theme ID from cookie
 *
 * Used in root layout to determine which theme to load.
 * Returns null if cookie doesn't exist.
 */
export async function getThemeIdFromCookie(): Promise<number | null> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME);

  if (!themeCookie) {
    return null;
  }

  const themeId = parseInt(themeCookie.value, 10);
  return isNaN(themeId) ? null : themeId;
}

/**
 * Server-side: Set theme ID cookie
 *
 * Called by server actions when user changes theme.
 * Sets cookie that persists for 1 year.
 */
export async function setThemeIdCookie(themeId: number): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(THEME_COOKIE_NAME, String(themeId), {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Server-side: Delete theme cookie
 *
 * Used when resetting to default theme or logging out.
 */
export async function deleteThemeIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(THEME_COOKIE_NAME);
}
