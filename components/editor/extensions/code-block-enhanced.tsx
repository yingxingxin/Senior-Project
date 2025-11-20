/**
 * Enhanced Code Block Extension for Tiptap
 *
 * Purpose: Syntax-highlighted code blocks with better UX
 *
 * Features:
 * - Language selector attribute (javascript, python, sql, etc.)
 * - Syntax highlighting via lowlight
 * - Optional filename label
 * - Optional line numbers
 * - Copy-to-clipboard button (added in client-side viewer, Phase 4)
 *
 * JSON Structure:
 * {
 *   "type": "codeBlock",
 *   "attrs": {
 *     "language": "javascript",
 *     "filename": "example.js",
 *     "showLineNumbers": true
 *   },
 *   "content": [
 *     {
 *       "type": "text",
 *       "text": "const greeting = 'Hello, World!';\nconsole.log(greeting);"
 *     }
 *   ]
 * }
 *
 * Rendering:
 * - SSR: Renders to <pre><code> structure for syntax highlighting
 * - Data attributes preserve metadata for client-side enhancement
 * - Lowlight provides syntax highlighting classes
 */

import { mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';

// Create lowlight instance with common language support
const lowlight = createLowlight(common);

export interface CodeBlockEnhancedOptions {
  HTMLAttributes: Record<string, unknown>;
  defaultLanguage: string | null;
}

/**
 * Enhanced Code Block Extension
 *
 * Extends the base CodeBlockLowlight extension with:
 * - Filename attribute
 * - Line numbers toggle
 * - Better HTML structure for styling
 */
export const CodeBlockEnhanced = CodeBlockLowlight.extend<CodeBlockEnhancedOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      ...this.parent?.(),
      lowlight,
      HTMLAttributes: {},
      defaultLanguage: null,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const className = element.className;
          const languageMatch = className.match(/language-(\w+)/);
          return languageMatch ? languageMatch[1] : this.options.defaultLanguage;
        },
        renderHTML: (attributes) => {
          if (!attributes.language) {
            return {};
          }
          return {
            class: `language-${attributes.language}`,
          };
        },
      },
      filename: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-filename'),
        renderHTML: (attributes) => {
          if (!attributes.filename) {
            return {};
          }
          return {
            'data-filename': attributes.filename,
          };
        },
      },
      showLineNumbers: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-line-numbers') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.showLineNumbers) {
            return {};
          }
          return {
            'data-line-numbers': 'true',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (element) => {
          if (typeof element === 'string') return false;

          const codeElement = element.querySelector('code');
          if (!codeElement) return false;

          const className = codeElement.className;
          const languageMatch = className.match(/language-(\w+)/);
          const language = languageMatch ? languageMatch[1] : null;

          return {
            language,
            filename: element.getAttribute('data-filename'),
            showLineNumbers: element.getAttribute('data-line-numbers') === 'true',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const preAttrs: Record<string, unknown> = {
      class: 'code-block-enhanced',
    };

    if (node.attrs.filename) {
      preAttrs['data-filename'] = node.attrs.filename;
    }

    if (node.attrs.showLineNumbers) {
      preAttrs['data-line-numbers'] = 'true';
    }

    if (node.attrs.language) {
      preAttrs['data-language'] = node.attrs.language;
    }

    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, preAttrs),
      [
        'code',
        mergeAttributes(HTMLAttributes, {
          class: node.attrs.language ? `language-${node.attrs.language}` : undefined,
        }),
        0,
      ],
    ];
  },
});
