'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type SupportedModel = 'nova' | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo';

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

export function AIChatWindow({ assistantAvatarUrl, assistantName }: AIChatWindowProps) {
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
      {/* Model Selector - Compact */}
      <div className="px-4 py-2 border-b border-pink-200/50 dark:border-pink-800/30 bg-white/30 dark:bg-gray-900/30">
        <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as SupportedModel)}>
          <SelectTrigger className="w-full h-8 text-xs border-pink-300 dark:border-pink-700 bg-white/80 dark:bg-gray-800/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nova">Nova</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start gap-2 animate-fade-in-up',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {message.role === 'assistant' && assistantAvatarUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-300 dark:border-purple-700">
                  <Image
                    src={assistantAvatarUrl}
                    alt={assistantName || 'Assistant'}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shadow-md',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
            </div>

            {/* Message Bubble */}
            <div className={cn('flex flex-col gap-1 max-w-[75%]', message.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'relative px-3 py-2 rounded-xl shadow-sm break-words text-sm',
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
                      ? 'right-0 top-0 translate-x-full border-l-[8px] border-l-pink-400 border-t-[8px] border-t-transparent'
                      : 'left-0 top-0 -translate-x-full border-r-[8px] border-r-white dark:border-r-gray-800 border-t-[8px] border-t-transparent'
                  )}
                />
                
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Timestamp */}
              <span className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 animate-fade-in-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-purple-500 to-indigo-500">
              {assistantAvatarUrl ? (
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={assistantAvatarUrl}
                    alt={assistantName || 'Assistant'}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="relative px-3 py-2 rounded-xl rounded-tl-none shadow-sm bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 pt-3 border-t border-pink-200/50 dark:border-pink-800/30 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[50px] max-h-[100px] resize-none border-pink-300 dark:border-pink-700 bg-white/90 dark:bg-gray-800/90 focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-600 rounded-xl text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-[50px] px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

