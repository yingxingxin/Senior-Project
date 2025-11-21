/**
 * Callout Extension for Tiptap
 *
 * Purpose: Highlight important information with visual styling and icons
 *
 * Supported types:
 * - tip: Helpful suggestions (primary color, lightbulb icon)
 * - warning: Important caveats (yellow, warning triangle icon)
 * - note: Additional context (purple, note icon)
 * - info: Informational callouts (muted, info icon)
 * - success: Positive reinforcement (green, check icon)
 * - error: Common mistakes to avoid (destructive, X icon)
 *
 * JSON Structure:
 * {
 *   "type": "callout",
 *   "attrs": {
 *     "type": "tip"
 *   },
 *   "content": [
 *     {
 *       "type": "paragraph",
 *       "content": [...]
 *     }
 *   ]
 * }
 *
 * Rendering:
 * - SSR: Renders to semantic HTML with data attributes
 * - Styled via global CSS using design system colors
 * - Icons added via CSS pseudo-elements or content
 */

import { Node, mergeAttributes } from '@tiptap/core';

export type CalloutType = 'tip' | 'warning' | 'note' | 'info' | 'success' | 'error';

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: (attributes?: { type: CalloutType }) => ReturnType;
      /**
       * Toggle a callout node
       */
      toggleCallout: (attributes?: { type: CalloutType }) => ReturnType;
      /**
       * Unset a callout node
       */
      unsetCallout: () => ReturnType;
    };
  }
}

/**
 * Callout Extension
 *
 * Renders as a div with callout class and data-type attribute
 * Styling is handled by global CSS in globals.css
 */
export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-type') || 'info',
        renderHTML: (attributes) => {
          return {
            'data-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="tip"]',
        attrs: { type: 'tip' },
      },
      {
        tag: 'div[data-type="warning"]',
        attrs: { type: 'warning' },
      },
      {
        tag: 'div[data-type="note"]',
        attrs: { type: 'note' },
      },
      {
        tag: 'div[data-type="info"]',
        attrs: { type: 'info' },
      },
      {
        tag: 'div[data-type="success"]',
        attrs: { type: 'success' },
      },
      {
        tag: 'div[data-type="error"]',
        attrs: { type: 'error' },
      },
      {
        tag: 'div.callout',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;
          const type = element.getAttribute('data-type');
          return type ? { type } : { type: 'info' };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || 'info';

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `callout callout-${type}`,
        'data-type': type,
      }),
      ['div', { class: 'callout-content' }, 0],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
