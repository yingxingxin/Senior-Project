# F20 — Progress Tracking

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Persist lesson progress, provide resume flows, and surface progress reports.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Data-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F20-US01 | As a learner, I want my lesson progress saved automatically so that I can continue later. |
| F20-US02 | As a learner, I want a “resume last lesson” button so that I can quickly pick up where I left off. |
| F20-US03 | As a learner, I want to view a progress report so that I know which topics I’ve mastered. |

## Acceptance criteria

### F20-US01
- [ ] **Given** a learner completes a lesson step, **when** the completion event fires, **then** progress is stored with timestamp and course identifiers.
- [ ] **Given** a network interruption, **when** the learner reconnects, **then** offline progress syncs without duplication.

### F20-US02
- [ ] **Given** stored progress, **when** the learner opens the dashboard, **then** a “Resume Lesson X” CTA shows the most recent incomplete lesson.
- [ ] **Given** the learner taps resume, **when** the lesson loads, **then** the assistant loads the saved context and code state.

### F20-US03
- [ ] **Given** progress data, **when** the learner opens the progress report, **then** completion percentages per module and recommended next steps are displayed.
- [ ] **Given** the report, **when** the learner exports it, **then** a shareable summary (PDF/email) is generated.

## Dependencies

- F19 — accounts to associate progress with users.
- F17 — uses the same completion events for points.

## Notes

- Define retention policy for historical progress (e.g., keep raw data 12 months).
- Support manual reset for learners who want to restart a course.
