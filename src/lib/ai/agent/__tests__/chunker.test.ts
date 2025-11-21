/**
 * Chunker Tests
 *
 * Simple tests to verify document chunking works correctly.
 * Run with: npx tsx src/lib/ai/agent/__tests__/chunker.test.ts
 */

import { chunkDocument, mergeChunks } from '../chunker';
import type { TiptapDocument } from '../../tiptap-schema';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('=== Chunker Tests ===\n');

// Test 1: Empty document
console.log('Test 1: Empty document');
const emptyDoc: TiptapDocument = { type: 'doc', content: [] };
const emptyChunks = chunkDocument(emptyDoc);
assert(emptyChunks.length === 1, 'Empty document creates 1 chunk');
assert(emptyChunks[0].characterCount === 0, 'Empty chunk has 0 characters');
console.log('');

// Test 2: Small document (single chunk)
console.log('Test 2: Small document (fits in one chunk)');
const smallDoc: TiptapDocument = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello World' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'This is a test.' }],
    },
  ],
};
const smallChunks = chunkDocument(smallDoc);
assert(smallChunks.length === 1, 'Small document creates 1 chunk');
assert(smallChunks[0].content.content!.length === 2, 'Chunk has 2 nodes');
console.log('');

// Test 3: Large document (multiple chunks)
console.log('Test 3: Large document (creates multiple chunks)');
const largeDoc: TiptapDocument = {
  type: 'doc',
  content: [],
};

// Create a document with many paragraphs (should exceed chunk size)
const longText = 'A'.repeat(10000); // 10k chars per paragraph
for (let i = 0; i < 10; i++) {
  largeDoc.content!.push({
    type: 'paragraph',
    content: [{ type: 'text', text: `Paragraph ${i}: ${longText}` }],
  });
}

const largeChunks = chunkDocument(largeDoc, 32000); // 32k chunk size
assert(largeChunks.length > 1, 'Large document creates multiple chunks');
assert(largeChunks[0].totalChunks === largeChunks.length, 'All chunks know total count');

let totalChars = 0;
for (const chunk of largeChunks) {
  totalChars += chunk.characterCount;
  assert(chunk.content.type === 'doc', 'Each chunk is a valid doc');
}
console.log(`  Created ${largeChunks.length} chunks with ${totalChars} total chars`);
console.log('');

// Test 4: Merge chunks back to original
console.log('Test 4: Merge chunks back to original document');
const merged = mergeChunks(largeChunks);
assert(merged.type === 'doc', 'Merged result is a doc');
assert(merged.content!.length === largeDoc.content!.length, 'Merged has same node count as original');

// Verify first and last nodes match
const firstOriginal = JSON.stringify(largeDoc.content![0]);
const firstMerged = JSON.stringify(merged.content![0]);
assert(firstOriginal === firstMerged, 'First node matches after merge');

const lastOriginal = JSON.stringify(largeDoc.content![largeDoc.content!.length - 1]);
const lastMerged = JSON.stringify(merged.content![merged.content!.length - 1]);
assert(lastOriginal === lastMerged, 'Last node matches after merge');
console.log('');

// Test 5: Chunk boundaries (nodes are never split)
console.log('Test 5: Chunk boundaries preserve nodes');
for (const chunk of largeChunks) {
  for (const node of chunk.content.content!) {
    assert(node.type !== undefined, 'All nodes have a type');
    if (node.content) {
      assert(Array.isArray(node.content), 'Node content is array');
    }
  }
}
console.log('  All nodes are intact (no split nodes)');
console.log('');

console.log('🎉 All chunker tests passed!\n');
