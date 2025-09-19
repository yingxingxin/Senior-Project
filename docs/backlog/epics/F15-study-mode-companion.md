# F15 — Assistant in Study Mode

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Allow learners to toggle the assistant’s presence while in study/focus mode.
- **Owner:** TBD
- **Non-functional refs:** [NFR-AI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F15-US01 | As a learner, I want my assistant to appear in study mode if I choose so that I feel like I’m studying with company. |
| F15-US02 | As a learner, I want to toggle the assistant on or off in study mode so that I control the environment. |

## Acceptance criteria

### F15-US01
- [ ] **Given** study mode is active with assistant toggled on, **when** the session starts, **then** a compact assistant avatar and chat input appear.
- [ ] **Given** the assistant is present, **when** the learner requests help, **then** responses respect a minimal UI overlay that doesn’t obscure notes.

### F15-US02
- [ ] **Given** the assistant toggle, **when** switched off, **then** the avatar/chat hide and no additional CPU resources are used.
- [ ] **Given** the learner toggles the assistant off, **when** they re-open study mode later, **then** the prior preference is remembered.

## Dependencies

- F14 — base study mode experience.
- F08 — AMA capability within focus mode.

## Notes

- Ensure notifications are subtle (e.g., glow/pulse) to avoid distraction.
- Consider “quiet hours” where assistant auto-minimizes after inactivity.
