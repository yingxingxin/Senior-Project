'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Sparkles, MoreVertical, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type SupportedModel = 'atlas' | 'sage' | 'nova';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatPopup({ open, onOpenChange }: AIChatPopupProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SupportedModel>('nova');
  const [reExplainingMessageId, setReExplainingMessageId] = useState<string | null>(null);

  const getModelName = (model: SupportedModel) => {
    const names: Record<SupportedModel, string> = {
      nova: 'Nova',
      atlas: 'Atlas',
      sage: 'Sage',
    };
    return names[model];
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm ${getModelName('nova')}, and I'm here to help you learn programming. What would you like to know? ✨`,
      timestamp: new Date(),
    },
  ]);

  // Update welcome message when model changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].id === '1') {
        return [
          {
            ...prev[0],
            content: `Hello! I'm ${getModelName(selectedModel)}, and I'm here to help you learn programming. What would you like to know? ✨`,
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  }, [selectedModel]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare messages for API (excluding the welcome message)
      const apiMessages = [
        ...messages.slice(1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: userMessage.content,
        },
      ];

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 1000,
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
      if (error instanceof Error && error.message.includes('OpenRouter API key not configured')) {
        errorContent = `⚠️ OpenRouter API key not configured.\n\nTo enable AI chat, please:\n1. Get an API key from https://openrouter.ai/keys\n2. Add OPENROUTER_API_KEY to your .env or .env.local file\n3. Restart your development server`;
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReExplain = async (messageId: string, originalContent: string) => {
    if (isLoading || reExplainingMessageId) return;
    
    setReExplainingMessageId(messageId);
    setIsLoading(true);

    try {
      // Find the user's question that led to this response
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;
      
      // Find the previous user message
      let userQuestion = '';
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userQuestion = messages[i].content;
          break;
        }
      }

      if (!userQuestion) {
        userQuestion = 'the previous question';
      }

      // Prepare messages for API
      const apiMessages = [
        ...messages.slice(1, messageIndex).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: `Please re-explain your previous answer about "${userQuestion}" in simpler, easier-to-understand terms. Make it more accessible and break down any complex concepts.`,
        },
      ];

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get re-explanation');
      }

      const data = await response.json();

      // Update the message with the re-explanation
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: data.message }
            : msg
        )
      );
    } catch (error) {
      console.error('Error re-explaining:', error);
    } finally {
      setIsLoading(false);
      setReExplainingMessageId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full h-[80vh] p-0 flex flex-col" style={{ backgroundColor: '#E6EDf5' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-300/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gray-600" />
              AI Chat
            </DialogTitle>
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as SupportedModel)}>
              <SelectTrigger className="w-[140px] border-gray-300 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="atlas">Atlas</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-fade-in-up',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
                  message.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-blue-500'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={cn('flex flex-col gap-1 max-w-[75%]', message.role === 'user' ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'relative px-4 py-3 rounded-2xl shadow-md break-words',
                    'backdrop-blur-sm',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                  )}
                >
                  {/* Mystic Messenger-style tail */}
                  <div
                    className={cn(
                      'absolute w-0 h-0',
                      message.role === 'user'
                        ? 'right-0 top-0 translate-x-full border-l-[12px] border-l-blue-500 border-t-[12px] border-t-transparent'
                        : 'left-0 top-0 -translate-x-full border-r-[12px] border-r-white border-t-[12px] border-t-transparent'
                    )}
                  />
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Timestamp and Actions */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-gray-500 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.role === 'assistant' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                          disabled={isLoading || reExplainingMessageId === message.id}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          onClick={() => handleReExplain(message.id, message.content)}
                          disabled={isLoading || reExplainingMessageId === message.id}
                          className="cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-explain in simpler terms
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in-up">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-blue-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="relative px-4 py-3 rounded-2xl rounded-tl-none shadow-md bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-300/50 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[120px] resize-none border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-[60px] px-6 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
