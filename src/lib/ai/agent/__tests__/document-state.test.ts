/**
 * Document State Tests
 *
 * Test document state management and chunk navigation.
 * Run with: npx tsx src/lib/ai/agent/__tests__/document-state.test.ts
 */

import { DocumentState } from '../document-state';
import type { TiptapDocument } from '../../tiptap-schema';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

console.log('=== Document State Tests ===\n');

// Test 1: Initialize with empty document
console.log('Test 1: Initialize empty document');
const state1 = new DocumentState();
state1.initialize({ type: 'doc', content: [] });
assert(state1.isEmpty() === true, 'Empty document is detected');
const emptyChunk = state1.getCurrentChunk();
assert(emptyChunk !== null, 'Empty document has one chunk');
assert(emptyChunk!.characterCount === 0, 'Empty chunk has 0 characters');
console.log('');

// Test 2: Initialize with small document
console.log('Test 2: Initialize small document');
const state2 = new DocumentState();
const smallDoc: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Content here' }],
    },
  ],
};

state2.initialize(smallDoc);
assert(state2.isEmpty() === false, 'Non-empty document is detected');
assert(state2.getDocument().content!.length === 2, 'Document has 2 nodes');
console.log('');

// Test 3: Read first chunk
console.log('Test 3: Read first chunk');
const chunk = state2.readFirstChunk();
assert(chunk !== null, 'First chunk exists');
assert(chunk!.index === 0, 'First chunk has index 0');
assert(chunk!.content.type === 'doc', 'Chunk contains doc structure');
console.log('');

// Test 4: Navigate chunks in larger document
console.log('Test 4: Navigate chunks (large document)');
const state3 = new DocumentState(10000); // Small chunk size to force multiple chunks
const largeDoc: TiptapDocument = {
  type: 'doc',
  content: [],
};

// Create large document
const longText = 'A'.repeat(5000);
for (let i = 0; i < 10; i++) {
  largeDoc.content!.push({
    type: 'paragraph',
    content: [{ type: 'text', text: `Paragraph ${i}: ${longText}` }],
  });
}

state3.initialize(largeDoc);

const firstChunk = state3.readFirstChunk();
assert(firstChunk !== null, 'Large doc has first chunk');
assert(firstChunk!.index === 0, 'First chunk has index 0');
assert(firstChunk!.totalChunks > 1, 'Large doc creates multiple chunks');

const secondChunk = state3.readNextChunk();
assert(secondChunk !== null, 'Can read next chunk');
assert(secondChunk!.index === 1, 'Second chunk has index 1');

const backToFirst = state3.readPreviousChunk();
assert(backToFirst !== null, 'Can read previous chunk');
assert(backToFirst!.index === 0, 'Back to first chunk');
console.log('');

// Test 5: Update document (triggers re-chunking)
console.log('Test 5: Update document');
const state4 = new DocumentState();
state4.initialize({ type: 'doc', content: [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Initial content' }],
  },
] });

const updatedDoc: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'New Title' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Updated content' }],
    },
  ],
};

state4.updateDocument(updatedDoc);
const updatedChunk = state4.readFirstChunk();
assert(updatedChunk !== null, 'Updated document has chunks');
assert(updatedChunk!.content.content![0].type === 'heading', 'Updated content is present');
console.log('');

// Test 6: Boundary conditions
console.log('Test 6: Navigation boundaries');
const state5 = new DocumentState();
state5.initialize({ type: 'doc', content: [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Single chunk' }],
  },
] });

state5.readFirstChunk();
const noNext = state5.readNextChunk();
assert(noNext === null, 'Cannot read past last chunk');

const noPrevious = state5.readPreviousChunk();
assert(noPrevious === null, 'Cannot read before first chunk when at first');
console.log('');

// Test 7: Get current chunk without reading
console.log('Test 7: Get current chunk');
const state6 = new DocumentState();
state6.initialize({ type: 'doc', content: [
  {
    type: 'paragraph',
    content: [{ type: 'text', text: 'Test' }],
  },
] });

const currentBefore = state6.getCurrentChunk();
assert(currentBefore !== null, 'Current chunk exists after initialize (defaults to index 0)');
assert(currentBefore!.index === 0, 'Current chunk index is 0 after initialize');

state6.readFirstChunk();
const currentAfter = state6.getCurrentChunk();
assert(currentAfter !== null, 'Current chunk exists after explicit read');
assert(currentAfter!.index === 0, 'Current chunk is first chunk');
console.log('');

console.log('All document state tests passed!\n');
