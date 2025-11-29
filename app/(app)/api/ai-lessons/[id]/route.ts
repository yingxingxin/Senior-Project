import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import {
  getAILessonById,
  canUserAccessAILesson,
  updateAILesson,
  deleteAILesson,
} from '@/src/db/queries';
import { z } from 'zod';

/**
 * Request schema for lesson updates
 */
const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

/**
 * GET /api/ai-lessons/[id]
 *
 * Retrieves an AI-generated lesson with all sections.
 * Access control based on lesson scope and ownership.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const lessonId = Number(id);

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Check access permission
    const canAccess = await canUserAccessAILesson(lessonId, userId);
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this lesson' },
        { status: 403 }
      );
    }

    // Get lesson with sections
    const lesson = await getAILessonById(lessonId);

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        estimatedDurationSec: lesson.estimatedDurationSec,
        scope: lesson.scope,
        isOwner: lesson.ownerUserId === userId,
        aiMetadata: lesson.aiMetadata,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        sections: lesson.sections,
      },
    });
  } catch (error) {
    console.error('[AI Lessons API] Error fetching lesson:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai-lessons/[id]
 *
 * Updates an AI-generated lesson's title or description.
 * Only the owner can update their lessons.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const lessonId = Number(id);

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Verify ownership
    const lesson = await getAILessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.ownerUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own lessons' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateLessonSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Update lesson
    const [updatedLesson] = await updateAILesson(lessonId, updates);

    return NextResponse.json({
      lesson: {
        id: updatedLesson.id,
        slug: updatedLesson.slug,
        title: updatedLesson.title,
        description: updatedLesson.description,
        updatedAt: updatedLesson.updated_at,
      },
    });
  } catch (error) {
    console.error('[AI Lessons API] Error updating lesson:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-lessons/[id]
 *
 * Deletes an AI-generated lesson and all its sections.
 * Only the owner can delete their lessons.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { id } = await params;
    const lessonId = Number(id);

    if (isNaN(lessonId)) {
      return NextResponse.json({ error: 'Invalid lesson ID' }, { status: 400 });
    }

    // Verify ownership
    const lesson = await getAILessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.ownerUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own lessons' },
        { status: 403 }
      );
    }

    // Delete lesson
    await deleteAILesson(lessonId, userId);

    return NextResponse.json({
      message: 'Lesson deleted successfully',
      lessonId,
    });
  } catch (error) {
    console.error('[AI Lessons API] Error deleting lesson:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
