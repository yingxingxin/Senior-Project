'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type SupportedModel = 'nova' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help you. What would you like to know? ✨',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SupportedModel>('nova');
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

      const response = await fetch('/api/chat', {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full h-[80vh] p-0 flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border-2 border-pink-200 dark:border-pink-800/50">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-pink-200/50 dark:border-pink-800/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              AI Chat
            </DialogTitle>
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as SupportedModel)}>
              <SelectTrigger className="w-[140px] border-pink-300 dark:border-pink-700 bg-white/80 dark:bg-gray-900/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nova">Nova</SelectItem>
                <SelectItem value="Atlas">GPT-4o</SelectItem>
                <SelectItem value="Sage">GPT-4o Mini</SelectItem>
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
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-500'
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
                      ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-tr-none'
                      : 'bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 rounded-tl-none border border-purple-200/50 dark:border-purple-700/50'
                  )}
                >
                  {/* Mystic Messenger-style tail */}
                  <div
                    className={cn(
                      'absolute w-0 h-0',
                      message.role === 'user'
                        ? 'right-0 top-0 translate-x-full border-l-[12px] border-l-pink-400 border-t-[12px] border-t-transparent'
                        : 'left-0 top-0 -translate-x-full border-r-[12px] border-r-white dark:border-r-gray-800 border-t-[12px] border-t-transparent'
                    )}
                  />
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-fade-in-up">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="relative px-4 py-3 rounded-2xl rounded-tl-none shadow-md bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 pb-6 pt-4 border-t border-pink-200/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[120px] resize-none border-pink-300 dark:border-pink-700 bg-white/90 dark:bg-gray-800/90 focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-600 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-[60px] px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
