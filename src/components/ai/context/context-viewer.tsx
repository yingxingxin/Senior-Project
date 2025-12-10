'use client';

/**
 * AI Context Viewer
 *
 * Collapsible panel showing what context the AI has access to.
 * Displayed in the chat window header area.
 *
 * Shows:
 * - Current lesson (if viewing a lesson)
 * - Current quiz (if taking a quiz)
 * - User-highlighted quotes (removable)
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, X, BookOpen, HelpCircle, Quote, GraduationCap } from 'lucide-react';
import { useAIContext, useHasAIContext } from './provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/src/lib/utils';

type AIContextViewerProps = {
  className?: string;
};

export function AIContextViewer({ className }: AIContextViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { course, lesson, quiz, quotes, removeQuote, clearQuotes } = useAIContext();
  const hasContext = useHasAIContext();

  // Don't render anything if no context and not expanded
  if (!hasContext && !isExpanded) {
    return null;
  }

  // Build context summary for collapsed state
  const contextParts: string[] = [];
  if (course) contextParts.push('Course');
  if (lesson) contextParts.push('Lesson');
  if (quiz) contextParts.push('Quiz');
  if (quotes.length > 0) contextParts.push(`${quotes.length} quote${quotes.length > 1 ? 's' : ''}`);

  return (
    <div className={cn('border-b border-border bg-muted/30', className)}>
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="font-medium">Context</span>
          {hasContext && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {contextParts.join(' + ')}
            </Badge>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Course context */}
          {course && (
            <div className="flex items-start gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{course.title}</span>
                <span className="text-muted-foreground">
                  {' '}&middot; Lesson {course.lessonIndex + 1} of {course.totalLessons}
                </span>
              </div>
            </div>
          )}

          {/* Lesson context */}
          {lesson && (
            <div className="flex items-start gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{lesson.title}</span>
                {lesson.currentSection && (
                  <span className="text-muted-foreground"> &middot; {lesson.currentSection}</span>
                )}
              </div>
            </div>
          )}

          {/* Quiz context */}
          {quiz && (
            <div className="flex items-start gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{quiz.title}</span>
                {quiz.questionIndex !== undefined && quiz.totalQuestions && (
                  <span className="text-muted-foreground">
                    {' '}&middot; Q{quiz.questionIndex + 1}/{quiz.totalQuestions}
                  </span>
                )}
                {quiz.question && (
                  <p className="text-muted-foreground truncate">{quiz.question.prompt}</p>
                )}
              </div>
            </div>
          )}

          {/* User quotes */}
          {quotes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Highlighted Text</span>
                {quotes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearQuotes();
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              {quotes.map((quote, index) => (
                <div
                  key={`${quote.source}-${index}`}
                  className="flex items-start gap-2 text-sm bg-background/50 rounded-md p-2"
                >
                  <Quote className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground line-clamp-2">&ldquo;{quote.text}&rdquo;</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{quote.source}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuote(index);
                    }}
                    aria-label="Remove quote"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!hasContext && (
            <p className="text-sm text-muted-foreground py-2">
              No context added. Navigate to a lesson or select text to add context.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
