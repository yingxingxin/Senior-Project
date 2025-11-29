import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { getPaginatedUsers } from "@/src/db/queries/admin";
import { parsePaginationParams } from "@/src/lib/pagination";
import { UsersTable } from "./_components/users-table";
import { UsersFilters } from "./_components/users-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function UsersContent({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const { page, pageSize } = parsePaginationParams(searchParams);

  // Parse filter params
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const role = searchParams.role === "admin" || searchParams.role === "user" ? searchParams.role : undefined;
  const onboardingStatus =
    searchParams.onboarding === "completed" || searchParams.onboarding === "pending"
      ? searchParams.onboarding
      : undefined;
  const createdAfter = typeof searchParams.created_gte === "string" ? searchParams.created_gte : undefined;

  const result = await getPaginatedUsers({
    page,
    pageSize,
    search,
    role,
    onboardingStatus,
    createdAfter,
  });

  return (
    <>
      <UsersFilters
        search={search}
        role={role}
        onboardingStatus={onboardingStatus}
        createdAfter={createdAfter}
      />
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {result.total} total users • Page {result.page} of {result.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={result.data}
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

export default async function UsersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>User Management</Heading>
        <Muted variant="small">
          Manage users, view their progress, and update their settings
        </Muted>
      </Stack>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
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
        <UsersContent searchParams={resolvedParams} />
      </Suspense>
    </Stack>
  );
}
