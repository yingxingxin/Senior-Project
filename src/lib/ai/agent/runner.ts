/**
 * AI Agent Runner
 *
 * Main orchestration loop for iterative lesson generation using tools.
 */

import { generateText, stepCountIs } from 'ai';
import { openrouter } from '@/lib/openrouter';
import type { AgentRunResult, ProgressCallback, ToolExecutionContext } from './types';
import { DocumentState } from './document-state';
import { ConversationState } from './conversation-state';
import { getAllTools, isFinalTool, getToolsDescription } from './tool-registry';
import { createCheckpoint, CheckpointManager } from './checkpoints';
import { buildPersonaInstruction } from '../prompts/persona-prompts';
import type { UserPersonalizationContext } from '../personalization';

const MAX_STEPS = 50; // Prevent infinite loops
const CHECKPOINT_INTERVAL = 5; // Save checkpoint every 5 steps

export interface RunAgentParams {
  userId: number;
  topic: string;
  difficulty: 'easy' | 'standard' | 'hard';
  context?: string;
  estimatedDurationMinutes: number;
  userContext: UserPersonalizationContext;
  onProgress?: ProgressCallback;
}

/**
 * Build system prompt for the agent
 */
function buildSystemPrompt(params: RunAgentParams): string {
  const { topic, difficulty, estimatedDurationMinutes, userContext } = params;

  const personaInstruction = buildPersonaInstruction(
    userContext.assistantPersona,
    userContext.assistantName,
    userContext.assistantGender
  );

  const difficultyGuidance = {
    easy: 'Provide thorough, step-by-step explanations. Assume no prior knowledge. Use simple language and many examples.',
    standard: 'Balance explanation with practice. Assume basic understanding. Include some advanced concepts.',
    hard: 'Be concise and technical. Assume strong foundation. Focus on advanced patterns and edge cases.',
  }[difficulty];

  return `You are an expert programming instructor creating a personalized lesson using an iterative, tool-based approach.

${personaInstruction}

LESSON REQUIREMENTS:
- Topic: ${topic}
- Skill Level: ${difficulty}
- Target Duration: ${estimatedDurationMinutes} minutes
- Approach: ${difficultyGuidance}
- Target Word Count: ${estimatedDurationMinutes * 150}-${estimatedDurationMinutes * 200} words

CONTENT STANDARDS:
- Use Tiptap JSON format for all content nodes
- Include h1 heading for lesson title
- Use h2 for main sections, h3 for subsections
- Add code blocks with syntax highlighting (codeBlockEnhanced)
- Include callouts for tips, warnings, and key points
- Add quiz questions to test understanding
- Use flip cards for definitions
- Match ${difficulty} difficulty throughout

${getToolsDescription()}

EXAMPLE TIPTAP NODES:
\`\`\`json
// Heading
{ "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Title" }] }

// Paragraph
{ "type": "paragraph", "content": [{ "type": "text", "text": "Content here" }] }

// Callout
{ "type": "callout", "attrs": { "type": "tip" }, "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Tip content" }] }] }

// Code Block
{ "type": "codeBlockEnhanced", "attrs": { "language": "javascript" }, "content": [{ "type": "text", "text": "const x = 1;" }] }

// Quiz
{ "type": "quizQuestion", "attrs": { "question": "What is X?", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Because..." } }
\`\`\`

CRITICAL WORKFLOW - You MUST complete ALL these steps:

STEP 1: Call "get_user_personalization" to load user preferences
STEP 2: Call "plan" to create lesson structure
STEP 3: **START BUILDING** - Call "apply_diff" to add the lesson title (h1 heading)
STEP 4: **KEEP BUILDING** - Call "apply_diff" repeatedly to add each section:
   - Add section heading (h2)
   - Add paragraphs explaining concepts
   - Add code blocks with examples
   - Add callouts for tips/warnings
   - Add quiz questions to test understanding
   - Add flip cards for definitions
STEP 5: When ALL sections are complete, call "finish_with_summary"

⚠️ CRITICAL: After steps 1-2, you MUST immediately proceed to step 3 and build the FULL lesson content.
⚠️ DO NOT just plan and stop - you must create the actual Tiptap JSON content using apply_diff.
`;
}

/**
 * Run the AI agent
 */
export async function runAgent(params: RunAgentParams): Promise<AgentRunResult> {
  const { userId, topic, context: userContext, onProgress } = params;

  // Initialize states
  const documentState = new DocumentState();
  const conversationState = new ConversationState();
  const checkpointManager = new CheckpointManager();

  // Initialize empty document
  documentState.initialize({ type: 'doc', content: [] });

  // Add initial user message
  const initialMessage = userContext
    ? `Create a lesson about: ${topic}\n\nAdditional context: ${userContext}`
    : `Create a lesson about: ${topic}`;

  conversationState.addUserMessage(initialMessage);

  // Tool execution context
  const toolContext: ToolExecutionContext = {
    documentState,
    conversationState,
  };

  // Step counter ref for tool logging
  const stepRef = { current: 0 };

  // Get all tools
  const tools = getAllTools(toolContext, userId, stepRef);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(params);

  conversationState.setStatus('loading');

  try {
    console.log('[Agent] Starting generation with automatic tool roundtrips');

    // Update progress callback
    if (onProgress) {
      await onProgress({
        step: 'agent_running',
        percentage: 10,
        message: 'AI agent processing...',
        stepNumber: 1,
        totalSteps: 1,
      });
    }

    // Get conversation history
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...conversationState.getMessagesForAI(),
    ];

    // Single call to generateText - SDK handles ALL tool roundtrips automatically with stopWhen
    const response = await generateText({
      model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o'),
      messages,
      tools,
      temperature: 0.7,
      maxSteps: 30, // SDK will loop internally up to 30 times to allow full lesson generation
      stopWhen: stepCountIs(30), // Enable multi-step tool calling - continue until 30 steps or AI stops naturally
    });

    // Log what happened
    console.log('[Agent] Generation complete:', {
      hasText: !!response.text,
      textLength: response.text?.length || 0,
      textPreview: response.text?.substring(0, 200),
      toolCallsInResponse: response.toolCalls?.length || 0,
      responseType: response.finishReason,
    });

    // Detailed diagnostic logging
    console.log('[Agent] Finish reason:', response.finishReason);
    console.log('[Agent] Total steps executed:', response.steps?.length || 0);

    // Log each step detail
    response.steps?.forEach((step, index) => {
      console.log(`[Agent Step ${index} Detail]:`, {
        hasText: !!step.text,
        textLength: step.text?.length || 0,
        toolCallsCount: step.toolCalls?.length || 0,
        toolNames: step.toolCalls?.map(tc => tc.toolName),
        finishReason: step.finishReason,
        // Log the full step object to see all available properties
        fullStep: JSON.stringify(step, null, 2).substring(0, 500),
      });
    });

    // Log token usage (log the entire object to see available properties)
    if (response.usage) {
      console.log('[Agent] Token usage:', response.usage);
    }

    // Log warnings if any
    if (response.warnings && response.warnings.length > 0) {
      console.warn('[Agent] Warnings:', response.warnings);
    }

    // Add final response to conversation
    if (response.text) {
      conversationState.addAiMessage(response.text);
    }

    // Update progress one more time
    if (onProgress) {
      await onProgress({
        step: 'agent_running',
        percentage: 90,
        message: 'Finalizing lesson...',
        stepNumber: 1,
        totalSteps: 1,
      });
    }

    // Mark as idle
    conversationState.setStatus('idle');

    // Get final document
    const finalDocument = documentState.getDocument();
    const finalDocInfo = documentState.getChunkInfo();

    // Log final summary
    console.log(`[Agent] Execution complete:`, {
      success: true,
      documentNodes: documentState.document.content.length,
      documentChars: finalDocInfo.totalCharCount,
      isEmpty: documentState.isEmpty(),
      totalMessages: conversationState.messages.length,
      toolCalls: conversationState.messages.filter((m) => m.type === 'toolCall').length,
      aiMessages: conversationState.messages.filter((m) => m.type === 'ai').length,
    });

    return {
      success: true,
      document: finalDocument,
      summary: response.text || 'Lesson completed',
      stepsExecuted: 1,
      conversationMessages: conversationState.getMessages(),
    };
  } catch (error) {
    conversationState.setStatus('error');

    console.error('[Agent] Error during execution:', error);

    return {
      success: false,
      document: documentState.getDocument(),
      summary: 'Error occurred during generation',
      stepsExecuted: 0,
      conversationMessages: conversationState.getMessages(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
