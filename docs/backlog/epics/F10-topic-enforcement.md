# F10 — Topic Enforcement

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Keep conversations focused on course material by intercepting off-topic prompts.
- **Owner:** TBD
- **Non-functional refs:** [NFR-AI-02](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F10-US01 | As a learner, I want the assistant to ignore off-topic questions so that I stay focused on learning. |
| F10-US02 | As a learner, I want the assistant to redirect me back to the lesson so that I don’t waste time. |

## Acceptance criteria

### F10-US01
- [ ] **Given** a learner asks a question outside the current course scope, **when** intent classification detects it, **then** the assistant declines to answer.
- [ ] **Given** the assistant declines, **when** the learner insists repeatedly, **then** the assistant continues to refuse without escalating aggression (unless persona dictates otherwise).

### F10-US02
- [ ] **Given** an off-topic prompt is detected, **when** the assistant responds, **then** it provides links or guidance back to the relevant lesson section.
- [ ] **Given** a refusal is sent, **when** the learner selects “return to lesson”, **then** the UI scrolls/highlights the current exercise.

## Dependencies

- F11 — modifies redirect tone per persona.
- NFR-AI-02 — defines safety and guardrails.

## Notes

- Maintain a whitelist of sanctioned off-topic commands (e.g., “help”, “settings”).
- Telemetry: log `off_topic_detected` with anonymized intent category.
