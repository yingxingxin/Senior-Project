"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitSkillQuizAnswers } from "@/app/onboarding/actions";
import { Heading, Muted } from "@/components/ui/typography";
import { Stack, Grid, Inline } from "@/components/ui/spacing";

// TODO: these probably could come from the db schema
type Question = {
  id: number;
  text: string;
  orderIndex: number;
  options: { id: number; text: string; orderIndex: number }[];
};

type SkillQuizFormProps = {
  initialQuestions: Question[];
};

type ServerResult = {
  level: string;
  score: number;
  total: number;
  suggestedCourse: string;
  next: string;
};

const AnswerSchema = z.object({
  questionId: z.number(),
  optionId: z.number().nullable(), // allow empty in UI; we'll enforce selection below
});

const FormSchema = z
  .object({
    answers: z.array(AnswerSchema),
  })
  .superRefine((data, ctx) => {
    data.answers.forEach((a, idx) => {
      if (a.optionId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers", idx, "optionId"],
          message: "Please answer this question",
        });
      }
    });
  });

type FormData = z.infer<typeof FormSchema>;

export function SkillQuizForm({ initialQuestions }: SkillQuizFormProps) {
  const router = useRouter();
  // we need this state to show the result of the quiz
  const [result, setResult] = useState<ServerResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      answers: initialQuestions.map((q) => ({
        questionId: q.id,
        optionId: null,
      })),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!result) return;
    const id = setTimeout(() => router.push(result.next), 2000);
    return () => clearTimeout(id);
  }, [result, router]);

  const onSubmit = async (data: FormData) => {
    try {
      // Zod already ensured optionId != null, but TS still sees nullable.
      // We need to convert the string to a number.
      const answers = data.answers.map((a) => ({
        questionId: a.questionId,
        optionId: Number(a.optionId),
      }));

      const res = await submitSkillQuizAnswers({ answers });
      setResult(res as ServerResult);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      form.setError("root", {
        message: "Failed to submit quiz. Please try again.",
      });
    }
  };

  return (
    <>
      {result && (
        <Card className="w-full mb-6">
          <div className="p-6 text-center">
            <Heading level={2} className="mb-4">
              Your starting level: {result.level.toUpperCase()}
            </Heading>
            <p className="mb-2">
              Score: {result.score} / {result.total}
            </p>
            <p className="mb-4">
              Suggested course: <strong>{result.suggestedCourse}</strong>
            </p>
            <Muted variant="small">Redirecting...</Muted>
          </div>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap="default">
        {initialQuestions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Q{idx + 1}. {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name={`answers.${idx}.optionId`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <RadioGroup
                      // store numbers in form; RadioGroup gives strings
                      value={field.value === null ? "" : String(field.value)}
                      onValueChange={(v) => field.onChange(v === "" ? null : Number(v))}
                      disabled={form.formState.isSubmitting}
                    >
                      <Grid gap="tight">
                        {q.options.map((opt) => {
                          const inputId = `q${q.id}-o${opt.id}`;
                          return (
                            <Inline key={opt.id} gap="default" align="center">
                              <RadioGroupItem value={String(opt.id)} id={inputId} />
                              <Label htmlFor={inputId} className="cursor-pointer">
                                {opt.text}
                              </Label>
                            </Inline>
                          );
                        })}
                      </Grid>
                    </RadioGroup>

                    {/* keep questionId in the form data */}
                    <input
                      type="hidden"
                      {...form.register(`answers.${idx}.questionId`, { value: q.id })}
                    />

                    {fieldState.error && (
                      <Muted variant="small" className="text-destructive mt-2">
                        {fieldState.error.message}
                      </Muted>
                    )}
                  </>
                )}
              />
            </CardContent>
          </Card>
        ))}

        {form.formState.errors.root && (
          <Muted variant="small" className="text-destructive text-center">
            {form.formState.errors.root.message}
          </Muted>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
        </Stack>
      </form>
    </>
  );
}
