# Auth Helpers

Server and client share one small surface for authentication. This folder provides:

* A stable set of types for requests/responses.
* Stateless tokens (JWT via `jose`) stored in an httpOnly cookie.
* Pure validators you can run on both client and server.
* Tiny helpers to read/apply/remove the cookie and extract a session.


## Modules and responsibilities

* `types.ts`
  Data contracts used by pages, forms, and routes:

  * `LoginInput`, `SignupInput` — validated request shapes.
  * `UserPublic` — what we expose to the client (id, email, username).
  * `AuthResponse` — union `{ ok: true, user } | { ok: false, errors: string[] }`.
  * `TokenPayload` — minimal token claims (e.g., `userId`, optional `email`).
    Keep these in sync with route responses so your forms can rely on them.

* `constants.ts`
  Centralized constants:

  * `AUTH_COOKIE` and `COOKIE_OPTIONS` (httpOnly, SameSite=Lax, secure in prod, path=/, 7d).
  * JWT metadata such as `ISSUER`, `AUDIENCE`, `EXPIRES_IN`.
  * Validation limits (min password length, etc.).

* `validators.ts`
  Pure functions that return arrays of messages; no IO:

  * `validateLogin(input): string[]`
  * `validateSignup(input): string[]`
    These run identically client-side (to show errors early) and server-side (to enforce).

* `jwt.ts`
  Token helpers using `jose`:

  * `signToken(payload): Promise<string>` — HS256, 7d by default, uses `process.env.JWT_SECRET`.
  * `verifyAuthToken(token): Promise<TokenPayload>` — verifies signature, issuer, audience, exp.
    Payloads are minimal to avoid exposing PII

* `session.ts`
  Cookie + session helpers:

  * `readAuthCookie(req): string | undefined`
  * `applyAuthCookie(res, token): void`
  * `removeAuthCookie(res): void`
  * `getSessionFromRequest(req): Promise<TokenPayload | null>`
    API routes call this to turn a request into a verified session (or null).

## HTTP contracts (what routes send/receive)

All routes return `AuthResponse`.

* `POST /api/auth/login`
  Request:

  ```json
  { "email": "a@b.com", "password": "secret123" }
  ```

  Responses:

  * `200 { ok: true, user }` and sets the auth cookie.
  * `400 { ok: false, errors: [...] }` when validation fails.
  * `401 { ok: false, errors: ["Invalid email or password"] }` for invalid credentials.

* `POST /api/auth/signup`
  Request:

  ```json
  { "email": "a@b.com", "confirmEmail": "a@b.com", "password": "secret123", "confirmPassword": "secret123" }
  ```

  Responses:

  * `201 { ok: true, user }` and sets the auth cookie.
  * `400 { ok: false, errors: [...] }` when validation fails.
  * `409 { ok: false, errors: ["Email already registered"] }` when unique check fails.

* `GET /api/auth/me`
  Responses:

  * `200 { ok: true, user }` when the cookie is present and valid.
  * `401 { ok: false, errors: ["Not authenticated"] }` when no/invalid cookie.
  * `404 { ok: false, errors: ["User not found"] }` if the DB row no longer exists.

* `POST /api/auth/logout`
  Response:

  * `200 { ok: true, message: "Logged out successfully" }` and clears the cookie.

## Control flow (login example)

```
Client form (validateLogin) -> POST /api/auth/login
  -> Route validates again -> fetch user -> bcrypt.compare
  -> signToken({ userId, email? }) -> applyAuthCookie(res, token)
  -> 200 { ok: true, user }
```

`/api/auth/me` uses `getSessionFromRequest(req)` to read and verify the cookie, then loads the user by `session.userId`.

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

## Testing quickstart

* Validators: unit-test correct path and each failure message.
* JWT: sign+verify roundtrip with a test `JWT_SECRET`; assert exp/iss/aud are enforced.
* Routes: integration tests that:

  * create a user, POST /login, assert `Set-Cookie` present, then GET /me returns the same user.
  * POST /signup with an existing email returns 409.
  * POST /logout clears the cookie.
