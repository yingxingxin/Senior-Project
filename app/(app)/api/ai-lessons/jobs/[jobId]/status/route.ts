import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getLessonGenerationJobStatus } from '@/lib/queue';

/**
 * GET /api/ai-lessons/jobs/[jobId]/status
 *
 * Polls the status of a lesson generation job.
 * Returns progress, state, and result when completed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;

    // Get job status
    const status = await getLessonGenerationJobStatus(jobId);

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify the job belongs to the authenticated user
    if (status.data?.userId !== Number(session.user.id)) {
      return NextResponse.json(
        { error: 'Forbidden - This job does not belong to you' },
        { status: 403 }
      );
    }

    // Build progress object with early redirect fields if available
    // status.progress from BullMQ can be object | number, so we need to handle both
    const rawProgress = status.progress;
    const progressData = typeof rawProgress === 'object' && rawProgress !== null
      ? rawProgress as Record<string, unknown>
      : {};

    // Return status information
    return NextResponse.json({
      jobId: status.jobId,
      state: status.state, // 'waiting', 'active', 'completed', 'failed', 'delayed'
      progress: {
        percentage: (progressData.percentage as number) ?? 0,
        step: (progressData.step as string) ?? 'waiting',
        message: (progressData.message as string) ?? 'Waiting to start',
        // Include early redirect fields if present
        canRedirect: progressData.canRedirect as boolean | undefined,
        courseSlug: progressData.courseSlug as string | undefined,
        firstLessonSlug: progressData.firstLessonSlug as string | undefined,
        lessonsCompleted: progressData.lessonsCompleted as number | undefined,
        totalLessons: progressData.totalLessons as number | undefined,
      },

      // Include result if completed
      ...(status.state === 'completed' && status.result
        ? {
            result: {
              lessonId: status.result.lessonId,
              lessonSlug: status.result.lessonSlug,
              lessonTitle: status.result.lessonTitle,
              sectionCount: status.result.sectionCount,
              firstSectionSlug: status.result.firstSectionSlug,
              generationTimeMs: status.result.generationTimeMs,
              lessonUrl: `/courses/${status.result.lessonSlug}`,
            }
          }
        : {}),

      // Include error if failed
      ...(status.state === 'failed' && status.error
        ? { error: status.error }
        : {}),

      // Metadata
      topic: status.data?.topic,
      difficulty: status.data?.difficulty,
      createdAt: status.timestamp,
      processedAt: status.processedOn,
      finishedAt: status.finishedOn,

      // Retry information
      ...(status.attemptsMade > 1
        ? { attemptsMade: status.attemptsMade }
        : {}),
    });
  } catch (error) {
    console.error('[AI Lessons Job Status API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
