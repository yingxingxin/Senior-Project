/**
 * Unified AI Chat API
 *
 * Single endpoint for all AI chat interactions.
 * Accepts context (lesson, quiz, quotes) and messages.
 * Auto-populates user and assistant info from session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/src/lib/auth';
import { getUserWithAssistant } from '@/src/db/queries/users';
import { generateAIResponse } from '@/src/lib/ai/service';
import type { AIContext, AIChatMessage } from '@/src/lib/ai/types';
import type { AssistantPersona, SkillLevel } from '@/src/db/schema';

// Request validation schema
const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(10000),
      })
    )
    .min(1)
    .max(50),
  context: z.object({
    lesson: z
      .object({
        id: z.number(),
        title: z.string(),
        topic: z.string(),
        currentSection: z.string().optional(),
        sectionContent: z.string().max(5000).optional(),
      })
      .optional(),
    quiz: z
      .object({
        id: z.number(),
        title: z.string(),
        question: z
          .object({
            id: z.number(),
            prompt: z.string(),
            options: z.array(z.string()),
            selectedIndex: z.number().optional(),
            correctIndex: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
    quotes: z
      .array(
        z.object({
          text: z.string().max(1000),
          source: z.string().max(200),
        })
      )
      .max(5)
      .default([]),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // Fetch user's assistant data
    const [userData] = await getUserWithAssistant.execute({ userId });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.assistant_id || !userData.assistantName) {
      return NextResponse.json(
        { error: 'Assistant not configured. Please complete onboarding.' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { messages, context: clientContext } = validation.data;

    // Build full context with server-side user/assistant data
    const context: AIContext = {
      user: {
        id: userId,
        name: userData.name || 'Learner',
        skillLevel: (userData.skill_level as SkillLevel) || 'beginner',
      },
      assistant: {
        id: userData.assistant_id,
        name: userData.assistantName,
        persona: (userData.assistant_persona as AssistantPersona) || 'calm',
        gender: (userData.assistantGender as 'feminine' | 'masculine' | 'androgynous') || 'androgynous',
      },
      lesson: clientContext.lesson,
      quiz: clientContext.quiz,
      quotes: clientContext.quotes.map((q) => ({
        ...q,
        addedAt: new Date(),
      })),
    };

    // Generate AI response
    const response = await generateAIResponse(context, messages as AIChatMessage[]);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[AI API Error]:', error);

    // Handle known error types
    if (error instanceof Error) {
      // API configuration errors
      if (error.message.includes('API key') || error.message.includes('not configured')) {
        return NextResponse.json(
          { error: 'AI service is not configured. Please contact support.' },
          { status: 500 }
        );
      }

      // Rate limiting
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }

      // Return the error message for other known errors
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unknown errors
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
