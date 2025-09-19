# F01 — Assistant Customization

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Allow learners to choose an assistant presentation that feels comfortable during onboarding.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F01-US01 | As a learner, I want to choose my assistant’s gender so that I feel comfortable interacting with them. |
| F01-US02 | As a learner, I want the gender choice to appear during setup so that it feels like part of my onboarding experience. |

## Acceptance criteria

### F01-US01
- [ ] **Given** the onboarding flow is active, **when** the learner reaches the assistant setup step, **then** gender options are displayed as selectable cards/buttons.
- [ ] **Given** a learner selects a gender, **when** the selection is confirmed, **then** the choice is persisted to their profile and reflected in subsequent assistant renders.

### F01-US02
- [ ] **Given** a new learner signs in for the first time, **when** they begin onboarding, **then** the assistant gender selection appears before any dashboard content.
- [ ] **Given** a returning learner who already chose a gender, **when** they revisit onboarding, **then** their prior selection is preselected.

## Dependencies

- F04 — allows updating the choice post-onboarding.
- F19 — learner accounts must exist to persist preferences.

## Notes

- Provide copy previews (“Hi, I’m Drift…”) for each option to reduce second guessing.
- Capture analytics event `assistant_gender_selected` with choice metadata.
