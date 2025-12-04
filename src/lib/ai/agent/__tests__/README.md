# AI Agent Tests

Simple, fast unit tests for the AI Agent system that don't require database, Redis, or AI API calls.

## Running Tests

Run all tests:
```bash
npm run test:agent
```

Or run individual test files:

```bash
# Test document chunking (split/merge)
npx tsx src/lib/ai/agent/__tests__/chunker.test.ts

# Test diff application (insert/delete)
npx tsx src/lib/ai/agent/__tests__/diff-applier.test.ts

# Test document state management (navigation)
npx tsx src/lib/ai/agent/__tests__/document-state.test.ts

# Test complete agent workflow (mock)
npx tsx src/lib/ai/agent/__tests__/agent-mock.test.ts
```

## Test Coverage

### 1. Chunker Tests (`chunker.test.ts`)
- Empty documents create single empty chunk
- Small documents fit in one chunk
- Large documents split into multiple chunks
- Chunks can be merged back to original
- Chunk boundaries preserve node integrity (never split nodes)

**Key Validation:** Document splitting and merging doesn't lose or corrupt data.

### 2. Diff Applier Tests (`diff-applier.test.ts`)
- Insert nodes at end of document
- Insert nodes after specific content
- Delete specific content
- Insert multiple nodes at once
- Validate document structure
- Handle errors (content not found)
- Support complex nested content (callouts, code blocks)

**Key Validation:** Incremental document editing works correctly and safely.

### 3. Document State Tests (`document-state.test.ts`)
- Initialize empty and non-empty documents
- Read first chunk
- Navigate forward/backward through chunks
- Update document triggers re-chunking
- Navigation boundaries (can't go past ends)
- Current chunk tracking

**Key Validation:** Chunk navigation and state management works correctly.

### 4. Mock Agent Tests (`agent-mock.test.ts`)
- Initialize agent states
- Simulate agent lifecycle (idle → loading → idle)
- Execute multiple tool calls (plan, apply_diff, finish)
- Save and restore checkpoints
- Read chunks during execution
- Format conversation messages for AI
- Handle tool execution errors
- Verify final document structure

**Key Validation:** Complete agent workflow functions correctly without AI calls.

## Test Output

Each test uses simple assertions with clear console output:
- Green checkmark = test passed
- Red X = test failed (with error message and stack trace)

Example output:
```
=== Chunker Tests ===

Test 1: Empty document
PASSED: Empty document creates 1 chunk
PASSED: Empty chunk has 0 characters

All chunker tests passed!
```

## Why These Tests?

These tests provide **confidence without complexity**:

1. **No external dependencies** - No database, Redis, or AI API required
2. **Fast execution** - All tests run in < 5 seconds combined
3. **Critical path coverage** - Tests the core logic everything depends on
4. **Easy debugging** - Simple assertions with clear error messages
5. **No mocking complexity** - Tests use real implementations

## Next Steps: Manual Smoke Test

After these unit tests pass, perform a manual smoke test with real AI:

1. Start Redis: `redis-server`
2. Start worker: `npm run worker`
3. Start dev server: `npm run dev`
4. Generate a real lesson via UI
5. Verify:
   - Job progresses through steps
   - Progress updates appear in UI
   - Agent completes successfully
   - Generated lesson has good quality
   - Document structure is valid Tiptap JSON

## Adding to package.json

Add this script to `package.json`:

```json
{
  "scripts": {
    "test:agent": "npx tsx src/lib/ai/agent/__tests__/chunker.test.ts && npx tsx src/lib/ai/agent/__tests__/diff-applier.test.ts && npx tsx src/lib/ai/agent/__tests__/document-state.test.ts && npx tsx src/lib/ai/agent/__tests__/agent-mock.test.ts"
  }
}
```
