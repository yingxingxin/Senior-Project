# Sprite.exe - Project State Documentation

**Last Updated:** Current Session  
**Purpose:** Comprehensive description of the current project state for LLM-assisted development

---

## Project Overview

**Sprite.exe** is an interactive coding education platform with a personalized AI assistant. The platform combines adaptive learning, gamification, and AI-powered conversations to help users learn programming concepts through structured courses, interactive exercises, and personalized study sessions.

**Core Value Proposition:**
- Concept-first, language-second learning approach
- Personalized AI assistant with customizable personality and appearance
- Interactive code playground with multiple language support
- Gamified progress tracking with points, levels, and achievements
- Customizable themes and background music for study sessions

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.5.3 (App Router)
- **Language:** TypeScript 5.9.3
- **React:** 19.1.0
- **Styling:** Tailwind CSS v4 with PostCSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** lucide-react
- **Code Editor:** Monaco Editor (@monaco-editor/react)
- **Animations:** framer-motion
- **Form Handling:** react-hook-form with Zod validation

### Backend
- **Runtime:** Next.js API Routes (serverless)
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM 0.44.5
- **Authentication:** Better Auth 1.3.13 (JWT-based with httpOnly cookies)
- **Email:** Resend 6.1.0 with React Email templates
- **AI/LLM:** Vercel AI SDK 5.0.92 with OpenRouter integration
- **Code Execution:** Piston API (emkc.org) for server-side code execution
- **TTS:** Microsoft Cognitive Services Speech SDK

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint 9 with Next.js config
- **Database Migrations:** Drizzle Kit
- **Type Safety:** Full TypeScript coverage

---

## Architecture & Folder Structure

The project follows a **feature-based architecture** with Next.js App Router conventions:

```
Senior-Project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (/login, /signup, /forgot-password)
│   │   ├── _components/          # Auth-specific components
│   │   ├── _lib/                 # Auth business logic, schemas, email utils
│   │   └── api/auth/             # Auth API routes
│   │
│   ├── (app)/                    # Protected app routes
│   │   ├── home/                 # Dashboard/homepage
│   │   ├── courses/              # Course listing and detail pages
│   │   ├── study/                # Study mode with AI companion
│   │   ├── settings/             # User settings (themes, music, account, preferences)
│   │   ├── leaderboard/          # Global leaderboard
│   │   └── api/                   # API routes (chat, execute, timed-runs, tts)
│   │
│   ├── onboarding/               # Multi-step onboarding flow
│   │   ├── _components/          # Onboarding components
│   │   ├── _lib/                 # Onboarding logic, steps, fixtures
│   │   └── [step]/               # Dynamic step pages
│   │
│   ├── admin/                    # Admin panel (user management)
│   ├── editor/                   # Code editor page
│   └── layout.tsx                # Root layout with theme injection
│
├── components/                    # Global design system
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Form, etc.)
│   ├── codeplayground/           # Code playground component
│   └── music/                    # Music player and context
│
├── src/
│   ├── db/                       # Database layer
│   │   ├── schema/               # Drizzle schema definitions
│   │   ├── queries/              # Database query functions
│   │   └── migrations/           # Database migration files
│   │
│   └── lib/                      # Global utilities
│       ├── auth.ts               # Better Auth server config
│       ├── auth-client.ts        # Better Auth client
│       ├── openrouter.ts         # OpenRouter AI client
│       └── utils.ts              # Utility functions (cn, etc.)
│
└── docs/                         # Documentation
    ├── backlog/                  # Product backlog and epics
    ├── folder-structure.md       # Architecture guide
    └── design-system.md          # Design system documentation
```

### Key Architectural Patterns

1. **Feature Colocation:** All feature code (components, logic, types) lives together in `app/feature/_components/` and `app/feature/_lib/`
2. **Private Folders:** `_components/` and `_lib/` opt out of routing while keeping code colocated
3. **Route Groups:** `(auth)` and `(app)` organize routes without affecting URLs
4. **Design System:** Global UI primitives in `components/ui/`, feature-specific components in feature folders

---

## Database Schema

### Core Tables

#### Authentication & Users (`src/db/schema/auth.ts`)
- **users:** Core user accounts with onboarding state, assistant preferences, skill level
- **accounts:** OAuth provider connections (Google, GitHub) and credentials
- **sessions:** Active user sessions with security metadata
- **verifications:** Email verification and password reset tokens

**Key Enums:**
- `user_role`: 'user' | 'admin'
- `onboarding_step`: 'welcome' | 'gender' | 'skill_quiz' | 'persona' | 'guided_intro'
- `skill_level`: 'beginner' | 'intermediate' | 'advanced'
- `assistant_persona`: 'calm' | 'kind' | 'direct'

#### Learning Content (`src/db/schema/lessons.ts`)
- **assistants:** AI assistant definitions (name, gender, avatar, tagline, description)
- **lessons:** Hierarchical course structure (parent_lesson_id for nesting)
- **lesson_sections:** Granular lesson content (markdown body, ordered sections)
- **user_lesson_sections:** Section-level completion tracking
- **dialogues:** Predefined conversation scripts for assistants (scene-based)
- **themes:** UI theme definitions with light/dark variants
- **music_tracks:** Background music metadata

**Key Enums:**
- `assistant_gender`: 'feminine' | 'masculine' | 'androgynous'
- `difficulty`: 'beginner' | 'intermediate' | 'advanced'

#### Progress & Gamification (`src/db/schema/progress.ts`)
- **user_lesson_progress:** Lesson-level progress (started_at, completed_at, last_section_id)
- **activity_events:** Immutable event log (lesson_started, quiz_submitted, achievement_unlocked, etc.)
- **achievements:** Badge definitions with rarity and point rewards
- **user_achievements:** Junction table for earned achievements
- **levels:** XP thresholds for level progression

**Key Enums:**
- `activity_event_type`: Various learning events
- `achievement_rarity`: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

#### Quizzes (`src/db/schema/quizzes.ts`)
- **quizzes:** Quiz definitions linked to lessons
- **quiz_questions:** Question content with correct answers
- **quiz_attempts:** User quiz submissions with scores

#### Preferences (`src/db/schema/preferences.ts`)
- **user_preferences:** Learning goals, difficulty preferences
- **user_theme_settings:** Active theme per user
- **user_music_tracks:** User's music playlist
- **study_settings:** Study mode configuration

#### Timed Runs (`src/db/schema/timedRuns.ts`)
- **timed_runs:** Records of exercise completion times for leaderboard

---

## Features Implemented

### ✅ Authentication & Onboarding

**Status:** Fully Implemented

- **Email/Password Auth:** Signup, login, password reset with email verification
- **OAuth:** Google and GitHub social login via Better Auth
- **Multi-Step Onboarding:**
  1. **Gender Selection:** Choose assistant gender (feminine/masculine/androgynous)
  2. **Skill Quiz:** Assessment to determine skill level (beginner/intermediate/advanced)
  3. **Persona Selection:** Choose assistant personality (calm/kind/direct)
  4. **Guided Intro:** Welcome tour with assistant explanation
- **Onboarding Guard:** Redirects incomplete users to appropriate step
- **Session Management:** JWT-based with httpOnly cookies

### ✅ Home Dashboard

**Status:** Fully Implemented

- **User Profile Section:** Displays name, email, skill level, level, points, streak days, assistant name
- **Assistant Hero:** Personalized assistant greeting with speech
- **Recommended Courses:** Course recommendations based on skill level
- **Navbar:** Global navigation with user menu
- **Real-time Data:** Fetches user progress, achievements, and stats from database

### ✅ Courses System

**Status:** Fully Implemented

- **Course Listing:** Grid view of all available courses with stats (lessons count, duration)
- **Course Detail Pages:** Individual course pages with lesson structure
- **Hierarchical Structure:** Courses contain lessons, lessons contain sections
- **Progress Tracking:** Section-level completion tracking
- **Difficulty Levels:** Beginner, intermediate, advanced courses
- **Resume Functionality:** Users can resume from last accessed section

### ✅ Code Playground

**Status:** Fully Implemented

**Location:** `components/codeplayground/CodePlayground.tsx`

**Features:**
- **Dual Modes:**
  - **Exercise Mode:** Pre-defined coding exercises with validation
  - **Free Code Mode:** Open-ended coding environment
- **Language Support:**
  - Client-side: JavaScript, TypeScript (with TS transpiler), HTML
  - Server-side (via Piston API): Python, Java, C, C++
- **Exercise System:**
  - Exercise definitions in `components/codeplayground/exercises/`
  - Supports dynamic exercise generation (random parameters)
  - Output validation (stdout matching, HTML content checking)
  - Multiple validation modes (exact match, order-insensitive, match-any)
- **Timed Runs:**
  - Start timer when beginning exercise
  - Save completion time to database
  - Track best time per exercise/language
  - Leaderboard integration
- **Monaco Editor:** Full-featured code editor with syntax highlighting
- **Theme Support:** Light/dark editor themes
- **Output Display:** Console output, HTML preview, validation messages

### ✅ Study Mode

**Status:** Partially Implemented

- **Study Shell Component:** Basic structure in place
- **AI Companion:** Integration with chat API for study assistance
- **Background Music:** Music player integration
- **Note:** Full implementation details need review

### ✅ Settings System

**Status:** Fully Implemented

**Settings Sections:**

1. **Themes (`/settings/themes`):**
   - Theme selection from built-in themes
   - Advanced theme editor with AI generation
   - Custom theme creation (colors, fonts, spacing, border radius)
   - Light/dark mode support
   - Real-time preview
   - Theme persistence per user

2. **Music (`/settings/music`):**
   - Background music playlist management
   - Track selection and ordering
   - Volume controls
   - Quick-add tracks interface

3. **Account (`/settings/account`):**
   - Profile management
   - Email settings
   - Account security

4. **Preferences (`/settings/preferences`):**
   - Learning goals
   - Difficulty preferences
   - Notification settings

### ✅ Leaderboard

**Status:** Implemented

- **Global Leaderboard:** User rankings based on points
- **API Route:** `/api/leaderboard` for fetching leaderboard data
- **Display:** Shows user rank, name, points, level, achievements

### ✅ Admin Panel

**Status:** Implemented

- **User Management:** View and manage users
- **User Detail Pages:** Individual user profiles with actions
- **Admin Guard:** Role-based access control
- **Statistics:** Admin dashboard with user stats

### ✅ API Routes

**Implemented Routes:**

1. **`/api/execute`:** Code execution via Piston API
   - Supports: Python, Java, C, C++
   - Returns stdout/stderr from compilation and execution

2. **`/api/chat`:** AI chat for theme generation
   - Uses OpenRouter with GPT-4o
   - Tool calling for theme application
   - Streaming responses

3. **`/api/timed-runs`:** Timed exercise runs
   - POST: Save completion time
   - Returns best time for exercise/language combination

4. **`/api/leaderboard`:** Leaderboard data
   - Returns ranked users with points, level, achievements

5. **`/api/tts`:** Text-to-speech (implementation status unclear)

---

## Key Components

### Global Components (`components/`)

**UI Primitives (`components/ui/`):**
- Typography: Display, Heading, Body, Muted, Caption
- Spacing: Stack, Grid, Inline
- Form: Form, Field, Input, Textarea, Select, Switch, RadioGroup
- Layout: Card, Dialog, Popover, Tabs, Separator
- Feedback: Alert, AlertDialog, Progress, Badge
- Navigation: DropdownMenu, ScrollArea
- Media: Avatar, AudioPlayer

**Feature Components:**
- **CodePlayground:** Full-featured code editor with exercise system
- **Music System:** MusicProvider, MusicPlayer, MusicSettings, QuickAddTracks
- **ThemeProvider:** Global theme context and management

### Feature Components

**Auth (`app/(auth)/_components/`):**
- LoginForm, SignupForm, ForgotPasswordForm
- OtpForm (email verification)
- AuthSuccess, SocialButtons
- AuthCarousel

**Home (`app/(app)/home/_components/`):**
- Navbar, UserProfileSection, AssistantHero
- RecommendedCourseSection, AchievementsSection

**Courses (`app/(app)/courses/_components/`):**
- Course listing and detail components
- Lesson navigation components

**Settings (`app/(app)/settings/_components/`):**
- Theme editor components
- Music management components
- Account management forms
- Preference forms

**Onboarding (`app/onboarding/_components/`):**
- OnboardingProgress, PersistOnboardingStep
- PersonaSelectionForm, AssistantSelectionForm
- SkillQuizForm, GuidedIntroCompletion

---

## Authentication & Authorization

### Authentication System

**Provider:** Better Auth 1.3.13

**Features:**
- Email/password authentication
- OAuth providers (Google, GitHub)
- Email verification with OTP
- Password reset flow
- Session management with JWT tokens
- httpOnly cookie-based sessions

**Flow:**
1. User signs up → Email verification required
2. User logs in → Session created
3. Onboarding check → Redirect if incomplete
4. Access granted → Protected routes available

### Authorization

- **Role-Based:** `user` (default) and `admin` roles
- **Route Protection:** Layout-level guards in `app/(app)/layout.tsx`
- **Admin Guard:** Separate guard for admin routes

---

## Current State & What's Working

### ✅ Fully Functional

1. **User Authentication:** Complete signup/login/verification flow
2. **Onboarding:** Multi-step onboarding with assistant selection
3. **Dashboard:** Home page with user stats and assistant greeting
4. **Courses:** Course listing and detail pages with progress tracking
5. **Code Playground:** Full exercise system with multiple languages and timed runs
6. **Settings:** Complete settings system (themes, music, account, preferences)
7. **Theme System:** Advanced theme customization with AI generation
8. **Music System:** Background music player with playlist management
9. **Leaderboard:** Global rankings based on points
10. **Admin Panel:** User management interface

### ⚠️ Partially Implemented / Needs Review

1. **Study Mode:** Basic structure exists, full implementation unclear
2. **Chat/Assistant:** Chat API exists for theme generation, but study mode chat needs review
3. **TTS:** API route exists but implementation status unclear
4. **Quiz System:** Database schema exists, UI implementation needs verification

### 📋 Database State

- **Schema:** Comprehensive schema covering all major features
- **Migrations:** Drizzle migrations in place
- **Relations:** Proper foreign keys and relations defined
- **Indexes:** Performance indexes on key columns

---

## Areas for Future Development

### High Priority

1. **Study Mode Completion:**
   - Full AI chat integration for study assistance
   - Topic enforcement and conversation management
   - Re-explanation functionality
   - Hint system integration

2. **Quiz System:**
   - Quiz UI implementation
   - Question rendering and submission
   - Score calculation and feedback
   - Quiz attempt tracking

3. **Assistant Features:**
   - Personality-based responses
   - Wardrobe changes (assistant customization)
   - Assistant introduction dialogues
   - Off-topic conversation handling

4. **Progress & Gamification:**
   - Achievement unlocking logic
   - Level-up notifications
   - Streak tracking and rewards
   - Activity feed implementation

### Medium Priority

1. **Community Features:**
   - Community tab/social features
   - User profiles and sharing
   - Discussion forums

2. **Enhanced Learning:**
   - Adaptive learning algorithms
   - Personalized course recommendations
   - Learning path optimization

3. **Code Playground Enhancements:**
   - More exercise types
   - Code sharing and collaboration
   - Exercise difficulty progression

### Low Priority / Nice to Have

1. **Soundboard:** Ambient sound effects
2. **Advanced Analytics:** Detailed progress reports
3. **Mobile Optimization:** Responsive design improvements
4. **Accessibility:** WCAG AAA compliance enhancements

---

## Development Workflow

### Database Commands
```bash
npm run db:generate    # Generate migrations after schema changes
npm run db:push        # Push schema changes to database
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio
npm run db:seed        # Seed database with initial data
```

### Development
```bash
npm run dev            # Start dev server with Turbopack
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `BETTER_AUTH_SECRET`: Secret for Better Auth
- `BETTER_AUTH_URL`: Base URL for auth callbacks
- `OPENROUTER_API_KEY`: API key for OpenRouter (AI)
- `RESEND_API_KEY`: API key for Resend (email)
- OAuth provider credentials (Google, GitHub)

---

## Code Quality & Standards

### Type Safety
- Full TypeScript coverage
- Zod schemas for runtime validation
- Drizzle ORM for type-safe database queries

### Component Organization
- Feature-based colocation
- Design system primitives in `components/ui/`
- Feature components in `app/feature/_components/`

### Validation
- Zod schemas for all form inputs
- Server-side validation in API routes
- Type-safe database queries

### Styling
- Tailwind CSS utility classes
- Design system tokens (colors, spacing, typography)
- Theme-aware components
- Responsive design patterns

---

## Known Limitations & Technical Debt

1. **Code Playground:**
   - TypeScript transpilation requires loading typescript library client-side
   - Some languages require server-side execution (network latency)

2. **Theme System:**
   - Complex theme structure with light/dark variants
   - CSS variable injection for dynamic themes

3. **Database:**
   - Some nullable fields that could be better constrained
   - Activity events table uses bigserial (consider partitioning for scale)

4. **Performance:**
   - Some N+1 query patterns may exist (needs profiling)
   - Large lesson content could benefit from pagination

---

## Documentation

- **Architecture:** `docs/folder-structure.md`
- **Design System:** `docs/design-system.md`
- **Zod Patterns:** `docs/zod.md`
- **Product Backlog:** `docs/backlog/` (epics and user stories)
- **TTS Setup:** `docs/tts-setup.md`

---

## Next Steps for Development

When starting new features or iterations:

1. **Review Backlog:** Check `docs/backlog/epics/` for planned features
2. **Follow Architecture:** Use feature-based structure with `_components/` and `_lib/`
3. **Database First:** Update schema in `src/db/schema/`, generate migrations
4. **Type Safety:** Use Zod for validation, Drizzle types for queries
5. **Component Reuse:** Check `components/ui/` before creating new components
6. **Testing:** Add tests for new features (test infrastructure may need setup)

---

**This document should be updated as the project evolves. Use it as a reference point for understanding the current state before making changes or adding features.**

