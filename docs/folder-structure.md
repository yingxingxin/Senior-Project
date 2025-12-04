# Architecture & Folder Structure Guide

**Last Updated:** October 2025
**Version:** 1.0
**Purpose:** Reference guide for organizing code in a feature-based Next.js App Router architecture

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Folder Structure Patterns](#folder-structure-patterns)
3. [Component Organization](#component-organization)
4. [Import Conventions](#import-conventions)
5. [Best Practices](#best-practices)
6. [Examples from Codebase](#examples-from-codebase)
7. [Extension Guide](#extension-guide)

---

## Overview & Philosophy

This project uses a **feature-based architecture** following Next.js App Router best practices. Code is organized by feature/route rather than by technical type, improving colocation, scalability, and maintainability.

**Official Next.js recommendation:** ["Split project files by feature or route"](https://nextjs.org/docs/app/getting-started/project-structure#split-project-files-by-feature-or-route)

### Core Principles

1. **Feature Colocation**
   - Keep all feature code (components, logic, types) together
   - Reduces cognitive load when working on a feature
   - Makes features self-contained and portable

2. **Clear Separation of Concerns**
   - `components/` → Global design system only
     - `components/ui/` → UI primitives (Button, Input, Card, Typography, Spacing)
     - `components/theme-provider.tsx` → Global utilities
   - `app/*/_components/` → All feature-specific components (shared and page-specific)
   - `app/*/_lib/` → Feature-specific business logic, utilities, and schemas
   - `src/lib/` → Global utilities and configurations

3. **Next.js Conventions**
   - Private folders (`_components`, `_lib`) opt out of routing
   - Route groups (`(auth)`, `(app)`) organize without affecting URLs
   - Colocation keeps related code together

### Benefits

[OK] **Scalability** — Easy to add new features without cluttering root directories
[OK] **Discoverability** — Clear feature boundaries, easier to navigate
[OK] **Maintainability** — Changes isolated to feature folders
[OK] **Reduced Coupling** — Features are self-contained
[OK] **Better DX** — Shorter import paths within features
[OK] **Team Productivity** — Multiple developers can work on different features without conflicts

---

## Folder Structure Patterns

### Current Architecture

```
Senior-Project/
├── components/
│   ├── ui/                      ← Design system primitives ONLY
│   │   ├── typography.tsx       (Display, Heading, Body, Muted, Caption)
│   │   ├── spacing.tsx          (Stack, Grid, Inline)
│   │   ├── button.tsx           (shadcn/ui Button)
│   │   ├── form.tsx             (shadcn/ui Form)
│   │   └── ...                  (other UI primitives)
│   └── theme-provider.tsx       ← Global theme utility
│
├── app/
│   ├── (auth)/                  ← Route group for auth pages
│   │   ├── _components/         ← All auth components
│   │   │   ├── auth-form.tsx    (Reusable form primitives)
│   │   │   ├── otp-form.tsx     (OTP verification)
│   │   │   ├── auth-success.tsx (Success screen)
│   │   │   ├── login-form.tsx   (Login page form)
│   │   │   ├── signup-form.tsx  (Signup page form)
│   │   │   └── forgot-password-form.tsx (Password reset form)
│   │   ├── _lib/                ← Auth business logic
│   │   │   ├── email.ts         (Email utilities)
│   │   │   ├── schemas.ts       (Zod validation)
│   │   │   └── index.ts         (Exports)
│   │   ├── login/
│   │   │   └── page_old.tsx
│   │   ├── signup/
│   │   │   └── page_old.tsx
│   │   └── forgot-password/
│   │       └── page_old.tsx
│   │
│   ├── (app)/                   ← Route group for app pages
│   │   └── home/
│   │       ├── _components/     ← Home feature components
│   │       │   ├── navbar.tsx
│   │       │   ├── assistant-hero.tsx
│   │       │   └── ...
│   │       └── page_old.tsx
│   │
│   └── onboarding/
│       ├── _components/         ← All onboarding components
│       │   ├── OnboardingProgress.tsx
│       │   ├── PersistOnboardingStep.tsx
│       │   ├── persona-selection-form.tsx
│       │   ├── assistant-selection-form.tsx
│       │   ├── skill-quiz-form.tsx
│       │   └── guided-intro-completion.tsx
│       ├── _lib/                ← Onboarding business logic
│       │   ├── fixtures.ts
│       │   ├── server.ts
│       │   └── steps.ts
│       ├── persona/
│       │   └── page_old.tsx
│       ├── gender/
│       │   └── page_old.tsx
│       ├── skill-quiz/
│       │   └── page_old.tsx
│       └── guided-intro/
│           └── page_old.tsx
│
└── src/lib/
    ├── auth.ts                  ← BetterAuth server config (global)
    ├── auth-client.ts           ← BetterAuth client (global)
    └── utils.ts                 ← Global utilities (cn, etc.)
```

### Key Patterns

#### 1. Private Folders (`_components`, `_lib`)

**Purpose:** Opt out of Next.js routing while keeping code colocated

```
app/onboarding/
├── _components/         ← Not a route (underscore prefix)
│   └── shared-ui.tsx
└── persona/
    └── page_old.tsx         ← Route: /onboarding/persona
```

**When to use:**
- [OK] All feature-specific components (shared and page-specific)
- [OK] Business logic, utilities, or types specific to a feature
- [OK] Anything that should live with the feature but isn't a route

#### 2. Route Groups (`(auth)`, `(app)`)

**Purpose:** Organize routes without affecting URL structure

```
app/
├── (auth)/
│   ├── login/page_old.tsx       → URL: /login
│   └── signup/page_old.tsx      → URL: /signup
└── (app)/
    └── home/page_old.tsx        → URL: /home
```

**When to use:**
- [OK] Grouping related routes (e.g., all auth pages)
- [OK] Applying different layouts to route groups
- [OK] Organizing without changing URLs

#### 3. The `/components/` Directory — Design System Primitives

**Purpose:** Houses ONLY globally reusable design system primitives and truly global utilities

```
components/
├── ui/                      ← Design system primitives (shadcn/ui)
│   ├── button.tsx           (Button component)
│   ├── input.tsx            (Input component)
│   ├── form.tsx             (Form primitives)
│   ├── card.tsx             (Card component)
│   ├── typography.tsx       (Display, Heading, Body, Muted, Caption)
│   ├── spacing.tsx          (Stack, Grid, Inline)
│   ├── alert.tsx            (Alert component)
│   ├── dialog.tsx           (Modal/Dialog)
│   ├── badge.tsx            (Badge component)
│   ├── avatar.tsx           (Avatar component)
│   └── ...                  (other shadcn/ui components)
└── theme-provider.tsx       ← Global theme provider
```

**What belongs in `/components/`:**
- [OK] **Design system primitives** — Button, Input, Card, etc. (from shadcn/ui)
- [OK] **Typography system** — Display, Heading, Body, Muted, Caption components
- [OK] **Layout system** — Stack, Grid, Inline spacing components
- [OK] **Global utilities** — ThemeProvider, global context providers
- [OK] **Truly reusable UI** — Used across 3+ different features

**What does NOT belong in `/components/`:**
- [X] **Feature-specific components** → Move to `app/feature/_components/`
- [X] **Page-specific forms** → Move to `app/feature/_components/`
- [X] **Business logic** → Move to `app/feature/_lib/` or `src/lib/`
- [X] **Auth-specific UI** → Move to `app/(auth)/_components/`

**The `components/ui/` standard:**

All components in `components/ui/` follow these principles:
1. **Framework agnostic** — Could be used in any Next.js project
2. **No business logic** — Pure UI presentation
3. **Highly reusable** — Used throughout the entire app
4. **Design system aligned** — Follows semantic color tokens and spacing
5. **Accessible** — WCAG AAA compliant

**Examples:**

```tsx
// [OK] CORRECT: Design system primitive in components/ui/
// components/ui/button.tsx
export function Button({ variant, size, children }) {
  return <button className={...}>{children}</button>
}

// [OK] CORRECT: Global utility in components/
// components/theme-provider.tsx
export function ThemeProvider({ children }) {
  return <ThemeContext.Provider>{children}</ThemeContext.Provider>
}

// [X] WRONG: Feature-specific in components/
// components/login-form.tsx  ← Should be app/(auth)/_components/login-form.tsx
export function LoginForm() { ... }

// [X] WRONG: Auth-specific in components/
// components/auth-button.tsx  ← Should be app/(auth)/_components/auth-button.tsx
export function AuthButton() { ... }
```

**Promotion to `/components/`:**

Only promote components to `/components/` when:
1. Used by **3 or more different features** (not just pages in same feature)
2. Contains **zero feature-specific logic**
3. Could be **extracted to a separate package** without modification

---

## Component Organization

### Decision Tree: Where Should This Component Live?

```
Is it a design system primitive (Button, Input, Typography)?
├─ YES → components/ui/
└─ NO
    ↓
    Is it used globally across multiple features (3+)?
    ├─ YES → components/ (e.g., theme-provider.tsx)
    └─ NO
        ↓
        Is it feature-specific?
        └─ YES → app/feature/_components/
            (Includes page-specific forms and shared feature components)
```

### Examples

#### Design System Primitive
```tsx
// [OK] components/ui/button.tsx
export function Button({ ... }) { ... }
```

#### Global Component
```tsx
// [OK] components/theme-provider.tsx
export function ThemeProvider({ ... }) { ... }
```

#### Feature-Shared Component (Reusable)
```tsx
// [OK] app/(auth)/_components/social-buttons.tsx
// Shared auth-only UI reused by multiple auth pages
export function SocialButtons({ disabled }) { ... }
```

#### Feature Component (Page-Specific)
```tsx
// [OK] app/(auth)/_components/login-form.tsx
// Specific to login page, but lives in feature _components/
export function LoginForm() { ... }
```

### Business Logic Organization

Same decision tree applies to non-component code:

```
Is it a global utility (cn, formatDate)?
├─ YES → src/lib/utils.ts
└─ NO
    ↓
    Is it feature-specific (auth schemas, onboarding steps)?
    └─ YES → app/feature/_lib/
```

---

## Import Conventions

### Path Aliases

All imports use the `@/` alias configured in `tsconfig.json`:

```tsx
// [OK] Good
import { Button } from "@/components/ui/button"
import { loginSchema } from "@/app/(auth)/_lib/schemas"

// [X] Bad (relative paths)
import { Button } from "../../../components/ui/button"
```

### Import Path Patterns

```tsx
// Design system
import { Button, Input } from "@/components/ui/button"
import { Display, Heading, Body } from "@/components/ui/typography"
import { Stack, Grid } from "@/components/ui/spacing"

// Global utilities
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

// Feature components
import { SocialButtons } from "@/app/(auth)/_components/social-buttons"
import { OtpForm } from "@/app/(auth)/_components/otp-form"

// Feature logic
import { loginSchema } from "@/app/(auth)/_lib/schemas"
import { sendVerificationEmail } from "@/app/(auth)/_lib/email"

// Relative imports within same feature
import { PersonaCard } from "./persona-card"  // Same directory
import { PERSONAS } from "../_lib/fixtures"   // Same feature
```

### Import Order (Recommended)

```tsx
// 1. React/Next.js
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. External libraries
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// 3. Global utilities
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

// 4. Design system
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Stack } from "@/components/ui/spacing"

// 5. Feature components/logic
import { SocialButtons } from "@/app/(auth)/_components/social-buttons"
import { loginSchema } from "@/app/(auth)/_lib/schemas"

// 6. Relative imports
import { LoginHeader } from "./login-header"
```

---

## Best Practices

### Do's [OK]

1. **Keep features self-contained**
   ```tsx
   // [OK] Feature owns its logic
   app/onboarding/
   ├── _lib/
   │   ├── fixtures.ts
   │   └── server.ts
   └── _components/
       └── progress.tsx
   ```

2. **Keep feature components in `_components/`**
   ```tsx
   // [OK] All feature components in _components/
   app/(auth)/
   ├── _components/
   │   ├── auth-form.tsx
   │   └── login-form.tsx
   └── login/
       └── page_old.tsx
   ```

3. **Use private folders for non-routes**
   ```tsx
   // [OK] Underscore prefix prevents routing
   app/feature/_components/
   app/feature/_lib/
   ```

4. **Share common UI via design system**
   ```tsx
   // [OK] Reusable primitives in components/ui/
   import { Button } from "@/components/ui/button"
   ```

### Don'ts [X]

1. **Don't put feature code in root components/**
   ```tsx
   // [X] Feature-specific component in wrong place
   components/login/login-form.tsx

   // [OK] Feature-specific component in right place
   app/(auth)/_components/login-form.tsx
   ```

2. **Don't create deep component hierarchies**
   ```tsx
   // [X] Too deep
   app/feature/_components/forms/auth/login/login-form.tsx

   // [OK] Flat structure
   app/(auth)/_components/auth-form.tsx
   app/(auth)/_components/login-form.tsx
   ```

3. **Don't duplicate code across features**
   ```tsx
   // [X] Same logic in multiple features
   app/feature-a/_lib/format-date.ts
   app/feature-b/_lib/format-date.ts

   // [OK] Shared utility
   src/lib/utils.ts
   ```

4. **Don't mix concerns**
   ```tsx
   // [X] Auth logic in onboarding
   app/onboarding/_lib/auth.ts

   // [OK] Auth logic in auth feature
   app/(auth)/_lib/schemas.ts
   ```

### Component Sizing Guidelines

- **Page-specific components** → Keep small (< 300 lines)
- **Shared components** → Extract reusable parts to `_components/`
- **Large components** → Split into smaller focused components
- **Too much splitting** → Keep related code together, don't over-abstract

---

## Examples from Codebase

### Auth Feature

**Structure:**
```
app/(auth)/
├── _components/          ← All auth components
│   ├── auth-form.tsx     (Form primitives used by all pages)
│   ├── otp-form.tsx      (Used by signup & forgot-password)
│   ├── auth-success.tsx  (Used by signup & forgot-password)
│   ├── login-form.tsx    (Login page form)
│   ├── signup-form.tsx   (Signup page form)
│   └── forgot-password-form.tsx  (Password reset form)
├── _lib/
│   ├── schemas.ts        (Zod validation)
│   └── email.ts          (Email utilities)
├── login/
│   └── page_old.tsx
├── signup/
│   └── page_old.tsx
└── forgot-password/
    └── page_old.tsx
```

**Why this works:**
- All auth components centralized in `_components/`
- Shared utilities (form primitives, `OtpForm`) are reused
- Page-specific forms (`login-form`, `signup-form`) live in same directory
- All auth code is colocated in one feature

### Onboarding Feature

**Structure:**
```
app/onboarding/
├── _components/
│   ├── OnboardingProgress.tsx    ← Shared progress bar
│   ├── PersistOnboardingStep.tsx ← Shared state management
│   ├── persona-selection-form.tsx  (Persona page form)
│   ├── assistant-selection-form.tsx (Gender page form)
│   ├── skill-quiz-form.tsx  (Quiz page form)
│   └── guided-intro-completion.tsx (Completion component)
├── _lib/
│   ├── fixtures.ts    ← Persona/assistant data
│   ├── server.ts      ← Server actions
│   └── steps.ts       ← Step configuration
├── persona/
│   └── page_old.tsx
├── gender/
│   └── page_old.tsx
├── skill-quiz/
│   └── page_old.tsx
└── guided-intro/
    └── page_old.tsx
```

**Why this works:**
- All onboarding components centralized in `_components/`
- Shared components (progress bar) and page-specific forms in same directory
- Business logic (fixtures, steps) centralized in `_lib/`
- Clear separation: pages are lean, components handle UI

### Home Feature

**Structure:**
```
app/(app)/home/
├── _components/
│   ├── navbar.tsx
│   ├── assistant-hero.tsx
│   ├── achievements-section.tsx
│   └── recent-activities.tsx
└── page_old.tsx
```

**Why this works:**
- All home components in one place
- Could be split further if page becomes too complex
- Clear feature boundary

---

## Extension Guide

### Adding a New Feature

**Example: Adding a "Dashboard" feature**

1. **Create feature structure:**
   ```bash
   mkdir -p "app/(app)/dashboard/_components"
   mkdir -p "app/(app)/dashboard/_lib"
   ```

2. **Add pages:**
   ```bash
   touch "app/(app)/dashboard/page_old.tsx"
   touch "app/(app)/dashboard/settings/page_old.tsx"
   ```

3. **Add shared components:**
   ```bash
   touch "app/(app)/dashboard/_components/sidebar.tsx"
   touch "app/(app)/dashboard/_components/widget.tsx"
   ```

4. **Add business logic:**
   ```bash
   touch "app/(app)/dashboard/_lib/analytics.ts"
   touch "app/(app)/dashboard/_lib/queries.ts"
   ```

5. **Import in pages:**
   ```tsx
   // app/(app)/dashboard/page_old.tsx
   import { Sidebar } from "./_components/sidebar"
   import { getAnalytics } from "./_lib/analytics"

   export default async function DashboardPage() {
     const data = await getAnalytics()
     return (
       <>
         <Sidebar />
         {/* ... */}
       </>
     )
   }
   ```

### Adding Feature Components

**Example: Adding a chart for dashboard page**

```bash
# All components go in _components/
touch "app/(app)/dashboard/_components/analytics-chart.tsx"
```

```tsx
// app/(app)/dashboard/page_old.tsx
import { AnalyticsChart } from "./_components/analytics-chart"
```

**Example: Adding a modal for multiple pages**

```bash
# Shared and page-specific components both in _components/
touch "app/(app)/dashboard/_components/confirmation-modal.tsx"
```

```tsx
// app/(app)/dashboard/settings/page_old.tsx
import { ConfirmationModal } from "../_components/confirmation-modal"
```

**Guideline:**
- [OK] All feature components go in `_components/` (whether shared or page-specific)
- [OK] Keeps feature code centralized and easy to find
- [OK] No need to decide "is this shared enough?" — everything in one place

### Adding Business Logic

**Example: Adding API client for dashboard**

```bash
touch "app/(app)/dashboard/_lib/api-client.ts"
```

```tsx
// app/(app)/dashboard/_lib/api-client.ts
export async function fetchDashboardData() { ... }
```

```tsx
// app/(app)/dashboard/page_old.tsx
import { fetchDashboardData } from "./_lib/api-client"
```

### Promoting Code to Global

**When feature code becomes used by 3+ different features:**

#### Promoting Utilities
```tsx
// Before: Feature-specific
app/dashboard/_lib/format-currency.ts

// After: Global utility
src/lib/utils.ts
export function formatCurrency(amount: number) { ... }
```

#### Promoting Components to `/components/`
```tsx
// Before: Feature-specific shared component
app/(auth)/_components/status-badge.tsx
app/dashboard/_components/status-badge.tsx  // Duplicated!
app/settings/_components/status-badge.tsx   // Duplicated!

// After: Design system primitive
components/ui/status-badge.tsx  // Single source of truth
```

**When to promote to `/components/`:**
- [OK] Used by **3 or more different features** (not just pages in same feature)
- [OK] Contains **zero feature-specific logic** (truly generic)
- [OK] Follows **design system patterns** (semantic colors, spacing components)
- [OK] Could be **extracted to npm package** without modification
- [OK] Provides **reusable UI primitive** used across entire app

**When NOT to promote:**
- [X] Used by 2 features or less
- [X] Contains feature-specific business logic
- [X] Might be reused "someday" (avoid premature abstraction)
- [X] Specific to one domain (auth, onboarding, etc.)

---

## Related Documentation

- [Design System Guide](./design-system.md) — UI components and patterns
- [Zod Validation Guide](./zod.md) — Schema validation patterns
- [Next.js Routing Docs](https://nextjs.org/docs/app/building-your-application/routing) — Official routing guide
- [Archive: Refactor Plan](./archive/refactor-plan-2025-10.md) — Historical migration documentation
