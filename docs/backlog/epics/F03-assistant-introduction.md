# F03 — Assistant Introduction

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Greet new learners with an assistant-led walkthrough of the dashboard.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UX-02](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F03-US01 | As a learner, I want my assistant to introduce themselves so that I feel welcomed into the app. |
| F03-US02 | As a learner, I want the assistant to explain the dashboard features so that I know how to use the app. |

## Acceptance criteria

### F03-US01
- [ ] **Given** onboarding completion, **when** the learner lands on the home dashboard for the first time, **then** the assistant appears with a welcome message personalized with the learner’s name.
- [ ] **Given** the welcome message appears, **when** the learner dismisses it, **then** it is not shown again unless reset via settings.

### F03-US02
- [ ] **Given** the welcome flow, **when** the learner progresses through the tour, **then** the assistant highlights major dashboard sections (courses, community, progress).
- [ ] **Given** the walkthrough ends, **when** the learner revisits the dashboard later, **then** a quick replay option is available.

## Dependencies

- F20 — uses stored progress to contextualize the tour later.

## Notes

- Record analytics `assistant_intro_completed` for onboarding funnel.
- Ensure accessibility: provide text transcripts for screen readers.
