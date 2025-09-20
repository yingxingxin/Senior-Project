import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  resetPasswordRouteSchema,
  formResponseSchema,
  type FormResponse,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const validation = resetPasswordRouteSchema.safeParse(await request.json())

    if (!validation.success) {
      const { formErrors, fieldErrors } = z.flattenError(validation.error)
      const errors = [
        ...formErrors.map((message) => ({ field: 'root', message })),
        ...Object.entries(fieldErrors).flatMap(([field, messages]) =>
          messages.map((message) => ({ field, message })),
        ),
      ]

      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Find valid token
    const resetToken = await db
      .select()
      .from(authTokens)
      .where(
        and(
          eq(authTokens.token, token),
          eq(authTokens.tokenType, 'password_reset'),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (resetToken.length === 0) {
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [{ field: 'root', message: 'Invalid or expired reset token' }],
        }),
        { status: 400 }
      )
    }

    const tokenData = resetToken[0]

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.userId, tokenData.userId))

    // Mark token as used
    await db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, tokenData.id))

    // Delete all other password reset tokens for this user (security measure)
    await db
      .delete(authTokens)
      .where(
        and(
          eq(authTokens.userId, tokenData.userId),
          eq(authTokens.tokenType, 'password_reset'),
          isNull(authTokens.usedAt)
        )
      )

    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: true,
        message: 'Password reset successful',
      })
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: false,
        errors: [{ field: 'root', message: 'Failed to reset password' }],
      }),
      { status: 500 }
    )
  }
}
