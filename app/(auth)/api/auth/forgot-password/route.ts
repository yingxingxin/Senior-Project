import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { eq, lt, and } from 'drizzle-orm'
import crypto from 'crypto'
import { z } from 'zod'

import {
  passwordResetRequestSchema,
  formResponseSchema,
  type FormResponse,
} from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/auth/email'
import { PASSWORD_RESET_EXPIRY } from '@/lib/auth/constants'

export async function POST(request: NextRequest) {
  try {
    const validation = passwordResetRequestSchema.safeParse(await request.json())

    if (!validation.success) {
      const { formErrors, fieldErrors } = z.flattenError(validation.error)
      const errors = [
        ...formErrors.map((message) => ({ field: 'root', message })),
        ...Object.entries(fieldErrors).flatMap(([field, messages]) =>
          messages.map((message) => ({ field, message }))
        ),
      ]

      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Always return success even if user doesn't exist (security best practice)
    if (user.length === 0) {
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: true,
          message: 'If an account exists, reset instructions have been sent',
        })
      )
    }

    const foundUser = user[0]

    // Opportunistically clean up expired tokens
    await db
      .delete(authTokens)
      .where(
        and(
          eq(authTokens.tokenType, 'password_reset'),
          lt(authTokens.expiresAt, new Date())
        )
      )

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Calculate the expiration date for the token
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY)

    // Store token in database
    await db.insert(authTokens).values({
      userId: foundUser.userId,
      token: resetToken,
      tokenType: 'password_reset',
      expiresAt,
    })

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: true,
        message: 'If an account exists, reset instructions have been sent',
      })
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: false,
        errors: [{ field: 'root', message: 'Failed to process password reset request' }],
      }),
      { status: 500 }
    )
  }
}
