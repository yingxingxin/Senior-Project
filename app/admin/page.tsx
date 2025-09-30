import Link from "next/link";
import { Suspense, type ComponentType, type ReactNode } from "react";
import { Activity, Users, BookOpen, Brain, Rocket, Download, Plus, Search } from "lucide-react";
import { sql, count, eq, gte, lt, and, desc } from "drizzle-orm";

import { db, users, lessons, quizzes, user_lesson_progress, activity_events, sessions, quiz_attempts } from "@/src/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RangeSwitch } from "@/components/admin/range-switch";
import { Sparkline } from "@/components/admin/sparkline";

const numberFormatter = new Intl.NumberFormat("en-US");

export type RangeKey = "7d" | "30d" | "90d";

type RangeMeta = ReturnType<typeof getRangeDates>;

type ActivityRow = {
  day: string;
  c: number;
};

type RecentActivityRow = Awaited<ReturnType<typeof getRecentActivity>>[number];

type DashboardStats = {
  meta: RangeMeta;
  totals: {
    users: number;
    lessons: number;
    quizzes: number;
  };
  kpis: {
    newUsers: { now: number; prev: number };
    lessonsCompleted: { now: number; prev: number };
    quizAttempts: { now: number; prev: number };
    dau: number;
    activeUsers: number;
  };
  pendingOnboarding: number;
  recentActivity: RecentActivityRow[];
  recentLessons: { id: number; title: string | null; updatedAt: Date | null }[];
  recentQuizzes: { id: number; topic: string | null; createdAt: Date | null }[];
  activitySeries: ActivityRow[];
};

function getRangeDates(range: RangeKey) {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEnd = start;
  return { now, start, prevStart, prevEnd, days };
}

async function getActivitySeries(rangeStart: Date): Promise<ActivityRow[]> {
  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${activity_events.occurred_at})::date::text`,
      c: count(),
    })
    .from(activity_events)
    .where(gte(activity_events.occurred_at, rangeStart))
    .groupBy(sql`date_trunc('day', ${activity_events.occurred_at})::date`)
    .orderBy(sql`date_trunc('day', ${activity_events.occurred_at})::date`);

  return rows;
}

async function getRecentActivity() {
  return db
    .select({
      id: activity_events.id,
      userId: activity_events.user_id,
      type: activity_events.event_type,
      at: activity_events.occurred_at,
      name: users.name,
      email: users.email,
    })
    .from(activity_events)
    .leftJoin(users, eq(activity_events.user_id, users.id))
    .orderBy(desc(activity_events.occurred_at))
    .limit(12);
}

async function getStats(range: RangeKey): Promise<DashboardStats> {
  const meta = getRangeDates(range);
  const { start, prevStart, prevEnd } = meta;

  const [totalUsers] = await db.select({ c: count() }).from(users);
  const [totalLessons] = await db.select({ c: count() }).from(lessons);
  const [totalQuizzes] = await db.select({ c: count() }).from(quizzes);

  const [newUsersNow] = await db
    .select({ c: count() })
    .from(users)
    .where(gte(users.created_at, start));

  const [newUsersPrev] = await db
    .select({ c: count() })
    .from(users)
    .where(and(gte(users.created_at, prevStart), lt(users.created_at, prevEnd)));

  const [completedNow] = await db
    .select({ c: count() })
    .from(user_lesson_progress)
    .where(and(eq(user_lesson_progress.is_completed, true), gte(user_lesson_progress.completed_at, start)));

  const [completedPrev] = await db
    .select({ c: count() })
    .from(user_lesson_progress)
    .where(
      and(
        eq(user_lesson_progress.is_completed, true),
        gte(user_lesson_progress.completed_at, prevStart),
        lt(user_lesson_progress.completed_at, prevEnd)
      )
    );

  const [attemptsNow] = await db
    .select({ c: count() })
    .from(quiz_attempts)
    .where(gte(quiz_attempts.started_at, start));

  const [attemptsPrev] = await db
    .select({ c: count() })
    .from(quiz_attempts)
    .where(and(gte(quiz_attempts.started_at, prevStart), lt(quiz_attempts.started_at, prevEnd)));

  const todayStart = new Date(meta.now);
  todayStart.setHours(0, 0, 0, 0);

  const [dau] = await db
    .select({ c: sql<number>`COUNT(DISTINCT ${sessions.user_id})` })
    .from(sessions)
    .where(gte(sessions.updated_at, todayStart));

  const [activeUsers] = await db
    .select({ c: sql<number>`COUNT(DISTINCT ${sessions.user_id})` })
    .from(sessions)
    .where(gte(sessions.updated_at, start));

  const [pendingOnboarding] = await db
    .select({ c: count() })
    .from(users)
    .where(sql`${users.onboarding_completed_at} IS NULL`);

  const recentActivity = await getRecentActivity();

  const recentLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      updatedAt: lessons.updated_at,
    })
    .from(lessons)
    .orderBy(desc(lessons.updated_at))
    .limit(5);

  const recentQuizzes = await db
    .select({
      id: quizzes.id,
      topic: quizzes.topic,
      createdAt: quizzes.created_at,
    })
    .from(quizzes)
    .orderBy(desc(quizzes.created_at))
    .limit(5);

  const activitySeries = await getActivitySeries(start);

  return {
    meta,
    totals: {
      users: totalUsers.c,
      lessons: totalLessons.c,
      quizzes: totalQuizzes.c,
    },
    kpis: {
      newUsers: { now: newUsersNow.c, prev: newUsersPrev.c },
      lessonsCompleted: { now: completedNow.c, prev: completedPrev.c },
      quizAttempts: { now: attemptsNow.c, prev: attemptsPrev.c },
      dau: dau.c || 0,
      activeUsers: activeUsers.c || 0,
    },
    pendingOnboarding: pendingOnboarding.c,
    recentActivity,
    recentLessons,
    recentQuizzes,
    activitySeries,
  };
}

function pctDelta(now: number, prev: number) {
  if (!prev && !now) return 0;
  if (!prev) return 100;
  return Math.round(((now - prev) / prev) * 100);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams?: { range?: RangeKey };
}) {
  const range = (searchParams?.range ?? "7d") as RangeKey;
  const stats = await getStats(range);
  const { meta } = stats;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card">
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search users, lessons, quizzes..."
                name="q"
                type="search"
              />
            </div>
            <Suspense fallback={<div className="h-9 w-40 rounded-md bg-muted" />}>
              <RangeSwitch initialRange={range} />
            </Suspense>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Separator orientation="vertical" className="hidden h-8 lg:block" />
            <Link href="/admin/content/lessons/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Lesson
              </Button>
            </Link>
            <Link href="/admin/content/quizzes/new">
              <Button size="sm" variant="secondary">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Quiz
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button size="sm" variant="outline">
                <Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
                Invite User
              </Button>
            </Link>
            <Link href={`/admin/analytics?range=${range}`}>
              <Button size="sm" variant="ghost">
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Export CSV
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="New Users"
          icon={Users}
          value={stats.kpis.newUsers.now}
          delta={pctDelta(stats.kpis.newUsers.now, stats.kpis.newUsers.prev)}
          href={`/admin/users?created_gte=${meta.start.toISOString()}`}
          sparkline={
            <Sparkline
              data={stats.activitySeries.map((row) => ({ label: row.day, value: row.c }))}
            />
          }
        />
        <StatCard
          title="Daily Active Users"
          icon={Activity}
          value={stats.kpis.dau}
          delta={0}
          href="/admin/users?active=today"
        />
        <StatCard
          title="Active (Range)"
          icon={Activity}
          value={stats.kpis.activeUsers}
          delta={0}
          href={`/admin/users?active_gte=${meta.start.toISOString()}`}
        />
        <StatCard
          title="Lessons Completed"
          icon={BookOpen}
          value={stats.kpis.lessonsCompleted.now}
          delta={pctDelta(stats.kpis.lessonsCompleted.now, stats.kpis.lessonsCompleted.prev)}
          href={`/admin/analytics?tab=lessons&range=${range}`}
        />
        <StatCard
          title="Quiz Attempts"
          icon={Brain}
          value={stats.kpis.quizAttempts.now}
          delta={pctDelta(stats.kpis.quizAttempts.now, stats.kpis.quizAttempts.prev)}
          href={`/admin/analytics?tab=quizzes&range=${range}`}
        />
        <StatCard
          title="Total Content"
          icon={BookOpen}
          value={stats.totals.lessons + stats.totals.quizzes}
          delta={0}
          href="/admin/content"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Activity (events/day)</CardTitle>
            <CardDescription>Last {meta.days} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Suspense fallback={<div className="h-full rounded-md border bg-muted" />}>
                <Sparkline
                  data={stats.activitySeries.map((row) => ({ label: row.day, value: row.c }))}
                  strokeWidth={1.5}
                  highlightLast
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pendingOnboarding ? "border-yellow-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className={stats.pendingOnboarding ? "text-yellow-700" : ""}>Alerts</CardTitle>
            <CardDescription>Actionable items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingOnboarding ? (
              <Link
                href="/admin/users?onboarding=pending"
                className="block rounded-md border bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50"
              >
                {stats.pendingOnboarding} users have not completed onboarding
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No alerts</p>
            )}
            <p className="text-xs text-muted-foreground">
              Add checks for content coverage, low completion rates, or failed jobs as needed.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              stats.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-1 rounded-md border p-3 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{event.name || "Unknown User"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(event.type ?? "").replace(/_/g, " ")} • {event.email || "—"}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {event.at ? new Date(event.at).toLocaleString() : ""}
                  </time>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recently Edited Content</CardTitle>
            <CardDescription>Lessons and quizzes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {stats.recentLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lessons updated recently</p>
              ) : (
                stats.recentLessons.map((lesson) => (
                  <Link
                    key={`lesson-${lesson.id}`}
                    href={`/admin/content/lessons/${lesson.id}`}
                    className="flex items-center justify-between rounded-md border p-2 text-sm transition-colors hover:bg-accent/40"
                  >
                    <span className="truncate">
                      {lesson.title || `Lesson #${lesson.id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : "—"}
                    </span>
                  </Link>
                ))
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              {stats.recentQuizzes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent quizzes</p>
              ) : (
                stats.recentQuizzes.map((quiz) => (
                  <Link
                    key={`quiz-${quiz.id}`}
                    href={`/admin/content/quizzes/${quiz.id}`}
                    className="flex items-center justify-between rounded-md border p-2 text-sm transition-colors hover:bg-accent/40"
                  >
                    <span className="truncate">
                      {quiz.topic ? `Quiz: ${quiz.topic}` : `Quiz #${quiz.id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type StatCardProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  value: number;
  delta: number;
  href?: string;
  sparkline?: ReactNode;
};

function StatCard({ title, icon: Icon, value, delta, href, sparkline }: StatCardProps) {
  const up = delta >= 0;
  const deltaLabel = `${up ? "+" : ""}${delta}%`;

  const content = (
    <Card className="h-full transition-colors hover:border-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold">{formatNumber(value)}</div>
          <Badge
            variant={up ? "default" : "destructive"}
            className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wide"
          >
            {deltaLabel}
          </Badge>
        </div>
        {sparkline ? <div className="mt-3 h-12">{sparkline}</div> : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}
