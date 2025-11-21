/**
 * Tool Registry
 *
 * Registers all available tools for use with Vercel AI SDK.
 */

import type { ToolExecutionContext } from './types';
import { createReadTools } from './tools/read-tools';
import { createEditTools } from './tools/edit-tools';
import { createMetaTools } from './tools/meta-tools';
import { getUserPersonalizationTool } from '../tools/personalization-tool';

/**
 * Wrap a tool to log its execution results
 */
function wrapToolWithLogging(toolName: string, tool: any, stepRef: { current: number }) {
  const originalExecute = tool.execute;

  tool.execute = async (...args: any[]) => {
    const startTime = Date.now();
    try {
      const result = await originalExecute(...args);
      const duration = Date.now() - startTime;

      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
      console.log(`[Agent Step ${stepRef.current}] Tool result for ${toolName}:`, {
        success: true,
        duration: `${duration}ms`,
        result: resultStr.substring(0, 300) + (resultStr.length > 300 ? '...' : ''),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Agent Step ${stepRef.current}] Tool error for ${toolName}:`, {
        success: false,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  return tool;
}

/**
 * Get all tools configured for AI SDK
 */
export function getAllTools(context: ToolExecutionContext, userId: number, stepRef: { current: number }) {
  const tools = {
    // Read tools
    ...createReadTools(context),
    // Edit tools
    ...createEditTools(context),
    // Meta tools
    ...createMetaTools(context),
    // Personalization tool
    get_user_personalization: getUserPersonalizationTool(userId),
  };

  // Wrap all tools with logging
  const wrappedTools: any = {};
  for (const [name, tool] of Object.entries(tools)) {
    wrappedTools[name] = wrapToolWithLogging(name, tool, stepRef);
  }

  return wrappedTools;
}

/**
 * Check if a tool is a final tool (ends execution)
 */
export function isFinalTool(toolName: string): boolean {
  return toolName === 'finish_with_summary';
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
