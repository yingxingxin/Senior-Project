/**
 * Tool Registry
 *
 * Registers all available tools and converts them for use with Vercel AI SDK.
 */

import { tool } from 'ai';
import type { AgentTool, ToolExecutionContext } from './types';
import { readTools } from './tools/read-tools';
import { editTools } from './tools/edit-tools';
import { metaTools } from './tools/meta-tools';
import { getUserPersonalizationTool } from '../tools/personalization-tool';

/**
 * Convert our AgentTool format to Vercel AI SDK tool format
 */
function convertToAITool(agentTool: AgentTool, context: ToolExecutionContext) {
  return tool({
    description: agentTool.description,
    parameters: agentTool.parameters,
    execute: async (args: any) => {
      const result = await agentTool.execute(args, context);
      return result.result; // Return the string result for AI
    },
  });
}

/**
 * Get all tools configured for AI SDK
 */
export function getAllTools(context: ToolExecutionContext, userId: number) {
  const allAgentTools: Record<string, AgentTool> = {
    ...readTools,
    ...editTools,
    ...metaTools,
  };

  // Convert to AI SDK format
  const aiTools: Record<string, any> = {};

  for (const [name, agentTool] of Object.entries(allAgentTools)) {
    aiTools[name] = convertToAITool(agentTool, context);
  }

  // Add personalization tool
  aiTools.get_user_personalization = getUserPersonalizationTool(userId);

  return aiTools;
}

/**
 * Get tool by name
 */
export function getTool(toolName: string, context: ToolExecutionContext): AgentTool | null {
  const allTools: Record<string, AgentTool> = {
    ...readTools,
    ...editTools,
    ...metaTools,
  };

  return allTools[toolName] || null;
}

/**
 * Check if a tool is a final tool (ends execution)
 */
export function isFinalTool(toolName: string, context: ToolExecutionContext): boolean {
  const toolDef = getTool(toolName, context);
  return toolDef?.isFinal === true;
}

/**
 * Get tool execution context description for system prompt
 */
export function getToolsDescription(): string {
  return `
AVAILABLE TOOLS:

**Planning & Organization:**
- plan: Create a structured outline before building content (ALWAYS use this first)
- ask_user: Ask clarifying questions (will use defaults for now)

**Reading & Navigation:**
- read_first_chunk: Start reading the document from the beginning
- read_next_chunk: Navigate to the next chunk (for large documents)
- read_previous_chunk: Go back to review previous content

**Editing & Building:**
- apply_diff: Add content to the document incrementally
  - Use beforeContent to locate where to insert
  - Use insertContent with Tiptap JSON nodes
  - Can delete content with deleteContent parameter
- replace_document: Replace entire document at once (use sparingly)

**Completion:**
- finish_with_summary: Mark lesson as complete with statistics (ALWAYS use this last)
- get_user_personalization: Get user's learning preferences and history

WORKFLOW:
1. Call "get_user_personalization" to understand the learner
2. Call "plan" to create lesson structure
3. Call "read_first_chunk" to see current document state
4. Call "apply_diff" multiple times to build content section by section
5. Call "finish_with_summary" when done

IMPORTANT NOTES:
- ALWAYS create a plan first
- Build content incrementally with apply_diff
- Use appropriate Tiptap node types (heading, paragraph, callout, codeBlockEnhanced, quizQuestion, etc.)
- ALWAYS finish with a summary
`.trim();
}
