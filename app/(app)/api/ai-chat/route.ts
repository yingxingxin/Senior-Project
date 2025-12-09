import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/src/lib/auth';
import { buildPersonaInstruction } from '@/src/lib/ai/prompts/persona';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('OpenRouter API key not configured. Chat will not work.');
}

// Use one default engine for all models
const DEFAULT_ENGINE = 'openai/gpt-4o';

// Model to persona mapping
const MODEL_PERSONA_MAP: Record<string, 'calm' | 'kind' | 'direct'> = {
  'nova': 'kind',
  'atlas': 'direct',
  'sage': 'calm',
};

// Model name mapping for display
const MODEL_NAMES: Record<string, string> = {
  'nova': 'Nova',
  'atlas': 'Atlas',
  'sage': 'Sage',
};

export type SupportedModel = 'nova' | 'atlas' | 'sage';

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
 * Model name determines the persona, not the user's assistant settings
 */
function buildChatSystemPrompt(
  modelName: string,
  modelPersona: 'calm' | 'kind' | 'direct'
): string {
  const assistantName = MODEL_NAMES[modelName] || modelName;
  const gender = modelName === 'nova' ? 'feminine' : modelName === 'atlas' ? 'masculine' : 'androgynous';
  
  // Get persona-specific instructions
  const personaInstruction = buildPersonaInstruction(modelPersona, assistantName, gender);
  
  // Build rejection messages based on persona
  const rejectionMessages = {
    calm: "I understand you're asking about something outside of programming. I'm here specifically to help you learn programming concepts, solve coding problems, and understand software development. Let's focus on that instead.",
    kind: "I'd love to help, but I'm specifically designed to assist with programming and learning about software development! I'm here to help you understand coding concepts, debug issues, and learn new programming skills. What programming topic can I help you with?",
    direct: "I only help with programming and software development questions. What do you need help with in your code?",
  };
  
  const rejectionMessage = rejectionMessages[modelPersona];

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

2. **Stay in Character**: Maintain your persona's tone (${modelPersona}) in all responses, including rejections. You are ${assistantName}, and your personality should match your model's characteristics.

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

    const body = (await request.json()) as ChatRequest;
    const { messages, model = 'nova', temperature = 0.7, max_tokens = 1000 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get persona based on model selection
    const modelPersona = MODEL_PERSONA_MAP[model] || 'kind';

    // Build system prompt with model-based persona
    const systemPrompt = buildChatSystemPrompt(model, modelPersona);

    // Use default engine for all models
    const openrouterModel = DEFAULT_ENGINE;

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
