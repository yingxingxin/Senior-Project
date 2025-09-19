import { NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, passwordResetTokens } from '@/src/db/schema'
import { eq, lt } from 'drizzle-orm'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Store token in database
    await db.insert(passwordResetTokens).values({
      userId: foundUser.userId,
      token: resetToken,
      expiresAt,
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    try {
      await resend.emails.send({
        from: 'Sprite.exe <onboarding@resend.dev>',
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi there,</p>
            <p>You requested to reset your password for your Sprite.exe account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `
      })
      console.log('Password reset email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Still return success to avoid revealing whether email exists
    }

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