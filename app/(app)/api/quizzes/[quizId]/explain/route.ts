import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getQuizQuestionById, getUserWithAssistant } from '@/src/db/queries';
import { openrouter } from '@/src/lib/openrouter';
import { generateText } from 'ai';
import { z } from 'zod';

const explainRequestSchema = z.object({
  questionId: z.number(),
  userSelectedIndex: z.number().min(0).max(3),
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
    const validation = explainRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { questionId, userSelectedIndex } = validation.data;

    // Get question
    const [question] = await getQuizQuestionById.execute({ questionId });
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Verify question belongs to quiz
    if (question.quizId !== Number(quizId)) {
      return NextResponse.json({ error: 'Question does not belong to this quiz' }, { status: 400 });
    }

    // Get user's assistant
    const [userData] = await getUserWithAssistant.execute({ userId });
    if (!userData?.assistantName || !userData?.assistant_persona) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    const isCorrect = userSelectedIndex === question.correctIndex;
    const userAnswer = question.options[userSelectedIndex];
    const correctAnswer = question.options[question.correctIndex];

    // Build persona-based system prompt
    const personaPrompts = {
      calm: 'You are a calm and patient teaching assistant. Provide clear, thorough explanations that help the learner understand the concept.',
      kind: 'You are a kind and encouraging teaching assistant. Be supportive while explaining concepts clearly and thoroughly.',
      direct: 'You are a direct and straightforward teaching assistant. Be clear, concise, and thorough in your explanations.',
    };

    const systemPrompt = `${personaPrompts[userData.assistant_persona as keyof typeof personaPrompts]}

Your task is to explain a quiz question and its answer. Provide a clear, educational explanation that helps the learner understand:
- Why the correct answer is correct
- Why the incorrect answer (if provided) is wrong
- The underlying concept or principle
- How to approach similar questions in the future

Keep the explanation focused and educational (3-5 sentences).`;

    // Build user prompt
    let userPrompt = `Question: ${question.prompt}\n\nOptions:\n${question.options
      .map((opt, idx) => `${idx + 1}. ${opt}`)
      .join('\n')}\n\n`;

    if (isCorrect) {
      userPrompt += `The learner selected the correct answer: "${userAnswer}". Explain why this is correct and reinforce the concept.`;
    } else {
      userPrompt += `The learner selected: "${userAnswer}" (incorrect). The correct answer is: "${correctAnswer}". Explain why the correct answer is right, why the selected answer is wrong, and help them understand the concept.`;
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Quiz Explain API] OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Generate explanation using OpenRouter
    const { text: explanation } = await generateText({
      model: openrouter('openai/gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 300,
    });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('[Quiz Explain API] Error:', error);
    
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
        error: 'Failed to generate explanation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

