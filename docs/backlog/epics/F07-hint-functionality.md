# F07 — Hint Functionality

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Offer tiered hints during quizzes so learners can recover without giving up.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UX-03](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F07-US01 | As a learner, I want to request hints during quizzes so that I have a chance to succeed without guessing. |
| F07-US02 | As a learner, I want hints to gradually get more obvious so that I still learn while being guided. |

## Acceptance criteria

### F07-US01
- [ ] **Given** a quiz question is active, **when** the learner taps “Hint”, **then** the assistant reveals the first-level hint without revealing the answer.
- [ ] **Given** the learner has used all hints, **when** they tap again, **then** the UI informs them no further hints remain.

### F07-US02
- [ ] **Given** multiple hint tiers, **when** the learner requests subsequent hints, **then** each hint provides additional detail leading toward the solution.
- [ ] **Given** the final hint tier, **when** presented, **then** it references the exact concept or code snippet needed but still requires the learner to respond.

## Dependencies

- F06 — hints surface within quiz flow.

## Notes

- Limit hints per question (e.g., max 3) and log usage for analytics.
- Configurable difficulty: consider disabling hints on “challenge” questions.
