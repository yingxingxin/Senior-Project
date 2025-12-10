/**
 * AI Quiz Generation
 *
 * Generates quizzes from AI course content using AI.
 */

import { generateText } from 'ai';
import { openrouter } from '@/src/lib/openrouter';
import { db } from '@/src/db';
import { quizzes, quiz_questions, lessons } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { extractTextFromTiptap, prepareSectionContent } from '../chat/utils';
import { getLessonWithSections } from '@/src/db/queries/lessons';
import type { JSONContent } from '@tiptap/core';

export interface GenerateQuizParams {
  userId: number;
  courseId: number;
  courseTitle: string;
  courseSlug: string;
  courseLessons: Array<{
    id: number;
    slug: string;
    title: string;
    description: string | null;
  }>;
  quizType: 'comprehensive' | 'quick-review' | 'specific-lesson';
  quizLength: number;
  lessonId?: number;
}

export interface GenerateQuizResult {
  quizId: number;
  slug: string;
  title: string;
}

/**
 * Generate a quiz from course content
 */
export async function generateQuizFromCourse(
  params: GenerateQuizParams
): Promise<GenerateQuizResult> {
  const { userId, courseId, courseTitle, courseSlug, courseLessons, quizType, quizLength, lessonId } = params;

  // Determine which lessons to use for quiz generation
  let lessonsToUse = courseLessons;
  if (quizType === 'specific-lesson' && lessonId) {
    lessonsToUse = courseLessons.filter(l => l.id === lessonId);
    if (lessonsToUse.length === 0) {
      throw new Error('Specified lesson not found in course');
    }
  }

  // Fetch all section content for the lessons
  const lessonContents: Array<{
    lessonId: number;
    lessonTitle: string;
    content: string;
  }> = [];

  for (const lesson of lessonsToUse) {
    const rows = await getLessonWithSections.execute({ lessonSlug: lesson.slug });
    
    if (rows.length === 0) continue;

    // Extract text from all sections
    const sectionTexts = rows
      .filter(r => r.sectionId)
      .map(r => {
        const bodyJson = r.sectionBodyJson as JSONContent | undefined;
        const bodyMd = r.sectionBodyMd as string | undefined;
        return prepareSectionContent(bodyJson, bodyMd, 5000); // Get more content for quiz generation
      })
      .filter(Boolean);

    if (sectionTexts.length > 0) {
      lessonContents.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        content: sectionTexts.join('\n\n'),
      });
    }
  }

  if (lessonContents.length === 0) {
    throw new Error('No content found in selected lessons');
  }

  // Build prompt for AI quiz generation
  const contentSummary = lessonContents
    .map(lc => `## ${lc.lessonTitle}\n${lc.content.substring(0, 3000)}...`)
    .join('\n\n');

  const quizTypeDescription = {
    'comprehensive': 'comprehensive quiz covering all concepts from the entire course',
    'quick-review': 'quick review quiz focusing on key concepts and fundamentals',
    'specific-lesson': `focused quiz on the specific lesson: ${lessonsToUse[0]?.title}`,
  }[quizType];

  const prompt = `You are an expert quiz creator. Generate ${quizLength} multiple-choice questions based on the following course content.

Course: ${courseTitle}
Quiz Type: ${quizTypeDescription}
Number of Questions: ${quizLength}

Course Content:
${contentSummary}

Generate exactly ${quizLength} multiple-choice questions. Each question must:
1. Have a clear, specific prompt
2. Have exactly 4 answer options
3. Have one clearly correct answer
4. Include a brief explanation for why the correct answer is right

Format your response as JSON array with this structure:
[
  {
    "prompt": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why the correct answer is right"
  },
  ...
]

Return ONLY the JSON array, no other text.`;

  // Generate quiz questions using AI
  const { text } = await generateText({
    model: openrouter('x-ai/grok-4.1-fast'),
    prompt,
    temperature: 0.7,
    maxOutputTokens: 4000,
  });

  // Parse the JSON response
  let questions: Array<{
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;

  try {
    // Try to extract JSON from the response (might have markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    questions = JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to generate valid quiz questions');
  }

  // Validate questions
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions generated');
  }

  // Limit to requested length
  questions = questions.slice(0, quizLength);

  // Validate each question
  for (const q of questions) {
    if (!q.prompt || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error('Invalid question format generated');
    }
    if (q.correctIndex < 0 || q.correctIndex > 3) {
      throw new Error('Invalid correct index');
    }
  }

  // Generate unique slug
  const baseSlug = `${courseSlug}-quiz-${nanoid(8)}`;
  const quizSlug = await ensureUniqueSlug(baseSlug);

  // Get course difficulty to determine skill level
  const [courseRecord] = await db
    .select({ difficulty: lessons.difficulty })
    .from(lessons)
    .where(eq(lessons.id, courseId))
    .limit(1);

  // Map difficulty to skill level, default to beginner
  const difficultyToSkillLevel: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    easy: 'beginner',
    standard: 'intermediate',
    hard: 'advanced',
  };
  
  const skillLevel = courseRecord?.difficulty 
    ? (difficultyToSkillLevel[courseRecord.difficulty] || 'beginner')
    : 'beginner';

  // Create quiz record
  const [quiz] = await db
    .insert(quizzes)
    .values({
      slug: quizSlug,
      title: `${courseTitle} - ${quizType === 'comprehensive' ? 'Comprehensive' : quizType === 'quick-review' ? 'Quick Review' : 'Lesson'} Quiz`,
      description: `AI-generated ${quizTypeDescription} based on ${courseTitle}`,
      topic_slug: courseSlug.replace(/-/g, '_'),
      skill_level: skillLevel,
      default_length: quizLength,
      is_ai_generated: true,
      owner_user_id: userId,
    })
    .returning();

  // Create quiz questions
  await db.insert(quiz_questions).values(
    questions.map((q, index) => ({
      quiz_id: quiz.id,
      order_index: index,
      prompt: q.prompt,
      options: q.options,
      correct_index: q.correctIndex,
      explanation: q.explanation || null,
    }))
  );

  return {
    quizId: quiz.id,
    slug: quiz.slug,
    title: quiz.title,
  };
}

/**
 * Ensure quiz slug is unique
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const [existing] = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(eq(quizzes.slug, slug))
      .limit(1);

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${nanoid(4)}`;
    attempts++;
  }

  throw new Error('Failed to generate unique quiz slug');
}

