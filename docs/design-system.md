# Design System Documentation

**Last Updated:** October 2025
**Version:** 1.0
**Purpose:** Comprehensive reference for Sprite.exe design system

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Spacing System](#spacing-system)
5. [Component Library Reference](#component-library-reference)
6. [Form Patterns](#form-patterns)
7. [Animation System](#animation-system)
8. [Architecture Patterns](#architecture-patterns)
9. [Quick Reference & Recipes](#quick-reference--recipes)

---

## Overview & Philosophy

### Core Principles

Our design system is built on five foundational principles:

1. **Semantic over Literal**
   - Use `text-primary` instead of `text-gray-900`
   - Use `bg-card` instead of `bg-white dark:bg-zinc-900`
   - Benefits: Automatic dark mode, centralized theming

2. **Component-Driven Layout**
   - Use `<Stack gap="loose">` instead of `className="space-y-8"`
   - Use `<Grid cols={3}>` instead of `className="grid grid-cols-3"`
   - Benefits: Consistency, maintainability, type safety

3. **Automatic Dark Mode**
   - All colors defined as CSS variables in `globals.css`
   - No `dark:` variants needed in components
   - Theme changes in one place affect entire app

4. **Type Safety**
   - All component props are TypeScript-validated
   - Invalid variants caught at compile time
   - Autocomplete for all options

5. **Accessibility First**
   - WCAG AAA compliance
   - Semantic HTML structure
   - Proper heading hierarchy
   - Minimum contrast ratios

### Design System Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **UI Library:** shadcn/ui (customizable components)
- **Icons:** lucide-react
- **Type System:** TypeScript with strict mode
- **Color Format:** OKLCH (perceptually uniform)

### When to Use What

#### Use Design System Components When:
- ✅ Building page layouts (Stack, Grid, Inline)
- ✅ Adding text content (Display, Heading, Body, Muted, Caption)
- ✅ Structuring forms (AuthForm utilities)
- ✅ Creating consistent UI (Button, Card, Alert from shadcn)

#### Use Raw Tailwind When:
- ✅ Adding padding inside components (`p-4`, `px-6`, `py-2`)
- ✅ Fine-tuning margins (`mt-2`, `mb-1`, `-mx-4`)
- ✅ One-off adjustments that don't fit semantic patterns
- ✅ Component-specific styling needs

#### Never Do:
- ❌ Hardcode colors (`bg-gray-900`, `text-blue-500`)
- ❌ Use `space-y-*` for layout structure (use `<Stack>`)
- ❌ Duplicate form fields (use shared form components)
- ❌ Skip semantic HTML (always use proper heading hierarchy)

---

## Color System

All colors are defined as CSS variables in `app/globals.css` using OKLCH color space for perceptual uniformity and better dark mode.

### Semantic Color Tokens

#### Background Colors

##### `bg-background`
**Purpose:** Main page/app background
**Light:** `oklch(1 0 0)` — Pure white
**Dark:** `oklch(0.145 0 0)` — Near black

**Usage:**
```tsx
// ✅ Main page container
<div className="bg-background min-h-screen">
  <main>...</main>
</div>

// ❌ Don't use for cards
<div className="bg-background"> {/* Use bg-card instead */}
  <Card>...</Card>
</div>
```

##### `bg-card`
**Purpose:** Elevated surfaces (cards, modals, dialogs)
**Light:** `oklch(1 0 0)` — White
**Dark:** `oklch(0.145 0 0)` — Near black (same as background in this theme)

**Usage:**
```tsx
// ✅ Card backgrounds
<Card className="bg-card">...</Card>

// ✅ Modal backgrounds
<Dialog>
  <DialogContent className="bg-card">...</DialogContent>
</Dialog>
```

##### `bg-muted`
**Purpose:** Subtle backgrounds for less prominent elements
**Light:** `oklch(0.97 0 0)` — Very light gray
**Dark:** `oklch(0.269 0 0)` — Dark gray

**Usage:**
```tsx
// ✅ Secondary sections, disabled states
<div className="bg-muted p-4 rounded">
  <Muted variant="small">Secondary info</Muted>
</div>

// ✅ Form field backgrounds
<Input className="bg-muted" disabled />
```

##### `bg-primary`
**Purpose:** Brand color, primary actions
**Light:** `oklch(0.205 0 0)` — Very dark (near black)
**Dark:** `oklch(0.985 0 0)` — Very light (near white)

**Usage:**
```tsx
// ✅ Primary buttons
<Button className="bg-primary text-primary-foreground">
  Continue
</Button>

// ✅ Brand accents
<div className="border-l-4 border-primary">...</div>
```

##### `bg-secondary`
**Purpose:** Secondary actions, alternative emphasis
**Light:** `oklch(0.97 0 0)` — Very light gray
**Dark:** `oklch(0.269 0 0)` — Dark gray

##### `bg-accent`
**Purpose:** Hover states, highlights
**Light:** `oklch(0.97 0 0)` — Very light gray
**Dark:** `oklch(0.269 0 0)` — Dark gray

##### `bg-destructive`
**Purpose:** Danger, errors, destructive actions
**Light:** `oklch(0.58 0.24 27.5)` — Red
**Dark:** `oklch(0.49 0.215 27.5)` — Darker red

**Usage:**
```tsx
// ✅ Delete buttons
<Button variant="destructive">Delete Account</Button>

// ✅ Error alerts
<Alert variant="destructive">
  <AlertDescription>Operation failed</AlertDescription>
</Alert>
```

##### `bg-success`
**Purpose:** Success states, confirmations
**Light:** `oklch(0.72 0.19 145)` — Green
**Dark:** `oklch(0.65 0.17 145)` — Darker green

##### `bg-warning`
**Purpose:** Warnings, cautions
**Light:** `oklch(0.68 0.16 90)` — Yellow/Orange
**Dark:** `oklch(0.75 0.18 90)` — Lighter yellow/orange

#### Text Colors

##### `text-foreground`
**Purpose:** Primary text, default color
**Light:** `oklch(0.145 0 0)` — Near black
**Dark:** `oklch(0.985 0 0)` — Near white

**Usage:**
```tsx
// ✅ Main content text (default, often unnecessary to specify)
<Body>This uses text-foreground by default</Body>

// ✅ Override when needed
<span className="text-foreground font-medium">Important</span>
```

##### `text-muted-foreground`
**Purpose:** Secondary text, descriptions, metadata
**Light:** `oklch(0.556 0 0)` — Medium gray
**Dark:** `oklch(0.708 0 0)` — Light gray

**Usage:**
```tsx
// ✅ Subtitles, captions
<Muted variant="small">This uses text-muted-foreground</Muted>

// ✅ Placeholder text
<Input placeholder="Enter email" className="placeholder:text-muted-foreground" />
```

##### `text-primary`, `text-primary-foreground`
**Purpose:** Brand text, primary emphasis
**Usage:**
```tsx
// ✅ Links in brand color
<Link href="/features" className="text-primary underline">
  Learn more
</Link>

// ✅ Text on primary backgrounds
<div className="bg-primary text-primary-foreground p-4">
  Highlighted content
</div>
```

##### `text-destructive`, `text-destructive-foreground`
**Purpose:** Error text, warnings

##### `text-success`, `text-success-foreground`
**Purpose:** Success messages

#### Border Colors

##### `border-border`
**Purpose:** Default borders
**Light:** `oklch(0.922 0 0)` — Light gray
**Dark:** `oklch(0.269 0 0)` — Dark gray

**Usage:**
```tsx
// ✅ Card borders
<Card className="border border-border">...</Card>

// ✅ Dividers
<div className="border-t border-border mt-4 pt-4">...</div>
```

##### `border-input`
**Purpose:** Form input borders
**Light:** `oklch(0.922 0 0)`
**Dark:** `oklch(0.269 0 0)`

#### Ring Colors

##### `ring-ring`
**Purpose:** Focus rings for accessibility
**Light:** `oklch(0.708 0 0)`
**Dark:** `oklch(0.439 0 0)`

**Usage:**
```tsx
// ✅ Automatically applied by form components
<Input /> {/* Has focus:ring-ring */}
<Button /> {/* Has focus:ring-ring */}
```

### Adding New Colors

**Before adding a new color:**
1. Check if an existing semantic token works
2. Consider if the need is truly global or component-specific
3. Evaluate impact on dark mode

**To add a new color:**
1. Add to both `:root` and `.dark` in `app/globals.css`
2. Add to `@theme inline` block
3. Document in this file
4. Update components to use semantic token

**Example:**
```css
/* globals.css */
:root {
  --info: oklch(0.65 0.18 240);
  --info-foreground: oklch(0.985 0 0);
}

.dark {
  --info: oklch(0.55 0.16 240);
  --info-foreground: oklch(0.985 0 0);
}

@theme inline {
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
}
```

---

## Typography System

Our typography system provides six semantic components for all text content, ensuring consistent visual hierarchy and accessibility.

**Component File:** `components/ui/typography.tsx`

### Component Matrix

| Component | Variants | HTML | Purpose |
|-----------|----------|------|---------|
| **Display** | 1, 2 | h1, h2 | Hero sections, landing pages |
| **Heading** | 1–6 | h1–h6 | Page structure, content hierarchy |
| **Body** | default, large, small | p, span | Paragraphs, main content |
| **Muted** | default, small, tiny | p, span | Secondary text, descriptions |
| **Caption** | default, uppercase, badge | span, label | Labels, metadata, UI chrome |
| **Code** | inline, block | code, pre | Code snippets |

---

### Display Component

**Purpose:** Large, impactful text for hero sections and major headings

**Import:**
```tsx
import { Display } from "@/components/ui/typography"
```

**API:**
```tsx
interface DisplayProps {
  level?: 1 | 2
  as?: "h1" | "h2" | "p" | "div"
  className?: string
  children: React.ReactNode
}
```

#### Display Level 1 — Hero

**Size:** 36px / 48px / 60px (mobile / tablet / desktop)
**Weight:** 700 (bold)
**Line Height:** tight (1.25)
**Tracking:** tight (-0.025em)

**Usage:**
```tsx
// ✅ Landing page hero
<Display level={1}>Welcome to Sprite.exe</Display>
// Renders: <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">

// ✅ With semantic override
<Display level={1} as="h2">
  Visually looks like H1, but semantically H2
</Display>
```

**Use cases:**
- Landing page heroes
- Marketing pages
- Major announcements

#### Display Level 2 — Subhero

**Size:** 30px / 36px (mobile / desktop)
**Weight:** 700 (bold)
**Line Height:** tight
**Tracking:** tight

**Usage:**
```tsx
<Display level={2}>Transform Your Learning Journey</Display>
// Renders: <h2 class="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
```

**Use cases:**
- Section heroes
- Feature callouts
- Secondary hero text

---

### Heading Component

**Purpose:** Structural hierarchy for pages and content

**Import:**
```tsx
import { Heading } from "@/components/ui/typography"
```

**API:**
```tsx
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span"
  className?: string
  children: React.ReactNode
}
```

#### Heading Level 1 — Page Title

**Size:** 36px
**Weight:** 600 (semibold)
**Line Height:** tight (1.25)
**Tracking:** tight (-0.025em)

**Usage:**
```tsx
<Heading level={1}>Account Settings</Heading>
// Renders: <h1 class="text-4xl font-semibold leading-tight tracking-tight">
```

**Use cases:**
- Page titles
- Modal/dialog headers
- Top-level content sections

#### Heading Level 2 — Section Title

**Size:** 30px
**Weight:** 600 (semibold)
**Line Height:** snug (1.375)

**Usage:**
```tsx
<Heading level={2}>Personal Information</Heading>
// Renders: <h2 class="text-3xl font-semibold leading-snug">
```

**Use cases:**
- Major page sections
- Sidebar headers
- Feature titles

#### Heading Level 3 — Subsection Title

**Size:** 24px
**Weight:** 600 (semibold)
**Line Height:** snug

**Usage:**
```tsx
<Heading level={3}>Recent Activity</Heading>
// Renders: <h3 class="text-2xl font-semibold leading-snug">
```

**Use cases:**
- Card headers
- Subsection titles
- List group headers

#### Heading Level 4 — Component Header

**Size:** 20px
**Weight:** 600 (semibold)
**Line Height:** normal (1.5)

**Usage:**
```tsx
<Heading level={4}>Email Preferences</Heading>
// Renders: <h4 class="text-xl font-semibold leading-normal">
```

**Use cases:**
- Form section headers
- Card subheaders
- Navigation groups

#### Heading Level 5 — Small Header

**Size:** 18px
**Weight:** 500 (medium)
**Line Height:** normal

**Usage:**
```tsx
<Heading level={5}>Quick Actions</Heading>
// Renders: <h5 class="text-lg font-medium leading-normal">
```

**Use cases:**
- Small component headers
- Sidebar sections
- Compact UI headers

#### Heading Level 6 — Micro Header

**Size:** 16px
**Weight:** 500 (medium)
**Line Height:** normal

**Usage:**
```tsx
<Heading level={6}>Last updated</Heading>
// Renders: <h6 class="text-base font-medium leading-normal">
```

**Use cases:**
- Inline headers
- List item titles
- Smallest structural headers

---

### Body Component

**Purpose:** Main content text and paragraphs

**Import:**
```tsx
import { Body } from "@/components/ui/typography"
```

**API:**
```tsx
interface BodyProps {
  variant?: "default" | "large" | "small"
  as?: "p" | "span" | "div"
  className?: string
  children: React.ReactNode
}
```

#### Body Default

**Size:** 16px
**Line Height:** relaxed (1.625)
**Color:** `text-foreground` (automatic)

**Usage:**
```tsx
<Body>This is the main content paragraph with optimal readability.</Body>
// Renders: <p class="text-base leading-relaxed">
```

**Use cases:**
- Article content
- Description text
- Default paragraphs

#### Body Large

**Size:** 18px / 20px (mobile / desktop)
**Line Height:** relaxed

**Usage:**
```tsx
<Body variant="large">
  Larger, more prominent body text for introductions.
</Body>
// Renders: <p class="text-lg lg:text-xl leading-relaxed">
```

**Use cases:**
- Introduction paragraphs
- Lead text
- Emphasized content

#### Body Small

**Size:** 14px
**Line Height:** normal (1.5)

**Usage:**
```tsx
<Body variant="small">Smaller body text for compact spaces.</Body>
// Renders: <p class="text-sm leading-normal">
```

**Use cases:**
- Dense content areas
- Compact layouts
- Secondary descriptions

---

### Muted Component

**Purpose:** Secondary text with reduced emphasis

**Import:**
```tsx
import { Muted } from "@/components/ui/typography"
```

**API:**
```tsx
interface MutedProps {
  variant?: "default" | "small" | "tiny"
  as?: "p" | "span" | "div"
  className?: string
  children: React.ReactNode
}
```

**Key Feature:** Automatically uses `text-muted-foreground` color

#### Muted Default

**Size:** 16px
**Line Height:** relaxed
**Color:** `text-muted-foreground`

**Usage:**
```tsx
<Muted>This is secondary descriptive text.</Muted>
// Renders: <p class="text-base leading-relaxed text-muted-foreground">
```

**Use cases:**
- Subtitles
- Help text
- Secondary descriptions

#### Muted Small

**Size:** 14px
**Line Height:** normal
**Color:** `text-muted-foreground`

**Usage:**
```tsx
<Muted variant="small">Additional context or help text</Muted>
// Renders: <p class="text-sm leading-normal text-muted-foreground">
```

**Use cases:**
- Form field hints
- Card descriptions
- Metadata

#### Muted Tiny

**Size:** 12px
**Line Height:** normal
**Color:** `text-muted-foreground`

**Usage:**
```tsx
<Muted variant="tiny">Fine print or minimal text</Muted>
// Renders: <p class="text-xs leading-normal text-muted-foreground">
```

**Use cases:**
- Timestamps
- Legal text
- Minimal annotations

---

### Caption Component

**Purpose:** Labels, badges, and UI chrome

**Import:**
```tsx
import { Caption } from "@/components/ui/typography"
```

**API:**
```tsx
interface CaptionProps {
  variant?: "default" | "uppercase" | "badge"
  as?: "label" | "span" | "div"
  className?: string
  children: React.ReactNode
}
```

#### Caption Default

**Size:** 12px
**Weight:** 500 (medium)
**Line Height:** normal

**Usage:**
```tsx
<Caption>Status</Caption>
// Renders: <span class="text-xs font-medium leading-normal">
```

**Use cases:**
- Form labels
- Data labels
- UI chrome text

#### Caption Uppercase

**Size:** 12px
**Weight:** 600 (semibold)
**Transform:** uppercase
**Tracking:** wider (+0.05em)

**Usage:**
```tsx
<Caption variant="uppercase">Section Header</Caption>
// Renders: <span class="text-xs font-semibold leading-normal uppercase tracking-wider">
```

**Use cases:**
- Section labels
- Category headers
- Eyebrow text

#### Caption Badge

**Size:** 10px
**Weight:** 700 (bold)
**Transform:** uppercase
**Tracking:** wide (+0.1em)

**Usage:**
```tsx
<Caption variant="badge">New</Caption>
// Renders: <span class="text-[10px] font-bold leading-normal uppercase tracking-wide">
```

**Use cases:**
- Status badges
- Notification counts
- Tiny labels

---

### Code Component

**Purpose:** Code snippets and technical text

**Import:**
```tsx
import { Code } from "@/components/ui/typography"
```

**API:**
```tsx
interface CodeProps {
  variant?: "inline" | "block"
  className?: string
  children: React.ReactNode
}
```

#### Code Inline

**Usage:**
```tsx
<Body>Install with <Code>npm install</Code> command.</Body>
// Renders: <code class="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
```

#### Code Block

**Usage:**
```tsx
<Code variant="block">
  {`const greeting = "Hello World";
console.log(greeting);`}
</Code>
// Renders: <pre class="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
```

---

### Typography Patterns & Recipes

#### Page Header Pattern
```tsx
<Stack gap="tight">
  <Heading level={1}>Page Title</Heading>
  <Muted variant="small">Descriptive subtitle or context</Muted>
</Stack>
```

#### Card Header Pattern
```tsx
<Stack gap="tight">
  <Heading level={3}>Card Title</Heading>
  <Muted variant="small">Card description</Muted>
</Stack>
```

#### Form Section Pattern
```tsx
<Stack gap="default">
  <Stack gap="tight">
    <Heading level={4}>Section Title</Heading>
    <Muted variant="small">Section description</Muted>
  </Stack>
  {/* Form fields */}
</Stack>
```

#### Hero Section Pattern
```tsx
<Stack gap="loose" className="text-center">
  <Display level={1}>Main Headline</Display>
  <Body variant="large" className="max-w-3xl mx-auto text-muted-foreground">
    Supporting description text
  </Body>
  <div>
    <Button size="lg">Get Started</Button>
  </div>
</Stack>
```

### Typography Anti-Patterns

#### ❌ Don't hardcode text sizes
```tsx
// Wrong
<h1 className="text-4xl font-semibold">Title</h1>

// Right
<Heading level={1}>Title</Heading>
```

#### ❌ Don't skip heading hierarchy
```tsx
// Wrong - jumps from H1 to H3
<Heading level={1}>Page</Heading>
<Heading level={3}>Section</Heading>

// Right
<Heading level={1}>Page</Heading>
<Heading level={2}>Section</Heading>
```

#### ❌ Don't use heading for styling
```tsx
// Wrong - using H1 for big text without semantic meaning
<Heading level={1} as="div">Just big text</Heading>

// Right - use Display for non-semantic large text
<Display level={1}>Hero Text</Display>
```

#### ❌ Don't forget muted-foreground for secondary text
```tsx
// Wrong - manually applying color
<p className="text-sm text-zinc-500 dark:text-zinc-400">Help text</p>

// Right - uses semantic color automatically
<Muted variant="small">Help text</Muted>
```

---

## Spacing System

Our spacing system provides three layout components that replace raw Tailwind spacing utilities for consistent, maintainable layouts.

**Component File:** `components/ui/spacing.tsx`

### Component Matrix

| Component | Purpose | Replaces | Variants |
|-----------|---------|----------|----------|
| **Stack** | Vertical spacing | `space-y-*` | tight, default, loose, section |
| **Inline** | Horizontal flex layout | `flex gap-*` | tight, default, loose |
| **Grid** | Responsive grid layouts | `grid grid-cols-*` | tight, default, loose |

---

### Stack Component

**Purpose:** Vertical spacing between child elements

**Import:**
```tsx
import { Stack } from "@/components/ui/spacing"
```

**API:**
```tsx
interface StackProps {
  gap?: "tight" | "default" | "loose" | "section"
  as?: "div" | "section" | "article" | "main" | "aside" | "nav" | "header" | "footer" | "fieldset"
  className?: string
  children: React.ReactNode
}
```

#### Variant Mapping

| Variant | Tailwind CSS | Spacing | Use Case |
|---------|--------------|---------|----------|
| `tight` | `space-y-4 sm:space-y-3` | 16px / 12px | Header groups, close element pairs |
| `default` | `space-y-6` | 24px | Component-level spacing (forms, cards) |
| `loose` | `space-y-8` | 32px | Section-level spacing (page sections) |
| `section` | `space-y-12` | 48px | Page-level major divisions |

#### Usage Examples

**Tight Spacing — Header Groups**
```tsx
<Stack gap="tight">
  <Heading level={1}>Welcome back</Heading>
  <Muted variant="small">Sign in to continue</Muted>
</Stack>
```

**Default Spacing — Forms**
```tsx
<Stack gap="default">
  <Stack gap="tight">
    <Heading level={2}>Create Account</Heading>
    <Muted variant="small">Fill in your details below</Muted>
  </Stack>

  <FormField name="email">...</FormField>
  <FormField name="password">...</FormField>

  <Button type="submit">Sign Up</Button>
</Stack>
```

**Loose Spacing — Page Sections**
```tsx
<Stack gap="loose" as="main">
  <header>...</header>
  <section>...</section>
  <section>...</section>
  <footer>...</footer>
</Stack>
```

**Section Spacing — Major Divisions**
```tsx
<Stack gap="section">
  <section>{/* Hero section */}</section>
  <section>{/* Features section */}</section>
  <section>{/* Testimonials section */}</section>
</Stack>
```

#### Migration Pattern

**Before:**
```tsx
<div className="space-y-8">
  <div className="space-y-3 sm:space-y-4">
    <h1 className="text-4xl font-semibold">Title</h1>
    <p className="text-sm text-muted-foreground">Subtitle</p>
  </div>
  <form className="space-y-6">
    {/* form fields */}
  </form>
</div>
```

**After:**
```tsx
<Stack gap="loose">
  <Stack gap="tight">
    <Heading level={1}>Title</Heading>
    <Muted variant="small">Subtitle</Muted>
  </Stack>
  <Stack gap="default" as="form">
    {/* form fields */}
  </Stack>
</Stack>
```

---

### Inline Component

**Purpose:** Horizontal flex layout with consistent gaps

**Import:**
```tsx
import { Inline } from "@/components/ui/spacing"
```

**API:**
```tsx
interface InlineProps {
  gap?: "tight" | "default" | "loose"
  align?: "start" | "center" | "end"
  as?: "div" | "span"
  className?: string
  children: React.ReactNode
}
```

#### Variant Mapping

| Variant | Tailwind CSS | Spacing | Use Case |
|---------|--------------|---------|----------|
| `tight` | `gap-2` | 8px | Close horizontal elements (icons + text) |
| `default` | `gap-4` | 16px | Standard horizontal spacing (button groups) |
| `loose` | `gap-6` | 24px | Generous horizontal spacing (nav items) |

**Features:**
- Automatic `flex` and `flex-wrap`
- Configurable vertical alignment
- Semantic HTML via `as` prop

#### Usage Examples

**Tight — Icon + Text**
```tsx
<Inline gap="tight" align="center">
  <CheckIcon className="size-4" />
  <Body>Email verified</Body>
</Inline>
```

**Default — Button Group**
```tsx
<Inline gap="default" align="center">
  <Button variant="outline">Cancel</Button>
  <Button>Continue</Button>
</Inline>
```

**Loose — Navigation**
```tsx
<Inline gap="loose" as="nav" align="center">
  <Link href="/features">Features</Link>
  <Link href="/pricing">Pricing</Link>
  <Link href="/about">About</Link>
</Inline>
```

#### Migration Pattern

**Before:**
```tsx
<div className="flex flex-wrap items-center gap-4">
  <button>Cancel</button>
  <button>Submit</button>
</div>
```

**After:**
```tsx
<Inline gap="default" align="center">
  <Button variant="outline">Cancel</Button>
  <Button>Submit</Button>
</Inline>
```

---

### Grid Component

**Purpose:** Responsive grid layouts with consistent gaps

**Import:**
```tsx
import { Grid } from "@/components/ui/spacing"
```

**API:**
```tsx
interface GridProps {
  gap?: "tight" | "default" | "loose"
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  as?: "div" | "section" | "ul"
  className?: string
  children: React.ReactNode
}
```

#### Variant Mapping

| Variant | Tailwind CSS | Spacing | Use Case |
|---------|--------------|---------|----------|
| `tight` | `gap-4` | 16px | Dense grids (icon grids, compact cards) |
| `default` | `gap-6` | 24px | Standard grids (card grids, dashboards) |
| `loose` | `gap-8` | 32px | Spacious grids (feature sections) |

#### Column Mapping

| Cols | Responsive Behavior |
|------|---------------------|
| `1` | `grid-cols-1` — Always 1 column |
| `2` | `grid-cols-1 md:grid-cols-2` — 1 col mobile, 2 cols tablet+ |
| `3` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — 1/2/3 cols |
| `4` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` — 1/2/4 cols |
| `6` | `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` — 2/3/6 cols |
| `12` | `grid-cols-12` — 12-column system for custom layouts |

#### Usage Examples

**Card Grid**
```tsx
<Grid gap="default" cols={3}>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</Grid>
```

**Feature Grid**
```tsx
<Grid gap="loose" cols={2} as="section">
  <FeatureCard title="Fast" />
  <FeatureCard title="Secure" />
  <FeatureCard title="Scalable" />
  <FeatureCard title="Reliable" />
</Grid>
```

**Icon Grid**
```tsx
<Grid gap="tight" cols={6}>
  <IconButton icon={<HomeIcon />} />
  <IconButton icon={<SettingsIcon />} />
  {/* ... more icons */}
</Grid>
```

**Custom Layout with 12-column System**
```tsx
<Grid cols={12} gap="default">
  <div className="col-span-12 lg:col-span-8">
    {/* Main content */}
  </div>
  <div className="col-span-12 lg:col-span-4">
    {/* Sidebar */}
  </div>
</Grid>
```

#### Migration Pattern

**Before:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**After:**
```tsx
<Grid gap="default" cols={3}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

---

### Spacing Patterns & Recipes

#### Page Layout Pattern
```tsx
<Stack gap="loose" as="main" className="max-w-6xl mx-auto px-4 py-8">
  <Stack gap="tight" as="header">
    <Heading level={1}>Dashboard</Heading>
    <Muted variant="small">Welcome back, Chris</Muted>
  </Stack>

  <Grid gap="default" cols={3}>
    <StatsCard />
    <StatsCard />
    <StatsCard />
  </Grid>

  <Stack gap="default" as="section">
    <Heading level={2}>Recent Activity</Heading>
    <ActivityList />
  </Stack>
</Stack>
```

#### Form Layout Pattern
```tsx
<Stack gap="default" as="form">
  <Stack gap="tight">
    <Heading level={2}>Personal Information</Heading>
    <Muted variant="small">Update your profile details</Muted>
  </Stack>

  <Grid gap="default" cols={2}>
    <FormField name="firstName" />
    <FormField name="lastName" />
  </Grid>

  <FormField name="email" />

  <Inline gap="default" align="center" className="justify-end">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </Inline>
</Stack>
```

#### Card Content Pattern
```tsx
<Card>
  <Stack gap="default" className="p-6">
    <Stack gap="tight">
      <Heading level={3}>Card Title</Heading>
      <Muted variant="small">Card description</Muted>
    </Stack>

    <Body>Card content goes here...</Body>

    <Inline gap="tight" align="center" className="justify-between">
      <Caption variant="uppercase">Status</Caption>
      <Badge>Active</Badge>
    </Inline>
  </Stack>
</Card>
```

### Spacing Anti-Patterns

#### ❌ Don't use Stack/Grid for padding
```tsx
// Wrong - padding should use raw Tailwind
<Stack gap="default" className="p-4"> {/* ✓ p-4 is fine */}
  <div className="Stack gap='tight'"> {/* ✗ Wrong */}
    <p>Text</p>
  </div>
</Stack>

// Right
<Stack gap="default" className="p-4">
  <div className="px-4"> {/* Padding uses raw Tailwind */}
    <p>Text</p>
  </div>
</Stack>
```

#### ❌ Don't use space-y-* for layout
```tsx
// Wrong
<div className="space-y-6">
  <section>...</section>
  <section>...</section>
</div>

// Right
<Stack gap="default">
  <section>...</section>
  <section>...</section>
</Stack>
```

#### ❌ Don't mix raw gap with Grid/Inline
```tsx
// Wrong
<Grid cols={3} className="gap-8"> {/* Don't override with raw gap */}

// Right
<Grid cols={3} gap="loose"> {/* Use semantic variant */}
```

---

## Component Library Reference

Quick reference for all shadcn/ui components used in the project.

**Base Location:** `components/ui/`

### Interactive Components

#### Alert
**File:** `alert.tsx`
**Purpose:** Contextual feedback messages
**Variants:** `default`, `destructive`
**Docs:** https://ui.shadcn.com/docs/components/alert

**Common Pattern:**
```tsx
import { Alert, AlertDescription } from "@/components/ui/alert"

<Alert variant="destructive">
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

#### Button
**File:** `button.tsx`
**Purpose:** Clickable actions
**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`
**Docs:** https://ui.shadcn.com/docs/components/button

**Common Pattern:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Get Started</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="icon"><IconX /></Button>
```

#### Card
**File:** `card.tsx`
**Purpose:** Content container
**Parts:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
**Docs:** https://ui.shadcn.com/docs/components/card

**Common Pattern:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

#### Dialog (Modal)
**File:** `dialog.tsx`
**Purpose:** Modal dialogs
**Parts:** `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
**Docs:** https://ui.shadcn.com/docs/components/dialog

**Common Pattern:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

#### Dropdown Menu
**File:** `dropdown-menu.tsx`
**Purpose:** Dropdown menus
**Parts:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`
**Docs:** https://ui.shadcn.com/docs/components/dropdown-menu

### Form Components

#### Form
**File:** `form.tsx`
**Purpose:** Form management with react-hook-form
**Parts:** `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `FormDescription`
**Docs:** https://ui.shadcn.com/docs/components/form

**Common Pattern:**
```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

#### Input
**File:** `input.tsx`
**Purpose:** Text input fields
**Docs:** https://ui.shadcn.com/docs/components/input

#### Input OTP
**File:** `input-otp.tsx`
**Purpose:** One-time password input
**Parts:** `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`

#### Label
**File:** `label.tsx`
**Purpose:** Form labels
**Docs:** https://ui.shadcn.com/docs/components/label

#### Radio Group
**File:** `radio-group.tsx`
**Purpose:** Radio button groups
**Parts:** `RadioGroup`, `RadioGroupItem`
**Docs:** https://ui.shadcn.com/docs/components/radio-group

### Display Components

#### Avatar
**File:** `avatar.tsx`
**Purpose:** User avatars
**Parts:** `Avatar`, `AvatarImage`, `AvatarFallback`
**Docs:** https://ui.shadcn.com/docs/components/avatar

#### Badge
**File:** `badge.tsx`
**Purpose:** Status indicators
**Variants:** `default`, `secondary`, `destructive`, `outline`
**Docs:** https://ui.shadcn.com/docs/components/badge

#### Progress
**File:** `progress.tsx`
**Purpose:** Progress indicators
**Docs:** https://ui.shadcn.com/docs/components/progress

#### Tabs
**File:** `tabs.tsx`
**Purpose:** Tab navigation
**Parts:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
**Docs:** https://ui.shadcn.com/docs/components/tabs

### Custom Components

#### Audio Player
**File:** `audio-player.tsx`
**Purpose:** Custom audio player for TTS

#### Mode Toggle
**File:** `mode-toggle.tsx`
**Purpose:** Dark/light mode toggle

---

## Form Patterns

### Architecture

Our form components follow a **colocation pattern**: page-specific forms live adjacent to their pages, while truly shared form utilities live in `components/`.

### File Organization

```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx          ← Page-specific form
│   ├── signup/
│   │   ├── page.tsx
│   │   └── signup-form.tsx         ← Page-specific form
│   └── forgot-password/
│       ├── page.tsx
│       └── forgot-password-form.tsx ← Page-specific form
│
└── onboarding/
    ├── persona/
    │   ├── page.tsx
    │   └── persona-selection-form.tsx ← Page-specific form
    └── ...

components/
├── auth/
│   ├── auth-form.tsx        ← Shared form utilities
│   ├── otp-form.tsx         ← Shared OTP component
│   └── auth-success.tsx     ← Shared success state
└── onboarding/
    ├── onboarding-progress.tsx ← Shared across onboarding
    └── persist-onboarding-step.tsx
```

### Shared Form Utilities

#### AuthForm Component

**File:** `components/auth/auth-form.tsx`
**Purpose:** Reusable form field components for auth flows

**Components:**
- `AuthForm.EmailField` — Email input with validation
- `AuthForm.PasswordField` — Password input with optional extras (forgot link)
- `AuthForm.Button` — Submit button with loading states
- `AuthForm.RootError` — Top-level error display

**Usage Example:**
```tsx
import { AuthForm } from "@/components/auth/auth-form"
import { useForm } from "react-hook-form"

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <AuthForm {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap="default">
          <AuthForm.RootError message={form.formState.errors.root?.message} />

          <Stack gap="tight" as="fieldset" disabled={form.formState.isSubmitting}>
            <AuthForm.EmailField
              control={form.control}
              name="email"
              label="Email"
            />

            <AuthForm.PasswordField
              control={form.control}
              name="password"
              label="Password"
              extra={
                <Link href="/forgot-password" className="text-sm text-primary">
                  Forgot password?
                </Link>
              }
            />
          </Stack>

          <AuthForm.Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            loadingText="Signing in..."
          >
            Sign In
          </AuthForm.Button>
        </Stack>
      </form>
    </AuthForm>
  )
}
```

#### OtpForm Component

**File:** `components/auth/otp-form.tsx`
**Purpose:** OTP verification UI with resend functionality

**Props:**
```tsx
interface OtpFormProps {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend?: () => Promise<void>
  message?: string
  headerIcon?: React.ReactNode
  headerTitle?: string
  headerDescription?: React.ReactNode
}
```

**Usage Example:**
```tsx
import { OtpForm } from "@/components/auth/otp-form"

const [otpMessage, setOtpMessage] = useState<string>()

const handleOtpSubmit = async (code: string) => {
  const { error } = await authClient.emailOtp.verifyEmail({
    email: pendingEmail,
    otp: code,
  })
  if (error) throw new Error(error.message)
  setStep("verified")
}

const handleOtpResend = async () => {
  await authClient.emailOtp.sendVerificationOtp({
    email: pendingEmail,
    type: "email-verification",
  })
  setOtpMessage("Verification code resent")
}

return (
  <OtpForm
    email={pendingEmail}
    onSubmit={handleOtpSubmit}
    onResend={handleOtpResend}
    message={otpMessage}
  />
)
```

#### AuthSuccess Component

**File:** `components/auth/auth-success.tsx`
**Purpose:** Success state display with action buttons

**Props:**
```tsx
interface AuthSuccessProps {
  icon?: React.ReactNode
  title: string
  message?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}
```

**Usage Example:**
```tsx
import { AuthSuccess } from "@/components/auth/auth-success"

<AuthSuccess
  title="Email Verified!"
  message="Your email has been verified successfully."
  primaryAction={{
    label: "Continue to Setup",
    onClick: () => router.push("/onboarding")
  }}
  secondaryAction={{
    label: "Skip for Now",
    onClick: () => router.push("/home")
  }}
/>
```

### Form Patterns

#### Multi-Step Form Pattern

Used in `signup-form.tsx` and `forgot-password-form.tsx`:

```tsx
type Step = "form" | "otp" | "verified"

export function MultiStepForm() {
  const [step, setStep] = useState<Step>("form")
  const [pendingEmail, setPendingEmail] = useState("")

  // Step 1: Initial form
  if (step === "form") {
    return <MainForm onSuccess={(email) => {
      setPendingEmail(email)
      setStep("otp")
    }} />
  }

  // Step 2: OTP verification
  if (step === "otp") {
    return <OtpForm
      email={pendingEmail}
      onSubmit={async (code) => {
        // Verify code
        setStep("verified")
      }}
    />
  }

  // Step 3: Success
  return <AuthSuccess title="Success!" />
}
```

#### Form with Semantic Stack Pattern

```tsx
<AuthForm {...form}>
  <form onSubmit={handleSubmit}>
    <Stack gap="default">
      {/* Error display */}
      <AuthForm.RootError message={errors.root?.message} />

      {/* Form fields - grouped as fieldset for accessibility */}
      <Stack gap="tight" as="fieldset" disabled={isSubmitting}>
        <AuthForm.EmailField control={control} name="email" />
        <AuthForm.PasswordField control={control} name="password" />
      </Stack>

      {/* Submit button */}
      <AuthForm.Button type="submit" isLoading={isSubmitting}>
        Submit
      </AuthForm.Button>
    </Stack>
  </form>
</AuthForm>
```

### Form Anti-Patterns

#### ❌ Don't duplicate form fields
```tsx
// Wrong - creating custom email field
<FormField name="email">
  <Input type="email" />
</FormField>

// Right - use shared AuthForm component
<AuthForm.EmailField control={control} name="email" />
```

#### ❌ Don't put page-specific forms in components/
```tsx
// Wrong
components/auth/LoginForm.tsx  // This is page-specific

// Right
app/(auth)/login/login-form.tsx  // Colocated with page
```

#### ❌ Don't skip fieldset for disabled state
```tsx
// Wrong - disabling each field individually
<Input disabled={isSubmitting} />
<Input disabled={isSubmitting} />

// Right - use fieldset
<Stack gap="tight" as="fieldset" disabled={isSubmitting}>
  <Input />
  <Input />
</Stack>
```

---

## Animation System

Custom animations defined in `app/globals.css` for consistent motion design.

### Available Animations

#### fade-in-up
**Purpose:** Entrance animation from bottom
**Duration:** 0.6s
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)

**Usage:**
```tsx
<div className="animate-fade-in-up">
  Content appears from below
</div>
```

#### slide-in-left
**Purpose:** Entrance animation from left
**Duration:** 0.5s
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)

**Usage:**
```tsx
<aside className="animate-slide-in-left">
  Sidebar slides in from left
</aside>
```

#### scale-in
**Purpose:** Entrance animation with scale
**Duration:** 0.4s
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)

**Usage:**
```tsx
<Card className="animate-scale-in">
  Card scales up on appearance
</Card>
```

#### glow-pulse
**Purpose:** Pulsing glow effect
**Duration:** 2s (infinite)
**Easing:** ease-in-out

**Usage:**
```tsx
<div className="animate-glow-pulse">
  Element pulses with glow
</div>
```

### Custom Animations

To add a new animation:

1. Define keyframes in `globals.css`:
```css
@keyframes my-animation {
  from {
    /* initial state */
  }
  to {
    /* final state */
  }
}
```

2. Create utility class:
```css
.animate-my-animation {
  animation: my-animation 0.5s ease-out forwards;
}
```

3. Use in components:
```tsx
<div className="animate-my-animation">...</div>
```

---

## Architecture Patterns

### Component Organization

#### Colocation Principle

**Rule:** Components should live as close as possible to where they're used.

**Page-specific components:**
```
app/[route]/
├── page.tsx
├── component-a.tsx  ← Only used on this page
└── component-b.tsx  ← Only used on this page
```

**Shared components:**
```
components/
├── ui/              ← Design system primitives
├── auth/            ← Shared across auth routes
└── onboarding/      ← Shared across onboarding routes
```

#### When to Extract to components/

Extract to `components/` when:
- ✅ Used in 2+ different page routes
- ✅ Truly reusable utility (AuthForm fields)
- ✅ Design system primitive (Button, Input)

Keep in page directory when:
- ✅ Only used on one page
- ✅ Page-specific business logic
- ✅ Unlikely to be reused

### Import Patterns

#### Relative Imports for Colocated Files
```tsx
// In app/(auth)/login/page.tsx
import { LoginForm } from "./login-form"  // ✅ Relative
```

#### Absolute Imports for Shared Components
```tsx
// From anywhere
import { Button } from "@/components/ui/button"  // ✅ Absolute
import { Heading } from "@/components/ui/typography"
import { Stack } from "@/components/ui/spacing"
```

### Component Composition Patterns

#### Compound Component Pattern

Used in `AuthForm`:
```tsx
// Export related components as properties
const AuthForm = Object.assign(AuthFormRoot, {
  Button: AuthFormButton,
  EmailField: AuthFormEmailField,
  PasswordField: AuthFormPasswordField,
  RootError: AuthFormRootError,
})

// Usage
<AuthForm>
  <AuthForm.EmailField />
  <AuthForm.PasswordField />
  <AuthForm.Button />
</AuthForm>
```

#### Slot Pattern with `as` Prop

Used in Typography and Spacing components:
```tsx
// Visual styling with semantic HTML
<Heading level={1} as="h2">
  Looks like H1, renders as H2
</Heading>

<Stack gap="loose" as="section">
  Renders as semantic <section> element
</Stack>
```

---

## Quick Reference & Recipes

### Complete Page Layout

```tsx
import { Stack, Grid } from "@/components/ui/spacing"
import { Heading, Muted, Body } from "@/components/ui/typography"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <Stack gap="loose" as="main" className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <Stack gap="tight" as="header">
        <Heading level={1}>Dashboard</Heading>
        <Muted variant="small">Welcome back, manage your account</Muted>
      </Stack>

      {/* Stats grid */}
      <Grid gap="default" cols={3}>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Body variant="large" className="font-semibold">1,234</Body>
          </CardContent>
        </Card>
        {/* More stat cards... */}
      </Grid>

      {/* Content sections */}
      <Stack gap="default" as="section">
        <Heading level={2}>Recent Activity</Heading>
        <ActivityList />
      </Stack>
    </Stack>
  )
}
```

### Auth Form Layout

```tsx
import { Stack, Inline, Grid } from "@/components/ui/spacing"
import { Heading, Muted } from "@/components/ui/typography"
import { AuthForm } from "@/components/auth/auth-form"

export function LoginForm() {
  return (
    <Stack gap="loose">
      {/* Header */}
      <Stack gap="tight">
        <Heading level={1}>Welcome back</Heading>
        <Muted variant="small">Sign in to continue</Muted>
      </Stack>

      {/* Form */}
      <AuthForm {...form}>
        <form onSubmit={handleSubmit}>
          <Stack gap="default">
            <Stack gap="tight" as="fieldset" disabled={isSubmitting}>
              <AuthForm.EmailField control={control} name="email" />
              <AuthForm.PasswordField control={control} name="password" />
            </Stack>

            <AuthForm.Button type="submit" isLoading={isSubmitting}>
              Sign In
            </AuthForm.Button>

            {/* Social sign-in */}
            <Grid cols={2} gap="tight">
              <AuthForm.Button variant="outline">Google</AuthForm.Button>
              <AuthForm.Button variant="outline">GitHub</AuthForm.Button>
            </Grid>
          </Stack>
        </form>
      </AuthForm>
    </Stack>
  )
}
```

### Card Grid Layout

```tsx
import { Grid, Stack } from "@/components/ui/spacing"
import { Heading, Muted } from "@/components/ui/typography"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <Stack gap="loose" as="section">
      {/* Section header */}
      <Stack gap="tight" className="text-center">
        <Heading level={2}>Features</Heading>
        <Muted>Everything you need to succeed</Muted>
      </Stack>

      {/* Feature grid */}
      <Grid gap="default" cols={3}>
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {feature.content}
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Stack>
  )
}
```

### Hero Section

```tsx
import { Stack, Inline } from "@/components/ui/spacing"
import { Display, Body } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <Stack gap="loose" as="section" className="text-center py-20">
      <Display level={1}>
        Transform Your Learning Journey
      </Display>

      <Body variant="large" className="max-w-3xl mx-auto text-muted-foreground">
        Experience personalized AI-powered education that adapts to your pace
        and learning style.
      </Body>

      <Inline gap="default" align="center" className="justify-center">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </Inline>
    </Stack>
  )
}
```

### Modal Pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Stack, Inline } from "@/components/ui/spacing"
import { Heading, Body } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"

export function ConfirmDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>

        <Stack gap="default">
          <Body>Are you sure you want to proceed?</Body>

          <Inline gap="default" align="center" className="justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>
              Confirm
            </Button>
          </Inline>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Appendix

### File Reference

- **Typography:** `components/ui/typography.tsx`
- **Spacing:** `components/ui/spacing.tsx`
- **Colors:** `app/globals.css`
- **Auth Forms:** `components/auth/auth-form.tsx`, `otp-form.tsx`, `auth-success.tsx`
- **Design Docs:** `DESIGN_SYSTEM.md` (this file)
- **Development Guidelines:** `CLAUDE.md`

### External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Lucide Icons](https://lucide.dev/icons)
- [Next.js App Router](https://nextjs.org/docs/app)

### Version History

- **v1.0** (October 2025) — Initial comprehensive documentation
