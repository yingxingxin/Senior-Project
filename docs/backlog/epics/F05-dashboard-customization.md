# F05 — Dashboard Customization

- **Status:** Proposed
- **Type:** Feature
- **Goal:** Let learners personalize the dashboard theme to suit their study environment.
- **Owner:** TBD
- **Non-functional refs:** [NFR-UI-01](../non-functional.md)

## User stories

| ID | Story |
|----|-------|
| F05-US01 | As a learner, I want to swap between default themes so that I can personalize my study environment. |
| F05-US02 | As a learner, I want to upload a custom theme so that my dashboard feels unique to me. |

## Acceptance criteria

### F05-US01
- [ ] **Given** the theme picker, **when** a learner selects a default theme, **then** the dashboard updates instantly with a preview and persists after reload.
- [ ] **Given** multiple devices, **when** the learner signs in elsewhere, **then** the chosen theme is applied automatically.

### F05-US02
- [ ] **Given** the custom theme upload option, **when** a learner provides valid assets (colors, wallpaper), **then** the system validates size/format before applying.
- [ ] **Given** a custom theme is saved, **when** the learner reopens the picker, **then** the custom entry appears with options to edit or delete.

## Dependencies

- F19 — store theme preferences per user.
- NFR-Security — sanitize uploads.

## Notes

- Support light/dark base toggles for accessibility.
- Consider quotas on uploaded assets to control storage costs.
