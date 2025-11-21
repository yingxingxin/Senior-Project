/**
 * AI Agent Types
 *
 * Core TypeScript interfaces and types for the AI Agent system.
 */

import type { TiptapDocument } from '../tiptap-schema';

/**
 * Agent status states
 */
export type AgentStatus =
  | 'idle'           // Not processing
  | 'loading'        // Processing AI request
  | 'reviewingToolCall' // Waiting for user review (future)
  | 'error';         // Error occurred

/**
 * Chat message types
 */
export type ChatMessage =
  | UserChatMessage
  | AiChatMessage
  | ToolCallChatMessage
  | ToolCallResultChatMessage
  | CheckpointChatMessage;

export interface UserChatMessage {
  type: 'user';
  text: string;
  context?: string | null;
  selection?: string | null;
  timestamp: Date;
}

export interface AiChatMessage {
  type: 'ai';
  text: string;
  timestamp: Date;
}

export interface ToolCallChatMessage {
  type: 'toolCall';
  toolName: string;
  toolCallId: string;
  arguments: any;
  timestamp: Date;
}

export interface ToolCallResultChatMessage {
  type: 'toolCallResult';
  toolName: string;
  toolCallId: string;
  result: string;
  isError: boolean;
  timestamp: Date;
}

export interface CheckpointChatMessage {
  type: 'checkpoint';
  checkpoint: Checkpoint;
  timestamp: Date;
}

/**
 * Checkpoint for save/restore
 */
export interface Checkpoint {
  id: string;
  conversationMessages: ChatMessage[];
  documentSnapshot: TiptapDocument;
  timestamp: Date;
  metadata: Record<string, any>;
}

/**
 * Document chunk
 */
export interface DocumentChunk {
  index: number;          // 0-based chunk index
  totalChunks: number;    // Total number of chunks
  content: TiptapDocument; // Tiptap JSON for this chunk
  characterCount: number; // Number of characters
  startNodeIndex: number; // Starting node index in full document
  endNodeIndex: number;   // Ending node index in full document
}

/**
 * Tool definition
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: any; // Zod schema
  execute: (args: any, context: ToolExecutionContext) => Promise<ToolResult>;
  isFinal?: boolean; // If true, ends agent run when called
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  documentState: DocumentState;
  conversationState: ConversationState;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  success: boolean;
  result: string;
  metadata?: Record<string, any>;
}

/**
 * Document state (tracks current document and chunks)
 */
export interface DocumentState {
  document: TiptapDocument;
  chunks: DocumentChunk[];
  currentChunkIndex: number;
  chunkSize: number;
}

/**
 * Conversation state
 */
export interface ConversationState {
  status: AgentStatus;
  messages: ChatMessage[];
  checkpoints: Checkpoint[];
  currentCheckpointId: string | null;
  metadata: Record<string, any>;
}

/**
 * Agent run result
 */
export interface AgentRunResult {
  success: boolean;
  document: TiptapDocument;
  summary: string;
  stepsExecuted: number;
  conversationMessages: ChatMessage[];
  error?: string;
}

/**
 * Progress callback
 */
export type ProgressCallback = (progress: {
  step: string;
  percentage: number;
  message: string;
  currentAction?: string;
  stepNumber?: number;
  totalSteps?: number;
}) => Promise<void>;
