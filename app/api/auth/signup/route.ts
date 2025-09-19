// app/api/auth/signup/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { db, users, authTokens } from '@/src/db'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  validateSignup,
  type SignupInput,
  type SignupResponse,
  type AuthResponse,
} from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/auth/email'

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
    const confirmEmail = typeof payload.confirmEmail === 'string' ? payload.confirmEmail.trim().toLowerCase() : email
    const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : ''
    const username = typeof payload.username === 'string' ? payload.username : email.split('@')[0]

    const formData: SignupInput = { email, password, confirmEmail, confirmPassword }
    const errors = validateSignup(formData)
    if (errors.length > 0) {
      return NextResponse.json<SignupResponse>({ ok: false, errors }, { status: 400 })
    }

    // Check for an existing account
    const [existing] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, formData.email))
      .limit(1)

    if (existing) {
      return NextResponse.json<SignupResponse>(
        { ok: false, errors: ['Email already registered'] },
        { status: 409 }
      )
    }

    // Create the user with isEmailVerified = false
    const SALT_ROUNDS = 10
    const passwordHash = await bcrypt.hash(formData.password, SALT_ROUNDS)

    const [newUser] = await db.insert(users).values({
      email: formData.email,
      username,
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

    return NextResponse.json<SignupResponse>(
      {
        ok: true,
        message: 'Verification email sent. Please check your inbox.',
      },
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
    return NextResponse.json<SignupResponse>(
      { ok: false, errors: [message] },
      { status }
    )
  }
}
