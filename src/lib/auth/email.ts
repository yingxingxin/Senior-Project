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
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

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
// export async function sendWelcomeEmail(email: string, username: string) { ... }
// export async function sendVerificationEmail(email: string, token: string) { ... }