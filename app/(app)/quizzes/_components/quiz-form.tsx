'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body, Muted } from '@/components/ui/typography';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lightbulb, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAIContext } from '@/components/ai-context-provider';
import { TextSelectionProvider } from '@/components/text-selection-popup';

type Question = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
};

type QuizFormProps = {
  quizId: number;
  quizTitle: string;
  questions: Question[];
  assistantName: string;
  assistantAvatar?: string | null;
};

export function QuizForm({ quizId, quizTitle, questions, assistantName, assistantAvatar }: QuizFormProps) {
  const router = useRouter();
  const { setQuiz } = useAIContext();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<Record<number, string>>({});
  const [loadingHints, setLoadingHints] = useState<Record<number, boolean>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    questionResults: Array<{
      questionId: number;
      isCorrect: boolean;
      correctIndex: number;
      userIndex: number;
      explanation?: string | null;
    }>;
  } | null>(null);
  const [lastAnsweredQuestionId, setLastAnsweredQuestionId] = useState<number | null>(null);

  // Set quiz context for AI assistant
  useEffect(() => {
    const currentQuestion = lastAnsweredQuestionId
      ? questions.find((q) => q.id === lastAnsweredQuestionId)
      : questions[0];

    setQuiz({
      id: quizId,
      title: quizTitle,
      question: currentQuestion
        ? {
            id: currentQuestion.id,
            prompt: currentQuestion.prompt,
            options: currentQuestion.options,
            selectedIndex: answers[currentQuestion.id],
          }
        : undefined,
    });
    return () => setQuiz(null); // Clear on unmount
  }, [quizId, quizTitle, questions, answers, lastAnsweredQuestionId, setQuiz]);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}/progress`);
        if (response.ok) {
          const data = await response.json();
          if (data.answers && Object.keys(data.answers).length > 0) {
            setAnswers(data.answers);
          }
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    };

    if (!results) {
      loadProgress();
    }
  }, [quizId, results]);

  // Save progress when answers change (debounced)
  useEffect(() => {
    if (results || Object.keys(answers).length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`/api/quizzes/${quizId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [answers, quizId, results]);

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setLastAnsweredQuestionId(questionId);
  };

  const handleRequestHint = async (questionId: number) => {
    setLoadingHints((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await fetch(`/api/quizzes/${quizId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedIndex: answers[questionId],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get hint');
      }

      const data = await response.json();
      setHints((prev) => ({ ...prev, [questionId]: data.hint }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get hint');
    } finally {
      setLoadingHints((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleRequestExplanation = async (questionId: number, userSelectedIndex: number) => {
    setLoadingExplanations((prev) => ({ ...prev, [questionId]: true }));
    try {
      const response = await fetch(`/api/quizzes/${quizId}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          userSelectedIndex,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get explanation');
      }

      const data = await response.json();
      setExplanations((prev) => ({ ...prev, [questionId]: data.explanation }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get explanation');
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleRequestSummary = async () => {
    if (!results) return;

    setLoadingSummary(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionResults: results.questionResults,
          score: results.score,
          total: results.total,
          percentage: results.percentage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get summary');
      }

      const data = await response.json();
      setOverallSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleResetQuiz = async () => {
    // Clear saved progress
    try {
      await fetch(`/api/quizzes/${quizId}/progress`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear progress:', err);
    }

    // Clear all state to reset the quiz
    setAnswers({});
    setResults(null);
    setHints({});
    setExplanations({});
    setOverallSummary(null);
    setError(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToQuizzes = () => {
    router.push('/quizzes');
  };

  const handleSubmit = async () => {
    // Check all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
            questionId: Number(questionId),
            selectedIndex,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit quiz');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (results) {
    return (
      <TextSelectionProvider source={`${quizTitle} quiz`}>
      <Stack gap="loose">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          <Stack gap="default">
            <Heading level={2}>Quiz Results</Heading>
            <Body className="text-lg">
              You got {results.score} out of {results.total} correct ({results.percentage}%)
            </Body>
            
            {overallSummary ? (
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Summary from {assistantName}:</strong>
                  <div className="mt-2">{overallSummary}</div>
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleRequestSummary}
                disabled={loadingSummary}
                className="mt-4"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting summary...
                  </>
                ) : (
                  `Get overall summary from ${assistantName}`
                )}
              </Button>
            )}
          </Stack>
        </Card>

        <Stack gap="default">
          {questions.map((question, index) => {
            const questionResult = results.questionResults.find(
              (r) => r.questionId === question.id
            );
            if (!questionResult) return null;

            const isCorrect = questionResult.isCorrect;
            const userAnswer = question.options[questionResult.userIndex];
            const correctAnswer = question.options[questionResult.correctIndex];

            return (
              <Card key={question.id} className="p-6">
                <Stack gap="default">
                  <div className="flex items-start justify-between">
                    <Heading level={4}>Question {index + 1}</Heading>
                    {isCorrect ? (
                      <Muted className="text-green-500">✓ Correct</Muted>
                    ) : (
                      <Muted className="text-red-500">✗ Incorrect</Muted>
                    )}
                  </div>

                  <Body>{question.prompt}</Body>

                  <Stack gap="tight">
                    <div>
                      <Muted variant="small" className="font-medium">
                        Your answer:
                      </Muted>
                      <Body
                        className={isCorrect ? 'text-green-500' : 'text-red-500'}
                      >
                        {userAnswer}
                      </Body>
                    </div>

                    {!isCorrect && (
                      <div>
                        <Muted variant="small" className="font-medium">
                          Correct answer:
                        </Muted>
                        <Body className="text-green-500">{correctAnswer}</Body>
                      </div>
                    )}

                    {questionResult.explanation && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <Muted variant="small" className="font-medium mb-1 block">
                          Static Explanation:
                        </Muted>
                        <Body variant="small" className="text-muted-foreground">
                          {questionResult.explanation}
                        </Body>
                      </div>
                    )}

                    {explanations[question.id] ? (
                      <Alert>
                        <AlertDescription>
                          <strong>Explanation from {assistantName}:</strong>
                          <div className="mt-2">{explanations[question.id]}</div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestExplanation(question.id, questionResult.userIndex)}
                        disabled={loadingExplanations[question.id]}
                      >
                        {loadingExplanations[question.id] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Getting explanation...
                          </>
                        ) : (
                          `Explain this with ${assistantName}`
                        )}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Stack>

        <Card className="p-6">
          <Stack gap="default">
            <Heading level={3}>What&apos;s Next?</Heading>
            <Body>
              Review your answers above, or try the quiz again to improve your score.
            </Body>
            <Inline gap="default" className="flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetQuiz}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Quiz
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToQuizzes}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quizzes
              </Button>
            </Inline>
          </Stack>
        </Card>
      </Stack>
      </TextSelectionProvider>
    );
  }

  return (
    <TextSelectionProvider source={`${quizTitle} quiz`}>
    <Stack gap="loose">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Stack gap="default">
        {questions.map((question, index) => (
          <Card key={question.id} className="p-6">
            <Stack gap="default">
              <Heading level={4}>Question {index + 1}</Heading>
              <Body>{question.prompt}</Body>

              <RadioGroup
                value={answers[question.id] !== undefined ? String(answers[question.id]) : ''}
                onValueChange={(value) => handleAnswerChange(question.id, Number(value))}
                disabled={isSubmitting}
              >
                <Stack gap="tight">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      htmlFor={`q${question.id}-o${optionIndex}`}
                      className="flex items-center gap-3 py-3 px-4 cursor-pointer rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={String(optionIndex)} id={`q${question.id}-o${optionIndex}`} />
                      <Body variant="small" as="span">{option}</Body>
                    </label>
                  ))}
                </Stack>
              </RadioGroup>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRequestHint(question.id)}
                disabled={loadingHints[question.id] || isSubmitting}
              >
                {loadingHints[question.id] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting hint...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Ask {assistantName} for a hint
                  </>
                )}
              </Button>

              {hints[question.id] && (
                <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Muted variant="small" className="font-medium mb-1 block">
                    Hint from {assistantName}:
                  </Muted>
                  <Body variant="small" className="text-muted-foreground">
                    {hints[question.id]}
                  </Body>
                </div>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length !== questions.length}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Quiz'
          )}
        </Button>
      </div>
    </Stack>
    </TextSelectionProvider>
  );
}

