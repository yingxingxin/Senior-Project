import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getQuizById, getQuizQuestions, getUserWithAssistant } from '@/src/db/queries';
import { openrouter } from '@/src/lib/openrouter';
import { generateText } from 'ai';
import { z } from 'zod';

const summaryRequestSchema = z.object({
  questionResults: z.array(
    z.object({
      questionId: z.number(),
      isCorrect: z.boolean(),
      userIndex: z.number().min(0).max(3),
      correctIndex: z.number().min(0).max(3),
    })
  ),
  score: z.number(),
  total: z.number(),
  percentage: z.number(),
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
    const validation = summaryRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { questionResults, score, total, percentage } = validation.data;

    // Get quiz
    const quizIdNum = Number(quizId);
    if (isNaN(quizIdNum)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const [quiz] = await getQuizById.execute({ quizId: quizIdNum });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get user's assistant
    const [userData] = await getUserWithAssistant.execute({ userId });
    if (!userData?.assistantName || !userData?.assistant_persona) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    // Get all questions
    const allQuestions = await getQuizQuestions.execute({ quizId: quiz.id });
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    // Build persona-based system prompt
    const personaPrompts = {
      calm: 'You are a calm and patient teaching assistant. Provide thoughtful, encouraging feedback that helps the learner understand their strengths and areas for improvement.',
      kind: 'You are a kind and encouraging teaching assistant. Be supportive and positive while providing constructive feedback on what to focus on.',
      direct: 'You are a direct and straightforward teaching assistant. Be clear and concise in your feedback, focusing on actionable insights.',
    };

    const systemPrompt = `${personaPrompts[userData.assistant_persona as keyof typeof personaPrompts]}

Your task is to provide a helpful summary of the quiz results. The summary should:
- Acknowledge the learner's performance (score: ${score}/${total}, ${percentage}%)
- Highlight what they did well
- Identify key areas or concepts to focus on for improvement
- Be encouraging and supportive
- Reference specific question topics if relevant

Keep the summary focused and actionable (3-5 sentences).`;

    // Build user prompt with quiz context
    const incorrectQuestions = questionResults.filter((r) => !r.isCorrect);
    const correctCount = questionResults.filter((r) => r.isCorrect).length;

    let userPrompt = `Quiz: ${quiz.title}\n`;
    userPrompt += `Topic: ${quiz.topicSlug}\n`;
    userPrompt += `Skill Level: ${quiz.skillLevel}\n\n`;
    userPrompt += `Results: ${score} out of ${total} correct (${percentage}%)\n\n`;

    if (incorrectQuestions.length > 0) {
      userPrompt += `Questions that were answered incorrectly:\n`;
      for (const result of incorrectQuestions.slice(0, 5)) {
        // Limit to first 5 incorrect questions to avoid token limits
        const question = questionMap.get(result.questionId);
        if (question) {
          const userAnswer = question.options[result.userIndex];
          const correctAnswer = question.options[result.correctIndex];
          userPrompt += `- "${question.prompt}"\n`;
          userPrompt += `  Selected: "${userAnswer}" (Correct: "${correctAnswer}")\n`;
        }
      }
      if (incorrectQuestions.length > 5) {
        userPrompt += `\n... and ${incorrectQuestions.length - 5} more incorrect questions.\n`;
      }
    }

    userPrompt += `\nProvide a helpful summary focusing on what concepts to review and practice.`;

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Quiz Summary API] OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Generate summary using OpenRouter
    const { text: summary } = await generateText({
      model: openrouter('openai/gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 300,
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[Quiz Summary API] Error:', error);

    // Handle specific OpenRouter API errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenRouter configuration.' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

