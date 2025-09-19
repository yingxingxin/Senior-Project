# F16 — Soundboard

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Provide ambient sound effects learners can layer to create a custom focus environment.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Audio-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F16-US01 | As a learner, I want to enable ambient sounds (rain, white noise, birds) so that I can focus better. |
| F16-US02 | As a learner, I want to combine multiple sound effects so that I create a custom atmosphere. |

## Acceptance criteria

### F16-US01
- [ ] **Given** the soundboard panel, **when** a learner toggles an ambience tile, **then** the corresponding loop begins playing immediately.
- [ ] **Given** an ambience track is active, **when** the learner exits the dashboard, **then** playback pauses unless study mode is active.

### F16-US02
- [ ] **Given** multiple ambiences, **when** the learner enables more than one, **then** volumes blend without clipping.
- [ ] **Given** a custom mix is created, **when** saved as a preset, **then** it appears for future sessions.

## Dependencies

- F13 — mixing levels rely on independent volume controls.
- NFR-Audio-01 — audio quality constraints.

## Notes

- Provide fade-in/out transitions to avoid abrupt changes.
- Consider energy impact on mobile devices (limit simultaneous tracks).
