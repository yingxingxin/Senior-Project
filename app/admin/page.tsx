import Link from "next/link";
import { Activity, Users, BookOpen, Brain, Rocket, Clock, Plus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type RangeKey, getAdminDashboard } from "@/app/admin/_lib/actions";
import { StatCard } from "@/app/admin/_components/stat-card";
import { AdminSearch } from "@/app/admin/_components/admin-search";
import { Stack, Grid, Inline } from "@/components/ui/spacing";
import { Muted, Body } from "@/components/ui/typography";

export default async function AdminHome({
  searchParams,
}: {
  searchParams?: Promise<{ range?: RangeKey }>;
}) {
  const range = (await searchParams)?.range ?? "7d" as RangeKey;
  const stats = await getAdminDashboard(range);
  const { meta } = stats;
  const delta = (current: number, previous: number) => {
    if (!previous && !current) return 0;
    if (!previous) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate date for new users filter (days ago from today)
  const createdAfterDate = meta.start.toISOString().split("T")[0];

  const kpiCards = [
    {
      title: "Daily Active Users",
      icon: Activity,
      value: stats.kpis.dau,
      delta: 0,
      href: "/admin/users",
    },
    {
      title: `New Users (${meta.days}d)`,
      icon: Users,
      value: stats.kpis.newUsers.now,
      delta: delta(stats.kpis.newUsers.now, stats.kpis.newUsers.prev),
      href: `/admin/users?created_gte=${createdAfterDate}`,
    },
    {
      title: "Lessons Completed",
      icon: BookOpen,
      value: stats.kpis.lessonsCompleted.now,
      delta: delta(stats.kpis.lessonsCompleted.now, stats.kpis.lessonsCompleted.prev),
      // Analytics page doesn't exist yet - link to users for now
      href: "/admin/users",
    },
    {
      title: "Quizzes Completed",
      icon: Brain,
      value: stats.kpis.quizAttempts.now,
      delta: delta(stats.kpis.quizAttempts.now, stats.kpis.quizAttempts.prev),
      // Analytics page doesn't exist yet - link to users for now
      href: "/admin/users",
    },
  ];

  return (
    <TooltipProvider>
      <Stack gap="default">
        <section className="rounded-2xl border bg-card">
          <Grid gap="default" className="p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="mb-6">
                <AdminSearch />
              </div>
            </div>
            <Inline gap="tight" align="center" justify="end" className="flex-wrap">
              <Separator orientation="vertical" className="hidden h-8 lg:block" />

              <Button asChild size="sm">
                <Link href="/admin/content/lessons/new">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  New Lesson
                </Link>
              </Button>

              <Button asChild size="sm" variant="secondary">
                <Link href="/admin/content/quizzes/new">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  New Quiz
                </Link>
              </Button>

              <Link href="/admin/users">
                <Button size="sm" variant="outline">
                  <Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
                  Invite User
                </Button>
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" disabled className="opacity-50">
                    <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                    Export CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon</p>
                </TooltipContent>
              </Tooltip>
            </Inline>
          </Grid>
        </section>

        <Grid gap="default" cols={4} as="section">
          {kpiCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </Grid>

        <Grid gap="default" as="section" className="xl:grid-cols-3">
          <Card className={stats.pendingOnboarding ? "border-yellow-500" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className={stats.pendingOnboarding ? "text-yellow-700" : ""}>Alerts</CardTitle>
              <CardDescription>Actionable items</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.pendingOnboarding ? (
                <Link
                  href="/admin/users?onboarding=pending"
                  className="block rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <Body variant="small">{stats.pendingOnboarding} users have not completed onboarding</Body>
                </Link>
              ) : (
                <Muted variant="small">No alerts</Muted>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user events</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivity.length === 0 ? (
                <Muted variant="small">No recent activity</Muted>
              ) : (
                <Stack gap="tight">
                  {stats.recentActivity.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-md border p-3"
                    >
                      <Inline gap="tight" align="center" justify="between" className="flex-col md:flex-row">
                        <div className="min-w-0">
                          <Body variant="small" className="truncate font-medium">{event.name || "Unknown User"}</Body>
                          <Muted variant="tiny" className="truncate">
                            {String(event.type ?? "").replace(/_/g, " ")} • {event.email || "—"}
                          </Muted>
                        </div>
                        <Muted variant="tiny">
                          <time>{event.at ? new Date(event.at).toLocaleString() : ""}</time>
                        </Muted>
                      </Inline>
                    </div>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recently Edited Content</CardTitle>
              <CardDescription>Lessons and quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack gap="default">
                <Stack gap="tight">
                  {stats.recentLessons.length === 0 ? (
                    <Muted variant="small">No lessons updated recently</Muted>
                  ) : (
                    stats.recentLessons.map((lesson) => (
                      <Link
                        key={`lesson-${lesson.id}`}
                        href={`/admin/content/lessons/${lesson.id}`}
                        className="block rounded-md border p-2 transition-colors hover:bg-muted/50"
                      >
                        <Inline gap="default" align="center" justify="between">
                          <Body variant="small" className="truncate">
                            {lesson.title || `Lesson #${lesson.id}`}
                          </Body>
                          <Muted variant="tiny">
                            {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : "—"}
                          </Muted>
                        </Inline>
                      </Link>
                    ))
                  )}
                </Stack>
                <Separator />
                <Stack gap="tight">
                  {stats.recentQuizzes.length === 0 ? (
                    <Muted variant="small">No recent quizzes</Muted>
                  ) : (
                    stats.recentQuizzes.map((quiz) => (
                      <Link
                        key={`quiz-${quiz.id}`}
                        href={`/admin/content/quizzes/${quiz.id}`}
                        className="block rounded-md border p-2 transition-colors hover:bg-muted/50"
                      >
                        <Inline gap="default" align="center" justify="between">
                          <Body variant="small" className="truncate">
                            {quiz.topic ? `Quiz: ${quiz.topic}` : `Quiz #${quiz.id}`}
                          </Body>
                          <Muted variant="tiny">
                            {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "—"}
                          </Muted>
                        </Inline>
                      </Link>
                    ))
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Stack>
    </TooltipProvider>
  );
}
