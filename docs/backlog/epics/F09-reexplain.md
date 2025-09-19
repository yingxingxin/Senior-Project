# F09 — Re-explain Button

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Give learners a one-tap way to have the assistant restate the last concept more simply.
- **Owner:** TBD
- **Non-functional refs:** [NFR-AI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F09-US01 | As a learner, I want a button that makes the assistant re-explain the last point simply so that I can understand better. |
| F09-US02 | As a learner, I want the assistant to give different examples when re-explaining so that it feels fresh. |

## Acceptance criteria

### F09-US01
- [ ] **Given** the assistant delivers an explanation, **when** the learner presses “Explain again”, **then** the assistant responds with simplified language within three seconds.
- [ ] **Given** the button is pressed multiple times, **when** the assistant responds, **then** it references the same concept but avoids repeating identical phrasing.

### F09-US02
- [ ] **Given** the assistant re-explains, **when** examples are included, **then** they differ from the original explanation.
- [ ] **Given** an example is reused, **when** detected, **then** the system logs it for review and an alternative is suggested.

## Dependencies

- F08 — shares conversational context.

## Notes

- Track request frequency to understand where lessons need improvement.
- Provide analytics `reexplain_requested` with lesson ID.
