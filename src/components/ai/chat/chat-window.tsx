'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle, Fragment } from 'react';
import { RefreshCcwIcon, CopyIcon, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIContext } from '../context/provider';
import { AIContextButton } from '../context/context-button';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '../elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from '../elements/prompt-input';

export interface AIChatWindowHandle {
  sendMessage: (message: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatWindowProps {
  assistantAvatarUrl?: string | null;
  assistantName?: string;
}

export const AIChatWindow = forwardRef<AIChatWindowHandle, AIChatWindowProps>(function AIChatWindow(
  { assistantAvatarUrl, assistantName },
  ref
) {
  const displayName = assistantName || 'Nova';
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ${displayName}, and I'm here to help you learn programming. What would you like to know? ✨`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getContextForAPI } = useAIContext();

  // Update welcome message when assistant name changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].id === '1') {
        return [
          {
            ...prev[0],
            content: `Hello! I'm ${displayName}, and I'm here to help you learn programming. What would you like to know? ✨`,
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  }, [displayName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const sendMessage = useCallback(async (messageText: string) => {
    const messageContent = messageText.trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare messages for API (excluding the welcome message)
      const apiMessages = [
        ...messages.slice(1).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage.content,
        },
      ];

      // Get current context
      const context = getContextForAPI();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorContent = `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;

      // Provide helpful message for missing API key
      if (error instanceof Error && (error.message.includes('API key') || error.message.includes('not configured'))) {
        errorContent = `AI service is not configured. Please contact support.`;
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, getContextForAPI]);

  // Expose sendMessage to parent via ref
  useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => sendMessage(message),
  }), [sendMessage]);

  // Regenerate an assistant message by re-sending the preceding user message
  const regenerateMessage = useCallback(async (messageId: string) => {
    if (isLoading) return;

    // Find the index of the assistant message to regenerate
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the preceding user message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) return; // No user message found

    const userMessage = messages[userMessageIndex];

    // Remove messages from the user message onwards
    setMessages((prev) => prev.slice(0, userMessageIndex));

    // Re-send the user message
    await sendMessage(userMessage.content);
  }, [isLoading, messages, sendMessage]);


  // Determine chat status for PromptInputSubmit
  const chatStatus = isLoading ? 'streaming' : 'ready';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#E6EDf5' }}>
      {/* Model Display - Show current assistant name */}
      <div className="px-4 py-2 border-b border-gray-300/50 bg-white/80">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-800">{displayName}</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((message, index) => {
          const isLastAssistantMessage =
            message.role === 'assistant' &&
            index === messages.length - 1;

          return (
            <Fragment key={message.id}>
              <Message from={message.role}>
                <MessageContent
                  className={cn(
                    'rounded-2xl px-4 py-3 shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border rounded-bl-sm'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <MessageResponse>{message.content}</MessageResponse>
                  ) : (
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  )}
                </MessageContent>
              </Message>

              {/* Actions only for assistant messages (not welcome message) */}
              {message.role === 'assistant' && message.id !== '1' && isLastAssistantMessage && (
                <MessageActions>
                  <MessageAction
                    onClick={() => regenerateMessage(message.id)}
                    tooltip="Re-explain"
                    label="Re-explain"
                    disabled={isLoading}
                  >
                    <RefreshCcwIcon className="size-3" />
                  </MessageAction>
                  <MessageAction
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    tooltip="Copy"
                    label="Copy"
                  >
                    <CopyIcon className="size-3" />
                  </MessageAction>
                </MessageActions>
              )}
            </Fragment>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <Message from="assistant">
            <MessageContent className="rounded-2xl px-4 py-3 shadow-sm bg-card border border-border rounded-bl-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </MessageContent>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Using ai-elements PromptInput */}
      <div className="border-t border-border bg-background p-3">
        <PromptInput
          onSubmit={(message: PromptInputMessage) => {
            const hasText = message.text.trim();
            const hasFiles = message.files?.length > 0;
            if (hasText || hasFiles) {
              sendMessage(message.text || 'Sent with attachments');
            }
          }}
          multiple
        >
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type your message..."
              disabled={isLoading}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <AIContextButton />
            </PromptInputTools>
            <PromptInputSubmit
              status={chatStatus}
              disabled={isLoading}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
});
