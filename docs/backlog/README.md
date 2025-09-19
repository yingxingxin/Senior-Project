# Product Backlog (spritedotexe)

This directory is the working backlog for spritedotexe. It captures every epic/feature, the
user stories that support it, and non-functional requirements that cut across the experience.
All changes land through pull requests so the backlog evolves alongside the product.

## How we use this backlog

- **Epics/Features:** One Markdown file per epic under `epics/`. The filename matches the
  feature ID (e.g. `F01-assistant-customization.md`).
- **User stories:** Nested inside each epic file using the WHO/WHAT/WHY format. Stories are
  numbered `<epic>-USxx` for easy cross-reference in GitHub Projects issues.
- **Acceptance criteria:** Start as placeholders in each story using Given/When/Then checklists.
  Flesh them out before the story is ready for development.
- **Statuses:** Track whether an epic is **Committed**, **Stretch**, or **Exploratory**.
- **Non-functional requirements:** Shared constraints live in `non-functional.md` and are
  referenced by whichever epics need them.

## Epic index

| ID  | Feature / Epic                       | Status     | Summary |
|-----|--------------------------------------|------------|---------|
| F01 | [Assistant customization](epics/F01-assistant-customization.md) | Proposed   | Choose assistant gender during onboarding |
| F02 | [Assistant personality](epics/F02-assistant-personality.md) | Proposed   | Select assistant persona that matches learning style |
| F03 | [Assistant introduction](epics/F03-assistant-introduction.md) | Proposed   | Welcome flow where the assistant explains the dashboard |
| F04 | [Assistant wardrobe](epics/F04-assistant-wardrobe.md) | Proposed   | Change assistant gender/personality after onboarding |
| F05 | [Dashboard themes](epics/F05-dashboard-customization.md) | Proposed   | Swap or upload study themes |
| F06 | [Quiz mode](epics/F06-quiz-mode.md) | Proposed   | Assistant-led knowledge checks |
| F07 | [Hints](epics/F07-hint-functionality.md) | Proposed   | Tiered hints during quizzes |
| F08 | [Ask assistant](epics/F08-ask-assistant.md) | Proposed   | Ask context-aware lesson questions |
| F09 | [Re-explain button](epics/F09-reexplain.md) | Proposed   | Simplify the last explanation on demand |
| F10 | [Topic enforcement](epics/F10-topic-enforcement.md) | Proposed   | Redirect off-topic conversations |
| F11 | [Personality responses](epics/F11-personality-responses.md) | Proposed   | Tailor redirections by assistant persona |
| F12 | [Background music](epics/F12-background-music.md) | Proposed   | Ambient study tracks |
| F13 | [Volume controls](epics/F13-volume-controls.md) | Proposed   | Separate sliders for voice, music, SFX |
| F14 | [Study mode](epics/F14-study-mode.md) | Proposed   | Focus room with animated background |
| F15 | [Assistant in study mode](epics/F15-study-mode-companion.md) | Proposed   | Toggle assistant presence in focus mode |
| F16 | [Soundboard](epics/F16-soundboard.md) | Proposed   | Layer ambient sounds |
| F17 | [Community points](epics/F17-community-tab.md) | Proposed   | Track lesson completions as points |
| F18 | [Leaderboard](epics/F18-leaderboard.md) | Proposed   | Compare progress with peers |
| F19 | [User accounts](epics/F19-user-accounts.md) | Proposed   | Auth + account recovery |
| F20 | [Progress tracking](epics/F20-progress-tracking.md) | Proposed   | Persist lesson progress and reports |

## Supporting docs

- [Non-functional requirements](non-functional.md)
- [Workflow guide](workflow.md)

Update this index when epics change status or new features are added.
