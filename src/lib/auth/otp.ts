import crypto from "crypto";
import { and, eq } from "drizzle-orm";

import { OTP_CODE_EXPIRY, OTP_CODE_LENGTH } from "./constants";
import { db } from "@/src/db";
import { authTokens } from "@/src/db/schema";
import {
  sendPasswordResetOtpEmail,
  sendSignupOtpEmail,
} from "./email";

export type OtpFlow = "signup" | "password-reset";
type OtpTokenKind = "code" | "session";

const OTP_TOKEN_SEPARATOR = ":";

export function generateNumericOtp(): string {
  const max = 10 ** OTP_CODE_LENGTH;
  const code = crypto.randomInt(0, max);
  return code.toString().padStart(OTP_CODE_LENGTH, "0");
}

export function generateVerificationSession(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashOtpValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function encodeOtpToken(kind: OtpTokenKind, hashedValue: string): string {
  return `${kind}${OTP_TOKEN_SEPARATOR}${hashedValue}`;
}

export function isOtpTokenOfKind(token: string, kind: OtpTokenKind): boolean {
  return token.startsWith(`${kind}${OTP_TOKEN_SEPARATOR}`);
}

type IssueOtpParams = {
  flow: OtpFlow;
  userId: number;
  email: string;
  username?: string;
};

export async function issueOtpForUser({
  flow,
  userId,
  email,
  username,
}: IssueOtpParams): Promise<string> {
  const tokenType = flow === "signup" ? "email_verification" : "password_reset";

  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.tokenType, tokenType)));

  const code = generateNumericOtp();
  const hashedCode = hashOtpValue(code);
  const tokenValue = encodeOtpToken("code", hashedCode);

  await db.insert(authTokens).values({
    userId,
    token: tokenValue,
    tokenType,
    expiresAt: new Date(Date.now() + OTP_CODE_EXPIRY),
  });

  try {
    if (flow === "signup") {
      await sendSignupOtpEmail(email, username ?? "", code);
    } else {
      await sendPasswordResetOtpEmail(email, code);
    }
  } catch (error) {
    console.error(`[otp] Failed to send ${flow} OTP email`, error);
  }

  return code;
}
