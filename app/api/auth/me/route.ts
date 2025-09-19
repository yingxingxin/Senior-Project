// app/api/auth/me/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { db, users } from '@/src/db'
import { eq } from 'drizzle-orm'
import { getSessionFromRequest, type AuthResponse } from '@/lib/auth'

/**
 * GET /api/auth/me
 *
 * Purpose
 * - Return the currently signed-in user's basic profile, using the auth cookie.
 *
 * How it works
 * 1) Read the cookie that holds the auth token
 * 2) Verify that ticket (cryptographic check + expiration).
 * 3) Look up the user in the database by the id inside the ticket.
 * 4) Return a minimal profile (id, email, username).
 *
 * Notes
 * - If there is no valid auth token, we respond 401.
 * - If the auth token is valid but the DB row is gone, we respond 404.
 * - We never return sensitive fields (password hash, etc).
 */
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json<AuthResponse>(
      { ok: false, errors: ['Not authenticated'] },
      { status: 401, headers: { 'cache-control': 'no-store' } }
    )
  }

  try {
    // Look up the user in the database by the id inside the auth token
    const [user] = await db
      .select({
        userId: users.userId,
        email: users.email,
        username: users.username,
      })
      .from(users)
      .where(eq(users.userId, session.userId))
      .limit(1)

    // If the user is not found, return a 404 error
    if (!user) {
      return NextResponse.json<AuthResponse>(
        { ok: false, errors: ['User not found'] },
        { status: 404, headers: { 'cache-control': 'no-store' } }
      )
    }

    return NextResponse.json<AuthResponse>(
      {
        ok: true,
        user: {
          id: user.userId,
          email: user.email,
          username: user.username,
        },
      },
      { status: 200, headers: { 'cache-control': 'no-store' } }
    )
  } catch (err) {
    // log error in server console
    console.error(
      'me route error:',
      err instanceof Error ? err.message : String(err)
    )
    // return a 500 error
    return NextResponse.json<AuthResponse>(
      { ok: false, errors: ['Failed to load profile'] },
      { status: 500, headers: { 'cache-control': 'no-store' } }
    )
  }
}
