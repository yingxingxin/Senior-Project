/**
 * AI Agent Runner
 *
 * Main orchestration loop for iterative lesson generation using tools.
 */

import { generateText } from 'ai';
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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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
    beginner: 'Provide thorough, step-by-step explanations. Assume no prior knowledge. Use simple language and many examples.',
    intermediate: 'Balance explanation with practice. Assume basic understanding. Include some advanced concepts.',
    advanced: 'Be concise and technical. Assume strong foundation. Focus on advanced patterns and edge cases.',
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

BEGIN by calling "get_user_personalization" and "plan", then build content iteratively with "apply_diff".
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

  // Get all tools
  const tools = getAllTools(toolContext, userId);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(params);

  // Agent loop
  let stepCount = 0;
  let isFinished = false;
  let finalSummary = '';

  conversationState.setStatus('loading');

  try {
    while (!isFinished && stepCount < MAX_STEPS) {
      stepCount++;

      // Update progress
      if (onProgress) {
        await onProgress({
          step: 'agent_running',
          percentage: Math.min(10 + (stepCount / MAX_STEPS) * 80, 90),
          message: `Agent step ${stepCount}/${MAX_STEPS}`,
          stepNumber: stepCount,
          totalSteps: MAX_STEPS,
        });
      }

      // Save checkpoint periodically
      if (stepCount % CHECKPOINT_INTERVAL === 0) {
        const checkpoint = createCheckpoint(conversationState, documentState, {
          step: stepCount,
        });
        checkpointManager.save(checkpoint);
      }

      // Get conversation history
      const messages = [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        ...conversationState.getMessagesForAI(),
      ];

      // Call AI with tools
      const response = await generateText({
        model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o'),
        messages,
        tools,
        temperature: 0.7,
        maxTokens: 4000,
      });

      // Add AI response text if present
      if (response.text) {
        conversationState.addAiMessage(response.text);
      }

      // Process tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const { toolName, toolCallId, args } = toolCall;

          // Record tool call in conversation
          conversationState.addToolCall(toolName, toolCallId, args);

          // Execute tool
          try {
            // Tool execution is handled by AI SDK automatically
            // We just need to track if it's a final tool
            if (isFinalTool(toolName, toolContext)) {
              isFinished = true;
              finalSummary = conversationState.metadata.finalSummary?.summary || 'Lesson completed';
            }

            // Tool result will be added automatically by AI SDK in next iteration
          } catch (error) {
            console.error(`[Agent] Tool execution error for ${toolName}:`, error);
            conversationState.addToolCallResult(
              toolName,
              toolCallId,
              `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              true
            );
          }
        }
      } else {
        // No tool calls - AI is done
        isFinished = true;
      }

      // Safety check - if no progress, break
      if (stepCount > 5 && documentState.isEmpty()) {
        console.warn('[Agent] No document content generated after 5 steps');
        isFinished = true;
      }
    }

    // Mark as idle
    conversationState.setStatus('idle');

    // Get final document
    const finalDocument = documentState.getDocument();

    return {
      success: true,
      document: finalDocument,
      summary: finalSummary || `Lesson created in ${stepCount} steps`,
      stepsExecuted: stepCount,
      conversationMessages: conversationState.getMessages(),
    };
  } catch (error) {
    conversationState.setStatus('error');

    console.error('[Agent] Error during execution:', error);

    return {
      success: false,
      document: documentState.getDocument(),
      summary: 'Error occurred during generation',
      stepsExecuted: stepCount,
      conversationMessages: conversationState.getMessages(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
