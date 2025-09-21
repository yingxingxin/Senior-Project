import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/src/db'
import { users, authTokens } from '@/src/db/schema'
import { and, eq, gt, isNull } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

import {
  formResponseSchema,
  passwordResetSchema,
  emailField,
  flattenZodErrors,
  type FormResponse,
} from '@/lib/auth'
import { PASSWORD_RESET_SESSION_COOKIE, PASSWORD_RESET_SESSION_COOKIE_OPTIONS } from '@/lib/auth/constants'
import { encodeOtpToken, hashOtpValue, isOtpTokenOfKind } from '@/lib/auth/otp'

const passwordResetPayloadSchema = passwordResetSchema.safeExtend({
  email: emailField,
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const validation = passwordResetPayloadSchema.safeParse(payload)

    if (!validation.success) {
      const errors = flattenZodErrors(validation.error)

      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    const sessionCookie = request.cookies.get(PASSWORD_RESET_SESSION_COOKIE)?.value

    if (!sessionCookie) {
      const response = NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [
            { field: 'root', message: 'Verification required. Request a new code.' },
          ],
        }),
        { status: 400 }
      )

      response.cookies.delete({
        name: PASSWORD_RESET_SESSION_COOKIE,
        path: PASSWORD_RESET_SESSION_COOKIE_OPTIONS.path,
      })

      return response
    }

    const hashedSession = hashOtpValue(sessionCookie)
    const expectedToken = encodeOtpToken('session', hashedSession)

    const [sessionToken] = await db
      .select({
        id: authTokens.id,
        userId: authTokens.userId,
        token: authTokens.token,
      })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.tokenType, 'password_reset'),
          eq(authTokens.token, expectedToken),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!sessionToken || !isOtpTokenOfKind(sessionToken.token, 'session')) {
      const response = NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [
            { field: 'root', message: 'Invalid or expired verification session.' },
          ],
        }),
        { status: 400 }
      )

      response.cookies.delete({
        name: PASSWORD_RESET_SESSION_COOKIE,
        path: PASSWORD_RESET_SESSION_COOKIE_OPTIONS.path,
      })

      return response
    }

    const [user] = await db
      .select({
        userId: users.userId,
        email: users.email,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.userId, sessionToken.userId))
      .limit(1)

    if (!user || user.email !== email) {
      const response = NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [{ field: 'root', message: 'Invalid verification session.' }],
        }),
        { status: 400 }
      )

      response.cookies.delete({
        name: PASSWORD_RESET_SESSION_COOKIE,
        path: PASSWORD_RESET_SESSION_COOKIE_OPTIONS.path,
      })

      return response
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db
      .update(users)
      .set({
        password: hashedPassword,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(users.userId, user.userId))

    await db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(eq(authTokens.id, sessionToken.id))

    await db
      .delete(authTokens)
      .where(
        and(
          eq(authTokens.userId, user.userId),
          eq(authTokens.tokenType, 'password_reset'),
          isNull(authTokens.usedAt)
        )
      )

    const response = NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: true,
        message: 'Password reset successfully. You can now sign in.',
      })
    )

    response.cookies.delete({
      name: PASSWORD_RESET_SESSION_COOKIE,
      path: PASSWORD_RESET_SESSION_COOKIE_OPTIONS.path,
    })

    return response
  } catch (error) {
    console.error('Forgot password reset error:', error)
    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: false,
        errors: [{ field: 'root', message: 'Failed to reset password.' }],
      }),
      { status: 500 }
    )
  }
}
