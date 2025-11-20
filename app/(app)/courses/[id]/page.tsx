import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, BookOpen, CheckCircle } from "lucide-react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Stack, Grid, Inline } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCourseData } from "../_lib/actions";
import { formatDuration } from "../_lib/utils";
import { LessonButton } from "../_components/lesson-button";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;

  // Get course data with progress (id is the slug)
  const courseData = await getCourseData(id);

  if (!courseData) {
    notFound();
  }

  const { lessons, completedLessons, totalLessons, progressPercentage, courseTitle, courseIcon, courseDifficulty, courseDescription, courseEstimatedDurationSec } = courseData;
  const startedLesson = lessons.find((lesson) => lesson.startedAt && !lesson.isCompleted);
  const nextLesson = lessons.find((lesson) => !lesson.isCompleted);
  const lessonToOpen = startedLesson ?? nextLesson ?? null;
  const hasProgress = lessons.some((lesson) => lesson.startedAt !== null || lesson.isCompleted);
  const primaryCtaLabel = hasProgress ? 'Continue Learning' : 'Start Course';
  const disabledCtaMessage = lessons.length === 0 ? 'Course Content Coming Soon' : 'Course Completed';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16">
        <Stack gap="loose">
          {/* Back Button */}
          <Button variant="outline" asChild className="self-start">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </Button>

          {/* Course Header */}
          <Card className="bg-card/50 backdrop-blur border-border shadow-lg">
            <div className="p-6">
              <Inline align="start" justify="between" className="mb-6">
                <div className="w-16 h-16 border-2 border-border rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg">
                  {courseIcon}
                </div>
                <Badge variant="outline" className="bg-muted/50 text-primary border-border">
                  {courseDifficulty}
                </Badge>
              </Inline>

              <Stack gap="default">
                <Heading level={1} className="text-foreground">{courseTitle}</Heading>
                <Body variant="large" className="text-foreground">
                  {courseDescription}
                </Body>

                {/* Course Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(courseEstimatedDurationSec)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{completedLessons} completed</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted/50 border border-border rounded-lg h-2 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all rounded-lg shadow-primary/50 shadow-md"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Start/Continue Button */}
                {lessonToOpen ? (
                  <LessonButton
                    variant="hero"
                    label={primaryCtaLabel}
                    lessonId={lessonToOpen.id}
                    lessonSlug={lessonToOpen.slug}
                    courseId={id}
                    isCompleted={lessonToOpen.isCompleted}
                    hasStarted={lessonToOpen.startedAt !== null}
                  />
                ) : (
                  <Button disabled className="opacity-70">
                    {disabledCtaMessage}
                  </Button>
                )}
              </Stack>
            </div>
          </Card>

          {/* Lessons List */}
          <Card className="bg-card/50 backdrop-blur border-border shadow-lg p-6">
            <Stack gap="default">
              <Heading level={3} className="text-foreground">Course Content</Heading>
                  <Grid cols={1} gap="tight">
                    {lessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="bg-card/30 backdrop-blur border-border p-4 transition-all hover:bg-card/40"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border border-border text-sm font-semibold ${
                              lesson.isCompleted
                                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                                : 'bg-muted/50 text-foreground'
                            }`}>
                              {lesson.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-white" />
                              ) : (
                                lesson.orderIndex
                              )}
                            </div>
                            {lesson.icon && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-lg flex-shrink-0">
                                {lesson.icon}
                              </div>
                            )}
                            <div>
                              <Heading level={6} className="text-foreground mb-1">{lesson.title}</Heading>
                              <Muted variant="small">{lesson.description}</Muted>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Muted variant="small">{formatDuration(lesson.estimatedDurationSec)}</Muted>
                            <LessonButton
                              lessonId={lesson.id}
                              lessonSlug={lesson.slug}
                              courseId={id}
                              isCompleted={lesson.isCompleted}
                              hasStarted={lesson.startedAt !== null}
                            />
                            {lesson.isCompleted ? (
                              <Button variant="outline" size="sm" asChild className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
                                <Link href={`/courses/${id}/${lesson.slug}`}>
                                  Revisit Lesson
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${id}/${lesson.slug}`}>
                                  Open Lesson
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </Grid>
            </Stack>
          </Card>
        </Stack>
      </main>
    </div>
  );
}
