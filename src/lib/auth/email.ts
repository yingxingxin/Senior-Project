import { Resend } from 'resend'

const EMAIL_FROM = 'onboarding@resend.dev'; // TODO: Change to verified domain in production
const EMAIL_FROM_NAME = 'Sprite.exe';

/**
 * We use a service called Resend to send emails
 * https://resend.com/docs/dashboard/emails/introduction
 */
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetOtpEmail(toEmail: string, code: string) {
  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Your password reset code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Use the code below to finish resetting your password for ${EMAIL_FROM_NAME}:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
            ${code}
          </div>
          <p>The code expires in 10 minutes. If you didn't request a reset, you can ignore this email.</p>
        </div>
      `,
    });
    console.log('Password reset OTP sent to:', toEmail)
  } catch (error) {
    console.error('Failed to send password reset OTP email:', error)
  }
}

export async function sendSignupOtpEmail(toEmail: string, username: string, code: string) {
  try {
    await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${username || 'there'}!</h2>
          <p>Enter this code to verify your email and activate your ${EMAIL_FROM_NAME} account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
            ${code}
          </div>
          <p>This code expires in 10 minutes. If you didn't create an account, you can ignore this email.</p>
        </div>
      `,
    });
    console.log('Signup OTP email sent to:', toEmail)
  } catch (error) {
    console.error('Failed to send signup OTP email:', error)
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
