// Central place for constants

export const AUTH_COOKIE = "auth-token" as const;

// Settings for JWT creation and verification.
export const TOKEN = {
  alg: "HS256" as const,              // Symmetric HMAC; keep secret on server (algorithm used to sign the token)
  issuer: "senior-project",           // Who issued the token (your app)
  audience: "senior-project-users",   // Intended audience
  ttl: "7d" as const,                 // Token lifetime in human-readable form
};

// Secure cookie defaults. Adjust domain if you use custom subdomains.
export const COOKIE_OPTIONS = {
  httpOnly: true,                                 // JS cannot read this cookie
  sameSite: "lax" as const,                       // Lax is a good default for auth
  secure: process.env.NODE_ENV === "production",  // HTTPS-only in production environment
  path: "/",                                      // Send cookie to all routes
  maxAge: 60 * 60 * 24 * 7,                       // 7 days (in seconds)
} as const;

// Basic email format validation.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keep a low minimum for class demos; raise to 10+ for real apps.
export const MIN_PASSWORD_LENGTH = 6;

// Constants related to sending emails with resend
// Email configuration
export const EMAIL_FROM = 'onboarding@resend.dev'; // TODO: Change to verified domain in production
export const EMAIL_FROM_NAME = 'Sprite.exe';

// Email token expiry times
export const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
