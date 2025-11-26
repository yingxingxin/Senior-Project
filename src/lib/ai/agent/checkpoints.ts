/**
 * Checkpoint System
 *
 * Save and restore conversation + document state for rollback.
 */

import type { Checkpoint } from './types';
import type { DocumentState } from './document-state';
import type { ConversationState } from './conversation-state';
import { randomUUID } from 'crypto';

/**
 * Create a checkpoint from current state
 */
export function createCheckpoint(
  conversationState: ConversationState,
  documentState: DocumentState,
  metadata: Record<string, unknown> = {}
): Checkpoint {
  const checkpoint: Checkpoint = {
    id: randomUUID(),
    conversationMessages: JSON.parse(JSON.stringify(conversationState.getMessages())),
    documentSnapshot: JSON.parse(JSON.stringify(documentState.getDocument())),
    timestamp: new Date(),
    metadata,
  };

  return checkpoint;
}

/**
 * Restore state from a checkpoint
 */
export function restoreCheckpoint(
  checkpoint: Checkpoint,
  conversationState: ConversationState,
  documentState: DocumentState
): void {
  // Restore conversation messages
  conversationState.messages = JSON.parse(JSON.stringify(checkpoint.conversationMessages));
  conversationState.setStatus('idle');

  // Restore document
  documentState.replaceDocument(JSON.parse(JSON.stringify(checkpoint.documentSnapshot)));
}

/**
 * Checkpoint Manager
 *
 * Manages a limited number of checkpoints with automatic cleanup
 */
export class CheckpointManager {
  private checkpoints: Map<string, Checkpoint>;
  private maxCheckpoints: number;
  private checkpointOrder: string[]; // Track insertion order

  constructor(maxCheckpoints: number = 10) {
    this.checkpoints = new Map();
    this.maxCheckpoints = maxCheckpoints;
    this.checkpointOrder = [];
  }

  /**
   * Save a checkpoint
   */
  save(checkpoint: Checkpoint): void {
    // Add checkpoint
    this.checkpoints.set(checkpoint.id, checkpoint);
    this.checkpointOrder.push(checkpoint.id);

    // Remove oldest if exceeding max
    if (this.checkpoints.size > this.maxCheckpoints) {
      const oldestId = this.checkpointOrder.shift();
      if (oldestId) {
        this.checkpoints.delete(oldestId);
      }
    }
  }

  /**
   * Get a checkpoint by ID
   */
  get(checkpointId: string): Checkpoint | null {
    return this.checkpoints.get(checkpointId) || null;
  }

  /**
   * Get the most recent checkpoint
   */
  getLatest(): Checkpoint | null {
    if (this.checkpointOrder.length === 0) {
      return null;
    }
    const latestId = this.checkpointOrder[this.checkpointOrder.length - 1];
    return this.get(latestId);
  }

  /**
   * Get all checkpoints
   */
  getAll(): Checkpoint[] {
    return this.checkpointOrder
      .map(id => this.checkpoints.get(id))
      .filter((cp): cp is Checkpoint => cp !== undefined);
  }

  /**
   * Clear all checkpoints
   */
  clear(): void {
    this.checkpoints.clear();
    this.checkpointOrder = [];
  }

  /**
   * Get checkpoint count
   */
  count(): number {
    return this.checkpoints.size;
  }
}
