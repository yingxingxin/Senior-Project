/**
 * Mock Agent Tests
 *
 * Simulate agent workflow without real AI calls.
 * Run with: npx tsx src/lib/ai/agent/__tests__/agent-mock.test.ts
 */

import { DocumentState } from '../document-state';
import { ConversationState } from '../conversation-state';
import { createCheckpoint, CheckpointManager } from '../checkpoints';
import { applyDiff } from '../diff-applier';
import type { TiptapDocument } from '../../tiptap-schema';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`PASSED: ${message}`);
}

console.log('=== Mock Agent Tests ===\n');

// Test 1: Initialize agent states
console.log('Test 1: Initialize agent states');
const documentState = new DocumentState();
const conversationState = new ConversationState();
const checkpointManager = new CheckpointManager();

documentState.initialize({ type: 'doc', content: [] });
assert(documentState.isEmpty() === true, 'Document starts empty');
assert(conversationState.getStatus() === 'idle', 'Conversation starts idle');
console.log('');

// Test 2: Simulate agent lifecycle
console.log('Test 2: Simulate agent lifecycle');

// User message
conversationState.addUserMessage('Create a lesson about JavaScript variables');
assert(conversationState.getMessages().length === 1, 'User message added');

// Set loading status
conversationState.setStatus('loading');
assert(conversationState.getStatus() === 'loading', 'Status set to loading');

// Simulate tool call: plan
conversationState.addToolCall('plan', 'tc1', {
  outline: ['Introduction', 'Variable types', 'Examples'],
});
conversationState.addToolCallResult('plan', 'tc1', 'Plan created successfully');
assert(conversationState.getMessages().length === 3, 'Tool call and result added');
console.log('');

// Test 3: Simulate apply_diff operations
console.log('Test 3: Simulate apply_diff operations');

// Add heading
const diff1 = applyDiff(
  documentState.getDocument(),
  null, // Insert at end
  null, // Don't delete
  [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'JavaScript Variables' }],
    },
  ]
);
assert(diff1.success === true, 'First diff applied successfully');
documentState.updateDocument(diff1.document);
assert(documentState.isEmpty() === false, 'Document is no longer empty');

// Add paragraph
const diff2 = applyDiff(
  documentState.getDocument(),
  'JavaScript Variables', // After heading
  null,
  [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Variables are containers for storing data values.' }],
    },
  ]
);
assert(diff2.success === true, 'Second diff applied successfully');
documentState.updateDocument(diff2.document);
assert(documentState.getDocument().content!.length === 2, 'Document has 2 nodes');

// Add code block
const diff3 = applyDiff(
  documentState.getDocument(),
  'Variables are containers for storing data values.',
  null,
  [
    {
      type: 'codeBlockEnhanced',
      attrs: { language: 'javascript' },
      content: [{ type: 'text', text: 'let x = 5;\nconst y = 10;' }],
    },
  ]
);
assert(diff3.success === true, 'Third diff applied successfully');
documentState.updateDocument(diff3.document);
assert(documentState.getDocument().content!.length === 3, 'Document has 3 nodes');
console.log('');

// Test 4: Checkpoint system
console.log('Test 4: Checkpoint system');

const checkpoint1 = createCheckpoint(conversationState, documentState, { step: 1 });
checkpointManager.save(checkpoint1);
assert(checkpointManager.count() === 1, 'Checkpoint saved');

// Make more changes
const diff4 = applyDiff(
  documentState.getDocument(),
  'let x = 5;\nconst y = 10;',
  null,
  [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'The let keyword allows you to reassign values.' }],
    },
  ]
);
documentState.updateDocument(diff4.document);

const checkpoint2 = createCheckpoint(conversationState, documentState, { step: 2 });
checkpointManager.save(checkpoint2);
assert(checkpointManager.count() === 2, 'Second checkpoint saved');

// Test checkpoint retrieval
const latestCheckpoint = checkpointManager.getLatest();
assert(latestCheckpoint !== null, 'Can retrieve latest checkpoint');
assert(latestCheckpoint!.id === checkpoint2.id, 'Latest checkpoint is the second one');

const allCheckpoints = checkpointManager.getAll();
assert(allCheckpoints.length === 2, 'Can retrieve all checkpoints');
console.log('');

// Test 5: Reading chunks
console.log('Test 5: Reading chunks');

const chunk = documentState.readFirstChunk();
assert(chunk !== null, 'Can read first chunk');
assert(chunk!.content.content!.length === 4, 'Chunk contains all 4 nodes');
assert(chunk!.totalChunks === 1, 'Single chunk for small document');
console.log('');

// Test 6: Conversation message formatting
console.log('Test 6: Conversation message formatting');

conversationState.addAiMessage('I have created an outline for the lesson.');
const messages = conversationState.getMessagesForAI();
assert(messages.length > 0, 'Messages formatted for AI');

// Check message types
const hasUserMessage = messages.some((m) => m.role === 'user');
const hasAssistantMessage = messages.some((m) => m.role === 'assistant');
assert(hasUserMessage === true, 'User messages included');
assert(hasAssistantMessage === true, 'Assistant messages included');
console.log('');

// Test 7: Complete lifecycle simulation
console.log('Test 7: Complete lifecycle simulation');

// Mark as reviewing
conversationState.setStatus('reviewingToolCall');
assert(conversationState.getStatus() === 'reviewingToolCall', 'Status updated to reviewing');

// Simulate finish_with_summary
conversationState.addToolCall('finish_with_summary', 'tc2', {
  summary: 'Created lesson about JavaScript variables',
  wordCount: 45,
  sectionsCompleted: 3,
});
conversationState.metadata.finalSummary = {
  summary: 'Created lesson about JavaScript variables',
  wordCount: 45,
  sectionsCompleted: 3,
};
conversationState.addToolCallResult('finish_with_summary', 'tc2', 'Lesson completed');

// Set to idle
conversationState.setStatus('idle');
assert(conversationState.getStatus() === 'idle', 'Status back to idle');

// Verify final state
assert(documentState.getDocument().content!.length === 4, 'Final document has 4 nodes');
assert(conversationState.metadata.finalSummary !== undefined, 'Final summary recorded');
console.log('');

// Test 8: Error handling simulation
console.log('Test 8: Error handling simulation');

const errorDiff = applyDiff(
  documentState.getDocument(),
  'Non-existent content',
  null,
  [{ type: 'paragraph', content: [{ type: 'text', text: 'This should fail' }] }]
);
assert(errorDiff.success === false, 'Invalid diff fails gracefully');
assert(errorDiff.message.includes('Could not find'), 'Error message is descriptive');

conversationState.addToolCallResult('apply_diff', 'tc3', errorDiff.message, true);
const lastMessage = conversationState.getMessages()[conversationState.getMessages().length - 1];
assert(lastMessage.type === 'toolCallResult', 'Error recorded as tool result');
assert(lastMessage.type === 'toolCallResult' && lastMessage.isError === true, 'Error flag set');
console.log('');

// Test 9: Verify document structure
console.log('Test 9: Verify final document structure');

const finalDoc = documentState.getDocument();
assert(finalDoc.type === 'doc', 'Document has correct type');
assert(finalDoc.content !== undefined, 'Document has content');

// Check node types
const nodeTypes = finalDoc.content!.map((node) => node.type);
assert(nodeTypes.includes('heading'), 'Contains heading');
assert(nodeTypes.includes('paragraph'), 'Contains paragraphs');
assert(nodeTypes.includes('codeBlockEnhanced'), 'Contains code block');
console.log('');

console.log('All mock agent tests passed!\n');
console.log('Agent workflow simulation:');
console.log('  1. Initialize states');
console.log('  2. Process user message');
console.log('  3. Execute plan tool');
console.log('  4. Apply multiple diffs');
console.log('  5. Save checkpoints');
console.log('  6. Read chunks');
console.log('  7. Handle errors');
console.log('  8. Complete with summary');
console.log('  9. Return to idle state\n');
