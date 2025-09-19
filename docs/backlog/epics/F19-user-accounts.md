# F19 — User Accounts

- **Status:** Proposed
- **Type:** Epic
- **Goal:** Provide authentication, secure access, and account recovery for learners.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Security-01](../non-functional.md), [NFR-Data-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F19-US01 | As a learner, I want to create an account so that I can save progress. |
| F19-US02 | As a learner, I want to log in securely so that my account is protected. |
| F19-US03 | As a learner, I want to reset my password if forgotten so that I don’t lose my progress. |

## Acceptance criteria

### F19-US01
- [ ] **Given** the signup form, **when** the learner provides required fields (email, password), **then** an account is created and a verification email is sent (if required).
- [ ] **Given** an account is created, **when** the learner confirms their email, **then** they are redirected into onboarding.

### F19-US02
- [ ] **Given** the login form, **when** valid credentials are submitted, **then** the learner receives a session (httpOnly cookie) and is redirected to `/home`.
- [ ] **Given** the login form, **when** invalid credentials are submitted, **then** a generic error is shown without revealing which field is incorrect.

### F19-US03
- [ ] **Given** “Forgot password”, **when** the learner enters their email, **then** a reset link/token is emailed with expiry.
- [ ] **Given** a reset link, **when** the learner sets a new password that meets strength requirements, **then** prior sessions are invalidated.

## Dependencies

- Supports all downstream personalization epics (F01–F18, F20).
- Requires infrastructure for email sending and secrets management.

## Notes

- Enforce password policy (length, complexity) and offer social login later.
- Log authentication events for security monitoring.
