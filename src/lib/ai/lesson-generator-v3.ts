/**
 * AI Agent-based Lesson Generator (v3) - Full Implementation
 *
 * Uses complete AI Agent architecture with iterative tool calling,
 * document chunking, diff-based editing, and checkpoint system.
 *
 * This is the full Tiptap-style AI Agent implementation.
 */

import { db } from '@/src/db';
import { lessons, lesson_sections } from '@/src/db/schema';
import type { Difficulty } from '@/src/db/schema';
import { loadUserPersonalizationContext } from './personalization';
import { runAgent } from './agent';
import { countWordsInTiptap } from './tiptap-schema';

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
 * Generate AI lesson using full agent system
 */
export async function generateAILessonWithFullAgent(
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

  await updateProgress('planning', 10, 'Initializing AI agent...');

  // Run the full AI agent
  const agentResult = await runAgent({
    userId,
    topic,
    difficulty,
    context,
    estimatedDurationMinutes,
    userContext,
    onProgress: async (progress) => {
      // Forward progress updates from agent
      await updateProgress(
        progress.step,
        progress.percentage,
        progress.message
      );
    },
  });

  if (!agentResult.success) {
    throw new Error(agentResult.error || 'Agent execution failed');
  }

  await updateProgress('storing', 95, 'Saving lesson to database...');

  // Extract lesson title from document
  const firstHeading = agentResult.document.content?.find((node: any) =>
    node.type === 'heading' && node.attrs?.level === 1
  );

  const lessonTitle = firstHeading?.content?.[0]?.text || topic;

  // Calculate word count
  const wordCount = countWordsInTiptap(agentResult.document);

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
      description: agentResult.summary.substring(0, 500),
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
        token_usage: null, // Agent doesn't track individual tokens yet
        estimated_duration_minutes: estimatedDurationMinutes,
        word_count: wordCount,
        agent_version: 'v3_full_agent',
        steps_executed: agentResult.stepsExecuted,
        final_summary: agentResult.summary,
      },
    })
    .returning();

  // Store lesson content
  await db.insert(lesson_sections).values({
    lesson_id: lesson.id,
    slug: 'content',
    title: 'Content',
    order_index: 1,
    body_json: agentResult.document,
    body_md: '', // Required field, empty for JSON lessons
  });

  const generationTimeMs = Date.now() - startTime;

  console.log(`[AI Agent v3] Lesson generated in ${generationTimeMs}ms`, {
    lessonId: lesson.id,
    title: lessonTitle,
    steps: agentResult.stepsExecuted,
    wordCount,
  });

  return {
    lessonId: lesson.id,
    lessonSlug: slug,
    lessonTitle,
    sectionCount: 1,
    generationTimeMs,
    tokenUsage: undefined, // Not tracked in agent mode yet
    modelUsed: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
    wordCount,
  };
}
