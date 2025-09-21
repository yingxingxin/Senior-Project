// app/api/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { db, users } from '@/src/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

import {
  createAuthToken,
  AUTH_COOKIE,
  COOKIE_OPTIONS,
  loginSchema,
  authResponseSchema,
  flattenZodErrors,
  type LoginInput,
  type AuthResponse,
} from '@/lib/auth'

/**
 * POST /api/auth/login
 *
 * Flow:
 * 1) Parse and validate request body.
 * 2) Look up user by normalized email.
 * 3) Compare bcrypt encrypted password.
 * 4) Sign short-lived token; set httpOnly cookie.
 * 5) Return minimal user profile.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate the request body
    const validation = loginSchema.safeParse(await request.json())

    if (!validation.success) {
      const errors = flattenZodErrors(validation.error)

      return NextResponse.json<AuthResponse>(
        authResponseSchema.parse({
          ok: false,
          errors,
        }),
        { status: 400 }
      )
    }

    const formData: LoginInput = validation.data

    // Generic error to use if email or password is invalid
    const invalidCreds = NextResponse.json<AuthResponse>(
      authResponseSchema.parse({
        ok: false,
        errors: [
          {
            field: 'root',
            message: 'Invalid email or password',
          },
        ],
      }),
      { status: 401 }
    )

    // Find user in db by email
    const [userByEmail] = await db
      .select({
        id: users.userId,
        email: users.email,
        username: users.username,
        passwordHash: users.password, // stored bcrypt encrypted password
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.email, formData.email))
      .limit(1)

    if (!userByEmail) return invalidCreds

    // Compare bcrypt encrypted password
    const isPasswordValid = await bcrypt.compare(formData.password, userByEmail.passwordHash)
    if (!isPasswordValid) return invalidCreds // given password does not match the stored hash

    // Check if email is verified
    if (!userByEmail.isEmailVerified) {
      return NextResponse.json<AuthResponse>(
        authResponseSchema.parse({
          ok: false,
          errors: [
            {
              field: 'root',
              message:
                'Please verify your email before logging in. Check your inbox for the 6-digit code.',
            },
          ],
        }),
        { status: 403 }
      )
    }

    // User is valid here, create a token and set it as an httpOnly cookie
    const token = await createAuthToken({ userId: userByEmail.id, email: userByEmail.email })

    const res = NextResponse.json<AuthResponse>(
      authResponseSchema.parse({
        ok: true,
        user: {
          id: userByEmail.id,
          email: userByEmail.email,
          username: userByEmail.username,
        },
      }),
      { status: 200 }
    )

    // Set the JWT token in a cookie
    res.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)

    return res
  } catch (err) {
    // Avoid logging sensitive data.
    console.error('Login error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json<AuthResponse>(
      authResponseSchema.parse({
        ok: false,
        errors: [
          { field: 'root', message: 'Failed to sign in. Please try again.' },
        ],
      }),
      { status: 500 }
    )
  }
}
