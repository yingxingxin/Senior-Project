/**
 * Unified AI Service
 *
 * Central service for all AI chat interactions. Handles:
 * - Context-aware system prompt building
 * - Persona-specific responses
 * - OpenRouter API calls via Vercel AI SDK
 */

import { generateText } from 'ai';
import { openrouter } from '@/src/lib/openrouter';
import { PERSONA_STYLES } from '../prompts/persona';
import type { AIContext, AIChatMessage, AIResponse } from './types';
import type { AssistantPersona } from '@/src/db/schema';

/**
 * Build the system prompt from AI context
 */
function buildSystemPrompt(context: AIContext): string {
  const { user, assistant, course, lesson, quiz, quotes } = context;
  const persona = PERSONA_STYLES[assistant.persona];

  // Pronoun helper
  const pronoun =
    assistant.gender === 'feminine' ? 'she' : assistant.gender === 'masculine' ? 'he' : 'they';
  const pronounVerb = pronoun === 'they' ? 'are' : 'is';

  let prompt = `# Your Identity
You are ${assistant.name}, ${persona.description}

## Teaching Style
${persona.tone.map((t) => `- ${t}`).join('\n')}

## Characteristics
- **Pacing**: ${persona.pacing}
- **Encouragement**: ${persona.encouragement}
- **Examples**: ${persona.examples}
- **Language**: ${persona.language}

## User Context
- Name: ${user.name}
- Skill Level: ${user.skillLevel}
- You should adapt your explanations to their ${user.skillLevel} level.
`;

  // Add course context if available (course hierarchy)
  if (course) {
    prompt += `
## Course Context
- **Course**: ${course.title}
- **Progress**: Lesson ${course.lessonIndex + 1} of ${course.totalLessons}
${course.previousLesson ? `- **Previously covered**: ${course.previousLesson}` : ''}
${course.nextLesson ? `- **Up next**: ${course.nextLesson}` : ''}

You can reference what they learned in previous lessons or preview what's coming.
`;
  }

  // Add lesson context if available
  if (lesson) {
    prompt += `
## Current Lesson Context
The user is currently studying:
- **Lesson**: ${lesson.title}
- **Topic**: ${lesson.topic}
${lesson.currentSection ? `- **Section**: ${lesson.currentSection}` : ''}
${lesson.sectionContent ? `\n**Current Content:**\n${lesson.sectionContent}\n` : ''}

When answering questions, relate your responses to this lesson when relevant.
Prioritize helping them understand the current topic.
`;
  }

  // Add quiz context if available
  if (quiz?.question) {
    prompt += `
## Current Quiz Context
The user is working on a quiz question:
- **Quiz**: ${quiz.title}
${quiz.questionIndex !== undefined && quiz.totalQuestions ? `- **Question ${quiz.questionIndex + 1} of ${quiz.totalQuestions}**` : ''}
- **Question**: ${quiz.question.prompt}
- **Options**:
${quiz.question.options.map((o, i) => `  ${i + 1}. ${o}`).join('\n')}
${quiz.question.selectedIndex !== undefined ? `- **User selected**: Option ${quiz.question.selectedIndex + 1}` : ''}

Help them understand the concepts without directly giving away the answer (unless they've already answered).
`;
  }

  // Add user-selected quotes
  if (quotes.length > 0) {
    prompt += `
## User-Highlighted Content
The user has highlighted the following text for discussion:
${quotes.map((q) => `> "${q.text}"\n> _(from ${q.source})_`).join('\n\n')}

Address their questions about this highlighted content.
`;
  }

  // Add off-topic handling based on context and persona
  prompt += `
## Response Guidelines
${buildOffTopicGuidelines(assistant.persona, lesson?.title)}

## Important
- Stay in character as ${assistant.name} throughout
- ${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${pronounVerb} a programming tutor - keep responses focused on programming and learning
- Be helpful, educational, and supportive in your teaching style
`;

  return prompt;
}

/**
 * Build persona-specific off-topic handling guidelines
 */
function buildOffTopicGuidelines(persona: AssistantPersona, lessonTitle?: string): string {
  if (lessonTitle) {
    // In a lesson - redirect to lesson topic
    const responses: Record<AssistantPersona, string> = {
      calm: `If the user asks something unrelated to "${lessonTitle}" or programming, calmly redirect them: "That's outside our current lesson scope. Let's stay focused on what we're learning here."`,
      kind: `If the user asks something unrelated to "${lessonTitle}" or programming, gently redirect them: "That's an interesting question! But let's save that for later - we're making great progress on ${lessonTitle}! What would you like to know about this topic?"`,
      direct: `If the user asks something unrelated to "${lessonTitle}" or programming, redirect them: "Off-topic. We're covering ${lessonTitle}. Questions about that?"`,
    };
    return responses[persona];
  }

  // General chat - keep to programming
  const responses: Record<AssistantPersona, string> = {
    calm: `If the user asks non-programming questions, calmly explain: "I'm here to help you with programming and software development. What coding topic can I help you with?"`,
    kind: `If the user asks non-programming questions, kindly explain: "I'd love to help, but I'm specifically here to teach you programming! What coding questions do you have? I'm excited to help you learn!"`,
    direct: `If the user asks non-programming questions, respond: "I only help with programming. What code do you need help with?"`,
  };
  return responses[persona];
}

/**
 * Generate an AI response given context and messages
 */
export async function generateAIResponse(
  context: AIContext,
  messages: AIChatMessage[]
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(context);

  // Validate API key
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  try {
    const { text, usage } = await generateText({
      model: openrouter('openai/gpt-4o'),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    return {
      message: text,
      model: 'openai/gpt-4o',
      usage: usage && usage.inputTokens !== undefined && usage.outputTokens !== undefined
        ? {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.inputTokens + usage.outputTokens,
          }
        : undefined,
    };
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your OpenRouter configuration.');
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred while generating a response.');
  }
}

// Re-export types for convenience
export type { AIContext, AIChatMessage, AIResponse } from './types';
