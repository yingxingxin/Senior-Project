import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { sendWelcomeEmail } from '@/lib/auth/email'
import VerifyEmailContent, { type VerificationState } from '@/components/auth/VerifyEmailContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email - Sprite.exe',
  description: 'Verify your email address to activate your Sprite.exe account',
}

/**
 * Server component for email verification
 * Handles token validation and database updates server-side
 * Passes result to client component for UI rendering and redirects
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams

  // Default state for missing token
  if (!params.token) {
    return <VerifyEmailContent state="no-token" />
  }

  const token = params.token
  let state: VerificationState = 'verifying'
  let errorMessage = ''

  try {
    // Find valid email verification token
    // Token must:
    // - Match the provided token
    // - Be of type 'email_verification'
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
      state = 'error'
      errorMessage = 'Invalid or expired verification token'
    } else {
      // Get user details for the token owner
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
        state = 'error'
        errorMessage = 'User not found'
      } else if (user.isEmailVerified) {
        // Email was already verified
        state = 'already-verified'
      } else {
        // Update user to mark email as verified
        await db
          .update(users)
          .set({
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
          })
          .where(eq(users.userId, verificationToken.userId))

        // Mark token as used to prevent reuse
        await db
          .update(authTokens)
          .set({ usedAt: new Date() })
          .where(eq(authTokens.id, verificationToken.id))

        // Send welcome email after successful verification
        // Non-critical - verification succeeds even if email fails
        try {
          await sendWelcomeEmail(user.email, user.username)
        } catch (error) {
          console.error('Failed to send welcome email:', error)
          // Don't fail the verification if welcome email fails
        }

        state = 'success'
      }
    }
  } catch (error) {
    console.error('Email verification error:', error)
    state = 'error'
    errorMessage = 'Failed to verify email. Please try again.'
  }

  return <VerifyEmailContent state={state} errorMessage={errorMessage} />
}