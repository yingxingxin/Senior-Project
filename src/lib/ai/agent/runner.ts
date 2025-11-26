/**
 * AI Agent Runner
 *
 * Main orchestration loop for iterative lesson generation using tools.
 */

import { generateText, stepCountIs } from 'ai';
import { openrouter } from '@/lib/openrouter';
import type { AgentRunResult, ProgressCallback, ToolExecutionContext } from './types';
import { DocumentState } from './document-state';
import { ConversationState } from './conversation-state';
import { getAllTools, getToolsDescription } from './tool-registry';
import { createCheckpoint, CheckpointManager } from './checkpoints';
import { buildPersonaInstruction } from '../prompts/persona-prompts';
import type { UserPersonalizationContext } from '../personalization';

const MAX_STEPS = 50; // Prevent infinite loops
const CHECKPOINT_INTERVAL = 5; // Save checkpoint every 5 steps

export interface RunAgentParams {
  userId: number;
  topic: string;
  difficulty: 'easy' | 'standard' | 'hard';
  context?: string;
  estimatedDurationMinutes: number;
  userContext: UserPersonalizationContext;
  onProgress?: ProgressCallback;
}

/**
 * Build system prompt for the agent
 */
function buildSystemPrompt(params: RunAgentParams): string {
  const { topic, difficulty, estimatedDurationMinutes, userContext } = params;

  const personaInstruction = buildPersonaInstruction(
    userContext.assistantPersona,
    userContext.assistantName,
    userContext.assistantGender
  );

  const difficultyGuidance = {
    easy: 'Provide thorough, step-by-step explanations. Assume no prior knowledge. Use simple language and many examples.',
    standard: 'Balance explanation with practice. Assume basic understanding. Include some advanced concepts.',
    hard: 'Be concise and technical. Assume strong foundation. Focus on advanced patterns and edge cases.',
  }[difficulty];

  return `You are an expert programming instructor creating a personalized COURSE using an iterative, tool-based approach.

${personaInstruction}

COURSE REQUIREMENTS:
- Topic: ${topic}
- Skill Level: ${difficulty}
- Target Duration: ${estimatedDurationMinutes} minutes
- Approach: ${difficultyGuidance}
- Target Word Count: ${estimatedDurationMinutes * 150}-${estimatedDurationMinutes * 200} words

3-LEVEL HIERARCHY (CRITICAL TO UNDERSTAND):
┌─────────────────────────────────────────────────────────────┐
│ Level 1: COURSE (the main topic you're creating)            │
│   └── Level 2: LESSONS (2-4 major subtopics)               │
│         └── Level 3: SECTIONS (3-5 content chunks/lesson)  │
└─────────────────────────────────────────────────────────────┘

- COURSE: The overall topic (e.g., "${topic}")
  - Shows as the course overview page
  - Defined by finish_with_summary (title, slug, description)

- LESSONS: Major topics within the course (2-4 lessons)
  - Shown as clickable cards on the course overview page
  - Created using create_lesson tool
  - Example: For "React Hooks" course, lessons might be "useState", "useEffect", "Custom Hooks"

- SECTIONS: Content chunks within each lesson (3-5 per lesson)
  - What users navigate through with "Next" and "Previous" buttons
  - Created using create_section tool
  - Users see "Section 1 of 5" etc. when viewing a lesson

CONTENT STANDARDS:
- Write content in EXTENDED MARKDOWN format (will be parsed to Tiptap JSON automatically)
- Use ## for section titles (# is reserved for lesson title)
- Use ### for subsections within a section
- Add code blocks with language identifiers for syntax highlighting
- Include callouts for tips, warnings, and key points
- Add quiz questions to test understanding
- Use flip cards for definitions and key concepts
- Match ${difficulty} difficulty throughout

${getToolsDescription()}

EXTENDED MARKDOWN FORMAT:

Write your content using standard Markdown plus these extensions:

## Standard Markdown (built-in)
- \`# Heading 1\`, \`## Heading 2\`, etc.
- \`**bold**\` and \`*italic*\`
- \`\\\`inline code\\\`\`
- \`\\\`\\\`\\\`language\` for code blocks
- \`- item\` for bullet lists
- \`1. item\` for numbered lists

## Callouts (tips, warnings, notes)
\`\`\`
:::tip
Pro tip content here. Always check your inputs!
:::

:::warning
Warning: This could cause issues if not handled correctly.
:::

:::note
Important note about this concept.
:::

:::info
Additional information the learner should know.
:::
\`\`\`

## Flip Cards (definitions, key concepts)
\`\`\`
???Term or Concept
Definition or explanation on the back of the card.
???

???Another Term
Its definition here.
???
\`\`\`
Consecutive flip cards will be grouped together automatically.

## Quizzes (multiple choice)
\`\`\`
[quiz: What is the correct answer? | Option A | Option B* | Option C | Option D]
Explanation of why Option B is correct. This appears after the user answers.
\`\`\`
Mark the correct answer with * after the option text.

CRITICAL WORKFLOW - 3-Level Generation (MUST complete ALL steps):

STEP 1: Call "plan" to create course structure
   - Define 2-4 lessons, each with 3-5 sections
   - Each lesson should cover a distinct subtopic
   - Each section should be a digestible chunk (300-500 words)

STEP 2: FOR EACH LESSON in your plan:
   a. Call "create_lesson" with:
      - title: Lesson title (e.g., "Understanding useState")
      - slug: URL-friendly slug (e.g., "understanding-usestate")
      - description: What this lesson covers

   b. FOR EACH SECTION in that lesson:
      Call "create_section" with:
        - title: Section title (e.g., "Introduction")
        - slug: URL-friendly slug (e.g., "introduction")
        - content: Section content in EXTENDED MARKDOWN format (REQUIRED)
          * Start with ## heading for section title
          * Add paragraphs explaining concepts
          * Add \`\`\`language code blocks with examples
          * Add :::tip or :::warning callouts
          * Add ???front\\nback??? flip cards for key terms
          * Add [quiz: ...] questions to test understanding

   c. REPEAT for all sections before moving to next lesson

STEP 3: Call "finish_with_summary" with:
   - lessonTitle: COURSE title (e.g., "Mastering React Hooks")
   - lessonSlug: COURSE slug (e.g., "mastering-react-hooks")
   - description: Short 1-2 sentence description of the course
   - summary: Brief summary of course content

⚠️ SLUG FORMAT REQUIREMENTS:
- Lowercase letters, numbers, and hyphens ONLY
- NO spaces, underscores, or special characters
- Make slugs readable and meaningful
- Course slug: descriptive (e.g., "mastering-react-hooks")
- Lesson slugs: clear (e.g., "understanding-usestate")
- Section slugs: concise (e.g., "introduction", "examples")

⚠️ CRITICAL RULES:
1. You MUST create a lesson BEFORE creating sections within it
2. Complete ALL sections of one lesson before creating the next lesson
3. Each lesson needs 3-5 sections for proper navigation
4. Users will see "Section X of Y" - make sure Y > 1 per lesson!
5. DO NOT skip any steps - the course won't work without all components
`;
}

/**
 * Format personalization context as initial user message
 */
function formatPersonalizationContext(userContext: UserPersonalizationContext): string {
  return `# About the Learner

**Learning Profile:**
- Skill Level: ${userContext.skillLevel || 'beginner'}
- Teaching Style: ${userContext.assistantPersona || 'calm'}
- Completed Lessons: ${userContext.completedLessonsCount || 0}
- Recent Topics: ${userContext.recentTopics?.slice(0, 3).join(', ') || 'None'}

Tailor this lesson to match their skill level and style.`;
}

/**
 * Run the AI agent
 */
export async function runAgent(params: RunAgentParams): Promise<AgentRunResult> {
  const { userId, topic, context: additionalContext, userContext, onProgress } = params;

  // Initialize states
  const documentState = new DocumentState();
  const conversationState = new ConversationState();
  const checkpointManager = new CheckpointManager();

  // Initialize empty document
  documentState.initialize({ type: 'doc', content: [] });

  // Add personalization context as first message
  conversationState.addUserMessage(formatPersonalizationContext(userContext));

  // Add lesson request
  const lessonRequest = additionalContext
    ? `Create a lesson about: ${topic}\n\nAdditional context: ${additionalContext}`
    : `Create a lesson about: ${topic}`;

  conversationState.addUserMessage(lessonRequest);

  // Tool execution context
  const toolContext: ToolExecutionContext = {
    documentState,
    conversationState,
  };

  // Step counter ref for tool logging
  const stepRef = { current: 0 };

  // Get all tools
  const tools = getAllTools(toolContext, userId, stepRef);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(params);

  conversationState.setStatus('loading');

  try {
    console.log('[Agent] Starting generation with automatic tool roundtrips');

    // Update progress callback
    if (onProgress) {
      await onProgress({
        step: 'agent_running',
        percentage: 10,
        message: 'AI agent processing...',
        stepNumber: 1,
        totalSteps: 1,
      });
    }

    // Get conversation history
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...conversationState.getMessagesForAI(),
    ];

    // Single call to generateText - SDK handles ALL tool roundtrips automatically with stopWhen
    const response = await generateText({
      model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o'),
      messages,
      tools,
      temperature: 0.7,
      stopWhen: stepCountIs(30), // SDK will loop internally up to 30 times to allow full lesson generation
    });

    // Log what happened
    console.log('[Agent] Generation complete:', {
      hasText: !!response.text,
      textLength: response.text?.length || 0,
      textPreview: response.text?.substring(0, 200),
      toolCallsInResponse: response.toolCalls?.length || 0,
      responseType: response.finishReason,
    });

    // Detailed diagnostic logging
    console.log('[Agent] Finish reason:', response.finishReason);
    console.log('[Agent] Total steps executed:', response.steps?.length || 0);

    // Log each step detail
    response.steps?.forEach((step, index) => {
      console.log(`[Agent Step ${index} Detail]:`, {
        hasText: !!step.text,
        textLength: step.text?.length || 0,
        toolCallsCount: step.toolCalls?.length || 0,
        toolNames: step.toolCalls?.map(tc => tc.toolName),
        finishReason: step.finishReason,
        // Log the full step object to see all available properties
        fullStep: JSON.stringify(step, null, 2).substring(0, 500),
      });
    });

    // Log token usage (log the entire object to see available properties)
    if (response.usage) {
      console.log('[Agent] Token usage:', response.usage);
    }

    // Log warnings if any
    if (response.warnings && response.warnings.length > 0) {
      console.warn('[Agent] Warnings:', response.warnings);
    }

    // Add final response to conversation
    if (response.text) {
      conversationState.addAiMessage(response.text);
    }

    // Update progress one more time
    if (onProgress) {
      await onProgress({
        step: 'agent_running',
        percentage: 90,
        message: 'Finalizing lesson...',
        stepNumber: 1,
        totalSteps: 1,
      });
    }

    // Mark as idle
    conversationState.setStatus('idle');

    // Get final document
    const finalDocument = documentState.getDocument();
    const finalDocInfo = documentState.getChunkInfo();

    // Log final summary
    console.log(`[Agent] Execution complete:`, {
      success: true,
      documentNodes: documentState.document.content.length,
      documentChars: finalDocInfo.totalCharCount,
      isEmpty: documentState.isEmpty(),
      totalMessages: conversationState.messages.length,
      toolCalls: conversationState.messages.filter((m) => m.type === 'toolCall').length,
      aiMessages: conversationState.messages.filter((m) => m.type === 'ai').length,
    });

    return {
      success: true,
      document: finalDocument,
      summary: response.text || 'Lesson completed',
      stepsExecuted: 1,
      conversationMessages: conversationState.getMessages(),
      documentState,
      conversationState,
    };
  } catch (error) {
    conversationState.setStatus('error');

    console.error('[Agent] Error during execution:', error);

    return {
      success: false,
      document: documentState.getDocument(),
      summary: 'Error occurred during generation',
      stepsExecuted: 0,
      conversationMessages: conversationState.getMessages(),
      documentState,
      conversationState,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
