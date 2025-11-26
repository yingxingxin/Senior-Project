/**
 * Diff Applier
 *
 * Applies diff-based edits to Tiptap documents.
 * Finds content, deletes specified parts, and inserts new content.
 */

import type { TiptapDocument, TiptapBlockNode } from '../tiptap-schema';

/**
 * Node type for text nodes in Tiptap
 */
type TiptapTextNode = { type: 'text'; text?: string };

/**
 * Extract text from Tiptap node for searching
 */
function extractText(node: TiptapBlockNode | TiptapTextNode): string {
  if (node.type === 'text' && 'text' in node) {
    return node.text || '';
  }
  if ('content' in node && node.content && Array.isArray(node.content)) {
    return node.content.map((n) => extractText(n as TiptapBlockNode | TiptapTextNode)).join('');
  }
  return '';
}

/**
 * Find the location of content in the document
 *
 * Returns [nodeIndex, textOffset] if found, or null if not found
 */
function findContent(
  document: TiptapDocument,
  searchText: string
): { nodeIndex: number; textOffset: number } | null {
  if (!document.content) {
    return null;
  }

  let accumulatedText = '';

  for (let nodeIndex = 0; nodeIndex < document.content.length; nodeIndex++) {
    const node = document.content[nodeIndex];
    const nodeText = extractText(node);

    const combinedText = accumulatedText + nodeText;
    const searchIndex = combinedText.indexOf(searchText);

    if (searchIndex >= 0) {
      // Found it!
      const textOffset = searchIndex - accumulatedText.length;
      return { nodeIndex, textOffset };
    }

    accumulatedText += nodeText;
  }

  return null;
}

/**
 * Delete content from a text node
 * Note: This function is currently unused but kept for future use
 */
function _deleteFromTextNode(node: TiptapTextNode, startOffset: number, length: number): TiptapTextNode {
  if (node.type !== 'text') {
    return node;
  }

  const text = node.text || '';
  const before = text.substring(0, startOffset);
  const after = text.substring(startOffset + length);

  return {
    ...node,
    text: before + after,
  };
}

/**
 * Insert content into document at a specific location
 */
function insertContentAt(
  document: TiptapDocument,
  insertAtIndex: number,
  newContent: TiptapBlockNode[]
): TiptapDocument {
  if (!document.content) {
    return {
      ...document,
      content: newContent,
    };
  }

  const updatedContent = [
    ...document.content.slice(0, insertAtIndex),
    ...newContent,
    ...document.content.slice(insertAtIndex),
  ];

  return {
    ...document,
    content: updatedContent,
  };
}

/**
 * Apply a diff to the document
 *
 * @param document - Current Tiptap document
 * @param beforeContent - Text to locate the edit position (optional)
 * @param deleteContent - Text to delete (optional)
 * @param insertContent - Tiptap nodes to insert
 * @returns Updated document and success status
 */
export function applyDiff(
  document: TiptapDocument,
  beforeContent: string | null,
  deleteContent: string | null,
  insertContent: TiptapBlockNode[]
): {
  success: boolean;
  document: TiptapDocument;
  message: string;
} {
  try {
    let workingDoc = JSON.parse(JSON.stringify(document)); // Deep clone

    // Case 1: Insert at specific location (if beforeContent provided)
    if (beforeContent && beforeContent.trim() !== '') {
      const location = findContent(workingDoc, beforeContent);

      if (!location) {
        return {
          success: false,
          document,
          message: `Could not find beforeContent: "${beforeContent.substring(0, 50)}..."`,
        };
      }

      // Delete content if specified
      if (deleteContent && deleteContent.trim() !== '') {
        const deleteLocation = findContent(workingDoc, deleteContent);
        if (!deleteLocation) {
          return {
            success: false,
            document,
            message: `Could not find deleteContent: "${deleteContent.substring(0, 50)}..."`,
          };
        }

        // Simple deletion: remove nodes that contain the delete text
        // This is a simplified implementation - in production, you'd want more sophisticated text node handling
        workingDoc.content = workingDoc.content?.filter((node: TiptapBlockNode) => {
          const nodeText = extractText(node);
          return !nodeText.includes(deleteContent);
        }) || [];
      }

      // Insert after the found location
      workingDoc = insertContentAt(workingDoc, location.nodeIndex + 1, insertContent);

      return {
        success: true,
        document: workingDoc,
        message: `Inserted ${insertContent.length} node(s) after "${beforeContent.substring(0, 30)}..."`,
      };
    }

    // Case 2: Append to end of document
    if (!beforeContent || beforeContent.trim() === '') {
      const currentLength = workingDoc.content?.length || 0;
      workingDoc = insertContentAt(workingDoc, currentLength, insertContent);

      return {
        success: true,
        document: workingDoc,
        message: `Appended ${insertContent.length} node(s) to end of document`,
      };
    }

    return {
      success: false,
      document,
      message: 'Invalid diff parameters',
    };
  } catch (error) {
    return {
      success: false,
      document,
      message: `Error applying diff: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate that a Tiptap document is well-formed
 */
export function validateDocument(document: TiptapDocument): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (document.type !== 'doc') {
    errors.push('Document type must be "doc"');
  }

  if (!Array.isArray(document.content)) {
    errors.push('Document content must be an array');
  }

  // Check each top-level node has a type
  document.content?.forEach((node, index) => {
    if (!node.type) {
      errors.push(`Node at index ${index} missing type`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
