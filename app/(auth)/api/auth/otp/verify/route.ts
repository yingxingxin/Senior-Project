import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/src/db";
import { authTokens, users } from "@/src/db/schema";
import {
  formResponseSchema,
  flattenZodErrors,
  type FormResponse,
  emailField,
  otpFlowEnum,
} from "@/lib/auth/schemas";
import { encodeOtpToken, generateVerificationSession, hashOtpValue } from "@/lib/auth/otp";
import {
  OTP_SESSION_EXPIRY,
  PASSWORD_RESET_SESSION_COOKIE,
  PASSWORD_RESET_SESSION_COOKIE_OPTIONS,
} from "@/lib/auth/constants";
import { sendWelcomeEmail } from "@/lib/auth/email";
import z from "zod";

const otpCodeMessage = "Enter the 6-digit code we emailed you";

const otpCodeField = z
  .string({ message: otpCodeMessage })
  .trim()
  .regex(/^\d{6}$/u, { message: otpCodeMessage });

export const otpVerifySchema = z.object({
  flow: otpFlowEnum,
  email: emailField,
  code: otpCodeField,
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = otpVerifySchema.safeParse(payload);

    if (!validation.success) {
      const errors = flattenZodErrors(validation.error);
      console.log("errors", errors);

      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      );
    }

    const { flow, email, code } = validation.data;

    const [user] = await db
      .select({
        userId: users.userId,
        email: users.email,
        username: users.username,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [{ field: "root", message: "Invalid verification code." }],
        }),
        { status: 400 }
      );
    }

    const tokenType = flow === "signup" ? "email_verification" : "password_reset";
    const hashedCode = hashOtpValue(code);
    const expectedToken = encodeOtpToken("code", hashedCode);

    const [existingToken] = await db
      .select({
        id: authTokens.id,
      })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.userId, user.userId),
          eq(authTokens.tokenType, tokenType),
          eq(authTokens.token, expectedToken),
          isNull(authTokens.usedAt),
          gt(authTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!existingToken) {
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: false,
          errors: [{ field: "root", message: "Invalid or expired verification code." }],
        }),
        { status: 400 }
      );
    }

    const now = new Date();

    await db
      .update(authTokens)
      .set({ usedAt: now })
      .where(eq(authTokens.id, existingToken.id));

    if (flow === "signup") {
      if (!user.isEmailVerified) {
        await db
          .update(users)
          .set({ isEmailVerified: true, emailVerifiedAt: now })
          .where(eq(users.userId, user.userId));

        try {
          await sendWelcomeEmail(user.email, user.username);
        } catch (error) {
          console.error("[otp/verify] Failed to send welcome email", error);
        }
      }

      const response = NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: true,
          message: "Email verified successfully.",
        })
      );

      response.cookies.delete({
        name: PASSWORD_RESET_SESSION_COOKIE,
        path: PASSWORD_RESET_SESSION_COOKIE_OPTIONS.path,
      });

      return response;
    }

    // Password reset flow
    if (!user.isEmailVerified) {
      await db
        .update(users)
        .set({ isEmailVerified: true, emailVerifiedAt: now })
        .where(eq(users.userId, user.userId));
    }

    const verificationSessionRaw = generateVerificationSession();
    const verificationSessionHashed = hashOtpValue(verificationSessionRaw);
    const sessionToken = encodeOtpToken("session", verificationSessionHashed);

    await db.insert(authTokens).values({
      userId: user.userId,
      token: sessionToken,
      tokenType,
      expiresAt: new Date(Date.now() + OTP_SESSION_EXPIRY),
    });

    const response = NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: true,
        message: "Code verified. You can now set a new password.",
      })
    );

    response.cookies.set(
      PASSWORD_RESET_SESSION_COOKIE,
      verificationSessionRaw,
      PASSWORD_RESET_SESSION_COOKIE_OPTIONS
    );

    return response;
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: false,
        errors: [{ field: "root", message: "Failed to verify code." }],
      }),
      { status: 500 }
    );
  }
}
