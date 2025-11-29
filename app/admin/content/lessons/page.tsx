import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stack, Inline } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { Plus } from "lucide-react";
import { getPaginatedLessons } from "@/src/db/queries/admin";
import { parsePaginationParams } from "@/src/lib/pagination";
import { LessonsTable } from "./_components/lessons-table";
import { LessonsFilters } from "./_components/lessons-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function LessonsContent({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { page, pageSize } = parsePaginationParams(searchParams);

  // Parse filter params
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const difficulty =
    searchParams.difficulty === "beginner" ||
    searchParams.difficulty === "intermediate" ||
    searchParams.difficulty === "advanced"
      ? searchParams.difficulty
      : undefined;
  const scope =
    searchParams.scope === "global" ||
    searchParams.scope === "user" ||
    searchParams.scope === "shared"
      ? searchParams.scope
      : undefined;
  const isPublished =
    searchParams.published === "true"
      ? true
      : searchParams.published === "false"
        ? false
        : undefined;

  const result = await getPaginatedLessons({
    page,
    pageSize,
    search,
    difficulty,
    scope,
    isPublished,
  });

  return (
    <>
      <LessonsFilters
        search={search}
        difficulty={difficulty}
        scope={scope}
        isPublished={isPublished}
      />
      <Card>
        <CardHeader>
          <CardTitle>All Lessons</CardTitle>
          <CardDescription>
            {result.total} total lessons • Page {result.page} of {result.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LessonsTable
            lessons={result.data}
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

export default async function LessonsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <Stack gap="loose">
      <Inline justify="between" align="center">
        <Stack gap="tight">
          <Heading level={1}>Lessons</Heading>
          <Muted variant="small">
            Manage lessons, courses, and learning content
          </Muted>
        </Stack>
        <Button asChild>
          <Link href="/admin/content/lessons/new">
            <Plus className="mr-2 h-4 w-4" />
            New Lesson
          </Link>
        </Button>
      </Inline>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>All Lessons</CardTitle>
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
        <LessonsContent searchParams={resolvedParams} />
      </Suspense>
    </Stack>
  );
}
