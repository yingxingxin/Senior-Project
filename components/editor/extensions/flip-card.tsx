/**
 * Flip Card Extension for Tiptap
 *
 * Purpose: Interactive flip cards for "Why it matters" sections and key concepts
 *
 * Node Structure:
 * - FlipCardGroup: Container for multiple flip cards
 * - FlipCard: Individual card with front/back sides
 * - FlipCardFront: Front side content
 * - FlipCardBack: Back side content
 *
 * JSON Example:
 * {
 *   "type": "flipCardGroup",
 *   "attrs": { "columns": 3 },
 *   "content": [
 *     {
 *       "type": "flipCard",
 *       "content": [
 *         {
 *           "type": "flipCardFront",
 *           "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Computational Thinking" }] }]
 *         },
 *         {
 *           "type": "flipCardBack",
 *           "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Break problems into steps..." }] }]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * Rendering:
 * - SSR: Static HTML structure with data attributes
 * - Client: Hydrates with flip animation and completion tracking
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface FlipCardGroupOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface FlipCardOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface FlipCardFrontOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface FlipCardBackOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * FlipCardGroup Node
 * Container for multiple flip cards with column layout control
 */
export const FlipCardGroup = Node.create<FlipCardGroupOptions>({
  name: 'flipCardGroup',

  group: 'block',

  content: 'flipCard+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      columns: {
        default: 3,
        parseHTML: (element) => {
          const cols = element.getAttribute('data-columns');
          return cols ? parseInt(cols, 10) : 3;
        },
        renderHTML: (attributes) => {
          return {
            'data-columns': attributes.columns,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-flip-card-group]',
      },
      {
        tag: 'div.flip-card-group',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'flip-card-group',
        'data-flip-card-group': '',
        'data-columns': node.attrs.columns,
      }),
      0,
    ];
  },
});

/**
 * FlipCard Node
 * Individual card with front and back content
 * Must contain exactly one FlipCardFront and one FlipCardBack
 */
export const FlipCard = Node.create<FlipCardOptions>({
  name: 'flipCard',

  group: 'flipCard',

  content: 'flipCardFront flipCardBack',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-flip-card]',
      },
      {
        tag: 'div.flip-card',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'flip-card',
        'data-flip-card': '',
      }),
      [
        'div',
        { class: 'flip-card-inner' },
        0,
      ],
    ];
  },
});

/**
 * FlipCardFront Node
 * Front side of the card (initially visible)
 * Contains rich content (paragraphs, headings, etc.)
 */
export const FlipCardFront = Node.create<FlipCardFrontOptions>({
  name: 'flipCardFront',

  group: 'flipCardFront',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-flip-card-front]',
      },
      {
        tag: 'div.flip-card-front',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'flip-card-front',
        'data-flip-card-front': '',
      }),
      0,
    ];
  },
});

/**
 * FlipCardBack Node
 * Back side of the card (visible after flip)
 * Contains rich content (paragraphs, headings, etc.)
 */
export const FlipCardBack = Node.create<FlipCardBackOptions>({
  name: 'flipCardBack',

  group: 'flipCardBack',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-flip-card-back]',
      },
      {
        tag: 'div.flip-card-back',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'flip-card-back',
        'data-flip-card-back': '',
      }),
      0,
    ];
  },
});
