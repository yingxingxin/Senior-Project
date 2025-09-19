import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { validatePasswordReset } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Validate password using standardized validation
    const validationErrors = validatePasswordReset(password, confirmPassword)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0] }, // Return first error for simplicity
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
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

    return NextResponse.json({
      message: 'Password reset successful'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}