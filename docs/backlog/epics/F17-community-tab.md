# F17 — Community Tab (Points)

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Visualize learner progress as points inside a community hub.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Data-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F17-US01 | As a learner, I want my completed lessons to count as points so that I feel rewarded for progress. |
| F17-US02 | As a learner, I want my total points displayed in the community tab so that I can track achievements. |

## Acceptance criteria

### F17-US01
- [ ] **Given** a learner completes a lesson or quiz, **when** the completion event fires, **then** points are calculated and added to their total.
- [ ] **Given** points are calculated, **when** a completion is rolled back (e.g., reset), **then** the points deduction is reflected.

### F17-US02
- [ ] **Given** the community tab loads, **when** the learner opens it, **then** total points, streaks, and next badge thresholds are displayed.
- [ ] **Given** points display, **when** the learner clicks “view history”, **then** a breakdown of point sources is shown.

## Dependencies

- F20 — progress tracking provides completion data.
- F18 — leaderboard consumes the same point totals.

## Notes

- Clarify point formula (e.g., lesson=10, quiz=15, project=50).
- Consider anti-gaming measures (cooldowns on repeated actions).
