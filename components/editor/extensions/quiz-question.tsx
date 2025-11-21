/**
 * Quiz Question Extension for Tiptap
 *
 * Purpose: Inline quiz questions with multiple choice options
 *
 * Node Structure:
 * - QuizQuestion: Container for question + options
 * - QuizOption: Individual answer choice
 *
 * JSON Example:
 * {
 *   "type": "quizQuestion",
 *   "attrs": {
 *     "correctOptionId": "b",
 *     "explanation": "let declares a block-scoped variable that can be reassigned."
 *   },
 *   "content": [
 *     {
 *       "type": "paragraph",
 *       "content": [{ "type": "text", "text": "What keyword declares a block-scoped variable?" }]
 *     },
 *     {
 *       "type": "quizOption",
 *       "attrs": { "id": "a" },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "var" }] }]
 *     },
 *     {
 *       "type": "quizOption",
 *       "attrs": { "id": "b" },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "let" }] }]
 *     },
 *     {
 *       "type": "quizOption",
 *       "attrs": { "id": "c" },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "const" }] }]
 *     }
 *   ]
 * }
 *
 * Rendering:
 * - SSR: Static HTML structure with radio buttons (disabled)
 * - Client: Hydrates with answer selection and immediate feedback
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface QuizQuestionOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface QuizOptionOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * QuizQuestion Node
 * Container for quiz question text and answer options
 * Tracks correct answer and explanation
 */
export const QuizQuestion = Node.create<QuizQuestionOptions>({
  name: 'quizQuestion',

  group: 'block',

  content: 'paragraph+ quizOption{2,}',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      correctOptionId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-correct-option-id'),
        renderHTML: (attributes) => {
          if (!attributes.correctOptionId) {
            return {};
          }
          return {
            'data-correct-option-id': attributes.correctOptionId,
          };
        },
      },
      explanation: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-explanation'),
        renderHTML: (attributes) => {
          if (!attributes.explanation) {
            return {};
          }
          return {
            'data-explanation': attributes.explanation,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-quiz-question]',
      },
      {
        tag: 'div.quiz-question',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'quiz-question',
        'data-quiz-question': '',
        'data-correct-option-id': node.attrs.correctOptionId,
        'data-explanation': node.attrs.explanation || undefined,
      }),
      0,
    ];
  },
});

/**
 * QuizOption Node
 * Individual answer choice with unique ID
 * Contains rich content (can be formatted text, code, etc.)
 */
export const QuizOption = Node.create<QuizOptionOptions>({
  name: 'quizOption',

  group: 'quizOption',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-option-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-option-id': attributes.id,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'label[data-quiz-option]',
      },
      {
        tag: 'label.quiz-option',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const optionId = node.attrs.id || 'option';

    return [
      'label',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'quiz-option',
        'data-quiz-option': '',
        'data-option-id': node.attrs.id,
      }),
      [
        'input',
        {
          type: 'radio',
          name: 'quiz-answer',
          value: node.attrs.id,
          class: 'quiz-option-input',
          disabled: true, // SSR - enabled by client hydration
        },
      ],
      [
        'div',
        { class: 'quiz-option-content' },
        0,
      ],
    ];
  },
});
