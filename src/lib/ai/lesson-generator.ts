/**
 * AI Lesson Generator
 *
 * Main orchestration for generating personalized lessons using AI.
 * Integrates persona, skill level, Tiptap JSON generation, and database storage.
 */

import { openrouter } from '@/lib/openrouter';
import { generateText } from 'ai';
import { db } from '@/db';
import { lessons, lesson_sections } from '@/db/schema';
import type { Difficulty } from '@/db/schema';
import {
  loadUserPersonalizationContext,
  createUserMetadataSnapshot,
  estimateLessonDuration,
  type UserPersonalizationContext,
} from './personalization';
import { buildLessonGenerationPrompt } from './prompts/lesson-generation';
import {
  validateTiptapJSON,
  sanitizeTiptapJSON,
  validateLessonContent,
  countWordsInTiptap,
  type TiptapDocument,
} from './tiptap-schema';
import { createDefaultAIMetadata, type AILessonMetadata } from '@/db/schema/ai-metadata-types';

export interface GenerateLessonParams {
  userId: number;
  topic: string;
  difficulty?: Difficulty;
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
  wordCount: number;
  generationTimeMs: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  modelUsed: string;
}

/**
 * Generate a complete AI lesson
 *
 * This is the main entry point for lesson generation.
 * Called by the BullMQ job processor.
 */
export async function generateAILesson(params: GenerateLessonParams): Promise<GenerateLessonResult> {
  const startTime = Date.now();

  const {
    userId,
    topic,
    difficulty = 'standard',
    context,
    estimatedDurationMinutes,
    languagePreference,
    paradigmPreference,
    onProgress,
  } = params;

  try {
    // Step 1: Load user personalization context (0-10%)
    await onProgress?.({
      step: 'loading_context',
      percentage: 5,
      message: 'Loading your profile and preferences...',
    });

    const userContext = await loadUserPersonalizationContext(userId);

    // Merge preferences (explicit params override inferred)
    const finalLanguagePreference = languagePreference || userContext.languagePreference;
    const finalParadigmPreference = paradigmPreference || userContext.paradigmPreference;
    const finalDuration = estimatedDurationMinutes || estimateLessonDuration(userContext);

    console.log('[Lesson Generator] User context loaded:', {
      userId,
      assistantName: userContext.assistantName,
      persona: userContext.assistantPersona,
      skillLevel: userContext.skillLevel,
      language: finalLanguagePreference,
      paradigm: finalParadigmPreference,
      duration: finalDuration,
    });

    // Step 2: Build personalized prompt (10-20%)
    await onProgress?.({
      step: 'building_prompt',
      percentage: 15,
      message: `Preparing ${userContext.assistantName}'s teaching style...`,
    });

    const systemPrompt = buildLessonGenerationPrompt({
      userId,
      assistantName: userContext.assistantName,
      assistantGender: userContext.assistantGender,
      persona: userContext.assistantPersona,
      skillLevel: userContext.skillLevel,
      topic,
      difficulty,
      context,
      estimatedDurationMinutes: finalDuration,
      languagePreference: finalLanguagePreference,
      paradigmPreference: finalParadigmPreference,
    });

    console.log(`[Lesson Generator] Prompt built (${systemPrompt.length} chars)`);

    // Step 3: Call AI to generate lesson content (20-80%)
    await onProgress?.({
      step: 'generating_content',
      percentage: 25,
      message: 'Generating personalized lesson content...',
    });

    const modelName = process.env.OPENROUTER_LESSON_MODEL || 'openai/gpt-4o';

    const aiResponse = await generateText({
      model: openrouter(modelName),
      system: systemPrompt,
      prompt: `Generate a comprehensive lesson on "${topic}". Remember to output ONLY valid Tiptap JSON.`,
      temperature: 0.7,
      maxTokens: 4000, // Allow for long, detailed lessons
    });

    console.log('[Lesson Generator] AI response received:', {
      textLength: aiResponse.text.length,
      promptTokens: aiResponse.usage?.promptTokens,
      completionTokens: aiResponse.usage?.completionTokens,
    });

    await onProgress?.({
      step: 'validating_content',
      percentage: 80,
      message: 'Validating lesson structure...',
    });

    // Step 4: Parse and validate Tiptap JSON (80-85%)
    let lessonContent: TiptapDocument;

    try {
      // Extract JSON from response (AI might add backticks or explanation)
      const jsonMatch = aiResponse.text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || aiResponse.text.match(/(\{[\s\S]*\})/);

      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response');
      }

      const jsonString = jsonMatch[1];
      const parsedJSON = JSON.parse(jsonString);

      // Sanitize common mistakes
      const sanitized = sanitizeTiptapJSON(parsedJSON);

      // Validate against schema
      const validation = validateTiptapJSON(sanitized);

      if (!validation.success) {
        console.error('[Lesson Generator] Validation failed:', validation.error);
        throw new Error(`Invalid Tiptap JSON: ${validation.error?.message}`);
      }

      lessonContent = validation.data!;

      // Validate lesson-specific requirements
      const contentValidation = validateLessonContent(lessonContent);
      if (!contentValidation.valid) {
        console.warn('[Lesson Generator] Content validation warnings:', contentValidation.errors);
        // Continue anyway - these are soft requirements
      }
    } catch (error) {
      console.error('[Lesson Generator] Failed to parse/validate AI response:', error);
      throw new Error(`Failed to generate valid lesson content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 5: Generate lesson title and metadata (85-90%)
    await onProgress?.({
      step: 'creating_lesson',
      percentage: 85,
      message: 'Creating lesson record...',
    });

    // Extract title from first heading or use topic
    const firstHeading = lessonContent.content.find((node: any) => node.type === 'heading');
    const lessonTitle = firstHeading?.content?.[0]?.text || topic;

    // Generate slug
    const lessonSlug = generateLessonSlug(lessonTitle, userId);

    // Calculate stats
    const wordCount = countWordsInTiptap(lessonContent);

    // Create AI metadata
    const aiMetadata: AILessonMetadata = createDefaultAIMetadata({
      model_used: modelName,
      generation_prompt: topic,
      ...createUserMetadataSnapshot(userContext),
      generation_duration_ms: Date.now() - startTime,
      token_usage: {
        prompt: aiResponse.usage?.promptTokens || 0,
        completion: aiResponse.usage?.completionTokens || 0,
        total: aiResponse.usage?.totalTokens || 0,
      },
    });

    // Step 6: Store lesson in database (90-95%)
    const [lesson] = await db
      .insert(lessons)
      .values({
        title: lessonTitle,
        slug: lessonSlug,
        description: `AI-generated lesson on ${topic}`,
        difficulty,
        estimated_duration_sec: finalDuration * 60,
        scope: 'user',
        owner_user_id: userId,
        is_ai_generated: true,
        ai_metadata: aiMetadata,
        is_published: true,
        order_index: 0,
      })
      .returning();

    console.log('[Lesson Generator] Lesson record created:', {
      lessonId: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
    });

    // Step 7: Store lesson content as a single section (95-100%)
    await onProgress?.({
      step: 'storing_content',
      percentage: 95,
      message: 'Saving lesson content...',
    });

    const [section] = await db
      .insert(lesson_sections)
      .values({
        lesson_id: lesson.id,
        order_index: 0,
        slug: 'content',
        title: lessonTitle,
        body_md: '', // Legacy field, leave empty
        body_json: lessonContent,
      })
      .returning();

    console.log('[Lesson Generator] Section created:', {
      sectionId: section.id,
      wordCount,
    });

    // Done!
    await onProgress?.({
      step: 'complete',
      percentage: 100,
      message: 'Lesson ready!',
    });

    const generationTimeMs = Date.now() - startTime;

    console.log('[Lesson Generator] ✅ Lesson generation complete:', {
      lessonId: lesson.id,
      timeMs: generationTimeMs,
      wordCount,
    });

    return {
      lessonId: lesson.id,
      lessonSlug: lesson.slug,
      lessonTitle: lesson.title,
      sectionCount: 1,
      wordCount,
      generationTimeMs,
      tokenUsage: {
        prompt: aiResponse.usage?.promptTokens || 0,
        completion: aiResponse.usage?.completionTokens || 0,
        total: aiResponse.usage?.totalTokens || 0,
      },
      modelUsed: modelName,
    };
  } catch (error) {
    console.error('[Lesson Generator] ❌ Generation failed:', error);
    throw error;
  }
}

/**
 * Generate unique lesson slug
 */
function generateLessonSlug(title: string, userId: number): string {
  // Convert to slug-friendly format
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  // Add user ID and timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${userId}-${timestamp}`;
}

/**
 * Regenerate a lesson section with feedback
 */
export async function regenerateLessonSection(params: {
  lessonId: number;
  sectionId: number;
  feedback: string;
  userId: number;
}): Promise<TiptapDocument> {
  // TODO: Implement section regeneration
  // This would load the existing section, build a regeneration prompt with feedback,
  // call AI again, and update the section
  throw new Error('Section regeneration not yet implemented');
}
