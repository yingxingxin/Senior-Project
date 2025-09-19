// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { removeAuthCookie } from '@/lib/auth'

/**
 * POST /api/auth/logout
 *
 * Purpose:
 * - Invalidate the current browser session by clearing the auth cookie.
 *
 * Behavior:
 * - Idempotent: safe to call multiple times (cookie is expired each time).
 * - No redirects here; the client decides the next navigation step.
 * - No DB access or external calls.
 *
 * Security:
 * - `removeAuthCookie` issues a Set-Cookie with maxAge=0 and the same
 *   attributes used when the cookie was set (httpOnly, sameSite, path, etc.).
 * - Response body contains no sensitive data.
 */
export async function POST() {
  // Build the JSON response first
  const response = NextResponse.json(
    { ok: true, message: 'Logged out successfully' },
    { status: 200 }
  )

  // Expire the auth cookie on this response so the browser drops the session.
  removeAuthCookie(response)

  // Return the response along with Set-Cookie.
  return response
}