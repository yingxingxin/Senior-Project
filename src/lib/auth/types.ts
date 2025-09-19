// Shared TypeScript types used across authentication code.

export interface UserPublic {
  id: number;       // Public-safe user identifier (numeric for example)
  email: string;    // User email (do not expose if you consider it sensitive)
  username: string; // Display name / handle
}

// Either ok:true with a user, or ok:false with errors
export type AuthResponse =
  | { ok: true; user: UserPublic }
  | { ok: false; errors: string[] };

// Signup response signals whether the verification email was queued successfully.
export type SignupResponse =
  | { ok: true; message: string }
  | { ok: false; errors: string[] };

// Login inputs we expect from the client.
export type LoginInput = {
  email: string;
  password: string;
};

// Signup extends login with confirmations
export type SignupInput = LoginInput & {
  confirmEmail: string;
  confirmPassword: string;
};

// The claims we put inside our signed JWT.
// Don't store sensitive data here; JWTs are not encrypted
export type TokenPayload = {
  userId: number;
  email?: string | null;
};
