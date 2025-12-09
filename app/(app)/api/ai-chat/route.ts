import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/src/lib/auth';
import { getUserWithAssistant } from '@/src/db/queries/users';
import { buildPersonaInstruction } from '@/src/lib/ai/prompts/persona';
import type { AssistantPersona } from '@/src/db/schema';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('OpenRouter API key not configured. Chat will not work.');
}

// Supported models - OpenRouter supports many models, mapping to OpenRouter model IDs
const SUPPORTED_MODELS: Record<string, string> = {
  'nova': 'openai/gpt-4o-mini', // Using mini as free alternative to nova
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
};

export type SupportedModel = 'nova' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: SupportedModel;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Build system prompt for AI chat assistant
 * Enforces strict programming/learning focus and uses persona-based tone
 */
function buildChatSystemPrompt(
  assistantName: string,
  assistantGender: string | null,
  persona: AssistantPersona | null
): string {
  const defaultPersona: AssistantPersona = persona || 'calm';
  const gender = assistantGender || 'androgynous';
  
  // Get persona-specific instructions
  const personaInstruction = buildPersonaInstruction(defaultPersona, assistantName, gender);
  
  // Build rejection messages based on persona
  const rejectionMessages = {
    calm: "I understand you're asking about something outside of programming. I'm here specifically to help you learn programming concepts, solve coding problems, and understand software development. Let's focus on that instead.",
    kind: "I'd love to help, but I'm specifically designed to assist with programming and learning about software development! I'm here to help you understand coding concepts, debug issues, and learn new programming skills. What programming topic can I help you with?",
    direct: "I only help with programming and software development questions. What do you need help with in your code?",
  };
  
  const rejectionMessage = rejectionMessages[defaultPersona];

  return `${personaInstruction}

# Your Role: Programming Learning Assistant

You are ${assistantName}, a dedicated programming tutor and learning assistant. Your SOLE purpose is to help users learn programming, understand coding concepts, solve programming problems, and improve their software development skills.

## STRICT SCOPE RESTRICTIONS

You MUST ONLY respond to questions related to:
- Programming languages (Python, JavaScript, TypeScript, Java, C++, etc.)
- Software development concepts (algorithms, data structures, design patterns, etc.)
- Coding problems and debugging
- Programming best practices and techniques
- Software engineering principles
- Development tools and workflows
- Technical explanations of code
- Learning programming concepts

You MUST NOT respond to questions about:
- General knowledge unrelated to programming
- Personal advice or life questions
- Non-technical topics (sports, weather, news, etc.)
- Topics outside software development
- Questions that don't relate to learning programming

## Response Guidelines

1. **Strict Enforcement**: If a user asks a question that is NOT related to programming or learning about software development, you MUST politely redirect them using this message (adjust tone based on your persona):

   "${rejectionMessage}"

2. **Stay in Character**: Maintain your persona's tone (${defaultPersona}) in all responses, including rejections.

3. **Be Helpful**: When answering programming questions, provide clear, educational responses that match your teaching style.

4. **Encourage Learning**: Focus on helping users understand concepts, not just giving answers.

Remember: You are a programming tutor, not a general-purpose assistant. Stay focused on your educational mission.`;
}

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Get user session and assistant info
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    
    // Fetch user's assistant data
    const [userData] = await getUserWithAssistant.execute({ userId });
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const assistantName = userData.assistantName || 'Assistant';
    const assistantGender = userData.assistantGender || 'androgynous';
    const persona = (userData.assistant_persona as AssistantPersona | null) || 'calm';

    const body = (await request.json()) as ChatRequest;
    const { messages, model = 'nova', temperature = 0.7, max_tokens = 1000 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build system prompt with persona and strict restrictions
    const systemPrompt = buildChatSystemPrompt(assistantName, assistantGender, persona);

    // Map user's model selection to OpenRouter model ID
    const openrouterModel = SUPPORTED_MODELS[model] || SUPPORTED_MODELS['nova'];

    // Prepare messages with system prompt
    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(msg => msg.role !== 'system'), // Remove any existing system messages
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Senior Project Chat',
      },
      body: JSON.stringify({
        model: openrouterModel,
        messages: apiMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenRouter API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to get response from OpenRouter' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json(
        { error: 'Invalid response from OpenRouter' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: data.choices[0].message.content,
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
