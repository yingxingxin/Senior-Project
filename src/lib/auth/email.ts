import { Resend } from 'resend'
import { EMAIL_FROM, EMAIL_FROM_NAME } from './constants'

/**
 * We use a service called Resend to send emails
 * https://resend.com/docs/dashboard/emails/introduction
 */
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send password reset email with a secure token link
 * @param toEmail - The email address to send the reset email to
 * @param resetToken - The unique token to give the user to reset their password
 */
export async function sendPasswordResetEmail(toEmail: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password/${resetToken}`

  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi there,</p>
          <p>You requested to reset your password for your ${EMAIL_FROM_NAME} account.</p>
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
    });
    // Log to server console so we can see it in the logs
    console.log('Password reset email sent to:', toEmail)
  } catch (error) {
    console.error('Failed to send email:', error)
    // Log to server console so we can see it in the logs
    // Don't throw - we don't want to reveal if email exists
  }
}

// Future email functions can be added here:
// Email verification flow for new accounts
export async function sendVerificationEmail(toEmail: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirm your email</h2>
          <p>Thanks for signing up for ${EMAIL_FROM_NAME}.</p>
          <p>Click the button below to verify your email address:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn&apos;t work, copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 14px; margin-top: 40px;">
            This verification link will expire in 24 hours. If you didn&apos;t create an account, you can ignore this email.
          </p>
        </div>
      `
    })
    console.log('Verification email sent to:', toEmail)
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

// Welcome email sent after successful email verification
export async function sendWelcomeEmail(toEmail: string, username: string) {
  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: toEmail,
      subject: `Welcome to ${EMAIL_FROM_NAME}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${EMAIL_FROM_NAME}, ${username}! 🎉</h2>
          <p>Your email has been successfully verified and your account is now active.</p>

          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul style="line-height: 1.8;">
              <li>Complete your onboarding to personalize your learning experience</li>
              <li>Choose your assistant's personality and appearance</li>
              <li>Start your first lesson and track your progress</li>
              <li>Join the community and compete on the leaderboard</li>
            </ul>
          </div>

          <p>Ready to get started?</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/home"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          <p style="color: #666; font-size: 14px;">
            If you have any questions or need help, feel free to reach out to our support team.
          </p>
        </div>
      `
    })
    console.log('Welcome email sent to:', toEmail)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}
