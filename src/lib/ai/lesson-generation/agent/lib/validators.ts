/**
 * Document Validator
 *
 * Validates Tiptap document structure.
 */

import type { TiptapDocument } from '../../../tiptap';

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
