import Link from "next/link";
import { Activity, Users, BookOpen, Brain, Rocket, Download, Plus, Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type RangeKey, getAdminDashboard } from "@/app/admin/actions";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminHome({
  searchParams,
}: {
  searchParams?: { range?: RangeKey };
}) {
  const range = (searchParams?.range ?? "7d") as RangeKey;
  const stats = await getAdminDashboard(range);
  const { meta } = stats;
  const delta = (current: number, previous: number) => {
    if (!previous && !current) return 0;
    if (!previous) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };
  const kpiCards = [
    {
      title: "Daily Active Users",
      icon: Activity,
      value: stats.kpis.dau,
      delta: 0,
      href: "/admin/users?active=today",
    },
    {
      title: `New Users (${meta.days}d)`,
      icon: Users,
      value: stats.kpis.newUsers.now,
      delta: delta(stats.kpis.newUsers.now, stats.kpis.newUsers.prev),
      href: `/admin/users?created_gte=${meta.start.toISOString()}`,
    },
    {
      title: "Lessons Completed",
      icon: BookOpen,
      value: stats.kpis.lessonsCompleted.now,
      delta: delta(stats.kpis.lessonsCompleted.now, stats.kpis.lessonsCompleted.prev),
      href: `/admin/analytics?tab=lessons&range=${range}`,
    },
    {
      title: "Quizzes Completed",
      icon: Brain,
      value: stats.kpis.quizAttempts.now,
      delta: delta(stats.kpis.quizAttempts.now, stats.kpis.quizAttempts.prev),
      href: `/admin/analytics?tab=quizzes&range=${range}`,
    },
  ];

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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
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
          </CardContent>
        </Card>

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
