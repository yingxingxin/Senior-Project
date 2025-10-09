import { z } from "zod";

// ============================================
// Constants
// ============================================
const MIN_PASSWORD_LENGTH = 6;

// ============================================
// Base Field Schemas
// ============================================
const emailFormatSchema = z.email({
  message: "Please enter a valid email address"
});

export const emailField = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .toLowerCase()
  .pipe(emailFormatSchema);

export const passwordField = z
  .string()
  .min(1, { message: "Password is required" })
  .refine((value) => value.length >= MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  });

const confirmEmailField = z
  .string()
  .trim()
  .min(1, { message: "Please confirm your email" })
  .toLowerCase()
  .pipe(emailFormatSchema);

const confirmPasswordField = z
  .string()
  .min(1, { message: "Please confirm your password" });

// ============================================
// Form Validation Schemas
// ============================================

/**
 * Schema for login form validation
 */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

/**
 * Schema for signup form validation with email and password confirmation
 */
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

/**
 * Schema for password reset form validation (forgot password final step)
 */
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

/**
 * Schema for password reset request (forgot password first step)
 */
export const passwordResetRequestSchema = z.object({
  email: emailField,
});

// ============================================
// Type Exports
// ============================================
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;