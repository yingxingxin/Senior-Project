/**
 * AI Utility Functions
 *
 * Helper functions for AI context processing, including:
 * - Text extraction from Tiptap JSON content
 * - Content truncation for token management
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Extract plain text from Tiptap JSONContent
 *
 * Recursively traverses Tiptap JSON to extract readable text content.
 * Handles nested nodes and preserves paragraph breaks for readability.
 */
export function extractTextFromTiptap(json: JSONContent | undefined): string {
  if (!json) return '';

  const textParts: string[] = [];

  function traverse(node: JSONContent): void {
    // Handle text nodes directly
    if (node.type === 'text' && node.text) {
      textParts.push(node.text);
      return;
    }

    // Handle specific node types that contain meaningful content
    switch (node.type) {
      case 'paragraph':
      case 'heading':
        // Process children then add newline
        if (node.content) {
          node.content.forEach(traverse);
        }
        textParts.push('\n');
        break;

      case 'bulletList':
      case 'orderedList':
        if (node.content) {
          node.content.forEach((item, index) => {
            const prefix = node.type === 'orderedList' ? `${index + 1}. ` : '• ';
            textParts.push(prefix);
            if (item.content) {
              item.content.forEach(traverse);
            }
          });
        }
        textParts.push('\n');
        break;

      case 'listItem':
        if (node.content) {
          node.content.forEach(traverse);
        }
        break;

      case 'codeBlock':
        // Include code blocks with language hint
        textParts.push('\n```');
        if (node.attrs?.language) {
          textParts.push(node.attrs.language as string);
        }
        textParts.push('\n');
        if (node.content) {
          node.content.forEach(traverse);
        }
        textParts.push('\n```\n');
        break;

      case 'blockquote':
        textParts.push('\n> ');
        if (node.content) {
          node.content.forEach(traverse);
        }
        textParts.push('\n');
        break;

      case 'hardBreak':
        textParts.push('\n');
        break;

      // Interactive nodes - extract question/content for AI context
      case 'flipCard':
        if (node.attrs) {
          const attrs = node.attrs as { front?: string; back?: string };
          if (attrs.front) textParts.push(`[Concept: ${attrs.front}]\n`);
          if (attrs.back) textParts.push(`[Explanation: ${attrs.back}]\n`);
        }
        break;

      case 'quizQuestion':
        if (node.attrs) {
          const attrs = node.attrs as { question?: string; options?: string[] };
          if (attrs.question) textParts.push(`[Quiz: ${attrs.question}]\n`);
        }
        break;

      case 'dragOrderExercise':
        if (node.attrs) {
          const attrs = node.attrs as { instruction?: string };
          if (attrs.instruction) textParts.push(`[Exercise: ${attrs.instruction}]\n`);
        }
        break;

      // Skip these node types (not relevant for AI context)
      case 'image':
      case 'horizontalRule':
        break;

      default:
        // Recursively process unknown nodes that have content
        if (node.content) {
          node.content.forEach(traverse);
        }
    }
  }

  traverse(json);

  // Clean up the result: collapse multiple newlines, trim
  return textParts
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Truncate content to a maximum character length
 *
 * Truncates at word boundaries to avoid cutting words in half.
 * Adds ellipsis indicator when content is truncated.
 */
export function truncateContent(content: string, maxLength: number = 2000): string {
  if (content.length <= maxLength) return content;

  // Find the last space before maxLength to avoid cutting words
  const truncateAt = content.lastIndexOf(' ', maxLength);
  const cutPoint = truncateAt > maxLength * 0.8 ? truncateAt : maxLength;

  return content.substring(0, cutPoint) + '... [content truncated]';
}

/**
 * Extract and prepare section content for AI context
 *
 * Combines extraction and truncation for use in lesson pages.
 */
export function prepareSectionContent(
  bodyJson: JSONContent | undefined,
  legacyBody: string | undefined,
  maxLength: number = 2000
): string {
  // Prefer Tiptap JSON content, fall back to legacy markdown
  const content = bodyJson ? extractTextFromTiptap(bodyJson) : (legacyBody ?? '');

  if (!content) return '';

  return truncateContent(content, maxLength);
}
