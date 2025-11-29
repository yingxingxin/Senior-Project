/**
 * Markdown Parser for AI-Generated Content
 *
 * Converts extended Markdown to Tiptap JSON.
 * Includes preprocessing for custom syntax:
 * - Callouts: :::type\nContent\n:::
 * - Flip Cards: ???Front\nBack???
 * - Quizzes: [quiz: Question | A | B* | C | D]\nExplanation
 *
 * Strategy:
 * 1. Preprocess custom syntax to HTML
 * 2. Convert standard Markdown to HTML using marked
 * 3. Use @tiptap/html's generateJSON to convert HTML to Tiptap JSON
 *
 * Usage:
 *   const json = parseMarkdownToTiptap(markdownString);
 *   // Store json in database as body_json
 */

import { generateJSON } from '@tiptap/html/server';
import type { JSONContent } from '@tiptap/core';
import { marked } from 'marked';

// Import server-safe extensions (no browser dependencies)
import { getServerExtensions } from './extensions';

// Configure marked for GFM
marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Pre-process markdown to convert custom syntax to HTML that Tiptap can parse
 *
 * This is a workaround because @tiptap/markdown's custom tokenizers require
 * the full editor to be running. Instead, we convert our custom syntax to
 * HTML before parsing.
 */
function preprocessMarkdown(markdown: string): string {
  let processed = markdown;

  // Convert callouts: :::type\nContent\n::: → <div data-type="type" class="callout">...</div>
  processed = processed.replace(
    /:::(tip|warning|note|info|success|error)\n([\s\S]*?)\n:::/g,
    (_, type, content) => {
      // Convert inner content from markdown paragraphs
      const innerContent = content
        .trim()
        .split('\n\n')
        .map((p: string) => `<p>${p.trim()}</p>`)
        .join('');
      return `<div data-type="${type}" class="callout callout-${type}"><div class="callout-content">${innerContent}</div></div>`;
    }
  );

  // Convert flip cards: ???Front\nBack??? → flipCardGroup HTML
  // We need to collect consecutive flip cards into groups
  const flipCardRegex = /\?\?\?(.+?)\n([\s\S]*?)\?\?\?/g;
  const flipCards: Array<{ front: string; back: string }> = [];
  let lastIndex = 0;
  let result = '';
  let match;

  while ((match = flipCardRegex.exec(processed)) !== null) {
    // Check if there's non-flip-card content between cards
    const beforeContent = processed.slice(lastIndex, match.index).trim();

    if (beforeContent && flipCards.length > 0) {
      // Output accumulated flip cards as a group
      result += buildFlipCardGroupHtml(flipCards);
      flipCards.length = 0;
    }

    if (beforeContent) {
      result += beforeContent + '\n\n';
    }

    flipCards.push({
      front: match[1].trim(),
      back: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Output any remaining flip cards
  if (flipCards.length > 0) {
    result += buildFlipCardGroupHtml(flipCards);
  }

  // Add remaining content
  result += processed.slice(lastIndex);
  processed = result;

  // Convert quizzes: [quiz: Question | A | B* | C | D]\nExplanation
  // Using [\s\S] instead of . with s flag for ES2017 compatibility
  processed = processed.replace(
    /\[quiz:\s*(.+?)\s*\|\s*(.+?)\s*\]\n([\s\S]+?)(?=\n\n|\n$|$)/g,
    (_, question, optionsStr, explanation) => {
      const options = optionsStr.split('|').map((o: string) => o.trim());
      let correctIndex = 0;

      // Find correct answer (marked with *)
      const processedOptions = options.map((opt: string, idx: number) => {
        if (opt.endsWith('*')) {
          correctIndex = idx;
          return opt.slice(0, -1).trim();
        }
        return opt;
      });

      const correctId = `option-${correctIndex}`;

      const optionsHtml = processedOptions
        .map(
          (opt: string, idx: number) =>
            `<label data-quiz-option data-option-id="option-${idx}" class="quiz-option">
              <input type="radio" name="quiz-answer" value="option-${idx}" class="quiz-option-input" disabled>
              <div class="quiz-option-content"><p>${opt}</p></div>
            </label>`
        )
        .join('');

      return `<div data-quiz-question class="quiz-question" data-correct-option-id="${correctId}" data-explanation="${explanation.trim()}">
        <p>${question.trim()}</p>
        ${optionsHtml}
      </div>`;
    }
  );

  return processed;
}

/**
 * Build HTML for a group of flip cards
 */
function buildFlipCardGroupHtml(cards: Array<{ front: string; back: string }>): string {
  const cardsHtml = cards
    .map(
      (card) =>
        `<div data-flip-card class="flip-card">
          <div class="flip-card-inner">
            <div data-flip-card-front class="flip-card-front"><p>${card.front}</p></div>
            <div data-flip-card-back class="flip-card-back"><p>${card.back}</p></div>
          </div>
        </div>`
    )
    .join('');

  return `<div data-flip-card-group class="flip-card-group" data-columns="3">${cardsHtml}</div>\n\n`;
}

/**
 * Parse Markdown string to Tiptap JSON
 *
 * @param markdown - Extended Markdown content from AI
 * @returns Tiptap JSON document
 */
export function parseMarkdownToTiptap(markdown: string): JSONContent {
  // Pre-process custom syntax to HTML placeholders
  const preprocessed = preprocessMarkdown(markdown);

  // Convert Markdown to HTML using marked
  const html = marked.parse(preprocessed) as string;

  // Get server-safe extensions for generateJSON
  // These define the same schema as the client-side extensions
  const extensions = getServerExtensions();

  // Convert HTML to Tiptap JSON
  const json = generateJSON(html, extensions);

  return json;
}

/**
 * Validate that parsed content has expected structure
 */
export function validateParsedContent(json: JSONContent): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    flipCards: number;
    quizzes: number;
    callouts: number;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!json.content || json.content.length === 0) {
    errors.push('Content is empty');
  }

  // Check for at least one heading
  const hasHeading = json.content?.some((node) => node.type === 'heading');
  if (!hasHeading) {
    warnings.push('Content has no headings');
  }

  // Count interactive elements
  const stats = { flipCards: 0, quizzes: 0, callouts: 0 };

  function countNodes(nodes: JSONContent[] | undefined) {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.type === 'flipCardGroup') stats.flipCards++;
      if (node.type === 'quizQuestion') stats.quizzes++;
      if (node.type === 'callout') stats.callouts++;
      if (node.content) countNodes(node.content);
    }
  }

  countNodes(json.content);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}
