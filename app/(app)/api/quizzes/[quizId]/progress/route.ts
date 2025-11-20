import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getUserQuizProgress, saveQuizProgress as saveQuizProgressFn, deleteQuizProgress } from '@/src/db/queries';
import { z } from 'zod';

const saveProgressSchema = z.object({
  answers: z.record(z.string(), z.number().min(0).max(3)),
});

// GET - Load saved progress
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const quizIdNum = Number(quizId);

    if (isNaN(quizIdNum)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const [progress] = await getUserQuizProgress.execute({
      userId,
      quizId: quizIdNum,
    });

    if (!progress) {
      return NextResponse.json({ answers: {} });
    }

    // Convert string keys to numbers
    const answers: Record<number, number> = {};
    for (const [key, value] of Object.entries(progress.answers)) {
      answers[Number(key)] = value;
    }

    return NextResponse.json({ answers });
  } catch (error) {
    console.error('[Quiz Progress API] Error loading progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to load progress',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST - Save progress
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const quizIdNum = Number(quizId);
    const body = await req.json();

    if (isNaN(quizIdNum)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    // Validate request body
    const validation = saveProgressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { answers } = validation.data;

    // Convert string keys to numbers
    const numericAnswers: Record<number, number> = {};
    for (const [key, value] of Object.entries(answers)) {
      numericAnswers[Number(key)] = value;
    }

    // Save progress
    await saveQuizProgressFn(userId, quizIdNum, numericAnswers);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Quiz Progress API] Error saving progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to save progress',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Clear saved progress (after completion)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const quizIdNum = Number(quizId);

    if (isNaN(quizIdNum)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    await deleteQuizProgress.execute({
      userId,
      quizId: quizIdNum,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Quiz Progress API] Error deleting progress:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete progress',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

