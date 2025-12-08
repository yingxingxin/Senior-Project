'use client';

/**
 * AI Context Button
 *
 * Modern hover card button showing what context the AI has access to.
 * Uses ai-elements HoverCard pattern for rich, hover-triggered display.
 *
 * Shows:
 * - Current lesson (if viewing a lesson)
 * - Current quiz (if taking a quiz)
 * - User-highlighted quotes (removable)
 *
 * Design Decision: Using HoverCard instead of collapsible panel because:
 * - Better UX: Hover to preview, click to interact
 * - Cleaner: Doesn't take up space when collapsed
 * - Modern: Matches Cursor/VS Code AI interfaces
 */

import { BookOpen, HelpCircle, Quote, X, Sparkles } from 'lucide-react';
import { useAIContext, useHasAIContext } from './ai-context-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/src/lib/utils';
import {
  PromptInputHoverCard,
  PromptInputHoverCardTrigger,
  PromptInputHoverCardContent,
  PromptInputCommand,
  PromptInputCommandList,
  PromptInputCommandGroup,
  PromptInputCommandItem,
  PromptInputButton,
} from '@/src/components/ai-elements/prompt-input';

type AIContextButtonProps = {
  className?: string;
};

export function AIContextButton({ className }: AIContextButtonProps) {
  const { lesson, quiz, quotes, removeQuote, clearQuotes } = useAIContext();
  const hasContext = useHasAIContext();

  // Count total context items
  const contextCount =
    (lesson ? 1 : 0) + (quiz ? 1 : 0) + quotes.length;

  // Don't render if no context
  if (!hasContext) {
    return null;
  }

  return (
    <PromptInputHoverCard openDelay={200} closeDelay={100}>
      <PromptInputHoverCardTrigger asChild>
        <PromptInputButton
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5 text-xs h-7 px-2 border-dashed hover:border-solid transition-all',
            className
          )}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Context</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1 py-0 h-4 min-w-[16px] flex items-center justify-center"
          >
            {contextCount}
          </Badge>
        </PromptInputButton>
      </PromptInputHoverCardTrigger>

      <PromptInputHoverCardContent
        className="w-[320px] p-0"
        side="top"
        align="start"
      >
        <PromptInputCommand className="rounded-lg">
          <PromptInputCommandList className="max-h-[300px]">
            {/* Lesson Context */}
            {lesson && (
              <PromptInputCommandGroup heading="Lesson">
                <PromptInputCommandItem className="gap-2 cursor-default">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {lesson.title}
                    </p>
                    {lesson.currentSection && (
                      <p className="text-xs text-muted-foreground truncate">
                        {lesson.currentSection}
                      </p>
                    )}
                  </div>
                </PromptInputCommandItem>
              </PromptInputCommandGroup>
            )}

            {/* Quiz Context */}
            {quiz && (
              <PromptInputCommandGroup heading="Quiz">
                <PromptInputCommandItem className="gap-2 cursor-default">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{quiz.title}</p>
                    {quiz.question && (
                      <p className="text-xs text-muted-foreground truncate">
                        {quiz.question.prompt}
                      </p>
                    )}
                  </div>
                </PromptInputCommandItem>
              </PromptInputCommandGroup>
            )}

            {/* Quotes */}
            {quotes.length > 0 && (
              <PromptInputCommandGroup
                heading={
                  <div className="flex items-center justify-between w-full pr-2">
                    <span>Highlighted Text</span>
                    {quotes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1.5 -mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearQuotes();
                        }}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                }
              >
                {quotes.map((quote, index) => (
                  <PromptInputCommandItem
                    key={`${quote.source}-${index}`}
                    className="gap-2 group cursor-default"
                  >
                    <Quote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">
                        &ldquo;{quote.text}&rdquo;
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {quote.source}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuote(index);
                      }}
                      aria-label="Remove quote"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </PromptInputCommandItem>
                ))}
              </PromptInputCommandGroup>
            )}
          </PromptInputCommandList>
        </PromptInputCommand>
      </PromptInputHoverCardContent>
    </PromptInputHoverCard>
  );
}
