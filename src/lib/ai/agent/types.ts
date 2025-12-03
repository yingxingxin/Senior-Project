/**
 * AI Agent Types
 *
 * Core TypeScript interfaces and types for the AI Agent system.
 */

import type { z } from 'zod';
import type { TiptapDocument } from '../tiptap';

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
  arguments: Record<string, unknown>;
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
  metadata: Record<string, unknown>;
}

/**
 * Lesson section (Level 3 - content chunks within a lesson)
 */
export interface LessonSection {
  slug: string;
  title: string;
  orderIndex: number;
  document: TiptapDocument;
}

/**
 * Lesson (Level 2 - topics within a course)
 */
export interface Lesson {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  sections: LessonSection[];
}

/**
 * Tool definition
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodType<Record<string, unknown>>;
  execute: (args: Record<string, unknown>, context: ToolExecutionContext) => Promise<ToolResult>;
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
  metadata?: Record<string, unknown>;
}

/**
 * Document state (tracks current document, lessons, and sections)
 */
export interface DocumentState {
  document: TiptapDocument;

  // Document operations
  initialize(document?: TiptapDocument): void;
  getDocument(): TiptapDocument;
  isEmpty(): boolean;
  getDocumentText(): string;

  // Lesson management (Level 2)
  createLesson(title: string, slug: string, description?: string): void;
  getCurrentLesson(): Lesson | null;
  getLessonBySlug(slug: string): Lesson | null;
  getAllLessons(): Lesson[];
  hasLessons(): boolean;
  getLessonCount(): number;

  // Section management (Level 3 - within current lesson)
  createSection(title: string, slug: string): void;
  getCurrentSection(): LessonSection | null;
  getSectionBySlug(slug: string): LessonSection | null;
  getSectionDocument(slug: string): TiptapDocument;
  updateSectionDocument(slug: string, document: TiptapDocument): void;
  getAllSections(): LessonSection[];
  hasSections(): boolean;
  getSectionCount(): number;

  // Cloning
  clone(): DocumentState;

    setCurrentLessonBySlug(slug: string): boolean;
}

/**
 * Conversation state
 */
export interface ConversationState {
  status: AgentStatus;
  messages: ChatMessage[];
  checkpoints: Checkpoint[];
  currentCheckpointId: string | null;
  metadata: Record<string, unknown>;
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
  documentState: DocumentState;
  conversationState: ConversationState;
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
