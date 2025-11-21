import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { enqueueLessonGeneration } from '@/lib/queue';
import { z } from 'zod';

/**
 * Request schema for lesson generation
 */
const generateLessonSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
  context: z.string().max(2000, 'Context too long').optional(),
  estimatedDurationMinutes: z.number().int().min(5).max(120).optional().default(30),
  languagePreference: z.string().max(50).optional(),
  paradigmPreference: z.string().max(50).optional(),
  triggerSource: z.enum(['manual', 'chat', 'recommendation']).optional().default('manual'),
});

/**
 * POST /api/ai-lessons/generate
 *
 * Enqueues a new AI lesson generation job.
 * Returns a job ID that can be used to poll status.
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
    const validationResult = generateLessonSchema.safeParse(body);

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

    // Enqueue the lesson generation job
    const job = await enqueueLessonGeneration({
      userId,
      topic: data.topic,
      difficulty: data.difficulty,
      context: data.context,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      languagePreference: data.languagePreference,
      paradigmPreference: data.paradigmPreference,
      triggerSource: data.triggerSource,
    });

    console.log(`[AI Lessons API] Job ${job.id} enqueued for user ${userId}: ${data.topic}`);

    // Return job information
    return NextResponse.json({
      jobId: job.id,
      topic: data.topic,
      difficulty: data.difficulty,
      estimatedWaitSeconds: 60, // Estimate based on queue size
      statusUrl: `/api/ai-lessons/jobs/${job.id}/status`,
    }, { status: 202 }); // 202 Accepted
  } catch (error) {
    console.error('[AI Lessons API] Error generating lesson:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
