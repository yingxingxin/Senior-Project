import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { sendWelcomeEmail } from '@/lib/auth/email'

/**
 * GET /api/auth/verify-email
 *
 * Email verification endpoint that confirms a user's email address.
 *
 * Flow:
 * 1) Extract token from query parameter (?token=xxx)
 * 2) Validate token exists, is unused, and hasn't expired
 * 3) Check token type is 'email_verification'
 * 4) Update user record to mark email as verified
 * 5) Mark token as used to prevent reuse
 * 6) Send welcome email to the user
 * 7) Return success response
 *
 * Query Parameters:
 * - token: The verification token sent to the user's email
 *
 * Responses:
 * - 200: Email successfully verified or already verified
 * - 400: Missing token or invalid/expired token
 * - 404: User not found (shouldn't happen in normal flow)
 * - 500: Server error during verification
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find valid email verification token
    // Token must:
    // - Match the provided token
    // - Be of type 'email_verification' (not 'password_reset')
    // - Not have been used before (usedAt is null)
    // - Not be expired (expiresAt > now)
    const [verificationToken] = await db
      .select({
        id: authTokens.id,
        userId: authTokens.userId,
      })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.token, token),
          eq(authTokens.tokenType, 'email_verification'),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Get user details for the token owner
    // We need the email and username for the welcome email
    const [user] = await db
      .select({
        email: users.email,
        username: users.username,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.userId, verificationToken.userId))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email was already verified
    // This can happen if user clicks the verification link multiple times
    if (user.isEmailVerified) {
      return NextResponse.json({
        message: 'Email already verified',
        alreadyVerified: true
      })
    }

    // Update user to mark email as verified
    // Set both the boolean flag and timestamp for audit trail
    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(users.userId, verificationToken.userId))

    // Mark token as used to prevent reuse
    // Even though token would expire, this provides immediate invalidation
    await db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, verificationToken.id))

    // Send welcome email after successful verification
    // This is non-critical - verification succeeds even if email fails
    try {
      await sendWelcomeEmail(user.email, user.username)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't fail the verification if welcome email fails
      // User is still verified and can log in
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      success: true
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}