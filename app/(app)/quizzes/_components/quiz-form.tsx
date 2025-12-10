'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body } from '@/components/ui/typography';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAIContext } from '@/src/components/ai/context';
import { TextSelectionProvider } from '@/components/text-selection-popup';
import { QuizQuestionCard, QuizProgressBar, QuizResultSummary } from '@/components/ui/quiz';

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
  const { setQuiz, sendMessageToChat } = useAIContext();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    const questionIndex = currentQuestion
      ? questions.findIndex((q) => q.id === currentQuestion.id)
      : 0;

    setQuiz({
      id: quizId,
      title: quizTitle,
      questionIndex,
      totalQuestions: questions.length,
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

  // Opens AI chat with a hint request - AI has full quiz context
  const handleRequestHint = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      sendMessageToChat(`Can you give me a hint for this question: "${question.prompt}"`);
    }
  };

  // Opens AI chat to explain the answer - AI has full quiz context
  const handleRequestExplanation = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      sendMessageToChat(`Can you explain the answer to: "${question.prompt}"`);
    }
  };

  // Opens AI chat for overall quiz summary
  const handleRequestSummary = () => {
    if (!results) return;
    sendMessageToChat(`Can you summarize my quiz results and suggest what I should review? I got ${results.score} out of ${results.total} correct (${results.percentage}%).`);
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

          <QuizResultSummary
            score={results.score}
            total={results.total}
            percentage={results.percentage}
            quizTitle={quizTitle}
            assistantName={assistantName}
            onRequestSummary={handleRequestSummary}
          />

          <Stack gap="default">
            {questions.map((question, index) => {
              const questionResult = results.questionResults.find(
                (r) => r.questionId === question.id
              );
              if (!questionResult) return null;

              return (
                <QuizQuestionCard
                  key={question.id}
                  questionNumber={index + 1}
                  questionId={question.id}
                  prompt={question.prompt}
                  options={question.options}
                  reviewMode={true}
                  isCorrect={questionResult.isCorrect}
                  correctIndex={questionResult.correctIndex}
                  userIndex={questionResult.userIndex}
                  explanation={questionResult.explanation}
                  onRequestExplanation={handleRequestExplanation}
                  assistantName={assistantName}
                />
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

  const answeredCount = Object.keys(answers).length;
  const currentQuestionIndex = Math.max(0, answeredCount - 1);

  return (
    <TextSelectionProvider source={`${quizTitle} quiz`}>
      <Stack gap="loose">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress Bar */}
        <Card className="p-4">
          <QuizProgressBar
            current={answeredCount}
            total={questions.length}
          />
        </Card>

        {/* Questions */}
        <Stack gap="default">
          {questions.map((question, index) => (
            <QuizQuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionId={question.id}
              prompt={question.prompt}
              options={question.options}
              selectedIndex={answers[question.id]}
              onAnswerChange={handleAnswerChange}
              onRequestHint={handleRequestHint}
              assistantName={assistantName}
              disabled={isSubmitting}
            />
          ))}
        </Stack>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount !== questions.length}
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

