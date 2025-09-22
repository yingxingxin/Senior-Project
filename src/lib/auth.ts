import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import { sendSignupOtpEmail, sendPasswordResetOtpEmail } from "./auth/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // With property keys aligned, we only need modelName to match table name
  user: {
    modelName: "users",
    // No field mappings needed - property keys now match Better Auth expectations
    additionalFields: {
      assistantId: { type: "number", input: false },
      assistantPersona: { type: "string", input: false },
      onboardingCompletedAt: { type: "date", input: false },
      onboardingStep: { type: "string", input: false },
    },
  },

  session: {
    modelName: "session",
    // No field mappings needed - property keys now match Better Auth expectations
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  account: {
    modelName: "account",
    // No field mappings needed
  },

  verification: {
    modelName: "verification",
    // No field mappings needed
  },

  // Let database handle all ID generation
  advanced: {
    database: {
      // Return false to let DB defaults handle ID generation:
      // - users table: SERIAL auto-increment
      // - account/session/verification: gen_random_uuid() default
      generateId: false,
    },
  },

  // Email + Password configuration
  emailAndPassword: {
    enabled: true,
    // We have our own flow for email verification
    // We use OTPs instead of links
    requireEmailVerification: false,
    minPasswordLength: 6,
  },

  // Social providers (add env vars when ready)
  socialProviders: process.env.GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        ...(process.env.GITHUB_CLIENT_ID && {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          },
        }),
      }
    : undefined,

  plugins: [
    emailOTP({
      // Send verification OTPs via email
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // For sign-in, we'll use the same email template as signup
          await sendSignupOtpEmail(email, email.split("@")[0], otp);
        } else if (type === "email-verification") {
          // Send OTP for email verification during signup
          await sendSignupOtpEmail(email, email.split("@")[0], otp);
        } else if (type === "forget-password") {
          // Send OTP for password reset
          await sendPasswordResetOtpEmail(email, otp);
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOnSignUp: false, // SignupForm explicitly handles sending OTP after signup
        // Override default email verification to use OTP instead of link
      // We have our own flow for email verification
      // We use OTPs instead of links
      overrideDefaultEmailVerification: true,
    }),
  ],
});

export type Auth = typeof auth;