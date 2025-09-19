# F12 — Background Music

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Provide curated background music to support focused study sessions.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Audio-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F12-US01 | As a learner, I want to enable background lofi music so that I can study in a relaxing environment. |
| F12-US02 | As a learner, I want multiple music tracks to choose from so that I don’t get bored of one style. |

## Acceptance criteria

### F12-US01
- [ ] **Given** the dashboard toolbar, **when** the learner taps the music button, **then** playback starts with a default playlist.
- [ ] **Given** music is playing, **when** the learner navigates between dashboard sections, **then** playback continues without interruption.

### F12-US02
- [ ] **Given** the music dropdown, **when** the learner selects a different track/playlist, **then** the new selection starts seamlessly.
- [ ] **Given** tracks are available, **when** the learner favorites one, **then** it appears at the top of their list.

## Dependencies

- F13 — volume controls interact with playback levels.
- NFR-Audio-01 — streaming and licensing requirements.

## Notes

- Consider caching short intro loops for instant playback.
- Provide attribution/licensing info in settings.
