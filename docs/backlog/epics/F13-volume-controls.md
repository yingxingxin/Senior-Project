# F13 — Volume Controls

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Allow learners to control volume for assistant voice, music, and ambient sounds independently.
- **Owner:** TBD
- **Non-functional refs:** [NFR-Audio-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F13-US01 | As a learner, I want to adjust the volume of the assistant’s voice so that it matches my preference. |
| F13-US02 | As a learner, I want to adjust music and sound effects independently so that I balance the audio experience. |

## Acceptance criteria

### F13-US01
- [ ] **Given** the audio settings panel, **when** the learner moves the assistant voice slider, **then** voice playback volume changes immediately.
- [ ] **Given** voice volume is muted, **when** the assistant speaks, **then** subtitles or text bubbles are shown by default.

### F13-US02
- [ ] **Given** separate sliders for music and ambient effects, **when** the learner adjusts them, **then** each track responds without affecting the others.
- [ ] **Given** a learner sets custom levels, **when** they sign in on another device, **then** the saved levels sync.

## Dependencies

- F12/F16 — audio sources subject to control.
- F19 — persistence of user preferences.

## Notes

- Expose a master mute toggle for quick silence.
- Respect OS-level accessibility settings (e.g., reduced loud sounds).
