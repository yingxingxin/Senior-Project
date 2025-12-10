import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { generateQuizFromCourse } from '@/src/lib/ai/quiz-generation';
import { db } from '@/src/db';
import { lessons } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getLessonsByCourse } from '@/src/db/queries/lessons';

/**
 * Request schema for quiz generation
 */
const generateQuizSchema = z.object({
  courseId: z.number().int().positive('Course ID is required'),
  quizType: z.enum(['comprehensive', 'quick-review', 'specific-lesson']),
  quizLength: z.number().int().min(5).max(20),
  lessonId: z.number().int().positive().optional(),
});

/**
 * POST /api/quizzes/generate
 *
 * Generates a quiz from an AI course.
 * Returns the generated quiz slug.
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = generateQuizSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify the course exists and belongs to the user
    const [course] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, data.courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (!course.is_ai_generated || course.owner_user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only generate quizzes from your own AI courses' },
        { status: 403 }
      );
    }

    // Get course lessons
    const courseLessons = await getLessonsByCourse.execute({
      courseId: data.courseId,
    });

    if (courseLessons.length === 0) {
      return NextResponse.json(
        { error: 'Course has no lessons yet' },
        { status: 400 }
      );
    }

    // Generate the quiz
    const result = await generateQuizFromCourse({
      userId,
      courseId: data.courseId,
      courseTitle: course.title,
      courseSlug: course.slug,
      courseLessons: courseLessons.map(l => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        description: l.description,
      })),
      quizType: data.quizType,
      quizLength: data.quizLength,
      lessonId: data.lessonId,
    });

    console.log(`[Quiz Generation] Generated quiz ${result.slug} for user ${userId} from course ${course.title}`);

    return NextResponse.json({
      slug: result.slug,
      title: result.title,
      quizId: result.quizId,
    }, { status: 201 });
  } catch (error) {
    console.error('[Quiz Generation API] Error generating quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

