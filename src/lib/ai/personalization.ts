/**
 * Personalization Engine
 *
 * Loads user profile, progress, and preferences to personalize AI-generated lessons.
 * Infers language/paradigm from learning history when not explicitly set.
 */

import { db } from '@/db';
import { eq, desc, and } from 'drizzle-orm';
import { users, assistants, user_lesson_progress, lessons } from '@/db/schema';
import type { AssistantPersona, SkillLevel } from '@/db/schema';

export interface UserPersonalizationContext {
  // User identity
  userId: number;
  userName: string;

  // Assistant persona
  assistantId: number;
  assistantName: string;
  assistantGender: string;
  assistantPersona: AssistantPersona;

  // Skill level
  skillLevel: SkillLevel;

  // Inferred preferences
  languagePreference?: string;
  paradigmPreference?: string;

  // Learning history stats
  completedLessonsCount: number;
  averageCompletionTimeMinutes?: number;
  recentTopics: string[];
}

/**
 * Load complete user personalization context
 *
 * @param userId - User ID
 * @returns Personalization context with all user data
 */
export async function loadUserPersonalizationContext(
  userId: number
): Promise<UserPersonalizationContext> {
  // Load user with assistant data
  const userWithAssistant = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      assistant: true,
    },
  });

  if (!userWithAssistant) {
    throw new Error(`User ${userId} not found`);
  }

  if (!userWithAssistant.assistant) {
    throw new Error(`User ${userId} has no assistant assigned`);
  }

  // Load user progress for learning history
  const userProgress = await db.query.user_lesson_progress.findMany({
    where: and(eq(user_lesson_progress.user_id, userId), eq(user_lesson_progress.is_completed, true)),
    orderBy: [desc(user_lesson_progress.completed_at)],
    limit: 20, // Last 20 completed lessons
    with: {
      lesson: true,
    },
  });

  // Calculate stats
  const completedLessonsCount = userProgress.length;

  const completionTimes = userProgress
    .filter((p) => p.started_at && p.completed_at)
    .map((p) => {
      const start = new Date(p.started_at!).getTime();
      const end = new Date(p.completed_at!).getTime();
      return (end - start) / (1000 * 60); // minutes
    });

  const averageCompletionTimeMinutes =
    completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : undefined;

  // Extract recent topics
  const recentTopics = userProgress.slice(0, 5).map((p) => p.lesson.title);

  // Infer language preference
  const languagePreference = inferLanguagePreference(userProgress);

  // Infer paradigm preference
  const paradigmPreference = inferParadigmPreference(userProgress);

  return {
    userId: userWithAssistant.id,
    userName: userWithAssistant.name,
    assistantId: userWithAssistant.assistant.id,
    assistantName: userWithAssistant.assistant.name,
    assistantGender: userWithAssistant.assistant.gender || 'androgynous',
    assistantPersona: userWithAssistant.assistant_persona || 'calm',
    skillLevel: userWithAssistant.skill_level || 'beginner',
    languagePreference,
    paradigmPreference,
    completedLessonsCount,
    averageCompletionTimeMinutes,
    recentTopics,
  };
}

/**
 * Infer programming language preference from learning history
 *
 * Looks for language mentions in lesson titles/descriptions
 */
function inferLanguagePreference(
  progress: Array<{ lesson: { title: string; description: string | null } }>
): string | undefined {
  const languages = ['javascript', 'python', 'java', 'typescript', 'cpp', 'rust', 'go', 'ruby', 'php'];

  const languageCounts: Record<string, number> = {};

  progress.forEach(({ lesson }) => {
    const text = `${lesson.title} ${lesson.description || ''}`.toLowerCase();

    languages.forEach((lang) => {
      // Handle variations (e.g., "C++" vs "cpp")
      const variations = lang === 'cpp' ? ['c++', 'cpp'] : [lang];

      variations.forEach((variant) => {
        if (text.includes(variant)) {
          languageCounts[lang] = (languageCounts[lang] || 0) + 1;
        }
      });
    });
  });

  // Return most common language
  const entries = Object.entries(languageCounts);
  if (entries.length === 0) {
    return undefined;
  }

  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

/**
 * Infer programming paradigm preference from learning history
 *
 * Looks for paradigm-related keywords in lesson content
 */
function inferParadigmPreference(
  progress: Array<{ lesson: { title: string; description: string | null } }>
): string | undefined {
  const paradigmKeywords = {
    oop: ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'oop'],
    functional: ['function', 'pure', 'immutable', 'map', 'reduce', 'filter', 'closure', 'functional'],
    procedural: ['procedure', 'procedural', 'sequential'],
  };

  const paradigmScores: Record<string, number> = {
    oop: 0,
    functional: 0,
    procedural: 0,
  };

  progress.forEach(({ lesson }) => {
    const text = `${lesson.title} ${lesson.description || ''}`.toLowerCase();

    Object.entries(paradigmKeywords).forEach(([paradigm, keywords]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          paradigmScores[paradigm]++;
        }
      });
    });
  });

  // Return highest scoring paradigm if score > 0
  const entries = Object.entries(paradigmScores).filter(([, score]) => score > 0);
  if (entries.length === 0) {
    return undefined;
  }

  entries.sort(([, a], [, b]) => b - a);
  return entries[0][0];
}

/**
 * Generate user-specific metadata for lesson
 *
 * Creates a snapshot of user's state at generation time
 */
export function createUserMetadataSnapshot(context: UserPersonalizationContext) {
  return {
    persona_snapshot: context.assistantPersona,
    skill_level_snapshot: context.skillLevel,
    language_preference: context.languagePreference,
    paradigm_preference: context.paradigmPreference,
    completed_lessons_count: context.completedLessonsCount,
    recent_topics: context.recentTopics.slice(0, 3), // Top 3
  };
}

/**
 * Estimate appropriate lesson duration based on user history
 */
export function estimateLessonDuration(
  context: UserPersonalizationContext,
  requestedMinutes?: number
): number {
  // If user has completed lessons, use their average
  if (context.averageCompletionTimeMinutes && context.completedLessonsCount >= 3) {
    return Math.round(context.averageCompletionTimeMinutes);
  }

  // If duration requested, use that
  if (requestedMinutes) {
    return requestedMinutes;
  }

  // Default by skill level
  const defaultDurations: Record<SkillLevel, number> = {
    beginner: 25, // Beginners need more time
    intermediate: 20,
    advanced: 15, // Advanced learners move faster
  };

  return defaultDurations[context.skillLevel];
}
