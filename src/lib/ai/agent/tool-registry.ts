/**
 * Tool Registry
 *
 * Registers all available tools for use with Vercel AI SDK.
 */

import type { ToolExecutionContext } from './types';
import { createReadTools } from './tools/read-tools';
import { createEditTools } from './tools/edit-tools';
import { createMetaTools } from './tools/meta-tools';

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

**Planning:**
- plan: Create a structured course plan with lessons and sections (ALWAYS use this first)

**Lesson Management (Level 2):**
- create_lesson: Create a new lesson within the course. Lessons appear on the course overview page.

**Section Management (Level 3):**
- create_section: Create a new section within the CURRENT lesson. Sections are what users "Next" through.
- edit_section: Edit the current active section by adding/modifying content.

**Reading & Navigation:**
- read_first_chunk: Start reading the current section from the beginning
- read_next_chunk: Navigate to the next chunk (for large sections)
- read_previous_chunk: Go back to review previous content

**Completion:**
- finish_with_summary: Provide course metadata (title, slug, description) and mark complete (ALWAYS use this last)

3-LEVEL HIERARCHY:
- Level 1: Course (the overall topic, e.g., "Mastering React Hooks")
- Level 2: Lessons (2-4 major topics shown as cards on course page)
- Level 3: Sections (3-5 content chunks per lesson, what users navigate with "Next")

WORKFLOW:
1. Call "plan" to define the hierarchy: lessons with their sections
2. FOR EACH LESSON in your plan:
   a. Call "create_lesson" with title, slug, description
   b. FOR EACH SECTION in that lesson:
      Call "create_section" with title, slug, AND initialContent (recommended)
3. Call "finish_with_summary" with course metadata when ALL lessons and sections complete

SLUG GUIDELINES:
- Course slug: Descriptive (e.g., "mastering-react-hooks")
- Lesson slugs: Clear (e.g., "understanding-usestate", "custom-hooks")
- Section slugs: Short (e.g., "introduction", "examples", "summary")
- Format: lowercase letters, numbers, hyphens only

IMPORTANT:
- You must create a lesson BEFORE creating sections within it
- Each lesson's sections are saved separately to the database
- Build one lesson at a time, completing all its sections before moving to the next
- Use appropriate Tiptap node types (heading, paragraph, callout, codeBlockEnhanced, quizQuestion)
`.trim();
}
