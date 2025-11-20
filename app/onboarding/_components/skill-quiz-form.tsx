'use client';

import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stack, Inline } from '@/components/ui/spacing';
import { Heading, Body, Muted, Caption } from '@/components/ui/typography';
import { Progress } from '@/components/ui/progress';

type Question = {
  id: number;
  text: string;
  options: { id: number; text: string }[]; // id is the index (0-3), text is the option text
};

const AnswerSchema = z.object({
  questionId: z.number(),
  selectedIndex: z.number().nullable(),
});

const FormSchema = z
  .object({
    answers: z.array(AnswerSchema),
  })
  .superRefine((d, ctx) => {
    d.answers.forEach((a, i) => {
      if (a.selectedIndex === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['answers', i, 'selectedIndex'],
          message: 'Please answer this question',
        });
      }
    });
  });

type FormData = z.infer<typeof FormSchema>;

export function SkillQuizForm({ questions }: { questions: Question[] }) {
  const { submitQuiz, pending, error, setError } = useOnboarding();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      answers: questions.map(q => ({ questionId: q.id, selectedIndex: null })),
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  });

  // Ensure all questionIds are always set correctly
  useEffect(() => {
    questions.forEach((q, i) => {
      form.setValue(`answers.${i}.questionId`, q.id, { shouldValidate: false });
    });
  }, [questions, form]);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('[SkillQuiz] onSubmit called with data:', data);
    setError(null);

    // Validate all questions are answered before submitting
    const unansweredIndices = data.answers
      .map((a, i) => (a.selectedIndex === null ? i : -1))
      .filter(i => i !== -1);

    console.log('[SkillQuiz] Unanswered indices:', unansweredIndices);

    if (unansweredIndices.length > 0) {
      console.log('[SkillQuiz] Validation failed - unanswered questions');
      setError('Please answer all questions before submitting');
      setCurrentQuestionIndex(unansweredIndices[0]); // Jump to first unanswered
      return;
    }

    try {
      // All questions are answered (validated above), safe to use non-null assertion
      const payload = data.answers.map(a => ({
        questionId: a.questionId,
        selectedIndex: a.selectedIndex!, // Non-null assertion - validation ensures this
      }));
      console.log('[SkillQuiz] Calling submitQuiz with payload:', payload);
      await submitQuiz(payload);
      console.log('[SkillQuiz] submitQuiz completed successfully');
    } catch (err) {
      console.error('[SkillQuiz] submitQuiz error:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.';
      setError(message);
    }
  };

  const currentAnswer = form.watch(`answers.${currentQuestionIndex}.selectedIndex`);
  const allAnswers = form.watch('answers');
  const allAnswered = allAnswers.every(a => a.selectedIndex !== null);
  const canProceed = currentAnswer !== null;

  // Debug logging
  console.log('[SkillQuiz] Button state:', {
    isLastQuestion,
    allAnswers,
    allAnswered,
    pending,
    isSubmitting: form.formState.isSubmitting,
    buttonDisabled: !allAnswered || pending || form.formState.isSubmitting,
  });

  // Debug form errors
  console.log('[SkillQuiz] Form errors:', form.formState.errors);
  console.log('[SkillQuiz] Form values:', form.getValues());

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="default">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress indicator */}
        <Stack gap="tight">
          <Inline gap="default" align="center" className="justify-between">
            <Caption variant="uppercase">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Caption>
            <Muted variant="small">{Math.round(progress)}% Complete</Muted>
          </Inline>
          <Progress value={progress} className="h-2" />
        </Stack>

        {/* Current question */}
        <Card>
          <CardHeader>
            <Heading level={3} className="text-lg">
              {currentQuestion.text}
            </Heading>
          </CardHeader>
          <CardContent>
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={i === currentQuestionIndex ? '' : 'hidden'}
                aria-hidden={i !== currentQuestionIndex}
              >
                <Controller
                  name={`answers.${i}.selectedIndex`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Stack gap="tight">
                      <RadioGroup
                        value={field.value === null ? '' : String(field.value)}
                        onValueChange={(v) => field.onChange(v === '' ? null : Number(v))}
                        disabled={pending || form.formState.isSubmitting}
                      >
                        <Stack gap="tight">
                          {questions[i].options.map((opt, optIndex) => {
                            const id = `q${q.id}-o${optIndex}`;
                            return (
                              <label
                                key={optIndex}
                                htmlFor={id}
                                className="flex items-center gap-3 py-3 px-4 cursor-pointer rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                              >
                                <RadioGroupItem value={String(optIndex)} id={id} />
                                <Body variant="small" as="span">{opt.text}</Body>
                              </label>
                            );
                          })}
                        </Stack>
                      </RadioGroup>
                      {fieldState.error && (
                        <Muted variant="small" className="text-destructive">{fieldState.error.message}</Muted>
                      )}
                    </Stack>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <Inline gap="default" align="center" className="justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion || pending}
            size="lg"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              type="submit"
              disabled={!allAnswered || pending || form.formState.isSubmitting}
              size="lg"
              onClick={() => {
                console.log('[SkillQuiz] Submit button clicked', {
                  allAnswered,
                  pending,
                  isSubmitting: form.formState.isSubmitting,
                  disabled: !allAnswered || pending || form.formState.isSubmitting,
                });
              }}
            >
              {pending || form.formState.isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || pending}
              size="lg"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </Inline>
      </Stack>
    </form>
  );
}
