import type { CalloutType } from '@/components/editor/extensions/callout';

/**
 * Generate Tiptap JSON for flip card content
 */
export function generateFlipCardJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'flipCardGroup',
        attrs: { columns: 3 },
        content: [
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Computational Thinking' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Break problems into steps and patterns—transferable to any field.' }] }],
              },
            ],
          },
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Career Opportunities' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Programming skills open doors in every industry.' }] }],
              },
            ],
          },
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automation' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automate repetitive tasks and build tools that save time.' }] }],
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for reading content
 */
export function generateReadingContentJson(title: string, body: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: body }],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for quiz question with multiple choice options
 */
export function generateQuizQuestionJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'quizQuestion',
        attrs: {
          correctOptionId: 'b',
          explanation: 'Variables declared with let have block scope and can be reassigned.',
        },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Which keyword declares a block-scoped variable in JavaScript?' }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'a' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'var' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'b' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'let' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'c' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'const' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'd' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'function' }] }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for drag-and-drop ordering exercise
 */
export function generateDragOrderExerciseJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'dragOrderExercise',
        attrs: {
          instructions: 'Arrange these programming steps in the correct order:',
        },
        content: [
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 0 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '1. Write the code' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 1 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '2. Test the code' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 2 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '3. Debug any errors' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 3 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '4. Deploy to production' }] }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for callout block
 */
export function generateCalloutJson(type: CalloutType, content: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'callout',
        attrs: { type },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: content }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for enhanced code block
 */
export function generateCodeBlockJson(language: string, code: string, filename?: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'codeBlock',
        attrs: {
          language,
          filename: filename || null,
          showLineNumbers: true,
        },
        content: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
    ],
  };
}
