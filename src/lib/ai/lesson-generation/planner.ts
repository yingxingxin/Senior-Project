/**
 * Course Planner
 *
 * Simple AI call that returns the course structure only (no content).
 * Used as the first step in parallel lesson generation flow.
 */

import { generateObject } from 'ai';
import { z } from 'zod';
import { openrouter } from '@/src/lib/openrouter';
import type { Difficulty } from '@/src/db/schema';
import type { UserPersonalizationContext } from './personalization';
import { buildPersonaInstruction } from '../prompts';

/**
 * Course plan schema - defines the structure returned by the planner
 */
const CoursePlanSchema = z.object({
  courseTitle: z.string().describe('The main course title (e.g., "Mastering React Hooks")'),
  courseSlug: z.string().describe('URL-friendly slug (lowercase, hyphens only, e.g., "mastering-react-hooks")'),
  description: z.string().describe('Short 1-2 sentence description of the course'),
  lessons: z.array(z.object({
    title: z.string().describe('Lesson title (e.g., "Understanding useState")'),
    slug: z.string().describe('URL-friendly slug (e.g., "understanding-usestate")'),
    description: z.string().describe('Brief description of what this lesson covers'),
    sections: z.array(z.object({
      title: z.string().describe('Section title (e.g., "Introduction")'),
      slug: z.string().describe('URL-friendly slug (e.g., "introduction")'),
      topics: z.array(z.string()).describe('Key topics to cover in this section'),
    })).min(5).max(8).describe('Sections within this lesson (5-8 per lesson)'),
  })).min(4).max(8).describe('Lessons within the course (4-8 lessons)'),
});

export type CoursePlan = z.infer<typeof CoursePlanSchema>;

export interface PlanCourseParams {
  topic: string;
  difficulty: Difficulty;
  estimatedDurationMinutes: number;
  userContext: UserPersonalizationContext;
}

/**
 * Calculate target lesson count based on course duration
 */
function getTargetLessonCount(minutes: number): { min: number; target: number; max: number } {
  if (minutes <= 20) return { min: 4, target: 4, max: 5 };
  if (minutes <= 35) return { min: 5, target: 6, max: 7 };
  if (minutes <= 50) return { min: 6, target: 7, max: 8 };
  return { min: 7, target: 8, max: 8 };
}

/**
 * Plan a course structure without generating content
 *
 * Returns the course hierarchy (lessons and sections) that will be
 * generated in parallel by separate jobs.
 */
export async function planCourse(params: PlanCourseParams): Promise<CoursePlan> {
  const { topic, difficulty, estimatedDurationMinutes, userContext } = params;

  const lessonTargets = getTargetLessonCount(estimatedDurationMinutes);

  const personaInstruction = buildPersonaInstruction(
    userContext.assistantPersona,
    userContext.assistantName,
    userContext.assistantGender
  );

  const difficultyGuidance = {
    easy: 'Assume no prior knowledge. Plan for thorough explanations.',
    standard: 'Assume basic understanding. Balance explanation with practice.',
    hard: 'Assume strong foundation. Focus on advanced patterns.',
  }[difficulty];

  const systemPrompt = `You are an expert programming instructor planning a course structure.

${personaInstruction}

Create a detailed course plan for the following:
- Topic: ${topic}
- Skill Level: ${difficulty}
- Target Duration: ${estimatedDurationMinutes} minutes
- Approach: ${difficultyGuidance}

IMPORTANT REQUIREMENTS:
- Create ${lessonTargets.target} lessons (minimum ${lessonTargets.min}, maximum ${lessonTargets.max})
- Each lesson should have 5-8 sections
- All slugs must be lowercase with hyphens only (no spaces or special characters)
- Each lesson should cover a distinct subtopic
- Sections should be digestible chunks (3-5 minutes each)

SLUG FORMAT:
- Course slug: descriptive (e.g., "mastering-react-hooks")
- Lesson slugs: clear (e.g., "understanding-usestate")
- Section slugs: concise (e.g., "introduction", "examples", "summary")`;

  const result = await generateObject({
    model: openrouter('x-ai/grok-4.1-fast'),
    schema: CoursePlanSchema,
    prompt: systemPrompt,
    temperature: 0.7,
  });

  // Validate and sanitize slugs
  const plan = result.object;

  // Ensure course slug is valid
  plan.courseSlug = sanitizeSlug(plan.courseSlug || generateSlugFromTitle(plan.courseTitle));

  // Ensure all lesson/section slugs are valid
  plan.lessons.forEach((lesson) => {
    lesson.slug = sanitizeSlug(lesson.slug || generateSlugFromTitle(lesson.title));
    lesson.sections.forEach((section) => {
      section.slug = sanitizeSlug(section.slug || generateSlugFromTitle(section.title));
    });
  });

  console.log('[Planner] Course plan created:', {
    courseTitle: plan.courseTitle,
    courseSlug: plan.courseSlug,
    lessonsCount: plan.lessons.length,
    totalSections: plan.lessons.reduce((sum, l) => sum + l.sections.length, 0),
  });

  return plan;
}

/**
 * Sanitize a slug to ensure it's URL-safe
 */
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Generate a slug from a title
 */
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
