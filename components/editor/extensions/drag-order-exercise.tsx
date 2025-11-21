/**
 * Drag Order Exercise Extension for Tiptap
 *
 * Purpose: Interactive drag-and-drop exercises for ordering items
 *
 * Node Structure:
 * - DragOrderExercise: Container for exercise with instructions
 * - DragOrderItem: Individual draggable item with correct position
 *
 * JSON Example:
 * {
 *   "type": "dragOrderExercise",
 *   "attrs": {
 *     "instructions": "Arrange these steps in the correct order"
 *   },
 *   "content": [
 *     {
 *       "type": "dragOrderItem",
 *       "attrs": { "correctPosition": 0 },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Boil water" }] }]
 *     },
 *     {
 *       "type": "dragOrderItem",
 *       "attrs": { "correctPosition": 1 },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Add tea bag" }] }]
 *     },
 *     {
 *       "type": "dragOrderItem",
 *       "attrs": { "correctPosition": 2 },
 *       "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Steep for 3-5 minutes" }] }]
 *     }
 *   ]
 * }
 *
 * Rendering:
 * - SSR: Static list of items
 * - Client: Hydrates with drag-and-drop functionality and validation
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface DragOrderExerciseOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface DragOrderItemOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * DragOrderExercise Node
 * Container for drag-and-drop ordering exercise
 * Shows instructions and contains draggable items
 */
export const DragOrderExercise = Node.create<DragOrderExerciseOptions>({
  name: 'dragOrderExercise',

  group: 'block',

  content: 'dragOrderItem{2,}',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      instructions: {
        default: 'Arrange these items in the correct order',
        parseHTML: (element) => element.getAttribute('data-instructions'),
        renderHTML: (attributes) => {
          return {
            'data-instructions': attributes.instructions,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-drag-order-exercise]',
      },
      {
        tag: 'div.drag-order-exercise',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'drag-order-exercise',
        'data-drag-order-exercise': '',
        'data-instructions': node.attrs.instructions,
      }),
      [
        'div',
        { class: 'drag-order-instructions' },
        node.attrs.instructions,
      ],
      [
        'div',
        { class: 'drag-order-items' },
        0,
      ],
    ];
  },
});

/**
 * DragOrderItem Node
 * Individual draggable item with correct position index
 * Contains rich content (paragraphs, code, etc.)
 */
export const DragOrderItem = Node.create<DragOrderItemOptions>({
  name: 'dragOrderItem',

  group: 'dragOrderItem',

  content: 'block+',

  defining: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      correctPosition: {
        default: 0,
        parseHTML: (element) => {
          const pos = element.getAttribute('data-correct-position');
          return pos ? parseInt(pos, 10) : 0;
        },
        renderHTML: (attributes) => {
          return {
            'data-correct-position': attributes.correctPosition,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-drag-order-item]',
      },
      {
        tag: 'div.drag-order-item',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'drag-order-item',
        'data-drag-order-item': '',
        'data-correct-position': node.attrs.correctPosition,
        draggable: 'false', // SSR - enabled by client hydration
      }),
      [
        'div',
        { class: 'drag-order-item-handle' },
        '⋮⋮', // Drag handle icon
      ],
      [
        'div',
        { class: 'drag-order-item-content' },
        0,
      ],
    ];
  },
});
