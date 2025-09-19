# F11 — Personality-Dependent Responses

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Ensure assistant responses reflect the chosen persona when redirecting off-topic behavior.
- **Owner:** TBD
- **Non-functional refs:** [NFR-AI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F11-US01 | As a learner, I want the “mean” assistant to scold me for off-topic questions so that the personality feels authentic. |
| F11-US02 | As a learner, I want the “kind” assistant to gently redirect me so that I stay motivated. |
| F11-US03 | As a learner, I want the “neutral” assistant to give short factual redirections so that I can continue quickly. |

## Acceptance criteria

### F11-US01
- [ ] **Given** persona `mean`, **when** an off-topic prompt is detected, **then** the assistant replies with playful but firm language and references staying on task.
- [ ] **Given** the tone is strong, **when** the learner requests a change of persona, **then** the system offers the wardrobe flow.

### F11-US02
- [ ] **Given** persona `kind`, **when** redirecting, **then** the assistant uses encouraging language and offers help on the current topic.
- [ ] **Given** the learner repeatedly goes off-topic, **when** responses continue, **then** the tone remains supportive but firm.

### F11-US03
- [ ] **Given** persona `calm`/`neutral`, **when** redirecting, **then** the assistant provides a short factual statement, a link back to the lesson, and ends the interaction.
- [ ] **Given** repeated off-topic prompts, **when** responded to, **then** the assistant escalates minimally (e.g., “Let’s return to Lesson 3 now.”).

## Dependencies

- F02 — persona selection.
- F10 — off-topic detection triggers the logic.

## Notes

- Provide persona tone guidelines for copywriters/LLM prompt templates.
- Consider rate-limiting “mean” responses to avoid sounding abusive.
