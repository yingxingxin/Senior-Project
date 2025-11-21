/**
 * Custom AI Tools for Tiptap Document Building
 *
 * These tools enable the AI to build Tiptap documents iteratively,
 * similar to Tiptap's AI Agent but using Vercel AI SDK directly.
 */

import { tool } from 'ai';
import { z } from 'zod';
import type { TiptapDocument } from '../tiptap-schema';

/**
 * Document state maintained during generation
 */
export interface DocumentState {
  content: TiptapDocument | null;
  plan: string | null;
  currentStep: number;
  totalSteps: number;
}

/**
 * Create a plan for the lesson structure
 */
export const createPlanTool = tool({
  description: 'Create a structured plan for the lesson before building content. Use this first to outline sections and topics.',
  parameters: z.object({
    sections: z.array(z.object({
      title: z.string().describe('Section title'),
      topics: z.array(z.string()).describe('Key topics to cover in this section'),
      interactiveElements: z.array(z.enum(['callout', 'codeBlock', 'quiz', 'flipCard', 'dragOrder'])).describe('Interactive elements to include'),
    })).describe('Ordered list of lesson sections'),
    estimatedDuration: z.number().describe('Estimated duration in minutes'),
  }),
  execute: async ({ sections, estimatedDuration }) => {
    const planMarkdown = sections.map((section, i) =>
      `## ${i + 1}. ${section.title}\n` +
      `Topics: ${section.topics.join(', ')}\n` +
      `Interactive: ${section.interactiveElements.join(', ')}`
    ).join('\n\n');

    return {
      success: true,
      plan: planMarkdown,
      totalSteps: sections.length,
      message: `Created plan with ${sections.length} sections (${estimatedDuration} min)`,
    };
  },
});

/**
 * Initialize an empty Tiptap document
 */
export const initializeDocumentTool = tool({
  description: 'Initialize an empty Tiptap document to start building the lesson.',
  parameters: z.object({}),
  execute: async () => {
    const emptyDoc: TiptapDocument = {
      type: 'doc',
      content: [],
    };

    return {
      success: true,
      document: emptyDoc,
      message: 'Initialized empty document',
    };
  },
});

/**
 * Add a heading to the document
 */
export const addHeadingTool = tool({
  description: 'Add a heading (h1, h2, or h3) to the document.',
  parameters: z.object({
    level: z.enum(['1', '2', '3']).describe('Heading level (1 for main title, 2 for sections, 3 for subsections)'),
    text: z.string().describe('Heading text'),
  }),
  execute: async ({ level, text }) => {
    const heading = {
      type: 'heading',
      attrs: { level: parseInt(level) },
      content: [{ type: 'text', text }],
    };

    return {
      success: true,
      node: heading,
      message: `Added h${level} heading: "${text}"`,
    };
  },
});

/**
 * Add a paragraph with text
 */
export const addParagraphTool = tool({
  description: 'Add a paragraph of text to the document. Can include bold, italic, or code formatting.',
  parameters: z.object({
    text: z.string().describe('Paragraph text'),
    formatting: z.array(z.object({
      type: z.enum(['bold', 'italic', 'code']),
      start: z.number().describe('Start position in text'),
      end: z.number().describe('End position in text'),
    })).optional().describe('Text formatting marks'),
  }),
  execute: async ({ text, formatting }) => {
    const textNode: any = { type: 'text', text };

    if (formatting && formatting.length > 0) {
      textNode.marks = formatting.map(f => ({ type: f.type }));
    }

    const paragraph = {
      type: 'paragraph',
      content: [textNode],
    };

    return {
      success: true,
      node: paragraph,
      message: `Added paragraph (${text.length} chars)`,
    };
  },
});

/**
 * Add a callout box (tip, warning, info, or error)
 */
export const addCalloutTool = tool({
  description: 'Add a callout box for tips, warnings, important info, or errors.',
  parameters: z.object({
    type: z.enum(['tip', 'warning', 'info', 'error']).describe('Callout type'),
    title: z.string().optional().describe('Optional callout title'),
    content: z.string().describe('Callout content text'),
  }),
  execute: async ({ type, title, content }) => {
    const callout = {
      type: 'callout',
      attrs: { type },
      content: [
        ...(title ? [{
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: title }],
        }] : []),
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }],
        },
      ],
    };

    return {
      success: true,
      node: callout,
      message: `Added ${type} callout${title ? `: "${title}"` : ''}`,
    };
  },
});

/**
 * Add a code block
 */
export const addCodeBlockTool = tool({
  description: 'Add a code block with syntax highlighting.',
  parameters: z.object({
    language: z.string().describe('Programming language (e.g., javascript, python, typescript)'),
    code: z.string().describe('Code content'),
    filename: z.string().optional().describe('Optional filename'),
  }),
  execute: async ({ language, code, filename }) => {
    const codeBlock = {
      type: 'codeBlockEnhanced',
      attrs: {
        language,
        ...(filename && { filename }),
      },
      content: [{ type: 'text', text: code }],
    };

    return {
      success: true,
      node: codeBlock,
      message: `Added ${language} code block${filename ? ` (${filename})` : ''}`,
    };
  },
});

/**
 * Add a flip card for definitions or Q&A
 */
export const addFlipCardTool = tool({
  description: 'Add a flip card with a front (question/term) and back (answer/definition).',
  parameters: z.object({
    front: z.string().describe('Front of card (term or question)'),
    back: z.string().describe('Back of card (definition or answer)'),
  }),
  execute: async ({ front, back }) => {
    const flipCard = {
      type: 'flipCard',
      attrs: {
        front,
        back,
      },
    };

    return {
      success: true,
      node: flipCard,
      message: `Added flip card: "${front.substring(0, 30)}..."`,
    };
  },
});

/**
 * Add a quiz question
 */
export const addQuizTool = tool({
  description: 'Add a multiple choice quiz question with 4 options.',
  parameters: z.object({
    question: z.string().describe('Quiz question text'),
    options: z.array(z.string()).length(4).describe('Four answer options'),
    correctIndex: z.number().min(0).max(3).describe('Index of correct answer (0-3)'),
    explanation: z.string().describe('Explanation of the correct answer'),
  }),
  execute: async ({ question, options, correctIndex, explanation }) => {
    const quiz = {
      type: 'quizQuestion',
      attrs: {
        question,
        options,
        correctAnswer: correctIndex,
        explanation,
      },
    };

    return {
      success: true,
      node: quiz,
      message: `Added quiz: "${question.substring(0, 40)}..."`,
    };
  },
});

/**
 * Finalize and validate the document
 */
export const finalizeDocumentTool = tool({
  description: 'Finalize the lesson document and provide a summary. Use this when the lesson is complete.',
  parameters: z.object({
    summary: z.string().describe('Summary of what was created'),
    wordCount: z.number().describe('Approximate word count'),
  }),
  execute: async ({ summary, wordCount }) => {
    return {
      success: true,
      completed: true,
      summary,
      wordCount,
      message: `Lesson completed: ${summary}`,
    };
  },
});

/**
 * All available tools for lesson generation
 */
export const tiptapTools = {
  create_plan: createPlanTool,
  initialize_document: initializeDocumentTool,
  add_heading: addHeadingTool,
  add_paragraph: addParagraphTool,
  add_callout: addCalloutTool,
  add_code_block: addCodeBlockTool,
  add_flip_card: addFlipCardTool,
  add_quiz: addQuizTool,
  finalize_document: finalizeDocumentTool,
} as const;
