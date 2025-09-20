// app/api/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { db, users } from '@/src/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import {
  createAuthToken,
  applyAuthCookie,
  loginSchema,
  authResponseSchema,
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
      const { formErrors, fieldErrors } = z.flattenError(validation.error)
      const errors = [
        ...formErrors,
        ...Object.values(fieldErrors).flat(),
      ]

      return NextResponse.json<AuthResponse>(
        authResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      )
    }

    const formData: LoginInput = validation.data

    // Generic error to use if email or password is invalid
    const invalidCreds = NextResponse.json<AuthResponse>(
      authResponseSchema.parse({ ok: false, errors: ['Invalid email or password'] }),
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
          errors: ['Please verify your email before logging in. Check your inbox for the verification link.'],
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
    applyAuthCookie(res, token)

    return res
  } catch (err) {
    // Avoid logging sensitive data.
    console.error('Login error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json<AuthResponse>(
      authResponseSchema.parse({ ok: false, errors: ['Failed to sign in. Please try again.'] }),
      { status: 500 }
    )
  }
}
