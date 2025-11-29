"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack, Inline, Grid } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { AdminQuizWithQuestions } from "@/src/db/queries/admin";

const quizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  topicSlug: z.string().min(1, "Topic is required"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"]),
  defaultLength: z.number().min(1).max(50),
  questions: z.array(z.object({
    id: z.number().optional(),
    prompt: z.string().min(1, "Question prompt is required"),
    options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Must have exactly 4 options"),
    correctIndex: z.number().min(0).max(3),
    explanation: z.string().optional(),
  })),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  quiz?: AdminQuizWithQuestions;
  topicOptions: string[];
  onSubmit: (data: QuizFormData) => Promise<{ success: boolean; error?: string; quizId?: number }>;
  onDelete?: () => Promise<{ success: boolean; error?: string }>;
}

export function QuizForm({ quiz, topicOptions, onSubmit, onDelete }: QuizFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!quiz;

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: quiz?.title ?? "",
      slug: quiz?.slug ?? "",
      description: quiz?.description ?? "",
      topicSlug: quiz?.topicSlug ?? "",
      skillLevel: quiz?.skillLevel ?? "beginner",
      defaultLength: quiz?.defaultLength ?? 5,
      questions: quiz?.questions.map(q => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? "",
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const handleSubmit = form.handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        if (!isEditing && result.quizId) {
          router.push(`/admin/content/quizzes/${result.quizId}`);
        } else {
          router.refresh();
        }
      } else {
        setError(result.error ?? "Failed to save quiz");
      }
    });
  });

  const handleDelete = () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return;

    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        router.push("/admin/content/quizzes");
      } else {
        setError(result.error ?? "Failed to delete quiz");
      }
    });
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!isEditing || !form.getValues("slug")) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  const addQuestion = () => {
    append({
      prompt: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="loose">
        {/* Header Actions */}
        <Inline justify="between" align="center">
          <Button variant="ghost" asChild>
            <Link href="/admin/content/quizzes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>
          <Inline gap="tight">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Quiz"}
            </Button>
          </Inline>
        </Inline>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <Body className="text-destructive">{error}</Body>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core quiz details</CardDescription>
          </CardHeader>
          <CardContent>
            <Grid gap="default" className="md:grid-cols-2">
              <Stack gap="tight">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  onChange={handleTitleChange}
                  placeholder="Variables Basics Quiz"
                />
                {form.formState.errors.title && (
                  <Muted className="text-destructive">{form.formState.errors.title.message}</Muted>
                )}
              </Stack>

              <Stack gap="tight">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  placeholder="variables-basics"
                />
                {form.formState.errors.slug && (
                  <Muted className="text-destructive">{form.formState.errors.slug.message}</Muted>
                )}
              </Stack>

              <Stack gap="tight" className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="A quiz testing your knowledge of..."
                  rows={2}
                />
              </Stack>

              <Stack gap="tight">
                <Label htmlFor="topicSlug">Topic *</Label>
                <Input
                  id="topicSlug"
                  {...form.register("topicSlug")}
                  placeholder="programming-basics"
                  list="topic-options"
                />
                <datalist id="topic-options">
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic} />
                  ))}
                </datalist>
                {form.formState.errors.topicSlug && (
                  <Muted className="text-destructive">{form.formState.errors.topicSlug.message}</Muted>
                )}
              </Stack>

              <Stack gap="tight">
                <Label>Skill Level *</Label>
                <Select
                  value={form.watch("skillLevel")}
                  onValueChange={(v) => form.setValue("skillLevel", v as "beginner" | "intermediate" | "advanced")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </Stack>

              <Stack gap="tight">
                <Label htmlFor="defaultLength">Default Length (questions)</Label>
                <Input
                  id="defaultLength"
                  type="number"
                  {...form.register("defaultLength", { valueAsNumber: true })}
                  min={1}
                  max={50}
                />
              </Stack>
            </Grid>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <Inline justify="between" align="center">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  {fields.length} question{fields.length !== 1 ? "s" : ""} • Each question has 4 options
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </Inline>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Muted>No questions yet. Add your first question above.</Muted>
              </div>
            ) : (
              <Stack gap="default">
                {fields.map((field, qIndex) => (
                  <Card key={field.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <Stack gap="default">
                        <Inline justify="between" align="center">
                          <Inline gap="tight" align="center">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <Badge variant="secondary">Question {qIndex + 1}</Badge>
                          </Inline>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => remove(qIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Inline>

                        <Stack gap="tight">
                          <Label>Question Prompt *</Label>
                          <Textarea
                            {...form.register(`questions.${qIndex}.prompt`)}
                            placeholder="What is a variable in programming?"
                            rows={2}
                          />
                          {form.formState.errors.questions?.[qIndex]?.prompt && (
                            <Muted className="text-destructive">
                              {form.formState.errors.questions[qIndex]?.prompt?.message}
                            </Muted>
                          )}
                        </Stack>

                        <Stack gap="tight">
                          <Label>Options (select the correct answer)</Label>
                          <RadioGroup
                            value={form.watch(`questions.${qIndex}.correctIndex`).toString()}
                            onValueChange={(v) => form.setValue(`questions.${qIndex}.correctIndex`, parseInt(v, 10))}
                          >
                            <Grid gap="tight" className="md:grid-cols-2">
                              {[0, 1, 2, 3].map((optIndex) => (
                                <Inline key={optIndex} gap="tight" align="center" className="p-2 border rounded-md">
                                  <RadioGroupItem value={optIndex.toString()} id={`q${qIndex}-opt${optIndex}`} />
                                  <Input
                                    {...form.register(`questions.${qIndex}.options.${optIndex}`)}
                                    placeholder={`Option ${optIndex + 1}`}
                                    className="flex-1"
                                  />
                                  {form.watch(`questions.${qIndex}.correctIndex`) === optIndex && (
                                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                                  )}
                                </Inline>
                              ))}
                            </Grid>
                          </RadioGroup>
                        </Stack>

                        <Stack gap="tight">
                          <Label>Explanation (shown after answering)</Label>
                          <Textarea
                            {...form.register(`questions.${qIndex}.explanation`)}
                            placeholder="A variable is a named storage location in memory..."
                            rows={2}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </form>
  );
}
