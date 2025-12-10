'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuizQuestionCardProps {
  questionNumber: number;
  questionId: number;
  prompt: string;
  options: string[];
  selectedIndex?: number;
  onAnswerChange?: (questionId: number, optionIndex: number) => void;
  onRequestHint?: (questionId: number) => void;
  assistantName?: string;
  disabled?: boolean;
  // Review mode props
  reviewMode?: boolean;
  isCorrect?: boolean;
  correctIndex?: number;
  userIndex?: number;
  explanation?: string | null;
  onRequestExplanation?: (questionId: number) => void;
}

export function QuizQuestionCard({
  questionNumber,
  questionId,
  prompt,
  options,
  selectedIndex,
  onAnswerChange,
  onRequestHint,
  assistantName,
  disabled = false,
  reviewMode = false,
  isCorrect,
  correctIndex,
  userIndex,
  explanation,
  onRequestExplanation,
}: QuizQuestionCardProps) {
  const isAnswered = selectedIndex !== undefined;

  return (
    <Card className={cn(
      'transition-colors',
      reviewMode && isCorrect && 'border-success/50 bg-success/5',
      reviewMode && !isCorrect && 'border-destructive/50 bg-destructive/5'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>
            <Heading level={4}>Question {questionNumber}</Heading>
          </CardTitle>
          {reviewMode && (
            <>
              {isCorrect ? (
                <Badge className="bg-success/20 text-success border-success/30 shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30 shrink-0">
                  <XCircle className="h-3 w-3 mr-1" />
                  Incorrect
                </Badge>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Stack gap="default">
          <Body>{prompt}</Body>

          {!reviewMode ? (
            <>
              <RadioGroup
                value={selectedIndex !== undefined ? String(selectedIndex) : ''}
                onValueChange={(value) => onAnswerChange?.(questionId, Number(value))}
                disabled={disabled}
                aria-label={`Question ${questionNumber} options`}
              >
                <Stack gap="tight">
                  {options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      htmlFor={`q${questionId}-o${optionIndex}`}
                      className={cn(
                        'flex items-center gap-3 py-3 px-4 cursor-pointer rounded-lg border transition-colors',
                        'hover:border-primary/50 hover:bg-accent/50',
                        selectedIndex === optionIndex && 'border-primary bg-accent',
                        disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <RadioGroupItem
                        value={String(optionIndex)}
                        id={`q${questionId}-o${optionIndex}`}
                        disabled={disabled}
                      />
                      <Body variant="small" as="span" className="flex-1">
                        {option}
                      </Body>
                    </label>
                  ))}
                </Stack>
              </RadioGroup>

              {onRequestHint && assistantName && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestHint(questionId)}
                  disabled={disabled}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Ask {assistantName} for a hint
                </Button>
              )}
            </>
          ) : (
            <Stack gap="default">
              {/* User's answer */}
              <div>
                <Muted variant="small" className="font-medium mb-1 block">
                  Your answer:
                </Muted>
                <Body
                  className={cn(
                    isCorrect ? 'text-success' : 'text-destructive'
                  )}
                >
                  {userIndex !== undefined ? options[userIndex] : 'Not answered'}
                </Body>
              </div>

              {/* Correct answer (only show if incorrect) */}
              {!isCorrect && correctIndex !== undefined && (
                <div>
                  <Muted variant="small" className="font-medium mb-1 block">
                    Correct answer:
                  </Muted>
                  <Body className="text-success">
                    {options[correctIndex]}
                  </Body>
                </div>
              )}

              {/* Explanation */}
              {explanation && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <Muted variant="small" className="font-medium mb-1 block">
                    Explanation:
                  </Muted>
                  <Body variant="small" className="text-muted-foreground">
                    {explanation}
                  </Body>
                </div>
              )}

              {/* Request explanation button */}
              {onRequestExplanation && assistantName && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestExplanation(questionId)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Explain this with {assistantName}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

