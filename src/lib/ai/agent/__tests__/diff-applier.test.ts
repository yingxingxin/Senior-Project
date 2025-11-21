/**
 * Diff Applier Tests
 *
 * Test applying diffs to Tiptap documents.
 * Run with: npx tsx src/lib/ai/agent/__tests__/diff-applier.test.ts
 */

import { applyDiff, validateDocument } from '../diff-applier';
import type { TiptapDocument } from '../../tiptap-schema';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('=== Diff Applier Tests ===\n');

// Test 1: Insert at end (no beforeContent)
console.log('Test 1: Insert at end of document');
const doc1: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
  ],
};

const result1 = applyDiff(doc1, null, null, [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'New paragraph' }],
  },
]);

assert(result1.success === true, 'Insert at end succeeds');
assert(result1.document.content!.length === 2, 'Document now has 2 nodes');
assert(result1.document.content![1].type === 'paragraph', 'Second node is paragraph');
console.log('');

// Test 2: Insert after specific content (with beforeContent)
console.log('Test 2: Insert after specific content');
const doc2: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Introduction' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'First paragraph' }],
    },
  ],
};

const result2 = applyDiff(
  doc2,
  'First paragraph', // beforeContent - locate this
  null, // don't delete anything
  [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Second paragraph' }],
    },
  ]
);

assert(result2.success === true, 'Insert after specific content succeeds');
assert(result2.document.content!.length === 3, 'Document now has 3 nodes');
console.log('');

// Test 3: Delete content
console.log('Test 3: Delete specific content');
const doc3: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Keep this' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Delete this' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Keep this too' }],
    },
  ],
};

const result3 = applyDiff(doc3, 'Keep this', 'Delete this', []);

assert(result3.success === true, 'Delete succeeds');
assert(result3.document.content!.length === 2, 'Document now has 2 nodes (deleted 1)');
console.log('');

// Test 4: Insert multiple nodes
console.log('Test 4: Insert multiple nodes at once');
const doc4: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
  ],
};

const result4 = applyDiff(doc4, null, null, [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Paragraph 1' }],
  },
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Paragraph 2' }],
  },
  {
    type: 'codeBlockEnhanced',
    attrs: { language: 'javascript' },
    content: [{ type: 'text', text: 'const x = 1;' }],
  },
]);

assert(result4.success === true, 'Insert multiple nodes succeeds');
assert(result4.document.content!.length === 4, 'Document has 4 nodes (1 heading + 3 new)');
assert(result4.document.content![3].type === 'codeBlockEnhanced', 'Last node is code block');
console.log('');

// Test 5: Validate document structure
console.log('Test 5: Document validation');
const validDoc: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Valid' }],
    },
  ],
};

const validation1 = validateDocument(validDoc);
assert(validation1.valid === true, 'Valid document passes validation');

const invalidDoc: any = {
  type: 'wrong', // Should be 'doc'
  content: [],
};

const validation2 = validateDocument(invalidDoc);
assert(validation2.valid === false, 'Invalid document fails validation');
assert(validation2.errors.length > 0, 'Validation errors are reported');
console.log('');

// Test 6: beforeContent not found (error case)
console.log('Test 6: Error handling - beforeContent not found');
const doc6: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Existing content' }],
    },
  ],
};

const result6 = applyDiff(doc6, 'Non-existent content', null, [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'New paragraph' }],
  },
]);

assert(result6.success === false, 'Diff fails when beforeContent not found');
assert(result6.message.includes('Could not find'), 'Error message explains the problem');
console.log('');

// Test 7: Complex nested content
console.log('Test 7: Complex nested content (callout)');
const doc7: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
  ],
};

const result7 = applyDiff(doc7, null, null, [
  {
    type: 'callout',
    attrs: { type: 'tip' },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'This is a tip callout' }],
      },
    ],
  },
]);

assert(result7.success === true, 'Insert nested content succeeds');
assert(result7.document.content!.length === 2, 'Document has 2 nodes');
assert(result7.document.content![1].type === 'callout', 'Second node is callout');
assert(result7.document.content![1].attrs?.type === 'tip', 'Callout has correct type');
console.log('');

console.log('🎉 All diff applier tests passed!\n');
