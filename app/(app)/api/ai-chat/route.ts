import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
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

    // Map user's model selection to OpenRouter model ID
    const openrouterModel = SUPPORTED_MODELS[model] || SUPPORTED_MODELS['nova'];

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
        messages: messages.map(msg => ({
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
