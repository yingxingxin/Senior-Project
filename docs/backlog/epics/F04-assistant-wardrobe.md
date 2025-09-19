# F04 — Assistant Wardrobe/Stasis

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Provide a persistent settings surface to reconfigure assistant gender and personality.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UX-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F04-US01 | As a learner, I want a “Wardrobe” button so that I can change my assistant’s gender or personality after setup. |
| F04-US02 | As a learner, I want my assistant to acknowledge changes so that it feels like a natural interaction. |

## Acceptance criteria

### F04-US01
- [ ] **Given** the learner is on any dashboard page, **when** they open the settings dropdown, **then** a Wardrobe/Stasis entry is available.
- [ ] **Given** the wardrobe modal/screen, **when** a new gender or persona is selected and saved, **then** the profile record updates and the assistant re-renders accordingly.

### F04-US02
- [ ] **Given** a change is saved, **when** the assistant next speaks, **then** it references the update (e.g., “Thanks for the new look!”).
- [ ] **Given** the assistant acknowledges the change, **when** the learner dismisses the message, **then** it is not repeated for the same configuration.

## Dependencies

- F01 & F02 — initial selection surfaces.
- F11 — ensures persona logic updates on change.

## Notes

- Consider rate-limiting changes to avoid excessive prompt churn.
- Provide preview avatars so the learner knows what to expect before saving.
