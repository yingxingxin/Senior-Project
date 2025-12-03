import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import {
  getQuizById,
  getQuizQuestions,
  createQuizAttempt,
  createQuizAttemptAnswer,
  deleteQuizProgress,
} from '@/src/db/queries';
import { insertActivityEvent } from '@/src/db/queries/activities';
import { z } from 'zod';

const submitRequestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number(),
      selectedIndex: z.number().min(0).max(3),
    })
  ),
});

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
    const body = await req.json();

    // Validate request body
    const validation = submitRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { answers } = validation.data;

    // Get quiz (verify it exists)
    const quizIdNum = Number(quizId);
    if (isNaN(quizIdNum)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const [quiz] = await getQuizById.execute({ quizId: quizIdNum });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get all questions for the quiz to validate answers
    const allQuestions = await getQuizQuestions.execute({ quizId: quiz.id });
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    // Validate all answers reference valid questions
    for (const answer of answers) {
      if (!questionMap.has(answer.questionId)) {
        return NextResponse.json(
          { error: `Question ${answer.questionId} not found in this quiz` },
          { status: 400 }
        );
      }
    }

    // Calculate score
    let score = 0;
    const questionResults: Array<{
      questionId: number;
      isCorrect: boolean;
      correctIndex: number;
      userIndex: number;
      explanation?: string | null;
    }> = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId)!;
      const isCorrect = answer.selectedIndex === question.correctIndex;
      if (isCorrect) {
        score++;
      }

      questionResults.push({
        questionId: answer.questionId,
        isCorrect,
        correctIndex: question.correctIndex,
        userIndex: answer.selectedIndex,
        explanation: question.explanation,
      });
    }

    const totalQuestions = answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Create quiz attempt
    const [attempt] = await createQuizAttempt.execute({
      userId,
      quizId: quiz.id,
      score,
      totalQuestions,
      percentage,
    });

    // Create attempt answers
    for (const answer of answers) {
      await createQuizAttemptAnswer.execute({
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
      });
    }

    // Clear saved progress since quiz is now completed
    await deleteQuizProgress.execute({
      userId,
      quizId: quiz.id,
    });

    // Record activity event for quiz submission
    const pointsEarned = score * 10; // 10 points per correct answer
    await insertActivityEvent.execute({
      userId,
      eventType: 'quiz_submitted',
      pointsDelta: pointsEarned,
      lessonId: null,
      quizId: quiz.id,
      quizAttemptId: attempt.id,
      achievementId: null,
    });

    // If perfect score, record additional achievement event
    if (score === totalQuestions) {
      await insertActivityEvent.execute({
        userId,
        eventType: 'quiz_perfect',
        pointsDelta: 20, // Bonus points for perfect score
        lessonId: null,
        quizId: quiz.id,
        quizAttemptId: attempt.id,
        achievementId: null,
      });
    }

    return NextResponse.json({
      score,
      total: totalQuestions,
      percentage,
      questionResults,
    });
  } catch (error) {
    console.error('[Quiz Submit API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit quiz',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

