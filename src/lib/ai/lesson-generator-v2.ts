/**
 * AI Agent-based Lesson Generator (v2) - Fixed
 *
 * Uses Vercel AI SDK's tool calling to build Tiptap documents iteratively.
 * Simplified version that works with current setup.
 */

import { generateText, tool } from 'ai';
import { openrouter } from '@/lib/openrouter';
import { z } from 'zod';
import { db } from '@/src/db';
import { lessons, lesson_sections } from '@/src/db/schema';
import type { Difficulty } from '@/src/db/schema';
import { loadUserPersonalizationContext, type UserPersonalizationContext } from './personalization';
import { buildPersonaInstruction } from './prompts/persona-prompts';
import type { TiptapDocument } from './tiptap-schema';

export interface GenerateLessonParams {
  userId: number;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  context?: string;
  estimatedDurationMinutes?: number;
  languagePreference?: string;
  paradigmPreference?: string;
  onProgress?: (progress: {
    step: string;
    percentage: number;
    message: string;
  }) => Promise<void>;
}

export interface GenerateLessonResult {
  lessonId: number;
  lessonSlug: string;
  lessonTitle: string;
  sectionCount: number;
  generationTimeMs: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelUsed: string;
  wordCount: number;
}

/**
 * Build system prompt for AI Agent
 */
function buildSystemPrompt(
  topic: string,
  difficulty: string,
  userContext: UserPersonalizationContext | null,
  estimatedDuration: number
): string {
  const personaInstruction = userContext
    ? buildPersonaInstruction(
        userContext.assistantPersona,
        userContext.assistantName,
        userContext.assistantGender
      )
    : '';

  const difficultyGuidance = {
    beginner: 'Provide thorough explanations with step-by-step guidance. Assume no prior knowledge.',
    intermediate: 'Balance explanation with practice. Assume basic understanding.',
    advanced: 'Be concise and technical. Focus on advanced patterns.',
  }[difficulty];

  return `You are an expert programming instructor creating a lesson as a valid Tiptap JSON document.

${personaInstruction}

LESSON REQUIREMENTS:
- Topic: ${topic}
- Skill Level: ${difficulty}
- Target Duration: ${estimatedDuration} minutes
- Approach: ${difficultyGuidance}

OUTPUT FORMAT:
You must call the "generate_lesson_content" tool with a complete Tiptap JSON document containing:
1. h1 heading with lesson title
2. Introductory paragraphs
3. h2 headings for main sections
4. Code blocks with examples
5. Call outs for tips/warnings
6. Quiz questions to test understanding

CONTENT STANDARDS:
- ${difficulty} difficulty throughout
- ${estimatedDuration * 150}-${estimatedDuration * 200} words total
- Include practical examples
- Add interactive elements

Call the tool NOW with the complete lesson content.`;
}

/**
 * Generate AI lesson using simplified agent approach
 */
export async function generateAILessonWithAgent(
  params: GenerateLessonParams
): Promise<GenerateLessonResult> {
  const {
    userId,
    topic,
    difficulty,
    context,
    estimatedDurationMinutes = 30,
    onProgress,
  } = params;

  const startTime = Date.now();

  const updateProgress = async (step: string, percentage: number, message: string) => {
    if (onProgress) {
      await onProgress({ step, percentage, message });
    }
  };

  await updateProgress('initializing', 5, 'Loading user preferences...');

  // Load user context
  const userContext = await loadUserPersonalizationContext(userId);

  await updateProgress('planning', 15, 'Planning lesson structure...');

  // Define the lesson generation tool
  const generateLessonTool = tool({
    description: 'Generate the complete lesson content as a Tiptap JSON document',
    parameters: z.object({
      title: z.string().describe('Lesson title'),
      tiptapDocument: z.object({
        type: z.literal('doc'),
        content: z.array(z.any()),
      }).describe('Complete Tiptap JSON document with all lesson content'),
      wordCount: z.number().describe('Approximate word count'),
    }),
    execute: async ({ title, tiptapDocument, wordCount }) => {
      return {
        success: true,
        title,
        document: tiptapDocument,
        wordCount,
      };
    },
  });

  await updateProgress('generating', 20, 'AI is creating your lesson...');

  // Call AI with tool
  const response = await generateText({
    model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o'),
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(topic, difficulty, userContext, estimatedDurationMinutes),
      },
      {
        role: 'user',
        content: context
          ? `Create a lesson about: ${topic}\n\nContext: ${context}`
          : `Create a lesson about: ${topic}`,
      },
    ],
    tools: {
      generate_lesson_content: generateLessonTool,
    },
    toolChoice: 'required',
    temperature: 0.7,
  });

  await updateProgress('processing', 80, 'Processing AI response...');

  // Extract the result
  let lessonTitle = topic;
  let tiptapDocument: TiptapDocument | null = null;
  let wordCount = 0;

  // Parse tool calls from response
  if (response.toolCalls && response.toolCalls.length > 0) {
    const toolCall = response.toolCalls[0];
    if (toolCall.toolName === 'generate_lesson_content' && 'args' in toolCall) {
      const args = toolCall.args as any;
      lessonTitle = args.title || topic;
      tiptapDocument = args.tiptapDocument;
      wordCount = args.wordCount || 0;
    }
  }

  // Fallback if AI didn't use tool properly
  if (!tiptapDocument) {
    tiptapDocument = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: lessonTitle }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: response.text || 'Lesson content could not be generated.' }],
        },
      ],
    };
  }

  await updateProgress('storing', 95, 'Saving lesson to database...');

  // Generate slug
  const slug = `${lessonTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)}-${Date.now().toString(36)}`;

  // Store lesson in database
  const [lesson] = await db
    .insert(lessons)
    .values({
      slug,
      title: lessonTitle,
      description: `AI-generated lesson about ${topic}`,
      difficulty: difficulty as Difficulty,
      estimated_duration_sec: estimatedDurationMinutes * 60,
      scope: 'user',
      owner_user_id: userId,
      is_ai_generated: true,
      ai_metadata: {
        topic,
        difficulty,
        context: context || null,
        model_used: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
        persona_snapshot: userContext.assistantPersona,
        generation_timestamp: new Date().toISOString(),
        token_usage: response.usage ? {
          prompt_tokens: response.usage.promptTokens,
          completion_tokens: response.usage.completionTokens,
          total_tokens: response.usage.totalTokens,
        } : null,
        estimated_duration_minutes: estimatedDurationMinutes,
        word_count: wordCount,
      },
    })
    .returning();

  // Store lesson content
  await db.insert(lesson_sections).values({
    lesson_id: lesson.id,
    slug: 'content',
    title: 'Content',
    order_index: 1,
    body_json: tiptapDocument,
    body_md: '', // Required field, empty for JSON lessons
  });

  const generationTimeMs = Date.now() - startTime;

  return {
    lessonId: lesson.id,
    lessonSlug: slug,
    lessonTitle,
    sectionCount: 1,
    generationTimeMs,
    tokenUsage: response.usage ? {
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
    } : undefined,
    modelUsed: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
    wordCount,
  };
}
