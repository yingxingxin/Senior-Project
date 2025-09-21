import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import {
  formResponseSchema,
  flattenZodErrors,
  type FormResponse,
  emailField,
  otpFlowEnum
} from "@/lib/auth/schemas";
import { issueOtpForUser } from "@/lib/auth/otp";
import { z } from "zod";

const GENERIC_SUCCESS = "If an account exists, we'll send a verification code.";

export const otpRequestSchema = z.object({
  flow: otpFlowEnum,
  email: emailField,
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = otpRequestSchema.safeParse(payload);

    if (!validation.success) {
      const errors = flattenZodErrors(validation.error);

      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: false, errors }),
        { status: 400 }
      );
    }

    const { flow, email } = validation.data;

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
      // Avoid leaking which emails are registered.
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({ ok: true, message: GENERIC_SUCCESS })
      );
    }

    // You do not need a OTP to verify an email that is already verified.
    if (flow === "signup" && user.isEmailVerified) {
      return NextResponse.json<FormResponse>(
        formResponseSchema.parse({
          ok: true,
          message: "Email is already verified. You can sign in instead.",
        })
      );
    }

    await issueOtpForUser({
      flow,
      userId: user.userId,
      email: user.email,
      username: user.username,
    });

    const successMessage =
      flow === "signup"
        ? "Verification code sent. Enter the code to verify your email."
        : GENERIC_SUCCESS;

    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({ ok: true, message: successMessage })
    );
  } catch (error) {
    console.error("OTP request error:", error);
    return NextResponse.json<FormResponse>(
      formResponseSchema.parse({
        ok: false,
        errors: [
          { field: "root", message: "Failed to send verification code." },
        ],
      }),
      { status: 500 }
    );
  }
}
