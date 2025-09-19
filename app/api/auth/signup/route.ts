// app/api/auth/signup/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { db, users } from '@/src/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import {
  validateSignup,
  createAuthToken,
  applyAuthCookie,
  type SignupInput,
  type AuthResponse,
} from '@/lib/auth'

/**
 * POST /api/auth/signup
 *
 * Flow:
 * 1) Parse + validate request body.
 * 2) Normalize email and check if it already exists.
 * 3) Encrypt password and create user.
 * 4) Create a short-lived login token and set it as an httpOnly cookie.
 * 5) Return a minimal user object.
 */
export async function POST(request: NextRequest) {
  try {
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json<AuthResponse>(
        { ok: false, errors: ['Unsupported content type'] },
        { status: 415 }
      )
    }

    const body = await request.json()
    const payload = (body ?? {}) as Record<string, unknown>
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    const password = typeof payload.password === 'string' ? payload.password : ''
    const confirmEmailRaw = payload.confirmEmail ?? payload.email
    const confirmEmail = typeof confirmEmailRaw === 'string'
      ? confirmEmailRaw.trim().toLowerCase()
      : ''
    const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : ''

    const formData: SignupInput = { email, password, confirmEmail, confirmPassword }
    const errors = validateSignup(formData)
    if (errors.length > 0) {
      return NextResponse.json<AuthResponse>({ ok: false, errors }, { status: 400 })
    }

    // Check for an existing account
    const [existing] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, formData.email))
      .limit(1)

    if (existing) {
      return NextResponse.json<AuthResponse>(
        { ok: false, errors: ['Email already registered'] },
        { status: 409 }
      )
    }

    // Create the user
    const SALT_ROUNDS = 10
    const passwordHash = await bcrypt.hash(formData.password, SALT_ROUNDS)
    const username = formData.email.split('@')[0] // default username is the first part of the email

    // Insert the user into the database
    // Returns the user data we inserted
    const [newUser] = await db
      .insert(users)
      .values({ email: formData.email, password: passwordHash, username })
      .returning({
        userId: users.userId,
        email: users.email,
        username: users.username,
      })

    // Create a login token and set it as an httpOnly cookie
    // The token is used to authenticate the user on subsequent requests
    const token = await createAuthToken({ userId: newUser.userId, email: newUser.email })

    const res = NextResponse.json<AuthResponse>(
      {
        ok: true,
        user: {
          id: newUser.userId,
          email: newUser.email,
          username: newUser.username,
        },
      },
      { status: 201 }
    )

    // Set the JWT token in a cookie
    applyAuthCookie(res, token)

    return res
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
      { ok: false, errors: [message] },
      { status }
    )
  }
}
