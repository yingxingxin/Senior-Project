# F08 — Ask Assistant (AMA Mode)

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Allow learners to ask freeform questions about current lessons and receive contextual answers.
- **Owner:** TBD
- **Non-functional refs:** [NFR-AI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F08-US01 | As a learner, I want to ask my assistant questions about the current topic so that I can clarify my understanding. |
| F08-US02 | As a learner, I want my assistant to highlight relevant examples when answering so that I learn faster. |

## Acceptance criteria

### F08-US01
- [ ] **Given** the learner is viewing a lesson, **when** they open the AMA drawer, **then** the assistant is preloaded with lesson context.
- [ ] **Given** the learner asks a question, **when** the assistant responds, **then** the answer references the current lesson/module.

### F08-US02
- [ ] **Given** an answer is generated, **when** code snippets or references are available, **then** they are embedded or linked inline.
- [ ] **Given** the assistant references external docs, **when** the learner clicks the link, **then** it opens in a new tab with tracking.

## Dependencies

- F10 — ensures off-topic questions are handled.
- NFR-AI-01 — governs context window and safety filters.

## Notes

- Log Q&A pairs for future retrieval and to improve suggestions.
- Provide a quick “Was this helpful?” feedback toggle.
