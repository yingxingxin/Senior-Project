import Link from "next/link";
import { notFound } from "next/navigation";

import {
  activity_events,
  db,
  lesson_sections,
  quiz_attempts,
  user_lesson_progress,
  user_lesson_sections,
} from "@/src/db";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import {
  getAdminUserById,
  getUserLessonProgress,
  getUserQuizAttempts,
  getRecentActivityWithDetails,
} from "@/src/db/queries";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Award,
  BadgeCheck,
  BookOpen,
  BookOpenCheck,
  Calendar,
  Clock,
  Flag,
  ListChecks,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/src/lib/utils";
import { UserDetailShell } from "@/app/admin/_components/user-detail-shell";
import { UserActions } from "@/app/admin/_components/user-actions";
import { Stack } from "@/components/ui/spacing";
import { Body, Muted, Caption } from "@/components/ui/typography";

function getAvatarInitials(name: string | null | undefined, fallback: string) {
  const base = name?.trim() || fallback;
  const words = base.split(/\s+/);
  const initials = words
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || "")
    .join("");
  return initials || fallback.slice(0, 2).toUpperCase();
}

const onboardingSteps = ["welcome", "gender", "skill_quiz", "persona", "guided_intro"] as const;

const onboardingStepLabels: Record<typeof onboardingSteps[number], string> = {
  welcome: "Welcome",
  gender: "Assistant gender",
  skill_quiz: "Skill quiz",
  persona: "Assistant persona",
  guided_intro: "Guided intro",
};

const activityIconConfig: Record<string, { icon: LucideIcon; tone: string }> = {
  lesson_started: { icon: BookOpen, tone: "text-sky-500 bg-sky-500/10" },
  lesson_progressed: { icon: Activity, tone: "text-blue-500 bg-blue-500/10" },
  lesson_completed: { icon: BookOpenCheck, tone: "text-emerald-500 bg-emerald-500/10" },
  quiz_started: { icon: Target, tone: "text-indigo-500 bg-indigo-500/10" },
  quiz_submitted: { icon: ListChecks, tone: "text-purple-500 bg-purple-500/10" },
  quiz_perfect: { icon: Award, tone: "text-amber-500 bg-amber-500/10" },
  achievement_unlocked: { icon: BadgeCheck, tone: "text-pink-500 bg-pink-500/10" },
  level_up: { icon: Flag, tone: "text-rose-500 bg-rose-500/10" },
  goal_met: { icon: Target, tone: "text-teal-500 bg-teal-500/10" },
};

async function getUserDetails(userId: number) {
  const [user] = await getAdminUserById.execute({ userId });

  if (!user) {
    return null;
  }

  const [
    lessonProgressRaw,
    quizAttemptsRaw,
    recentActivityRaw,
    lessonTotals,
    quizTotals,
    pointsAggregate,
  ] = await Promise.all([
    getUserLessonProgress.execute({ userId, limit: 5 }),
    getUserQuizAttempts.execute({ userId, limit: 5 }),
    getRecentActivityWithDetails.execute({ userId, limit: 10 }),
    db
      .select({
        started: count(),
        completed: sql<number>`COALESCE(SUM(CASE WHEN ${user_lesson_progress.is_completed} THEN 1 ELSE 0 END), 0)`,
      })
      .from(user_lesson_progress)
      .where(eq(user_lesson_progress.user_id, userId))
      .limit(1)
      .then((rows) => rows[0] ?? { started: 0, completed: 0 }),
    db
      .select({
        attempts: count(),
        submitted: sql<number>`COALESCE(SUM(CASE WHEN ${quiz_attempts.submitted_at} IS NOT NULL THEN 1 ELSE 0 END), 0)`,
      })
      .from(quiz_attempts)
      .where(eq(quiz_attempts.user_id, userId))
      .limit(1)
      .then((rows) => rows[0] ?? { attempts: 0, submitted: 0 }),
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${activity_events.points_delta}), 0)`,
      })
      .from(activity_events)
      .where(eq(activity_events.user_id, userId))
      .limit(1)
      .then((rows) => rows[0] ?? { totalPoints: 0 }),
  ]);

  const lessonIds = lessonProgressRaw.map((record) => record.lessonId).filter(Boolean) as number[];

  let sectionTotals: Array<{ lessonId: number; totalSections: number }> = [];
  let completedSectionTotals: Array<{ lessonId: number; completedSections: number }> = [];

  if (lessonIds.length > 0) {
    sectionTotals = await db
      .select({
        lessonId: lesson_sections.lesson_id,
        totalSections: count(),
      })
      .from(lesson_sections)
      .where(inArray(lesson_sections.lesson_id, lessonIds))
      .groupBy(lesson_sections.lesson_id);

    completedSectionTotals = await db
      .select({
        lessonId: lesson_sections.lesson_id,
        completedSections: count(),
      })
      .from(user_lesson_sections)
      .innerJoin(lesson_sections, eq(user_lesson_sections.section_id, lesson_sections.id))
      .where(and(eq(user_lesson_sections.user_id, userId), inArray(lesson_sections.lesson_id, lessonIds)))
      .groupBy(lesson_sections.lesson_id);
  }

  const totalSectionsMap = new Map(sectionTotals.map((item) => [item.lessonId, Number(item.totalSections)]));
  const completedSectionsMap = new Map(
    completedSectionTotals.map((item) => [item.lessonId, Number(item.completedSections)]),
  );

  const lessonProgress = lessonProgressRaw.map((record) => {
    const totalSections = totalSectionsMap.get(record.lessonId) ?? 0;
    const completedSections = record.isCompleted
      ? totalSections
      : completedSectionsMap.get(record.lessonId) ?? 0;
    const progressPercent = record.isCompleted
      ? 100
      : totalSections > 0
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

    return {
      ...record,
      totalSections,
      completedSections,
      progressPercent,
    };
  });

  const quizAttempts = quizAttemptsRaw.map((record) => ({
    ...record,
  }));

  const recentActivity = recentActivityRaw.map((record) => ({
    ...record,
    occurredAt: record.occurredAt ? new Date(record.occurredAt) : null,
  }));

  const lastActiveAt = recentActivity[0]?.occurredAt ?? null;

  return {
    user,
    lessonProgress,
    quizAttempts,
    recentActivity,
    totals: {
      totalPoints: Number(pointsAggregate.totalPoints ?? 0),
      lessonsStarted: Number(lessonTotals.started ?? 0),
      lessonsCompleted: Number(lessonTotals.completed ?? 0),
      quizzesAttempted: Number(quizTotals.attempts ?? 0),
      quizzesSubmitted: Number(quizTotals.submitted ?? 0),
    },
    lastActiveAt,
  };
}

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
  tone?: string;
}

function MetricTile({ icon: Icon, label, value, helper, tone = "text-primary bg-primary/10" }: MetricTileProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm", tone)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <Caption variant="uppercase" className="text-muted-foreground">{label}</Caption>
          <Body variant="large" className="font-semibold leading-tight">{value}</Body>
          {helper ? <Muted variant="tiny">{helper}</Muted> : null}
        </div>
      </div>
    </div>
  );
}

export default async function UserDetailPage({ params }: { params: { userId: string } }) {
  const userId = Number.parseInt(params.userId, 10);

  if (Number.isNaN(userId)) {
    notFound();
  }

  const details = await getUserDetails(userId);

  if (!details) {
    notFound();
  }

  const { user, lessonProgress, quizAttempts, recentActivity, totals, lastActiveAt } = details;

  const fullName = user.name || "Unnamed user";
  const email = user.email || "No email";
  const heroInitials = getAvatarInitials(user.name, email);

  const metrics = [
    {
      icon: Sparkles,
      label: "Total points",
      value: totals.totalPoints.toLocaleString(),
      helper: "Lifetime points earned",
      tone: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: BookOpenCheck,
      label: "Lessons completed",
      value: totals.lessonsCompleted.toLocaleString(),
      helper: `${totals.lessonsStarted.toLocaleString()} started`,
      tone: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: ListChecks,
      label: "Quizzes attempted",
      value: totals.quizzesAttempted.toLocaleString(),
      helper: `${totals.quizzesSubmitted.toLocaleString()} submitted`,
      tone: "bg-sky-500/10 text-sky-500",
    },
    {
      icon: Activity,
      label: "Last activity",
      value: lastActiveAt ? lastActiveAt.toLocaleString("en-US") : "No activity",
      helper: lastActiveAt ? lastActiveAt.toLocaleDateString("en-US") : undefined,
      tone: "bg-indigo-500/10 text-indigo-500",
    },
  ];

  const onboardingCompleted = Boolean(user.onboarding_completed_at);
  const currentStep = onboardingCompleted ? null : user.onboarding_step;
  const currentStepIndex = currentStep
    ? onboardingSteps.indexOf(currentStep as typeof onboardingSteps[number])
    : -1;

  const accountFacts = [
    { label: "User ID", value: `#${user.id}` },
    { label: "Role", value: user.role },
    { label: "Skill level", value: user.skill_level ?? "—" },
    { label: "Assistant persona", value: user.assistant_persona ?? "—" },
    { label: "Assistant ID", value: user.assistant_id ?? "—" },
    {
      label: "Joined",
      value: user.created_at ? user.created_at.toLocaleDateString("en-US") : "Unknown",
    },
  ];

  return (
    <Stack gap="default">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/admin/users">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to users
        </Link>
      </Button>

      <UserDetailShell
        heading={(
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 border border-border/60">
              <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                {heroInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {email}
                </span>
              </div>
            </div>
          </div>
        )}
        subheading={(
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Joined {user.created_at ? user.created_at.toLocaleDateString("en-US") : "Unknown"}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {lastActiveAt ? `Last active ${lastActiveAt.toLocaleString("en-US")}` : "No activity yet"}
            </span>
          </div>
        )}
        metadata={(
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
            {user.is_email_verified ? (
              <Badge variant="outline" className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Email verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Email unverified
              </Badge>
            )}
            {user.skill_level ? (
              <Badge variant="outline" className="capitalize">
                Skill: {user.skill_level}
              </Badge>
            ) : null}
          </div>
        )}
        sidebar={(
          <>
            <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Account snapshot</CardTitle>
                <CardDescription>Key profile attributes and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="tight">
                  {accountFacts.map((fact) => (
                    <div key={fact.label} className="flex items-center justify-between gap-4">
                      <Muted variant="small">{fact.label}</Muted>
                      <Body variant="small" className="font-medium capitalize">{fact.value}</Body>
                    </div>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle>Onboarding journey</CardTitle>
                <CardDescription>Manage the user’s onboarding progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack gap="default">
                  <Stack gap="tight">
                    <Body variant="small" className="font-semibold">
                      {onboardingCompleted ? "Completed" : currentStep ? onboardingStepLabels[currentStep as typeof onboardingSteps[number]] : "Not started"}
                    </Body>
                    <Muted variant="tiny">
                      {onboardingCompleted
                        ? `Finished ${user.onboarding_completed_at?.toLocaleString("en-US") ?? "Unknown"}`
                        : currentStep
                          ? `Currently at ${onboardingStepLabels[currentStep as typeof onboardingSteps[number]]}`
                          : "Awaiting first step"}
                    </Muted>
                  </Stack>

                  <ol className="space-y-3">
                  {onboardingSteps.map((step, index) => {
                    const status = onboardingCompleted
                      ? "completed"
                      : index < currentStepIndex
                        ? "completed"
                        : index === currentStepIndex
                          ? "current"
                          : "upcoming";

                    return (
                      <li key={step} className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                            status === "completed" && "border-emerald-500 bg-emerald-500/10 text-emerald-600",
                            status === "current" && "border-primary bg-primary/10 text-primary",
                            status === "upcoming" && "border-border/60 text-muted-foreground",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <Body variant="small" className="font-medium">{onboardingStepLabels[step]}</Body>
                          <Muted variant="tiny">
                            {status === "completed"
                              ? "Completed"
                              : status === "current"
                                ? "In progress"
                                : "Pending"}
                          </Muted>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <Separator />

                <UserActions
                  userId={userId}
                  user={{
                    role: user.role,
                    onboarding_completed_at: user.onboarding_completed_at,
                    onboarding_step: user.onboarding_step,
                  }}
                  className="pt-1"
                />
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      >
        <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Key metrics</CardTitle>
            <CardDescription>High-level view of the learner’s engagement.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>Latest interactions that earned points or progress.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <Muted variant="small">No activity recorded yet.</Muted>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
                <Stack gap="default">
                  {recentActivity.map((event) => {
                    const iconConfig = activityIconConfig[event.eventType] ?? {
                      icon: Activity,
                      tone: "bg-primary/10 text-primary",
                    };

                    const Icon = iconConfig.icon;
                    const contextParts = [event.lessonTitle, event.quizTopic, event.achievementName].filter(Boolean);
                    const context = contextParts.join(" • ");

                    return (
                      <div key={event.id} className="relative pl-10">
                        <span
                          className={cn(
                            "absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full text-sm",
                            iconConfig.tone,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <Stack gap="tight">
                          <div className="flex items-center justify-between gap-3">
                            <Body variant="small" className="font-semibold">
                              {event.eventType.replace(/_/g, " ")}
                            </Body>
                            <Muted variant="tiny">
                              {event.occurredAt ? event.occurredAt.toLocaleString("en-US") : "Unknown"}
                            </Muted>
                          </div>
                          {context ? (
                            <Muted variant="tiny">{context}</Muted>
                          ) : null}
                          {event.pointsDelta ? (
                            <Caption
                              className={cn(
                                "font-semibold",
                                event.pointsDelta > 0 ? "text-emerald-600" : "text-destructive",
                              )}
                            >
                              {event.pointsDelta > 0 ? `+${event.pointsDelta}` : event.pointsDelta} pts
                            </Caption>
                          ) : null}
                        </Stack>
                      </div>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Lesson progress</CardTitle>
            <CardDescription>Recent lessons and completion momentum.</CardDescription>
          </CardHeader>
          <CardContent>
            {lessonProgress.length === 0 ? (
              <Muted variant="small">No lessons started yet.</Muted>
            ) : (
              <Stack gap="default">
                {lessonProgress.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Body variant="small" className="font-semibold">
                          {lesson.lessonTitle || `Lesson ${lesson.lessonId}`}
                        </Body>
                        <Muted variant="tiny">
                          Last touched {lesson.lastAccessedAt ? lesson.lastAccessedAt.toLocaleString("en-US") : "Unknown"}
                        </Muted>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.estimatedDurationSec ? (
                          <Badge variant="outline" className="text-xs">
                            {`${Math.max(1, Math.round(lesson.estimatedDurationSec / 60))} min`}
                          </Badge>
                        ) : null}
                        {lesson.isCompleted ? (
                          <Badge variant="outline" className="border-emerald-400/60 bg-emerald-500/10 text-emerald-600">
                            Completed
                          </Badge>
                        ) : null}
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/content/lessons/${lesson.lessonId}`}>Open</Link>
                        </Button>
                      </div>
                    </div>
                    <Stack gap="tight" className="mt-4">
                      <div className="flex items-center justify-between">
                        <Muted variant="tiny">
                          {lesson.completedSections}/{lesson.totalSections} sections
                        </Muted>
                        <Muted variant="tiny">{lesson.progressPercent}%</Muted>
                      </div>
                      <Progress value={lesson.progressPercent} />
                    </Stack>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/70 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Quiz attempts</CardTitle>
            <CardDescription>Latest quizzes and submission details.</CardDescription>
          </CardHeader>
          <CardContent>
            {quizAttempts.length === 0 ? (
              <Muted variant="small">No quiz activity yet.</Muted>
            ) : (
              <Stack gap="default">
                {quizAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Body variant="small" className="font-semibold">
                          {attempt.quizTopic || `Quiz ${attempt.quizId}`}
                        </Body>
                        <Muted variant="tiny">
                          Attempt #{attempt.attemptNumber} • Started {attempt.startedAt ? attempt.startedAt.toLocaleString("en-US") : "Unknown"}
                        </Muted>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof attempt.passingPct === "number" ? (
                          <Badge variant="outline" className="text-xs">
                            Passing {attempt.passingPct}%
                          </Badge>
                        ) : null}
                        {attempt.submittedAt ? (
                          <Badge variant="outline" className="border-emerald-400/60 bg-emerald-500/10 text-emerald-600">
                            Submitted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            In progress
                          </Badge>
                        )}
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/content/quizzes/${attempt.quizId}`}>Open</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Muted variant="tiny">
                        {attempt.durationSec
                          ? `Duration ${Math.max(1, Math.round(attempt.durationSec / 60))} min`
                          : "Duration unknown"}
                      </Muted>
                      {attempt.submittedAt ? (
                        <Muted variant="tiny">
                          Submitted {attempt.submittedAt ? attempt.submittedAt.toLocaleString("en-US") : "Unknown"}
                        </Muted>
                      ) : null}
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </UserDetailShell>
    </Stack>
  );
}
