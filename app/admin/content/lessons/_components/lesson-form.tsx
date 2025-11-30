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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack, Inline, Grid } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { AdminLessonWithSections } from "@/src/db/queries/admin";

const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional(),
  difficulty: z.enum(["easy", "standard", "hard"]).optional().nullable(),
  estimatedDurationMin: z.number().min(0).optional().nullable(),
  icon: z.string().optional().nullable(),
  isPublished: z.boolean(),
  scope: z.enum(["global", "user", "shared"]),
  parentLessonId: z.number().optional().nullable(),
  sections: z.array(z.object({
    id: z.number().optional(),
    title: z.string().min(1, "Section title is required"),
    slug: z.string().min(1, "Section slug is required"),
    bodyMd: z.string(),
  })),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface ParentLessonOption {
  id: number;
  title: string;
  slug: string;
}

interface LessonFormProps {
  lesson?: AdminLessonWithSections;
  parentOptions: ParentLessonOption[];
  onSubmit: (data: LessonFormData) => Promise<{ success: boolean; error?: string; lessonId?: number }>;
  onDelete?: () => Promise<{ success: boolean; error?: string }>;
}

export function LessonForm({ lesson, parentOptions, onSubmit, onDelete }: LessonFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!lesson;

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      slug: lesson?.slug ?? "",
      description: lesson?.description ?? "",
      difficulty: lesson?.difficulty ?? null,
      estimatedDurationMin: lesson?.estimatedDurationSec ? Math.floor(lesson.estimatedDurationSec / 60) : null,
      icon: lesson?.icon ?? "",
      isPublished: lesson?.isPublished ?? true,
      scope: lesson?.scope ?? "global",
      parentLessonId: lesson?.parentLessonId ?? null,
      sections: lesson?.sections.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        bodyMd: s.bodyMd,
      })) ?? [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const handleSubmit = form.handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.success) {
        if (!isEditing && result.lessonId) {
          router.push(`/admin/content/lessons/${result.lessonId}`);
        } else {
          router.refresh();
        }
      } else {
        setError(result.error ?? "Failed to save lesson");
      }
    });
  });

  const handleDelete = () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) return;

    startTransition(async () => {
      const result = await onDelete();
      if (result.success) {
        router.push("/admin/content/lessons");
      } else {
        setError(result.error ?? "Failed to delete lesson");
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

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="loose">
        {/* Header Actions */}
        <Inline justify="between" align="center">
          <Button variant="ghost" asChild>
            <Link href="/admin/content/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
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
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Lesson"}
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
            <CardDescription>Core lesson details</CardDescription>
          </CardHeader>
          <CardContent>
            <Grid gap="default" className="md:grid-cols-2">
              <Stack gap="tight">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  onChange={handleTitleChange}
                  placeholder="Introduction to Variables"
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
                  placeholder="introduction-to-variables"
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
                  placeholder="A brief description of the lesson..."
                  rows={3}
                />
              </Stack>

              <Stack gap="tight">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  {...form.register("icon")}
                  placeholder="📚"
                  maxLength={10}
                />
              </Stack>

              <Stack gap="tight">
                <Label htmlFor="estimatedDurationMin">Duration (minutes)</Label>
                <Input
                  id="estimatedDurationMin"
                  type="number"
                  {...form.register("estimatedDurationMin", { valueAsNumber: true })}
                  placeholder="15"
                  min={0}
                />
              </Stack>
            </Grid>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Visibility and categorization</CardDescription>
          </CardHeader>
          <CardContent>
            <Grid gap="default" className="md:grid-cols-2">
              <Stack gap="tight">
                <Label>Difficulty</Label>
                <Select
                  value={form.watch("difficulty") ?? "none"}
                  onValueChange={(v) => form.setValue("difficulty", v === "none" ? null : v as "easy" | "standard" | "hard")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </Stack>

              <Stack gap="tight">
                <Label>Scope</Label>
                <Select
                  value={form.watch("scope")}
                  onValueChange={(v) => form.setValue("scope", v as "global" | "user" | "shared")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (visible to all)</SelectItem>
                    <SelectItem value="user">User (private)</SelectItem>
                    <SelectItem value="shared">Shared (select users)</SelectItem>
                  </SelectContent>
                </Select>
              </Stack>

              <Stack gap="tight">
                <Label>Parent Course</Label>
                <Select
                  value={form.watch("parentLessonId")?.toString() ?? "none"}
                  onValueChange={(v) => form.setValue("parentLessonId", v === "none" ? null : parseInt(v, 10))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level course)</SelectItem>
                    {parentOptions
                      .filter((p) => p.id !== lesson?.id)
                      .map((parent) => (
                        <SelectItem key={parent.id} value={parent.id.toString()}>
                          {parent.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Stack>

              <Inline gap="default" align="center" className="pt-6">
                <Switch
                  id="isPublished"
                  checked={form.watch("isPublished")}
                  onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Published
                </Label>
              </Inline>
            </Grid>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <Inline justify="between" align="center">
              <div>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Lesson content broken into sections</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ title: "", slug: "", bodyMd: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </Inline>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Muted>No sections yet. Add your first section above.</Muted>
              </div>
            ) : (
              <Stack gap="default">
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <Stack gap="default">
                        <Inline justify="between" align="center">
                          <Inline gap="tight" align="center">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <Body variant="small" className="font-medium">
                              Section {index + 1}
                            </Body>
                          </Inline>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Inline>

                        <Grid gap="default" className="md:grid-cols-2">
                          <Stack gap="tight">
                            <Label>Section Title *</Label>
                            <Input
                              {...form.register(`sections.${index}.title`)}
                              placeholder="Getting Started"
                              onChange={(e) => {
                                form.setValue(`sections.${index}.title`, e.target.value);
                                // Auto-generate section slug
                                const slug = e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-|-$/g, "");
                                form.setValue(`sections.${index}.slug`, slug);
                              }}
                            />
                          </Stack>

                          <Stack gap="tight">
                            <Label>Section Slug *</Label>
                            <Input
                              {...form.register(`sections.${index}.slug`)}
                              placeholder="getting-started"
                            />
                          </Stack>
                        </Grid>

                        <Stack gap="tight">
                          <Label>Content (Markdown)</Label>
                          <Textarea
                            {...form.register(`sections.${index}.bodyMd`)}
                            placeholder="# Section Heading&#10;&#10;Your content here..."
                            rows={8}
                            className="font-mono text-sm"
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
