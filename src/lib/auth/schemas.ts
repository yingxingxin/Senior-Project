import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "./constants";

const emailMessage = "Email is required";
const passwordMessage = "Password is required";
const confirmEmailMessage = "Please confirm your email";
const confirmPasswordMessage = "Please confirm your password";
const resetTokenMessage = "Reset token is required";
const verificationTokenMessage = "Verification token is required";
const emailFormatMessage = "Please enter a valid email address";

const emailFormatSchema = z.email({ message: emailFormatMessage });

export const emailField = z
  .string()
  .trim()
  .min(1, { message: emailMessage })
  .toLowerCase()
  .pipe(emailFormatSchema);

export const passwordField = z
  .string()
  .min(1, { message: passwordMessage })
  .refine((value) => value.length >= MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  });

const confirmEmailField = z
  .string()
  .trim()
  .min(1, { message: confirmEmailMessage })
  .toLowerCase()
  .pipe(emailFormatSchema);

const confirmPasswordField = z
  .string()
  .min(1, { message: confirmPasswordMessage });

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmEmail: confirmEmailField,
    confirmPassword: confirmPasswordField,
  })
  .superRefine((data, ctx) => {
    if (data.email !== data.confirmEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmEmail"],
        message: "Emails do not match",
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const passwordResetSchema = z
  .object({
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const resetPasswordRouteSchema = passwordResetSchema.safeExtend({
  token: z
    .string()
    .min(1, { message: resetTokenMessage }),
});

export const passwordResetRequestSchema = z.object({
  email: emailField,
});

export const verifyEmailQuerySchema = z.object({
  token: z
    .string()
    .min(1, { message: verificationTokenMessage }),
});

export const tokenPayloadSchema = z.object({
  userId: z.number(),
  email: emailFormatSchema,
});

export const userPublicSchema = z.object({
  id: z.number(),
  email: emailFormatSchema,
  username: z.string(),
});

export const authResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    user: userPublicSchema,
    message: z.string().optional(),
  }),
  z.object({
    ok: z.literal(false),
    errors: z.array(z.string()).min(1),
  }),
]);

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
