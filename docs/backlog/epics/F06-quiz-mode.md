# F06 — Quiz Mode

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Provide assistant-led quizzes to reinforce lesson material.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Perf-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F06-US01 | As a learner, I want the assistant to quiz me so that I can test my knowledge of lessons. |
| F06-US02 | As a learner, I want to receive instant feedback on quiz answers so that I understand mistakes. |
| F06-US03 | As a learner, I want to see my final score after a quiz so that I know how I performed. |

## Acceptance criteria

### F06-US01
- [ ] **Given** the learner starts a quiz, **when** the assistant asks questions, **then** the content is scoped to the current course/lesson.
- [ ] **Given** question templates exist, **when** the assistant generates prompts, **then** each quiz contains at least five questions.

### F06-US02
- [ ] **Given** the learner submits an answer, **when** the assistant evaluates it, **then** immediate feedback (correct/incorrect explanation) is displayed.
- [ ] **Given** an incorrect answer, **when** feedback is shown, **then** the assistant offers a link to the relevant lesson section.

### F06-US03
- [ ] **Given** the quiz completes, **when** results render, **then** score, accuracy percentage, and recommended next actions appear.
- [ ] **Given** results are shown, **when** the learner leaves the quiz, **then** the attempt is stored for progress analytics.

## Dependencies

- F07 — optional hints integrate with quizzes.
- F20 — progress tracking records completions.

## Notes

- Support multiple-choice initially; extend to free-form answers later.
- Ensure quizzes are accessible (keyboard navigation, screen readers).
