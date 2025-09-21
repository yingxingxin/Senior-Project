# Auth Helpers

Server and client share one small surface for authentication. This folder provides:

* A stable set of response schemas derived from Zod.
* Stateless tokens (JWT via `jose`) stored in an httpOnly cookie.
* Shared Zod schemas you can run on both client and server.


## Modules and responsibilities

* `constants.ts`
  Centralized constants:

  * `AUTH_COOKIE` and `COOKIE_OPTIONS` (httpOnly, SameSite=Lax, secure in prod, path=/, 7d).
  * JWT metadata such as `ISSUER`, `AUDIENCE`, `EXPIRES_IN`.
  * Validation limits (min password length, etc.).

* `schemas.ts`
  Shared Zod schemas and field primitives:

  * `loginSchema`, `signupSchema`, `passwordResetSchema` — identical validation on client and server, including trimming and confirmation checks.
  * `passwordResetRequestSchema`, `otpRequestSchema`, `otpVerifySchema` — shared payload contracts for OTP and reset flows.
  * `tokenPayloadSchema`, `userPublicSchema`, `authResponseSchema`, `formResponseSchema` — runtime contracts for tokens, user payloads, and JSON responses.
  Use `schema.safeParse(data)` and `z.flattenError` to surface `formErrors` + `fieldErrors` across surfaces.

* `otp.ts`
  Helpers for generating, hashing, and storing OTP codes/sessions plus shared email dispatch logic.

* `jwt.ts`
  Token helpers using `jose`:

  * `signToken(payload): Promise<string>` — HS256, 7d by default, uses `process.env.JWT_SECRET`.
  * `verifyAuthToken(token): Promise<TokenPayload>` — verifies signature, issuer, audience, exp.
    Payloads are minimal to avoid exposing PII

* Route handlers
  Cookie handling happens inside the relevant API routes using `AUTH_COOKIE`,
  `COOKIE_OPTIONS`, and `verifyAuthToken`.

## HTTP contracts (what routes send/receive)

All routes return `AuthResponse`.

* `POST /api/auth/login`
  Request:

  ```json
  { "email": "a@b.com", "password": "secret123" }
  ```

  Responses:

  * `200 { ok: true, user }` and sets the auth cookie.
  * `400 { ok: false, errors: [{ field, message }] }` when validation fails.
  * `401 { ok: false, errors: [{ field: "root", message: "Invalid email or password" }] }` for invalid credentials.

* `POST /api/auth/signup`
  Request:

  ```json
  { "email": "a@b.com", "confirmEmail": "a@b.com", "password": "secret123", "confirmPassword": "secret123" }
  ```

  Responses:

  * `201 { ok: true, user, message }` (message confirms an OTP has been sent).
  * `400 { ok: false, errors: [{ field, message }] }` when validation fails.
  * `409 { ok: false, errors: [{ field: "email", message: "Email already registered" }] }` when unique check fails.

* `POST /api/auth/otp/request`

  ```json
  { "flow": "signup", "email": "a@b.com" }
  ```

  Issues a six digit code for the requested flow. Always returns success to avoid enumeration.

* `POST /api/auth/otp/verify`

  ```json
  { "flow": "password-reset", "email": "a@b.com", "code": "123456" }
  ```

  Validates the code. For password resets it sets a short-lived httpOnly cookie (`password-reset-session`) consumed by `/api/auth/forgot-password`.

* `POST /api/auth/forgot-password`

  Requires the verification cookie issued by the previous step.

  ```json
  { "email": "a@b.com", "password": "secret123", "confirmPassword": "secret123" }
  ```

  Updates the password when the session token is valid, and marks the email verified.

* `GET /api/auth/me`
  Responses:

  * `200 { ok: true, user }` when the cookie is present and valid.
  * `401 { ok: false, errors: [{ field: "root", message: "Not authenticated" }] }` when no/invalid cookie.
  * `404 { ok: false, errors: [{ field: "root", message: "User not found" }] }` if the DB row no longer exists.

* `POST /api/auth/logout`
  Response:

  * `200 { ok: true, message: "Logged out successfully" }` and clears the cookie.

## Control flow (login example)

```
Client form (`loginSchema.safeParse`) -> POST /api/auth/login
  -> Route validates again -> fetch user -> bcrypt.compare
  -> signToken({ userId, email }) -> res.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
  -> 200 { ok: true, user }
```

`/api/auth/me` reads the cookie directly (`request.cookies.get(AUTH_COOKIE)`), verifies it with `verifyAuthToken`, and then loads the user by the embedded `userId`.

## TODO: Middleware (gating page access)

Use middleware to keep protected pages behind a valid token and to redirect signed-in users away from `/login` or `/signup`.

* Read cookie (`request.cookies.get(AUTH_COOKIE)` or wrapper).
* Verify with `verifyAuthToken`.
* Redirect to `/login?from=/original` when missing/invalid.

This would run before it hits any page.

## Security notes

* Cookies: httpOnly, SameSite=Lax, `secure: true` in production. If you later set `SameSite=None` (cross-site), add a CSRF token.
* Tokens: keep claims minimal; store only identifiers. Default exp is 7d; shorten for higher risk surfaces.
* Passwords: bcrypt with a reasonable cost (10 is fine for now). Never log raw passwords or token contents.
* Enumeration: return generic 401 for login failures; don’t reveal whether email exists.
* Logging: log error messages, not token strings or stack traces containing secrets.
* Rate limiting: consider adding throttling on login/signup to slow brute-force attempts.

## Zod Validation

For detailed information about our Zod schema architecture, validation patterns, and extension guidelines, see [`/docs/zod.md`](/docs/zod.md).

## Testing quickstart

* Schemas: unit-test success paths and each failure message to guard error copy.
* JWT: sign+verify roundtrip with a test `JWT_SECRET`; assert exp/iss/aud are enforced.
* Routes: integration tests that:

  * create a user, POST /login, assert `Set-Cookie` present, then GET /me returns the same user.
  * POST /signup with an existing email returns 409.
  * POST /logout clears the cookie.
