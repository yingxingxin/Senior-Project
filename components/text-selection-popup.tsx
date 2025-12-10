'use client';

/**
 * Text Selection Popup
 *
 * Shows a popup when user selects text, allowing them to:
 * - Add the selection to chat (primary)
 * - Auto-send "explain this" with the quote
 * - Just add to context without opening chat
 *
 * Uses AIContextProvider to control the floating chat.
 *
 * Usage:
 * Wrap content where you want text selection to work:
 * <TextSelectionProvider source="Python Loops lesson">
 *   <LessonContent />
 * </TextSelectionProvider>
 */

import { useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Lightbulb, Plus } from 'lucide-react';
import { useAIContext } from '@/src/components/ai/context';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';

type SelectionState = {
  text: string;
  x: number;
  y: number;
  useMargin: boolean; // true = right margin (LessWrong style), false = above text
} | null;

type TextSelectionProviderProps = {
  children: ReactNode;
  source: string; // e.g., "Python Loops lesson"
  className?: string;
  disabled?: boolean;
};

export function TextSelectionProvider({
  children,
  source,
  className,
  disabled = false,
}: TextSelectionProviderProps) {
  const [selection, setSelection] = useState<SelectionState>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addQuote, openChat, sendMessageToChat } = useAIContext();

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    if (disabled) return;

    // Small delay to ensure selection is complete
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();

      // Validate selection
      if (!text || text.length < 3 || text.length > 500) {
        setSelection(null);
        return;
      }

      // Check if selection is within our container
      if (containerRef.current && sel?.anchorNode) {
        if (!containerRef.current.contains(sel.anchorNode)) {
          setSelection(null);
          return;
        }
      }

      // Get position for popup
      const range = sel?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        // Check if we have margin space on the right (LessWrong style)
        // Need ~120px for buttons in the right margin
        const containerRect = containerRef.current?.getBoundingClientRect();
        const contentRightEdge = containerRect ? containerRect.right : rect.right;
        const hasMarginSpace = window.innerWidth - contentRightEdge > 120;

        if (hasMarginSpace) {
          // Position in right margin, vertically centered on selection
          setSelection({
            text,
            x: contentRightEdge + 16, // 16px gap from content edge
            y: rect.top + window.scrollY + rect.height / 2,
            useMargin: true,
          });
        } else {
          // Fall back to above-text positioning (mobile/narrow screens)
          setSelection({
            text,
            x: rect.left + rect.width / 2 + window.scrollX,
            y: rect.top + window.scrollY - 8,
            useMargin: false,
          });
        }
      }
    }, 10);
  }, [disabled]);

  // Clear selection on click elsewhere
  const handleMouseDown = useCallback((e: MouseEvent) => {
    // If clicking outside the popup, clear selection
    const target = e.target as HTMLElement;
    if (!target.closest('[data-text-selection-popup]')) {
      setSelection(null);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  // Action handlers
  const handleAddToChat = useCallback(() => {
    if (!selection) return;
    addQuote(selection.text, source);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    openChat();
  }, [selection, source, addQuote, openChat]);

  const handleExplainThis = useCallback(() => {
    if (!selection) return;
    addQuote(selection.text, source);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    // Open chat and auto-send explain message
    sendMessageToChat('Can you explain this to me?');
  }, [selection, source, addQuote, sendMessageToChat]);

  const handleJustAdd = useCallback(() => {
    if (!selection) return;
    addQuote(selection.text, source);
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, [selection, source, addQuote]);

  return (
    <div ref={containerRef} className={className}>
      {children}

      {/* Popup portal */}
      {mounted &&
        selection &&
        createPortal(
          <div
            data-text-selection-popup
            className={cn(
              'fixed z-50 p-1 bg-popover border border-border rounded-lg shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-150',
              // Margin mode: stack vertically, Above mode: horizontal row
              selection.useMargin ? 'flex flex-col gap-1' : 'flex items-center gap-1'
            )}
            style={{
              left: selection.x,
              top: selection.y,
              // Margin mode: just vertically center. Above mode: center above selection
              transform: selection.useMargin
                ? 'translateY(-50%)'
                : 'translate(-50%, -100%)',
            }}
          >
            {/* Primary: Add to chat */}
            <Button
              size="sm"
              variant="default"
              className={cn(
                'gap-1.5',
                selection.useMargin ? 'h-8 w-full justify-start' : 'h-8'
              )}
              onClick={handleAddToChat}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </Button>

            {/* Secondary: Explain this */}
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                'gap-1.5',
                selection.useMargin ? 'h-8 w-full justify-start' : 'h-8'
              )}
              onClick={handleExplainThis}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Explain</span>
            </Button>

            {/* Tertiary: Just add */}
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                selection.useMargin ? 'h-8 w-full justify-start gap-1.5' : 'h-8 w-8 p-0'
              )}
              onClick={handleJustAdd}
              title="Add to context"
            >
              <Plus className="h-4 w-4" />
              {selection.useMargin && <span>Add to context</span>}
            </Button>

            {/* Arrow pointer - only show in above-text mode */}
            {!selection.useMargin && (
              <>
                <div
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid hsl(var(--border))',
                  }}
                />
                <div
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '5px solid hsl(var(--popover))',
                    marginTop: '-1px',
                  }}
                />
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
