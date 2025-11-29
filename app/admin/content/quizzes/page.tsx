import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stack, Inline } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { Plus } from "lucide-react";
import { getPaginatedQuizzes } from "@/src/db/queries/admin";
import { parsePaginationParams } from "@/src/lib/pagination";
import { QuizzesTable } from "./_components/quizzes-table";
import { QuizzesFilters } from "./_components/quizzes-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function QuizzesContent({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { page, pageSize } = parsePaginationParams(searchParams);

  // Parse filter params
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const skillLevel =
    searchParams.skillLevel === "beginner" ||
    searchParams.skillLevel === "intermediate" ||
    searchParams.skillLevel === "advanced"
      ? searchParams.skillLevel
      : undefined;
  const topicSlug = typeof searchParams.topic === "string" ? searchParams.topic : undefined;

  const result = await getPaginatedQuizzes({
    page,
    pageSize,
    search,
    skillLevel,
    topicSlug,
  });

  return (
    <>
      <QuizzesFilters
        search={search}
        skillLevel={skillLevel}
        topicSlug={topicSlug}
      />
      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>
            {result.total} total quizzes • Page {result.page} of {result.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuizzesTable
            quizzes={result.data}
            pagination={{
              page: result.page,
              pageSize: result.pageSize,
              total: result.total,
              totalPages: result.totalPages,
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default async function QuizzesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <Stack gap="loose">
      <Inline justify="between" align="center">
        <Stack gap="tight">
          <Heading level={1}>Quizzes</Heading>
          <Muted variant="small">
            Manage quizzes, questions, and assessments
          </Muted>
        </Stack>
        <Button asChild>
          <Link href="/admin/content/quizzes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quiz
          </Link>
        </Button>
      </Inline>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>All Quizzes</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <QuizzesContent searchParams={resolvedParams} />
      </Suspense>
    </Stack>
  );
}
