// app/api/auth/signup/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { db, users, authTokens } from '@/src/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

import {
  type SignupInput,
  type AuthResponse,
  signupSchema,
  authResponseSchema,
} from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/auth/email'

export const signupRouteSchema = signupSchema.safeExtend({
  username: z.string().trim().optional(),
});

/**
 * POST /api/auth/signup
 *
 * Flow:
 * 1) Parse + validate request body.
 * 2) Normalize email and check if it already exists.
 * 3) Create user with isEmailVerified = false.
 * 4) Generate verification token and store in authTokens.
 * 5) Send verification email to the user.
*/
export async function POST(request: NextRequest) {
  try {
    const validation = signupRouteSchema.safeParse(await request.json())

    if (!validation.success) {
      const { formErrors, fieldErrors } = z.flattenError(validation.error)
      const errors = [
        ...formErrors.map((message) => ({ field: 'root', message })),
        ...Object.entries(fieldErrors).flatMap(([field, messages]) =>
          messages.map((message) => ({ field, message }))
        ),
      ]

      return NextResponse.json<AuthResponse>(
        authResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      )
    }

    const { username, ...rest } = validation.data
    const formData: SignupInput = rest
    const resolvedUsername = username && username.length > 0
      ? username
      : formData.email.split('@')[0]

    // Check for an existing account
    const [existing] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, formData.email))
      .limit(1)

    if (existing) {
      return NextResponse.json<AuthResponse>(
        authResponseSchema.parse({
          ok: false,
          errors: [{ field: 'email', message: 'Email already registered' }],
        }),
        { status: 409 }
      )
    }

    // Create the user with isEmailVerified = false
    const SALT_ROUNDS = 10
    const passwordHash = await bcrypt.hash(formData.password, SALT_ROUNDS)

    const [newUser] = await db.insert(users).values({
      email: formData.email,
      username: resolvedUsername,
      password: passwordHash,
      isEmailVerified: false,
    }).returning({ userId: users.userId })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    await db.insert(authTokens).values({
      userId: newUser.userId,
      token: verificationToken,
      tokenType: 'email_verification',
      expiresAt,
    })

    try {
      await sendVerificationEmail(formData.email, verificationToken)
    } catch (error) {
      console.error('Signup verification email error:', error)
    }

    return NextResponse.json<AuthResponse>(
      authResponseSchema.parse({
        ok: true,
        user: {
          id: newUser.userId,
          email: formData.email,
          username: resolvedUsername,
        },
        message: 'Verification email sent. Please check your inbox.',
      }),
      { status: 201 }
    )
  } catch (err: unknown) {
    // Handle possible unique-constraint race (insert after check)
    const code = typeof err === 'object' && err && 'code' in err
      ? String((err as { code?: unknown }).code ?? '')
      : undefined
    const isUniqueViolation = code === '23505'
    const message = isUniqueViolation
      ? 'Email already registered'
      : 'Failed to create account. Please try again.'
    const status = isUniqueViolation ? 409 : 500

    console.error('Signup error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json<AuthResponse>(
      authResponseSchema.parse({
        ok: false,
        errors: [
          {
            field: isUniqueViolation ? 'email' : 'root',
            message,
          },
        ],
      }),
      { status }
    )
  }
}
