# AI System Architecture

Complete documentation of the `src/lib/ai` directory for development reference and reorganization.

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Core Files](#core-files)
4. [Prompts Module](#prompts-module)
5. [Agent System](#agent-system)
6. [Tiptap Module](#tiptap-module)
7. [Architecture Patterns](#architecture-patterns)
8. [Dependencies & Integrations](#dependencies--integrations)
9. [AI Context System](#ai-context-system)
10. [API Routes](#api-routes)
11. [Code Duplication Analysis](#code-duplication-analysis)
12. [Issues & Recommendations](#issues--recommendations)

---

## Overview

The AI system provides two main capabilities:

1. **Lesson Generation** - Creates multi-lesson courses using a tool-based AI agent
2. **Chat Assistance** - Context-aware chat for helping users during lessons/quizzes

### Models Used

| Use Case | Model | Provider |
|----------|-------|----------|
| Lesson Generation | `x-ai/grok-4.1-fast` | OpenRouter |
| Chat Assistance | `openai/gpt-4o` | OpenRouter |

### Key Concepts

- **3-Level Hierarchy**: Course → Lessons → Sections
- **Persona System**: Three teaching personas (calm, kind, direct)
- **Extended Markdown**: Custom syntax for callouts, flip cards, quizzes
- **Tool-Based Agent**: Uses Vercel AI SDK for automatic tool orchestration

---

## Directory Structure

**27 files total**

```
src/lib/ai/
├── index.ts                    # Main export aggregator
├── types.ts                    # AI context and message types
├── service.ts                  # Unified AI chat service (GPT-4o)
├── lesson-generator.ts         # Main lesson generation orchestrator
├── personalization.ts          # User preference inference engine
├── profileAssistant.ts         # Public profile assistant prompt builder
│
├── prompts/
│   ├── index.ts               # Prompt exports
│   └── persona.ts             # Persona definitions (calm, kind, direct)
│
├── agent/                      # AI Agent system (v3 - full hierarchy)
│   ├── index.ts               # Agent exports
│   ├── runner.ts              # Main orchestration loop (Grok-4.1-fast)
│   ├── types.ts               # Agent type definitions
│   ├── state/
│   │   ├── index.ts           # State exports
│   │   ├── document.ts        # 3-level hierarchy management
│   │   └── conversation.ts    # Chat history and agent status
│   ├── tools/
│   │   ├── index.ts           # Tool exports
│   │   ├── registry.ts        # Tool registration and logging
│   │   ├── edit.ts            # create_lesson, create_section tools
│   │   └── meta.ts            # plan, finish_with_summary tools
│   ├── lib/
│   │   ├── index.ts           # Utility exports
│   │   └── validators.ts      # Tiptap document validation
│   └── __tests__/             # Test files (~730 lines)
│       ├── README.md
│       ├── agent-mock.test.ts
│       ├── chunker.test.ts
│       ├── diff-applier.test.ts
│       └── document-state.test.ts
│
└── tiptap/                     # Content processing (Markdown↔Tiptap JSON)
    ├── index.ts               # Tiptap utilities exports
    ├── schema.ts              # Zod schemas for Tiptap validation
    ├── parser.ts              # Markdown → Tiptap JSON converter
    └── extensions.ts          # Server-safe Tiptap extensions
```

---

## Core Files

### `index.ts` - Central Export Point

**Purpose**: Aggregates all AI functionality into a single entry point.

**Main Exports**:
```typescript
// Lesson generation
export { generateAILesson, generateAILessonWithFullAgent } from './lesson-generator';

// Agent system (advanced usage)
export * from './agent';

// Personalization
export { loadUserPersonalizationContext, createUserMetadataSnapshot, estimateLessonDuration } from './personalization';

// Persona builders
export { buildPersonaInstruction, PERSONA_STYLES, PERSONA_EXAMPLE_OPENINGS, PERSONA_CALLOUT_USAGE } from './prompts';

// Tiptap utilities
export { validateTiptapJSON, sanitizeTiptapJSON, parseMarkdownToTiptap, ... } from './tiptap';
```

---

### `types.ts` - AI Context Types

**Purpose**: Unified types for the AI context system.

#### Type Definitions

```typescript
// User info (auto-populated from session)
type AIUserContext = {
  id: number;
  name: string;
  skillLevel: SkillLevel;
};

// Assistant info (auto-populated from user's selected assistant)
type AIAssistantContext = {
  id: number;
  name: string;
  persona: AssistantPersona;
  gender: 'feminine' | 'masculine' | 'androgynous';
};

// Lesson context (set by lesson pages)
type AILessonContext = {
  id: number;
  title: string;
  topic: string;
  currentSection?: string;
  sectionContent?: string;
};

// Quiz context (set by quiz pages)
type AIQuizContext = {
  id: number;
  title: string;
  question?: {
    id: number;
    prompt: string;
    options: string[];
    selectedIndex?: number;
    correctIndex?: number;
  };
};

// User-highlighted text
type AIQuote = {
  text: string;
  source: string;
  addedAt: Date;
};

// Full context passed to AI service
type AIContext = {
  user: AIUserContext;
  assistant: AIAssistantContext;
  lesson?: AILessonContext;
  quiz?: AIQuizContext;
  quotes: AIQuote[];
};

// Chat message format
type AIChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// API contract
type AIRequest = {
  messages: AIChatMessage[];
  context: Omit<AIContext, 'user' | 'assistant'>;
};

type AIResponse = {
  message: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number; };
};

// Client-side context management
type AIContextState = {
  lesson: AILessonContext | null;
  quiz: AIQuizContext | null;
  quotes: AIQuote[];
};

type AIContextActions = {
  setLesson: (lesson: AILessonContext | null) => void;
  setQuiz: (quiz: AIQuizContext | null) => void;
  addQuote: (text: string, source: string) => void;
  removeQuote: (index: number) => void;
  clearQuotes: () => void;
  getContextForAPI: () => Omit<AIContext, 'user' | 'assistant'>;
};
```

---

### `service.ts` - Unified AI Chat Service

**Purpose**: Central service for all AI chat interactions.

#### Key Functions

```typescript
// Build system prompt from AI context
function buildSystemPrompt(context: AIContext): string

// Build persona-specific off-topic handling guidelines
function buildOffTopicGuidelines(persona: AssistantPersona, lessonTitle?: string): string

// Generate AI response
async function generateAIResponse(context: AIContext, messages: AIChatMessage[]): Promise<AIResponse>
```

#### System Prompt Structure

The system prompt includes:
1. **Identity**: Assistant name and persona description
2. **Teaching Style**: Tone characteristics from persona
3. **Characteristics**: Pacing, encouragement, examples, language
4. **User Context**: Name, skill level, adaptation instructions
5. **Lesson Context** (if available): Current lesson, topic, section content
6. **Quiz Context** (if available): Current question, options, user selection
7. **User Quotes** (if any): Highlighted text for discussion
8. **Response Guidelines**: Off-topic handling based on persona

#### Configuration

| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o` |
| Temperature | 0.7 |
| Max Tokens | 1000 |

---

### `lesson-generator.ts` - High-Level Orchestrator

**Purpose**: Main entry point for AI lesson generation.

#### Main Function

```typescript
async function generateAILessonWithFullAgent(params: GenerateLessonParams): Promise<GenerateLessonResult>
```

#### Workflow

1. **Load Personalization** - Get user context via `loadUserPersonalizationContext()`
2. **Run Agent** - Call `runAgent()` to generate structured content
3. **Store in Database** - Create lessons and sections with 3-level hierarchy
4. **Handle Early Redirect** - Allow redirect after first lesson saves

#### Database Operations

- Creates parent lesson (Level 1: Course)
- Creates child lessons (Level 2: Lessons)
- Creates sections (Level 3: Content chunks)
- Ensures unique slugs (falls back to timestamp-based uniqueness)

#### Types

```typescript
interface GenerateLessonParams {
  userId: number;
  topic: string;
  difficulty: 'easy' | 'standard' | 'hard';
  context?: string;
  durationMinutes: number;
  onProgress?: ProgressCallback;
  onFirstLessonReady?: (lessonId: number, slug: string) => Promise<void>;
}

interface GenerateLessonResult {
  lessonId: number;
  slug: string;
  sectionCount: number;
  wordCount: number;
  lessonsCreated: number;
  estimatedDuration: number;
}
```

---

### `personalization.ts` - User Preference Engine

**Purpose**: Loads and infers user learning preferences.

#### Main Function

```typescript
async function loadUserPersonalizationContext(userId: number): Promise<UserPersonalizationContext>
```

#### Returned Context

```typescript
interface UserPersonalizationContext {
  // User identity
  userId: number;
  userName: string;
  skillLevel: SkillLevel;

  // Assistant info
  assistantId: number;
  assistantName: string;
  assistantGender: 'feminine' | 'masculine' | 'androgynous';
  assistantPersona: AssistantPersona;

  // Inferred preferences
  languagePreference?: string;  // javascript, python, etc.
  paradigmPreference?: string;  // oop, functional, procedural

  // Learning stats
  completedLessonsCount: number;
  averageCompletionTime?: number;
  recentTopics: string[];
}
```

#### Inference Functions

```typescript
// Infers programming language from lesson history
function inferLanguagePreference(progress: UserProgress[]): string | undefined

// Infers paradigm from lesson history
function inferParadigmPreference(progress: UserProgress[]): string | undefined

// Predicts lesson duration based on user's average
function estimateLessonDuration(context: UserPersonalizationContext, requestedMinutes: number): number

// Creates snapshot for lesson metadata
function createUserMetadataSnapshot(context: UserPersonalizationContext): object
```

---

### `profileAssistant.ts` - Public Profile Assistant

**Purpose**: Generates prompts for profile assistant feature (read-only, public data).

#### Main Function

```typescript
function buildProfileAssistantPrompt(
  profileData: PublicProfileData,
  learningData: PublicLearningData,
  achievementsData: PublicAchievementsData,
  assistantPersona: AssistantPersona,
  questionType: QuestionType
): { system: string; user: string }
```

#### Question Types

| Type | Purpose |
|------|---------|
| `learning_overview` | What have they been learning? |
| `project_summary` | What kind of projects? |
| `next_steps` | What might be next? |
| `style_persona` | How do they learn/work? |

#### Data Types

```typescript
interface PublicProfileData {
  profile: { name: string; bio?: string; avatar?: string };
  projects: { title: string; description?: string }[];
  experiences: { company: string; role: string }[];
}

interface PublicLearningData {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
}

interface PublicAchievementsData {
  achievements: { name: string; description: string; earnedAt: Date }[];
}
```

---

## Prompts Module

### `prompts/persona.ts` - Persona Definitions

**Purpose**: Defines three teaching personas with consistent characteristics.

#### Persona Styles

```typescript
const PERSONA_STYLES = {
  calm: {
    description: 'a grounded, focused programming tutor',
    tone: [
      'Even-tempo, methodical explanations',
      'Focused, deliberate language',
      'Steady progression through concepts'
    ],
    pacing: 'measured',
    encouragement: 'subtle',
    examples: 'practical, focused',
    language: 'clear, precise'
  },

  kind: {
    description: 'an encouraging, warm programming tutor',
    tone: [
      'Enthusiastic, supportive explanations',
      'Celebrates wins, acknowledges effort',
      'Gentle guidance through challenges'
    ],
    pacing: 'gentle',
    encouragement: 'frequent',
    examples: 'relatable, friendly',
    language: 'warm, approachable'
  },

  direct: {
    description: 'a straight-talking, efficient programming tutor',
    tone: [
      'Concise, no-fluff explanations',
      'Practical, get-to-the-point style',
      'Efficient progression'
    ],
    pacing: 'fast',
    encouragement: 'minimal',
    examples: 'practical, efficient',
    language: 'direct, technical'
  }
};
```

#### Key Exports

```typescript
// Full persona definitions
export const PERSONA_STYLES: Record<AssistantPersona, PersonaStyle>;

// Format persona for system prompt
export function buildPersonaInstruction(
  persona: AssistantPersona,
  name: string,
  gender: 'feminine' | 'masculine' | 'androgynous'
): string;

// Example dialogue starters by persona
export const PERSONA_EXAMPLE_OPENINGS: Record<AssistantPersona, string[]>;

// Callout preferences by persona
export const PERSONA_CALLOUT_USAGE: Record<AssistantPersona, {
  tip: 'frequent' | 'moderate' | 'minimal';
  warning: 'frequent' | 'moderate' | 'minimal';
  note: 'frequent' | 'moderate' | 'minimal';
}>;
```

---

## Agent System

### `agent/runner.ts` - Main Orchestration Loop

**Purpose**: Runs the AI agent with automatic tool roundtrips.

#### Main Function

```typescript
async function runAgent(params: RunAgentParams): Promise<AgentRunResult>
```

#### Parameters

```typescript
interface RunAgentParams {
  userId: number;
  topic: string;
  difficulty: 'easy' | 'standard' | 'hard';
  context?: string;
  estimatedDurationMinutes: number;
  userContext: UserPersonalizationContext;
  onProgress?: ProgressCallback;
}
```

#### Workflow

1. Initialize `DocumentState` and `ConversationState`
2. Add personalization context as first message
3. Add lesson request
4. Call `generateText()` with `stopWhen: stepCountIs(80)`
5. SDK handles all tool roundtrips automatically
6. Return result with `documentState` containing all lessons/sections

#### System Prompt Structure

The system prompt includes:
1. Persona instruction
2. Course requirements (topic, difficulty, duration)
3. 3-level hierarchy explanation
4. Extended Markdown format documentation
5. Tool descriptions and workflow
6. Difficulty-specific guidance
7. Target lesson count based on duration

#### Lesson Count Targets

```typescript
function getTargetLessonCount(minutes: number): { min: number; target: number; max: number } {
  if (minutes <= 20) return { min: 4, target: 4, max: 5 };
  if (minutes <= 35) return { min: 5, target: 6, max: 7 };
  if (minutes <= 50) return { min: 6, target: 7, max: 8 };
  return { min: 7, target: 8, max: 8 }; // 50+ minutes
}
```

#### Configuration

| Setting | Value |
|---------|-------|
| Model | `x-ai/grok-4.1-fast` |
| Temperature | 0.7 |
| Max Steps | 80 |

---

### `agent/types.ts` - Agent Type Definitions

#### Key Interfaces

```typescript
// Level 3: Section within a lesson
interface LessonSection {
  slug: string;
  title: string;
  orderIndex: number;
  document: TiptapDocument;
}

// Level 2: Lesson containing sections
interface Lesson {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  sections: LessonSection[];
}

// Chat message types
type ChatMessage =
  | { type: 'user'; content: string; timestamp: Date }
  | { type: 'ai'; content: string; timestamp: Date }
  | { type: 'toolCall'; toolName: string; args: object; timestamp: Date }
  | { type: 'toolCallResult'; toolName: string; result: string; timestamp: Date }
  | { type: 'checkpoint'; label: string; state: object; timestamp: Date };

// Tool definition
interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (args: object, context: ToolExecutionContext) => Promise<string>;
}

// Tool execution context
interface ToolExecutionContext {
  documentState: DocumentState;
  conversationState: ConversationState;
}

// Agent run result
interface AgentRunResult {
  success: boolean;
  document: TiptapDocument;
  summary: string;
  stepsExecuted: number;
  conversationMessages: ChatMessage[];
  documentState: DocumentState;
  conversationState: ConversationState;
  error?: string;
}

// Progress callback
type ProgressCallback = (progress: {
  step: string;
  percentage: number;
  message: string;
  stepNumber: number;
  totalSteps: number;
}) => Promise<void>;
```

---

### `agent/state/document.ts` - 3-Level Hierarchy Management

**Purpose**: Manages document state with course/lesson/section structure.

#### Class: `DocumentState`

```typescript
class DocumentState {
  // Initialization
  initialize(doc: TiptapDocument): void;

  // Lesson management (Level 2)
  createLesson(title: string, slug: string, description: string): Lesson;
  getCurrentLesson(): Lesson | null;
  getLessonBySlug(slug: string): Lesson | undefined;
  setCurrentLessonBySlug(slug: string): boolean;
  getLessonCount(): number;
  getAllLessons(): Lesson[];

  // Section management (Level 3)
  createSection(lessonSlug: string, title: string, slug: string, document: TiptapDocument): LessonSection;
  getCurrentSection(): LessonSection | null;
  getSectionBySlug(lessonSlug: string, sectionSlug: string): LessonSection | undefined;
  updateSectionDocument(lessonSlug: string, sectionSlug: string, document: TiptapDocument): boolean;

  // Utility
  isEmpty(): boolean;
  getDocument(): TiptapDocument;
  getDocumentText(): string;
  clone(): DocumentState;
}
```

#### Internal State

```typescript
private lessons: Lesson[] = [];
private currentLessonIndex: number = -1;
private currentSectionIndex: number = -1;
```

---

### `agent/state/conversation.ts` - Chat History Manager

**Purpose**: Tracks conversation, tool calls, and agent status.

#### Class: `ConversationState`

```typescript
class ConversationState {
  // Message management
  addUserMessage(content: string): void;
  addAiMessage(content: string): void;
  getMessages(): ChatMessage[];

  // Tool call tracking
  addToolCall(toolName: string, args: object): void;
  addToolCallResult(toolName: string, result: string): void;

  // Checkpoints
  addCheckpoint(label: string, state: object): void;

  // Format for AI SDK
  getMessagesForAI(): Array<{ role: 'user' | 'assistant'; content: string }>;

  // Status management
  setStatus(status: 'idle' | 'loading' | 'reviewingToolCall' | 'error'): void;
  isLoading(): boolean;
  hasError(): boolean;

  // Summary
  getSummary(): {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    toolCalls: number;
    checkpoints: number;
  };

  // Metadata storage
  metadata: Record<string, unknown>;
}
```

---

### `agent/tools/edit.ts` - Content Creation Tools

#### Tool: `create_lesson` (Level 2)

**Purpose**: Creates a new lesson in the current course.

```typescript
{
  name: 'create_lesson',
  description: 'Create a new lesson in the course',
  parameters: z.object({
    title: z.string().describe('Lesson title'),
    slug: z.string().describe('URL-friendly slug'),
    description: z.string().describe('What this lesson covers')
  }),
  execute: async (args, context) => {
    // Validates slug format (lowercase, numbers, hyphens only)
    // Prevents duplicate slugs
    // Tracks plan progress
    // Returns state feedback with created count and next steps
  }
}
```

#### Tool: `create_section` (Level 3)

**Purpose**: Creates a section within a specific lesson.

```typescript
{
  name: 'create_section',
  description: 'Create a section within a lesson',
  parameters: z.object({
    lesson_slug: z.string().describe('Which lesson this section belongs to'),
    title: z.string().describe('Section title'),
    slug: z.string().describe('URL-friendly slug'),
    content: z.string().describe('Section content in extended Markdown')
  }),
  execute: async (args, context) => {
    // REQUIRES lesson_slug parameter
    // Parses Markdown content to Tiptap JSON
    // Validates parsed document
    // Prevents duplicate section slugs within lesson
    // Returns progress feedback
  }
}
```

---

### `agent/tools/meta.ts` - Planning & Completion Tools

#### Tool: `plan`

**Purpose**: Creates 3-level structure plan.

```typescript
{
  name: 'plan',
  description: 'Create a course structure plan',
  parameters: z.object({
    lessons: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      sections: z.array(z.object({
        title: z.string(),
        slug: z.string()
      }))
    }))
  }),
  execute: async (args, context) => {
    // Stores plan in conversationState.metadata
    // Tracks planned vs created items
    // Returns formatted plan with current state
  }
}
```

#### Tool: `finish_with_summary`

**Purpose**: Completes course generation.

```typescript
{
  name: 'finish_with_summary',
  description: 'Finalize the course with metadata',
  parameters: z.object({
    lessonTitle: z.string().describe('Course title'),
    lessonSlug: z.string().describe('Course slug'),
    description: z.string().describe('Course description'),
    summary: z.string().describe('Brief summary')
  }),
  execute: async (args, context) => {
    // CRITICAL: Validates no empty lessons (fails if any lesson has 0 sections)
    // Stores course metadata
    // Records interactive element counts
    // Marks generation complete
  }
}
```

---

### `agent/tools/registry.ts` - Tool Management

**Purpose**: Tool registration, configuration, and logging.

#### Key Functions

```typescript
// Get all tools configured for AI SDK
function getAllTools(
  context: ToolExecutionContext,
  userId: number,
  stepRef: { current: number }
): Record<string, Tool>

// Check if tool ends execution
function isFinalTool(toolName: string): boolean

// Get tool documentation for system prompt
function getToolsDescription(): string

// Add logging wrapper to tools
function wrapToolWithLogging(
  tool: AgentTool,
  stepRef: { current: number }
): AgentTool
```

---

## Tiptap Module

### `tiptap/schema.ts` - Zod Validation Schemas

**Purpose**: Validates AI-generated Tiptap JSON structure.

#### Node Types Supported

| Node Type | Description |
|-----------|-------------|
| `heading` | h1-h6 headings |
| `paragraph` | Standard paragraphs |
| `bulletList` | Unordered lists |
| `orderedList` | Numbered lists |
| `codeBlockEnhanced` | Code blocks with language, filename, lineNumbers |
| `callout` | Tips, warnings, notes, info, success, error |
| `quizQuestion` | Multiple choice with `quizOption` children |
| `flipCardGroup` | Container for `flipCard` pairs |
| `dragOrderExercise` | Ordering exercise with `dragOrderItem` children |
| `horizontalRule` | Dividers |

#### Key Functions

```typescript
// Validate against schema
function validateTiptapJSON(json: unknown): { valid: boolean; errors?: string[] }

// Repair common AI mistakes
function sanitizeTiptapJSON(json: unknown): TiptapDocument

// Get text content
function extractTextFromTiptap(doc: TiptapDocument): string

// Count words
function countWordsInTiptap(doc: TiptapDocument): number

// Check minimum quality (100+ words)
function validateLessonContent(doc: TiptapDocument): { valid: boolean; wordCount: number; issues?: string[] }
```

---

### `tiptap/parser.ts` - Markdown to Tiptap Converter

**Purpose**: Converts extended Markdown to Tiptap JSON.

#### Main Function

```typescript
function parseMarkdownToTiptap(markdown: string): TiptapDocument
```

#### Process

1. **Preprocess** - Convert custom syntax to HTML
2. **Convert** - Markdown to HTML using `marked`
3. **Parse** - HTML to Tiptap JSON using `@tiptap/html`'s `generateJSON()`

#### Extended Syntax

**Callouts**:
```markdown
:::tip
Pro tip content here!
:::

:::warning
Warning content here.
:::

:::note
Note content here.
:::

:::info
Info content here.
:::
```

**Flip Cards**:
```markdown
???Term or Concept
Definition on the back of the card.
???

???Another Term
Its definition here.
???
```
Consecutive flip cards are automatically grouped.

**Quizzes**:
```markdown
[quiz: What is the correct answer? | Option A | Option B* | Option C | Option D]
Explanation of why Option B is correct.
```
The `*` marks the correct option.

---

### `tiptap/extensions.ts` - Server-Safe Extensions

**Purpose**: Lightweight Tiptap extensions for Node.js (no browser dependencies).

#### Extensions

| Extension | Purpose |
|-----------|---------|
| `CalloutServer` | Defines callout schema (tip, warning, note, info, success, error) |
| `CodeBlockServer` | Basic code block (client handles syntax highlighting) |
| `FlipCardGroupServer` | Container for flip card pairs |
| `FlipCardServer` | Individual flip cards with front/back content |
| `QuizQuestionServer` | Quiz questions with options |
| `DragOrderExerciseServer` | Drag-and-drop ordering exercises |

---

## Architecture Patterns

### 1. 3-Level Hierarchy

```
Course (Level 1)
│   Defined by: finish_with_summary tool
│   Stored as: Parent lesson (parentLessonId = null)
│
├── Lesson 1 (Level 2)
│   │   Defined by: create_lesson tool
│   │   Stored as: Child lesson (parentLessonId = course.id)
│   │
│   ├── Section 1 (Level 3)
│   │       Defined by: create_section tool
│   │       Stored in: lesson_sections table
│   │
│   └── Section 2
│
└── Lesson 2
    ├── Section 1
    └── Section 2
```

### 2. Tool-Based AI Agent Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     PLAN PHASE                               │
│  1. Call `plan` tool to define course structure              │
│     - Lessons with titles, slugs, descriptions               │
│     - Sections with titles, slugs                            │
│     - Stored in conversationState.metadata                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CREATION PHASE                             │
│  For each lesson in plan:                                    │
│    2a. Call `create_lesson` to create lesson (Level 2)       │
│    2b. For each section in lesson:                           │
│        Call `create_section` with lesson_slug (Level 3)      │
│        - Parses Markdown to Tiptap JSON                      │
│        - Validates content                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  COMPLETION PHASE                            │
│  3. Call `finish_with_summary` to finalize                   │
│     - Validates no empty lessons                             │
│     - Stores course metadata                                 │
│     - Records interactive element counts                     │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Vercel AI SDK handles all roundtrips automatically with `stopWhen: stepCountIs(80)`.

### 3. Extended Markdown Syntax

| Syntax | Renders As |
|--------|------------|
| `:::type ... :::` | Callout block (tip, warning, note, info, success, error) |
| `???front ... ???` | Flip card (consecutive cards grouped) |
| `[quiz: Q \| A \| B* \| C]` | Multiple choice quiz (* marks correct) |

### 4. Persona System

| Persona | Tone | Pacing | Encouragement |
|---------|------|--------|---------------|
| `calm` | Measured, methodical | Steady | Subtle |
| `kind` | Warm, encouraging | Gentle | Frequent |
| `direct` | Concise, technical | Fast | Minimal |

Affects:
- System prompt personality
- Off-topic redirect style
- Callout usage frequency
- Example dialogue patterns

### 5. Two AI Models, Two Use Cases

| Model | Use Case | Why |
|-------|----------|-----|
| `grok-4.1-fast` | Lesson generation | Long-running, tool-based, needs many iterations |
| `gpt-4o` | Chat assistance | Quick, conversational, single response |

---

## Dependencies & Integrations

### External Libraries

| Library | Purpose |
|---------|---------|
| `ai` (Vercel AI SDK) | `generateText()`, tool calling, `stepCountIs()` |
| `@/lib/openrouter` | OpenRouter API integration |
| `@tiptap/core` | Tiptap editor-agnostic content model |
| `@tiptap/html` | HTML to Tiptap JSON conversion |
| `marked` | Markdown parser |
| `zod` | Schema validation |

### Database (Drizzle ORM)

**Tables**:
- `lessons` - Stores courses (Level 1) and lessons (Level 2)
- `lesson_sections` - Stores sections (Level 3)
- `users` - User info for personalization
- `user_lesson_progress` - Lesson completion data

**Schema Types**:
- `AssistantPersona` - 'calm' | 'kind' | 'direct'
- `SkillLevel` - User's programming skill level

---

## AI Context System

This section documents the client-side AI context system for chat assistance.

### Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
├────────────────────────────────────────────────────────────────────┤
│  Lesson Page ─────────────┐                                         │
│  Quiz Page ───────────────┼──▶ AIContextProvider                    │
│  TextSelectionProvider ───┘     (setLesson, setQuiz, addQuote)      │
│                                       │                             │
│  FloatingAIChat ◀─────────────────────┤ (isChatOpen, pendingMessage)│
│       │                               │                             │
│       └──▶ AIChatWindow ─────────────▶│ (getContextForAPI)          │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                      POST /api/ai                                   │
├────────────────────────────────────────────────────────────────────┤
│  1. Authenticate user (auth.api.getSession)                         │
│  2. Fetch user + assistant data (getUserWithAssistant)              │
│  3. Merge client context with server context                        │
│  4. Call generateAIResponse()                                       │
│     - Build system prompt with persona + context                    │
│     - Call OpenRouter via Vercel AI SDK                             │
│  5. Return response                                                 │
└────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| AI Types | `src/lib/ai/types.ts` | Type definitions for context |
| AI Service | `src/lib/ai/service.ts` | Unified `generateAIResponse()` |
| API Endpoint | `app/(app)/api/ai/route.ts` | Single AI endpoint |
| Context Provider | `components/ai-context-provider.tsx` | React context state |
| Context Viewer | `components/ai-context-viewer.tsx` | Collapsible UI in chat |
| Text Selection | `components/text-selection-popup.tsx` | Selection popup |
| Chat Window | `components/ai-chat-window.tsx` | Updated to use context |
| Floating Chat | `components/floating-ai-chat.tsx` | Uses context for open/close |

### Usage: Setting Lesson Context

```tsx
import { useAIContext } from '@/components/ai-context-provider';
import { TextSelectionProvider } from '@/components/text-selection-popup';

function LessonPage({ lesson, currentSection }) {
  const { setLesson } = useAIContext();

  useEffect(() => {
    setLesson({
      id: lesson.id,
      title: lesson.title,
      topic: lesson.slug,
      currentSection: currentSection?.title,
    });
    return () => setLesson(null);
  }, [lesson, currentSection, setLesson]);

  return (
    <TextSelectionProvider source={`${lesson.title} lesson`}>
      <LessonContent />
    </TextSelectionProvider>
  );
}
```

### Usage: Setting Quiz Context

```tsx
import { useAIContext } from '@/components/ai-context-provider';

function QuizPage({ quiz, questions, answers }) {
  const { setQuiz } = useAIContext();

  useEffect(() => {
    const currentQuestion = questions[0];
    setQuiz({
      id: quiz.id,
      title: quiz.title,
      question: currentQuestion ? {
        id: currentQuestion.id,
        prompt: currentQuestion.prompt,
        options: currentQuestion.options,
        selectedIndex: answers[currentQuestion.id],
      } : undefined,
    });
    return () => setQuiz(null);
  }, [quiz, questions, answers, setQuiz]);

  return <QuizContent />;
}
```

### Text Selection

Wrap content where text selection should work:

```tsx
<TextSelectionProvider source="Python Basics lesson">
  <div>
    <p>This text can be selected...</p>
  </div>
</TextSelectionProvider>
```

Selection actions:
- **Ask AI** - Opens chat with quote as context
- **Explain** - Opens chat and auto-sends "Can you explain this to me?"
- **+** - Adds quote to context without opening chat

---

## API Routes

All AI-related API routes in the application.

### Route Summary

| Route | File | Model | Auth | Purpose |
|-------|------|-------|------|---------|
| POST `/api/ai-chat` | `app/(app)/api/ai-chat/route.ts` | gpt-4o-mini | Yes | Persona-based programming chat |
| POST `/api/chat` | `app/(app)/api/chat/route.ts` | gpt-4o | No | Theme generation with tool calling |
| POST `/api/quizzes/[id]/explain` | `app/(app)/api/quizzes/[quizId]/explain/route.ts` | gpt-4o | Yes | Quiz answer explanations |
| POST `/api/quizzes/[id]/hint` | `app/(app)/api/quizzes/[quizId]/hint/route.ts` | gpt-4o | Yes | Quiz hints without revealing answers |
| POST `/api/quizzes/[id]/summary` | `app/(app)/api/quizzes/[quizId]/summary/route.ts` | gpt-4o | Yes | Quiz performance feedback |
| POST `/api/ai-lessons/generate` | `app/(app)/api/ai-lessons/generate/route.ts` | grok-4.1-fast | Yes | Enqueue lesson generation job |
| GET `/api/ai-lessons/jobs/[id]/status` | `app/(app)/api/ai-lessons/jobs/[jobId]/status/route.ts` | - | Yes | Poll job status |
| GET `/api/ai-lessons` | `app/(app)/api/ai-lessons/route.ts` | - | Yes | List user's AI lessons |
| GET/PATCH/DELETE `/api/ai-lessons/[id]` | `app/(app)/api/ai-lessons/[id]/route.ts` | - | Yes | CRUD for single lesson |
| POST `/api/profile/[handle]/assistant` | `app/(app)/api/profile/[handle]/assistant/route.ts` | gpt-4o-mini | No | Profile assistant Q&A |
| POST `/api/tts` | `app/(app)/api/tts/route.ts` | Azure TTS | No | Text-to-speech |

---

### Chat Routes

#### POST `/api/ai-chat` - Persona-Based Programming Chat

**File**: `app/(app)/api/ai-chat/route.ts`

**Purpose**: Main chat endpoint with strict programming-only restrictions and persona-based responses.

**Authentication**: Required

**Request Schema**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: 'nova' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
  temperature?: number;
  max_tokens?: number;
}
```

**Response Schema**:
```typescript
{
  message: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o-mini` (mapped as 'nova') |
| Temperature | 0.7 (default) |
| Max Tokens | Configurable |

**Key Features**:
- Persona-aware responses (calm/kind/direct)
- Strict programming-only topic enforcement
- Gender-aware pronoun handling
- Direct OpenRouter API calls (not using Vercel AI SDK)

---

#### POST `/api/chat` - Theme Generation Chat

**File**: `app/(app)/api/chat/route.ts`

**Purpose**: Streaming chat for theme design assistance with tool calling.

**Authentication**: Not required

**Request Schema**:
```typescript
{
  messages: UIMessage[];  // Vercel AI SDK format
}
```

**Response**: Streaming response with tool results

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o` |
| Max Duration | 30 seconds |

**Key Features**:
- Uses `streamText()` from Vercel AI SDK
- `applyTheme` tool for theme application
- Returns `toUIMessageStreamResponse()`

---

### Quiz Routes

#### POST `/api/quizzes/[quizId]/explain` - Answer Explanation

**File**: `app/(app)/api/quizzes/[quizId]/explain/route.ts`

**Purpose**: Generate AI-powered explanations for quiz answers.

**Authentication**: Required

**Request Schema**:
```typescript
{
  questionId: number;
  userSelectedIndex: number;  // 0-3
}
```

**Response Schema**:
```typescript
{
  explanation: string;
}
```

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o` |
| Temperature | 0.7 |
| Max Tokens | 500 |

**Key Features**:
- Persona-specific teaching style
- Contextualizes correct vs incorrect answers
- Educational focus on concept understanding

---

#### POST `/api/quizzes/[quizId]/hint` - Hint Generation

**File**: `app/(app)/api/quizzes/[quizId]/hint/route.ts`

**Purpose**: Generate helpful hints without revealing answers.

**Authentication**: Required

**Request Schema**:
```typescript
{
  questionId: number;
  selectedIndex?: number;
}
```

**Response Schema**:
```typescript
{
  hint: string;
}
```

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o` |
| Temperature | 0.7 |
| Max Tokens | 300 |

**Key Features**:
- Persona-based hint style
- Can optionally eliminate wrong options
- Brief format (1-2 sentences max)

---

#### POST `/api/quizzes/[quizId]/summary` - Performance Summary

**File**: `app/(app)/api/quizzes/[quizId]/summary/route.ts`

**Purpose**: Generate personalized quiz performance summary with improvement suggestions.

**Authentication**: Required

**Request Schema**:
```typescript
{
  questionResults: Array<{
    questionId: number;
    isCorrect: boolean;
    userIndex: number;
    correctIndex: number;
  }>;
  score: number;
  total: number;
  percentage: number;
}
```

**Response Schema**:
```typescript
{
  summary: string;
}
```

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o` |
| Temperature | 0.7 |
| Max Tokens | 800 |

**Key Features**:
- Persona-specific feedback style
- Limits incorrect questions to first 5 (token optimization)
- Acknowledges strengths, suggests improvements

---

### Lesson Generation Routes

#### POST `/api/ai-lessons/generate` - Enqueue Generation

**File**: `app/(app)/api/ai-lessons/generate/route.ts`

**Purpose**: Enqueues async AI lesson generation job to queue.

**Authentication**: Required

**Request Schema**:
```typescript
{
  topic: string;
  difficulty?: 'easy' | 'standard' | 'hard';
  context?: string;
  estimatedDurationMinutes?: number;  // 5-120
  languagePreference?: string;
  paradigmPreference?: string;
  triggerSource?: 'manual' | 'chat' | 'recommendation';
}
```

**Response Schema** (202 Accepted):
```typescript
{
  jobId: string;
  topic: string;
  difficulty: string;
  estimatedWaitSeconds: number;
  statusUrl: string;
}
```

**Key Imports**:
- `enqueueLessonGeneration` from `@/lib/queue`

---

#### GET `/api/ai-lessons/jobs/[jobId]/status` - Poll Job Status

**File**: `app/(app)/api/ai-lessons/jobs/[jobId]/status/route.ts`

**Purpose**: Poll status of lesson generation job with progress updates.

**Authentication**: Required

**Response Schema**:
```typescript
{
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: {
    percentage: number;
    step: string;
    message: string;
    canRedirect?: boolean;
    courseSlug?: string;
    firstLessonSlug?: string;
    lessonsCompleted?: number;
    totalLessons?: number;
  };
  result?: {
    lessonId: number;
    lessonSlug: string;
    lessonTitle: string;
    sectionCount: number;
    firstSectionSlug: string;
    generationTimeMs: number;
    lessonUrl: string;
  };
  error?: string;
  topic: string;
  difficulty: string;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
  attemptsMade?: number;
}
```

**Key Features**:
- Early redirect support (after first lesson saves)
- Progress tracking with percentage
- Job ownership verification (userId check)

---

#### GET `/api/ai-lessons` - List AI Lessons

**File**: `app/(app)/api/ai-lessons/route.ts`

**Purpose**: Retrieve all AI-generated lessons for authenticated user.

**Authentication**: Required

**Query Parameters**:
- `limit`: number (default 50, max 100)

**Response Schema**:
```typescript
{
  lessons: Array<{
    id: number;
    slug: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedDurationSec: number;
    scope: string;
    createdAt: Date;
    aiMetadata: object;
    progress: object;
    viewUrl: string;
    apiUrl: string;
  }>;
  total: number;
}
```

---

#### GET/PATCH/DELETE `/api/ai-lessons/[id]` - Single Lesson CRUD

**File**: `app/(app)/api/ai-lessons/[id]/route.ts`

**Purpose**: Retrieve, update, or delete AI lesson with sections.

**Authentication**: Required

**GET Response**: Full lesson with sections

**PATCH Request Schema**:
```typescript
{
  title?: string;
  description?: string;
}
```

**DELETE**: Requires ownership, deletes lesson and all sections

**Access Control**: Scope-based (user scope can only access own lessons)

---

### Other AI Routes

#### POST `/api/profile/[handle]/assistant` - Profile Assistant

**File**: `app/(app)/api/profile/[handle]/assistant/route.ts`

**Purpose**: Generate AI-powered responses for public profile questions.

**Authentication**: Not required (public profiles only)

**Request Schema**:
```typescript
{
  questionType: 'learning_overview' | 'project_summary' | 'next_steps' | 'style_persona';
}
```

**Response Schema**:
```typescript
{
  questionType: string;
  answer: string;
  assistantName: string;
}
```

**AI Configuration**:
| Setting | Value |
|---------|-------|
| Model | `openai/gpt-4o-mini` |
| Temperature | 0.7 |

**Key Features**:
- Rate limiting: 5 requests/minute/IP
- Privacy-safe: only public profile data
- Uses `buildProfileAssistantPrompt()` from `src/lib/ai/profileAssistant.ts`

---

#### POST `/api/tts` - Text-to-Speech

**File**: `app/(app)/api/tts/route.ts`

**Purpose**: Convert text to speech using Azure Speech Services.

**Authentication**: Not required

**Request Schema**:
```typescript
{
  text: string;
  persona: string;
  gender?: 'feminine' | 'masculine' | 'androgynous';
}
```

**Response Schema**:
```typescript
{
  audio: string;  // base64
  format: 'audio/mpeg';
}
```

**Service**: Azure Cognitive Services (NOT AI model)

**Key Features**:
- Persona-to-voice mapping (calm→Aria/Davis, kind→Aria/Guy, etc.)
- SSML generation with prosody control
- Gender-aware voice selection

---

## Code Duplication Analysis

### Pattern 1: Quiz Routes (explain, hint, summary)

**Files with identical patterns**:
- `app/(app)/api/quizzes/[quizId]/explain/route.ts`
- `app/(app)/api/quizzes/[quizId]/hint/route.ts`
- `app/(app)/api/quizzes/[quizId]/summary/route.ts`

**Duplicated Logic**:
```typescript
// 1. Auth + session lookup (identical in all 3)
const session = await auth.api.getSession({ headers: await headers() })
const userId = Number(session.user.id)
const [userData] = await getUserWithAssistant.execute({ userId })

// 2. Persona prompt building (similar structure)
const personaStyle = PERSONA_STYLES[persona]
const systemPrompt = `You are ${assistantName}...`

// 3. generateText call (identical pattern)
const { text } = await generateText({
  model: openrouter('openai/gpt-4o'),
  system: systemPrompt,
  prompt: userPrompt,
  temperature: 0.7,
  maxTokens: 500
})

// 4. Error handling (identical)
if (error.message.includes('401')) { ... }
if (error.message.includes('429')) { ... }
```

**Recommendation**: Extract to `src/lib/ai/quiz-assistant.ts`:
```typescript
export async function generateQuizExplanation(questionId: number, userIndex: number): Promise<string>
export async function generateQuizHint(questionId: number, selectedIndex?: number): Promise<string>
export async function generateQuizSummary(questionResults: QuestionResult[], score: number): Promise<string>
```

---

### Pattern 2: Auth + User Lookup

**Used in 8+ routes** with identical code:
```typescript
const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const userId = Number(session.user.id)
const [userData] = await getUserWithAssistant.execute({ userId })
```

**Recommendation**: Create `src/lib/auth/get-session-with-assistant.ts`:
```typescript
export async function getSessionWithAssistant(): Promise<{
  userId: number;
  user: User;
  assistant: Assistant;
}>
```

---

### Pattern 3: Persona Prompt Construction

**Used in**: ai-chat, quiz/*, profile/assistant

**Duplicated across routes**:
- Building system prompts with persona characteristics
- Gender-aware pronoun selection
- Persona-specific tone/pacing/encouragement

**Recommendation**: `buildPersonaInstruction()` exists but not used consistently. All routes should use this shared utility.

---

### Pattern 4: OpenRouter Error Handling

**Identical in 5+ routes**:
```typescript
catch (error) {
  if (error.message.includes('401') || error.message.includes('API key')) {
    throw new Error('Invalid API key')
  }
  if (error.message.includes('429') || error.message.includes('rate limit')) {
    throw new Error('Rate limit exceeded')
  }
  throw error
}
```

**Recommendation**: Create `src/lib/openrouter/error-handler.ts`:
```typescript
export function handleOpenRouterError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your OpenRouter configuration.')
    }
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    }
  }
  throw error
}
```

---

### Environment Variables Required

| Variable | Used By | Purpose |
|----------|---------|---------|
| `OPENROUTER_API_KEY` | All LLM routes | OpenRouter authentication |
| `AZURE_SPEECH_KEY` | `/api/tts` | Azure TTS authentication |
| `AZURE_SPEECH_REGION` | `/api/tts` | Azure region configuration |
| `NEXT_PUBLIC_APP_URL` | OpenRouter client | HTTP-Referer header |

---

## Issues & Recommendations

### Type Safety

**Issues**:
- Tool parameters use generic `Record<string, unknown>` in some places
- Plan metadata in `conversationState.metadata` is loosely typed

**Recommendations**:
- Add explicit interfaces for tool parameters
- Type `metadata` as specific union type

### Error Handling

**Issues**:
- Markdown parsing errors silently caught in `create_section`
- Empty lessons only caught at `finish_with_summary`, not earlier

**Recommendations**:
- Surface parsing errors in tool responses
- Validate section count when calling `create_lesson` for subsequent lessons

### Hardcoded Values

**Issues**:
- Step limit: 80 in `runner.ts`
- Token limits: 1000 in `service.ts`
- Word count formulas: 150-200 words per minute
- Lesson targets: hardcoded in `getTargetLessonCount()`

**Recommendations**:
- Extract to configuration file or environment variables
- Allow per-request customization

### Test Coverage

**Issues**:
- Test files exist (~730 lines) but coverage unclear
- No visible tests for full agent workflow
- Parser edge cases might not be tested

**Recommendations**:
- Add integration tests for complete agent flow
- Add tests for parser edge cases (nested syntax, escaping)
- Add coverage reporting

### Reorganization Suggestions

1. **Move `profileAssistant.ts`** to `prompts/profile-assistant.ts` - better organization with other prompts

2. **Split `lesson-generator.ts`** - Separate DB operations from orchestration logic:
   ```
   lesson-generator.ts → lesson-orchestrator.ts (coordination)
                       → lesson-persistence.ts (DB operations)
   ```

3. **Add stricter types** - Create explicit interfaces for tool parameters and plan metadata

4. **Consolidate validators** - Merge `agent/lib/validators.ts` with `tiptap/schema.ts`

5. **Add README files** - Add README.md to `agent/`, `tiptap/`, `prompts/` subdirectories

6. **Extract configuration** - Create `config.ts` for hardcoded values:
   ```typescript
   export const AI_CONFIG = {
     lessonGeneration: {
       model: 'x-ai/grok-4.1-fast',
       maxSteps: 80,
       temperature: 0.7
     },
     chatAssistance: {
       model: 'openai/gpt-4o',
       maxTokens: 1000,
       temperature: 0.7
     },
     lessonTargets: {
       wordsPerMinute: { min: 150, max: 200 },
       sectionsPerLesson: { min: 5, max: 8 }
     }
   };
   ```
