'use client';

import { useState, useRef, useEffect } from 'react';
import { AIChatWindow, type AIChatWindowHandle } from './chat-window';
import { X, Minimize2, Bot } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAIContext } from '../context/provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingAIChatProps {
  assistantAvatarUrl: string | null;
  assistantName: string;
}

export function FloatingAIChat({ assistantAvatarUrl, assistantName }: FloatingAIChatProps) {
  const { isChatOpen, setChatOpen, consumePendingMessage } = useAIContext();
  const chatRef = useRef<AIChatWindowHandle>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chatButtonPosition');
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition);
        setPosition({ x, y });
      } catch {
        // Invalid saved position, use default
      }
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('chatButtonPosition', JSON.stringify(position));
    }
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isChatOpen) return; // Don't drag when chat is open
    
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isChatOpen) return;

    setHasMoved(true);
    const newX = e.clientX - dragOffset.x - (buttonRef.current?.offsetWidth || 0) / 2;
    const newY = e.clientY - dragOffset.y - (buttonRef.current?.offsetHeight || 0) / 2;

    // Constrain to viewport
    const maxX = window.innerWidth - (buttonRef.current?.offsetWidth || 64);
    const maxY = window.innerHeight - (buttonRef.current?.offsetHeight || 64);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click to process
    setTimeout(() => setHasMoved(false), 100);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Handle window drag
  const handleWindowMouseDown = (e: React.MouseEvent) => {
    // Only drag from the header area
    const target = e.target as HTMLElement;
    if (!target.closest('[data-drag-handle]')) return;

    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleWindowMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isChatOpen) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 384);
    const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 600);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  useEffect(() => {
    if (isDragging && isChatOpen) {
      document.addEventListener('mousemove', handleWindowMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleWindowMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isChatOpen, dragOffset]);

  // Handle pending messages when chat opens
  useEffect(() => {
    if (isChatOpen && chatRef.current) {
      const pending = consumePendingMessage();
      if (pending) {
        // Small delay to ensure chat is fully rendered
        setTimeout(() => {
          chatRef.current?.sendMessage(pending);
        }, 100);
      }
    }
  }, [isChatOpen, consumePendingMessage]);

  return (
    <>
      {/* Floating Chat Button with Tooltip */}
      {!isChatOpen && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                ref={buttonRef}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                    return;
                  }
                  setChatOpen(true);
                }}
                onMouseDown={handleMouseDown}
                className={cn(
                  'fixed z-50 w-14 h-14 rounded-full text-white shadow-xl transition-all duration-300 flex items-center justify-center',
                  'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600',
                  'hover:shadow-2xl hover:scale-105',
                  'active:scale-95',
                  'ring-2 ring-white/20 ring-offset-2 ring-offset-transparent',
                  isDragging ? 'scale-110 cursor-grabbing shadow-2xl' : 'cursor-move'
                )}
                style={{
                  left: position.x || undefined,
                  right: position.x === 0 ? 24 : undefined,
                  bottom: position.y === 0 ? 24 : undefined,
                  top: position.y || undefined,
                }}
                aria-label={`Chat with ${assistantName}`}
              >
                {assistantAvatarUrl ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={assistantAvatarUrl}
                      alt={`${assistantName} avatar`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                ) : (
                  <Bot className="h-7 w-7" />
                )}
                {/* Online indicator - more subtle pulse */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              <p className="font-medium">Chat with {assistantName}</p>
              <p className="text-xs text-muted-foreground">Drag to move</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div
          ref={windowRef}
          onMouseDown={handleWindowMouseDown}
          className={cn(
            'fixed z-50 w-96 rounded-2xl shadow-2xl border-2 border-gray-300',
            'backdrop-blur-sm flex flex-col overflow-hidden',
            'animate-scale-in',
            isMinimized ? 'h-16' : 'h-[600px]',
            isDragging && 'cursor-grabbing'
          )}
          style={{
            backgroundColor: '#E6EDf5',
            left: position.x || undefined,
            right: position.x === 0 ? 24 : undefined,
            bottom: position.y === 0 ? 24 : undefined,
            top: position.y || undefined,
          }}
        >
          {/* Header */}
          <div 
            data-drag-handle
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b border-gray-300/50 bg-white/80 backdrop-blur-sm flex-shrink-0",
              "cursor-move hover:bg-white/90 transition-colors"
            )}
          >
            <div className="flex items-center gap-3">
              {assistantAvatarUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                  <Image
                    src={assistantAvatarUrl}
                    alt={`${assistantName} avatar`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-2 border-gray-300">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm text-gray-900">{assistantName}</p>
                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatOpen(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden min-h-0">
              <AIChatWindow
                ref={chatRef}
                assistantAvatarUrl={assistantAvatarUrl}
                assistantName={assistantName}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

