/**
 * AI Agent Module
 *
 * Full implementation of Tiptap-style AI Agent for iterative lesson generation.
 */

// Main runner
export { runAgent, type RunAgentParams } from './runner';

// State management
export { DocumentState } from './document-state';
export { ConversationState } from './conversation-state';

// Checkpoint system
export {
  createCheckpoint,
  restoreCheckpoint,
  CheckpointManager,
} from './checkpoints';

// Tools
export * from './tools';

// Tool registry
export {
  getAllTools,
  isFinalTool,
  getToolsDescription,
} from './tool-registry';

// Types
export * from './types';

// Utilities
export {
  chunkDocument,
  getChunk,
  mergeChunks,
  rechunkDocument,
} from './chunker';

export {
  applyDiff,
  validateDocument,
} from './diff-applier';
