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

  secret: process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Map Better Auth's expected camelCase to our snake_case database columns
  user: {
    modelName: "users",
    fields: {
      emailVerified: "is_email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
      emailVerifiedAt: "email_verified_at",
    },
    additionalFields: {
      assistant_id: {
        type: "number",
        input: false,
        defaultValue: null,
        required: false,
      },
      assistant_persona: {
        type: "string",
        input: false,
        defaultValue: null,
        required: false,
      },
      onboarding_completed_at: {
        type: "date",
        input: false,
        defaultValue: null,
        required: false,
      },
      onboarding_step: {
        type: "string",
        input: false,
        defaultValue: null,
        required: false,
      },
    },
  },

  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
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

  // Social providers
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/google`,
      },
    }),
    // Use development GitHub app in development, production app in production
    // Github doesn't support multiple redirect URIs; so we use two different Github Oauth apps for development and production
    ...(() => {
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           process.env.VERCEL_ENV === 'development' ||
                           !process.env.VERCEL_ENV; // Local development

      const githubClientId = isDevelopment
        ? (process.env.GITHUB_CLIENT_ID_DEVELOPMENT || process.env.GITHUB_CLIENT_ID)
        : process.env.GITHUB_CLIENT_ID;

      const githubClientSecret = isDevelopment
        ? (process.env.GITHUB_CLIENT_SECRET_DEVELOPMENT || process.env.GITHUB_CLIENT_SECRET)
        : process.env.GITHUB_CLIENT_SECRET;

      if (githubClientId && githubClientSecret) {
        return {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            redirectURI: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback/github`,
          },
        };
      }
      return {};
    })(),
  },

  // Database hooks to handle OAuth onboarding
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Check if this is an OAuth user (they won't have completed onboarding)
          // OAuth users are created automatically on first sign-in
          // We'll handle the redirect check in the auth layout
          console.log("New user created:", user.id, "Email:", user.email);
          // The auth layout will check onboarding status and redirect accordingly
        },
      },
    },
  },

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