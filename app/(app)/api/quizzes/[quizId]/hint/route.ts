import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { getQuizQuestionById, getUserWithAssistant } from '@/src/db/queries';
import { openrouter } from '@/src/lib/openrouter';
import { generateText } from 'ai';
import { z } from 'zod';

const hintRequestSchema = z.object({
  questionId: z.number(),
  selectedIndex: z.number().min(0).max(3).optional(),
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
    const validation = hintRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { questionId, selectedIndex } = validation.data;

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

    // Build persona-based system prompt
    const personaPrompts = {
      calm: 'You are a calm and patient teaching assistant. Provide gentle guidance without revealing the answer directly.',
      kind: 'You are a kind and encouraging teaching assistant. Be supportive and helpful while guiding the learner.',
      direct: 'You are a direct and straightforward teaching assistant. Be clear and concise in your guidance.',
    };

    const systemPrompt = `${personaPrompts[userData.assistant_persona as keyof typeof personaPrompts]}

Your task is to provide a helpful hint for a quiz question. The hint should:
- NOT directly reveal the correct answer
- Help the learner think through the problem
- Rephrase the question or concept if needed
- Optionally eliminate one obviously wrong option
- Be encouraging and supportive

Keep the hint brief (1-2 sentences maximum).`;

    // Build user prompt
    let userPrompt = `Question: ${question.prompt}\n\nOptions:\n${question.options
      .map((opt, idx) => `${idx + 1}. ${opt}`)
      .join('\n')}`;

    if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < question.options.length) {
      userPrompt += `\n\nThe learner has selected option ${selectedIndex + 1}: "${question.options[selectedIndex]}".`;
    }

    userPrompt += '\n\nProvide a helpful hint without revealing the answer.';

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Quiz Hint API] OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Generate hint using OpenRouter
    const { text: hint } = await generateText({
      model: openrouter('openai/gpt-4o'),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('[Quiz Hint API] Error:', error);
    
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
        error: 'Failed to generate hint',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

