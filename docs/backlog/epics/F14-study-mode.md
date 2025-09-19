# F14 — Study Mode

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Offer a dedicated focus environment with animated backgrounds for self-guided study.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Perf-02](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F14-US01 | As a learner, I want a study mode with an animated background so that I can focus without distractions. |
| F14-US02 | As a learner, I want study mode to work even if I’m not in a coding lesson so that I can use it for outside study. |

## Acceptance criteria

### F14-US01
- [ ] **Given** the learner opens study mode, **when** the screen loads, **then** an ambient animation and minimalist UI appear.
- [ ] **Given** performance constraints, **when** the animation plays, **then** CPU/GPU usage remains within acceptable limits on target devices.

### F14-US02
- [ ] **Given** study mode is active, **when** the learner switches away from the course content, **then** the timer continues and doesn’t force-close.
- [ ] **Given** study mode sessions, **when** the learner exits, **then** the session duration is logged (regardless of lesson completion).

## Dependencies

- F15 — optionally display the assistant.
- F12/F16 — integrates with background audio.

## Notes

- Provide quick access to to-do lists or markdown notes while in focus mode.
- Consider Pomodoro timers for future iterations.
