import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, passwordResetTokens } from '@/src/db/schema'
import { eq, lt } from 'drizzle-orm'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/auth/email'
import { PASSWORD_RESET_EXPIRY } from '@/lib/auth/constants'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // Always return success even if user doesn't exist (security best practice)
    if (user.length === 0) {
      return NextResponse.json({
        message: 'If an account exists, reset instructions have been sent'
      })
    }

    const foundUser = user[0]

    // Opportunistically clean up expired tokens
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()))

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Calculate the expiration date for the token
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY)

    // Store token in database
    await db.insert(passwordResetTokens).values({
      userId: foundUser.userId,
      token: resetToken,
      expiresAt,
    })

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({
      message: 'If an account exists, reset instructions have been sent'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}