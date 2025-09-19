# F02 — Assistant Personality

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Let learners pick an assistant persona (calm, kind, mean) that matches their learning style.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UX-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F02-US01 | As a learner, I want to select my assistant’s personality type so that the assistant matches my learning style. |
| F02-US02 | As a learner, I want to see examples of each personality before choosing so that I know what to expect. |
| F02-US03 | As a learner, I want to switch personalities later so that I can adapt as my preferences change. |

## Acceptance criteria

### F02-US01
- [ ] **Given** the onboarding persona step, **when** the learner views the available personas, **then** calm, kind, and mean options are displayed with concise descriptions.
- [ ] **Given** a persona is selected, **when** the learner completes onboarding, **then** the persona is stored with the user profile and informs assistant behavior.

### F02-US02
- [ ] **Given** the persona selection UI, **when** a learner hovers or focuses a persona, **then** an example reply for that persona is shown.
- [ ] **Given** a learner toggles between personas, **when** the preview text changes, **then** it reflects tone differences clearly.

### F02-US03
- [ ] **Given** a learner is on the “Wardrobe/Stasis” screen, **when** they select a new persona, **then** the change is persisted and applied immediately.
- [ ] **Given** a persona is changed, **when** the assistant next responds, **then** the tone matches the new persona.

## Dependencies

- F04 — UI entry point for post-onboarding changes.
- F10/F11 — rely on persona metadata to drive responses.

## Notes

- Consider storing persona as an enum (`calm`, `kind`, `direct`).
- Ensure voice/tone guidelines are documented for content/LLM prompts.
