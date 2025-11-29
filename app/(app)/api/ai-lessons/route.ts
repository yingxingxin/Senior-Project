import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getUserAILessons } from '@/src/db/queries';

/**
 * GET /api/ai-lessons
 *
 * Retrieves all AI-generated lessons for the authenticated user.
 * Includes progress information and metadata.
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // Get limit from query params (default 50, max 100)
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(
      Number(searchParams.get('limit') || '50'),
      100
    );

    // Get user's AI lessons
    const lessons = await getUserAILessons(userId, limit);

    return NextResponse.json({
      lessons: lessons.map(lesson => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        difficulty: lesson.difficulty,
        estimatedDurationSec: lesson.estimatedDurationSec,
        scope: lesson.scope,
        createdAt: lesson.createdAt,

        // AI metadata
        aiMetadata: lesson.aiMetadata,

        // Progress info
        progress: {
          isStarted: !!lesson.startedAt,
          isCompleted: lesson.isCompleted || false,
          startedAt: lesson.startedAt,
          lastAccessedAt: lesson.lastAccessedAt,
        },

        // Links
        viewUrl: `/lessons/${lesson.slug}`,
        apiUrl: `/api/ai-lessons/${lesson.id}`,
      })),
      total: lessons.length,
    });
  } catch (error) {
    console.error('[AI Lessons API] Error listing lessons:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
