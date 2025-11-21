/**
 * Conversation State Manager
 *
 * Manages chat messages, agent status, and conversation history.
 */

import type {
  ChatMessage,
  UserChatMessage,
  AiChatMessage,
  ToolCallChatMessage,
  ToolCallResultChatMessage,
  CheckpointChatMessage,
  AgentStatus,
  Checkpoint,
  ConversationState as IConversationState,
} from './types';

export class ConversationState implements IConversationState {
  status: AgentStatus;
  messages: ChatMessage[];
  checkpoints: Checkpoint[];
  currentCheckpointId: string | null;
  metadata: Record<string, any>;

  constructor() {
    this.status = 'idle';
    this.messages = [];
    this.checkpoints = [];
    this.currentCheckpointId = null;
    this.metadata = {};
  }

  /**
   * Add a user message
   */
  addUserMessage(text: string, options?: { context?: string; selection?: string }): void {
    const message: UserChatMessage = {
      type: 'user',
      text,
      context: options?.context || null,
      selection: options?.selection || null,
      timestamp: new Date(),
    };
    this.messages.push(message);
  }

  /**
   * Add an AI message
   */
  addAiMessage(text: string): void {
    const message: AiChatMessage = {
      type: 'ai',
      text,
      timestamp: new Date(),
    };
    this.messages.push(message);
  }

  /**
   * Add a tool call message
   */
  addToolCall(toolName: string, toolCallId: string, args: any): void {
    const message: ToolCallChatMessage = {
      type: 'toolCall',
      toolName,
      toolCallId,
      arguments: args,
      timestamp: new Date(),
    };
    this.messages.push(message);
  }

  /**
   * Add a tool call result message
   */
  addToolCallResult(
    toolName: string,
    toolCallId: string,
    result: string,
    isError: boolean = false
  ): void {
    const message: ToolCallResultChatMessage = {
      type: 'toolCallResult',
      toolName,
      toolCallId,
      result,
      isError,
      timestamp: new Date(),
    };
    this.messages.push(message);
  }

  /**
   * Add a checkpoint message
   */
  addCheckpoint(checkpoint: Checkpoint): void {
    const message: CheckpointChatMessage = {
      type: 'checkpoint',
      checkpoint,
      timestamp: new Date(),
    };
    this.messages.push(message);
    this.checkpoints.push(checkpoint);
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /**
   * Get messages formatted for AI (system, user, assistant, tool)
   */
  getMessagesForAI(): any[] {
    const aiMessages: any[] = [];

    for (const msg of this.messages) {
      if (msg.type === 'user') {
        aiMessages.push({
          role: 'user',
          content: msg.text,
        });
      } else if (msg.type === 'ai') {
        aiMessages.push({
          role: 'assistant',
          content: msg.text,
        });
      } else if (msg.type === 'toolCall') {
        // Tool calls are added by the AI SDK automatically
        // We just need to track them for history
      } else if (msg.type === 'toolCallResult') {
        aiMessages.push({
          role: 'tool',
          content: msg.result,
          toolCallId: msg.toolCallId,
        });
      }
      // Skip checkpoint messages in AI conversation
    }

    return aiMessages;
  }

  /**
   * Set agent status
   */
  setStatus(status: AgentStatus): void {
    this.status = status;
  }

  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Check if agent is idle
   */
  isIdle(): boolean {
    return this.status === 'idle';
  }

  /**
   * Check if agent is loading
   */
  isLoading(): boolean {
    return this.status === 'loading';
  }

  /**
   * Check if agent has error
   */
  hasError(): boolean {
    return this.status === 'error';
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
    this.status = 'idle';
    this.currentCheckpointId = null;
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    toolCalls: number;
    checkpoints: number;
  } {
    return {
      totalMessages: this.messages.length,
      userMessages: this.messages.filter(m => m.type === 'user').length,
      aiMessages: this.messages.filter(m => m.type === 'ai').length,
      toolCalls: this.messages.filter(m => m.type === 'toolCall').length,
      checkpoints: this.checkpoints.length,
    };
  }

  /**
   * Clone the state (for checkpoints)
   */
  clone(): ConversationState {
    const cloned = new ConversationState();
    cloned.status = this.status;
    cloned.messages = JSON.parse(JSON.stringify(this.messages));
    cloned.checkpoints = JSON.parse(JSON.stringify(this.checkpoints));
    cloned.currentCheckpointId = this.currentCheckpointId;
    cloned.metadata = JSON.parse(JSON.stringify(this.metadata));
    return cloned;
  }
}
