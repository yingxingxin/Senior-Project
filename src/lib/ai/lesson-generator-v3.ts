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
import { eq } from 'drizzle-orm';

export interface GenerateLessonParams {
  userId: number;
  topic: string;
  difficulty: 'easy' | 'standard' | 'hard';
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
  firstSectionSlug: string; // For redirecting to /courses/[slug]/[firstSection]
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
 * Generate a fallback slug from topic (only used if AI fails to provide one)
 */
function generateFallbackSlug(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Spaces to hyphens
    .replace(/-+/g, '-')          // Collapse multiple hyphens
    .replace(/^-|-$/g, '')        // Trim hyphens from ends
    .substring(0, 50);            // Limit length
}

/**
 * Ensure a slug is unique in the database by appending a timestamp if needed
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  // Check if slug exists
  const existing = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.slug, baseSlug))
    .limit(1);

  if (existing.length === 0) {
    return baseSlug; // Slug is unique
  }

  // Slug exists, append timestamp to make it unique
  const timestamp = Date.now();
  const uniqueSlug = `${baseSlug}-${timestamp}`;
  console.log(`[AI Agent] Slug "${baseSlug}" already exists, using "${uniqueSlug}"`);
  return uniqueSlug;
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

  // Get all lessons from document state (Level 2)
  const agentLessons = agentResult.documentState.getAllLessons();

  if (agentLessons.length === 0) {
    throw new Error('No lessons created by agent. Generation failed.');
  }

  // Calculate total sections across all lessons
  const totalSections = agentLessons.reduce((sum, lesson) => sum + lesson.sections.length, 0);

  if (totalSections === 0) {
    throw new Error('No sections created in any lesson. Generation failed.');
  }

  // Get AI-generated course metadata from conversation state
  const metadata = agentResult.conversationState.metadata;
  const courseTitle = (metadata.lessonTitle as string) || topic;
  let courseSlug = (metadata.lessonSlug as string) || generateFallbackSlug(topic);
  const description = (metadata.description as string) || agentResult.summary;

  // Validate course slug format
  if (!/^[a-z0-9-]+$/.test(courseSlug)) {
    console.warn(`[AI Agent] Invalid course slug: ${courseSlug}, using fallback`);
    courseSlug = generateFallbackSlug(topic);
  }

  // Ensure slug is unique in the database (append timestamp if needed)
  courseSlug = await ensureUniqueSlug(courseSlug);

  // Calculate total word count across all sections in all lessons
  const wordCount = agentLessons.reduce((lessonSum, lesson) =>
    lessonSum + lesson.sections.reduce((sectionSum, section) =>
      sectionSum + countWordsInTiptap(section.document), 0
    ), 0
  );

  console.log(`[AI Agent] Creating course with ${agentLessons.length} lessons and ${totalSections} total sections`);

  // Level 1: Create COURSE (parent lesson with parent_lesson_id = null)
  const [courseRecord] = await db
    .insert(lessons)
    .values({
      slug: courseSlug,
      title: courseTitle,
      description: description.substring(0, 500),
      difficulty,
      estimated_duration_sec: estimatedDurationMinutes * 60,
      scope: 'user' as const,
      owner_user_id: userId,
      parent_lesson_id: null, // This makes it a "course"
      is_ai_generated: true,
      ai_metadata: {
        topic,
        difficulty,
        context: context || null,
        model_used: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
        persona_snapshot: userContext.assistantPersona,
        generation_timestamp: new Date().toISOString(),
        estimated_duration_minutes: estimatedDurationMinutes,
        word_count: wordCount,
        lesson_count: agentLessons.length,
        total_section_count: totalSections,
        agent_version: 'v3_full_hierarchy',
        steps_executed: agentResult.stepsExecuted,
        final_summary: agentResult.summary,
      },
    })
    .returning();

  console.log(`[AI Agent] Created course: ${courseRecord.id} (${courseSlug})`);

  // Level 2: Create LESSONS (child lessons with parent_lesson_id = course.id)
  const lessonRecords = await db
    .insert(lessons)
    .values(
      agentLessons.map((lesson, index) => ({
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description || '',
        difficulty,
        estimated_duration_sec: Math.floor(estimatedDurationMinutes * 60 / agentLessons.length),
        scope: 'user' as const,
        owner_user_id: userId,
        parent_lesson_id: courseRecord.id, // Links to course
        order_index: index,
        is_ai_generated: true,
        ai_metadata: {
          lesson_index: index,
          parent_course_slug: courseSlug,
          section_count: lesson.sections.length,
        },
      }))
    )
    .returning();

  console.log(`[AI Agent] Created ${lessonRecords.length} lessons`);

  // Level 3: Create SECTIONS (lesson_sections for each lesson)
  let sectionCount = 0;
  for (let lessonIndex = 0; lessonIndex < lessonRecords.length; lessonIndex++) {
    const lessonRecord = lessonRecords[lessonIndex];
    const agentLesson = agentLessons[lessonIndex];

    // Create multiple sections per lesson - this is what makes "Section X of Y" work!
    for (let sectionIndex = 0; sectionIndex < agentLesson.sections.length; sectionIndex++) {
      const section = agentLesson.sections[sectionIndex];
      await db.insert(lesson_sections).values({
        lesson_id: lessonRecord.id,
        slug: section.slug,
        title: section.title,
        order_index: sectionIndex,
        body_json: section.document,
        body_md: '', // Required field, empty for JSON lessons
      });
      sectionCount++;
    }

    console.log(`[AI Agent] Created ${agentLesson.sections.length} sections for lesson "${lessonRecord.title}"`);
  }

  console.log(`[AI Agent] Created ${sectionCount} total lesson_sections across ${lessonRecords.length} lessons`);

  const generationTimeMs = Date.now() - startTime;

  console.log(`[AI Agent v3] Course generated in ${generationTimeMs}ms`, {
    courseId: courseRecord.id,
    title: courseTitle,
    lessons: lessonRecords.length,
    totalSections: sectionCount,
    steps: agentResult.stepsExecuted,
    wordCount,
  });

  // For firstSectionSlug, we want the first lesson's slug (what appears on course overview)
  // The user will navigate to /courses/[courseSlug]/[lessonSlug] then see sections
  return {
    lessonId: courseRecord.id,
    lessonSlug: courseSlug,
    lessonTitle: courseTitle,
    sectionCount: sectionCount, // Total sections across all lessons
    firstSectionSlug: lessonRecords[0].slug, // First lesson's slug (for redirect to first lesson)
    generationTimeMs,
    tokenUsage: undefined, // Not tracked in agent mode yet
    modelUsed: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
    wordCount,
  };
}
