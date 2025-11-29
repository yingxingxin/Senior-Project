/**
 * Server-Safe Tiptap Extensions
 *
 * Lightweight versions of custom extensions for server-side use.
 * These define only the schema structure needed for HTML → JSON parsing,
 * without browser-specific dependencies like CodeBlockLowlight.
 *
 * Used by:
 * - markdown-parser.ts (parseMarkdownToTiptap)
 * - Worker processes that run in Node.js
 */

import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';

/**
 * Callout Extension (Server-Safe)
 * Defines schema for callout blocks: :::type\nContent\n:::
 */
export const CalloutServer = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      type: {
        default: 'tip',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-callout-type') || 'tip',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['div', { 'data-callout': '', 'data-callout-type': HTMLAttributes.type }, 0];
  },
});

/**
 * CodeBlock Extension (Server-Safe)
 * Uses basic CodeBlock instead of CodeBlockLowlight to avoid browser deps.
 * The client-side viewer will still get proper syntax highlighting.
 */
export const CodeBlockServer = CodeBlock.extend({
  name: 'codeBlock',

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-language'),
      },
      filename: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-filename'),
      },
      showLineNumbers: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-show-line-numbers') === 'true',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'pre',
      {
        'data-language': HTMLAttributes.language,
        'data-filename': HTMLAttributes.filename,
        'data-show-line-numbers': HTMLAttributes.showLineNumbers,
      },
      ['code', {}, 0],
    ];
  },
});

/**
 * Flip Card Group Extension (Server-Safe)
 */
export const FlipCardGroupServer = Node.create({
  name: 'flipCardGroup',
  group: 'block',
  content: 'flipCard+',

  parseHTML() {
    return [{ tag: 'div[data-flip-card-group]' }];
  },

  renderHTML() {
    return ['div', { 'data-flip-card-group': '' }, 0];
  },
});

/**
 * Flip Card Extension (Server-Safe)
 */
export const FlipCardServer = Node.create({
  name: 'flipCard',
  group: 'block',
  content: 'flipCardFront flipCardBack',

  parseHTML() {
    return [{ tag: 'div[data-flip-card]' }];
  },

  renderHTML() {
    return ['div', { 'data-flip-card': '' }, 0];
  },
});

/**
 * Flip Card Front Extension (Server-Safe)
 */
export const FlipCardFrontServer = Node.create({
  name: 'flipCardFront',
  content: 'block+',

  parseHTML() {
    return [{ tag: 'div[data-flip-card-front]' }];
  },

  renderHTML() {
    return ['div', { 'data-flip-card-front': '' }, 0];
  },
});

/**
 * Flip Card Back Extension (Server-Safe)
 */
export const FlipCardBackServer = Node.create({
  name: 'flipCardBack',
  content: 'block+',

  parseHTML() {
    return [{ tag: 'div[data-flip-card-back]' }];
  },

  renderHTML() {
    return ['div', { 'data-flip-card-back': '' }, 0];
  },
});

/**
 * Quiz Question Extension (Server-Safe)
 *
 * Content rule matches client: paragraph(s) FIRST, then 2+ quizOption nodes
 */
export const QuizQuestionServer = Node.create({
  name: 'quizQuestion',
  group: 'block',
  content: 'paragraph+ quizOption+',
  defining: true,

  addAttributes() {
    return {
      correctOptionId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-correct-option-id'),
      },
      explanation: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-explanation'),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-quiz-question]' },
      { tag: 'div.quiz-question' },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'div',
      {
        'data-quiz-question': '',
        class: 'quiz-question',
        'data-correct-option-id': HTMLAttributes.correctOptionId,
        'data-explanation': HTMLAttributes.explanation,
      },
      0,
    ];
  },
});

/**
 * Quiz Option Extension (Server-Safe)
 *
 * Matches client: group 'quizOption', content 'block+', attribute 'id'
 */
export const QuizOptionServer = Node.create({
  name: 'quizOption',
  group: 'quizOption',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-option-id'),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'label[data-quiz-option]' },
      { tag: 'label.quiz-option' },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'label',
      {
        'data-quiz-option': '',
        class: 'quiz-option',
        'data-option-id': HTMLAttributes.id,
      },
      0,
    ];
  },
});

/**
 * Get all extensions for server-side parsing
 */
export function getServerExtensions() {
  return [
    StarterKit.configure({
      // Disable codeBlock from StarterKit since we use our custom one
      codeBlock: false,
    }),
    CalloutServer,
    CodeBlockServer,
    FlipCardGroupServer,
    FlipCardServer,
    FlipCardFrontServer,
    FlipCardBackServer,
    QuizQuestionServer,
    QuizOptionServer,
  ];
}
