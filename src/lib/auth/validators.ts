// Validation helpers for auth flows.

import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from "./constants";
import type { LoginInput, SignupInput } from "./types";

// Validate login inputs; return readable error messages if any.
export function validateLogin(input: LoginInput): string[] {
  const errors: string[] = [];

  if (!input.email.trim()) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!input.password) {
    errors.push("Password is required");
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  return errors;
}

// Validate signup inputs by reusing login checks and adding confirmations.
export function validateSignup(input: SignupInput): string[] {
  const errors = validateLogin(input);

  if (!input.confirmEmail.trim()) {
    errors.push("Please confirm your email");
  } else if (input.email !== input.confirmEmail) {
    errors.push("Emails do not match");
  }

  if (!input.confirmPassword) {
    errors.push("Please confirm your password");
  } else if (input.password !== input.confirmPassword) {
    errors.push("Passwords do not match");
  }

  return errors;
}

// Validate password reset - checks password strength and confirmation match
export function validatePasswordReset(password: string, confirmPassword: string): string[] {
  const errors: string[] = [];

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!confirmPassword) {
    errors.push("Please confirm your password");
  } else if (password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return errors;
}
