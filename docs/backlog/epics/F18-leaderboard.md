# F18 — Leaderboard

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Motivate learners by comparing progress across friends and the wider community.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Data-02](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F18-US01 | As a learner, I want to see a leaderboard of users by points so that I feel motivated to compete. |
| F18-US02 | As a learner, I want to filter the leaderboard (friends, global, weekly) so that I compare meaningfully. |

## Acceptance criteria

### F18-US01
- [ ] **Given** leaderboard data exists, **when** the learner opens the leaderboard, **then** top entries show avatar, name, level, and points.
- [ ] **Given** the learner is logged in, **when** they are outside the top list, **then** their current rank is still displayed.

### F18-US02
- [ ] **Given** filter controls, **when** the learner switches between global, friends, and weekly views, **then** the list updates without full page reload.
- [ ] **Given** the weekly filter, **when** the week resets, **then** scores archive and the new week starts at zero.

## Dependencies

- F17 — provides point totals.
- F19 — friend relationships / account identifiers.

## Notes

- Consider privacy settings to opt-out of leaderboards.
- Paginate results to avoid loading too many records at once.
