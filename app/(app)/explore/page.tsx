import { searchPublicProfiles, getRandomPublicProfiles } from "@/src/db/queries/profile";
import { UserCard } from "./_components/user-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading, Body } from "@/components/ui/typography";
import { Search } from "lucide-react";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

interface ExplorePageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() || null;

  // Get current user session to exclude from recommendations
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user ? Number(session.user.id) : undefined;

  // Get search results if query exists
  const searchResults = searchQuery
    ? await searchPublicProfiles(searchQuery, 20)
    : [];

  // Always get recommended profiles (exclude current user if logged in)
  const recommendedProfiles = await getRandomPublicProfiles(8, currentUserId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} className="mb-2">
            Explore Learners
          </Heading>
          <Body className="text-muted-foreground">
            Discover other learners and their learning journeys
          </Body>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <form action="/explore" method="get" className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search by name or handle..."
                  defaultValue={searchQuery || ""}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <Heading level={2} className="mb-4">
              Search results for &quot;{searchQuery}&quot;
            </Heading>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <UserCard key={user.user_id} {...user} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Body className="text-muted-foreground">
                    No matching users found. Try a different search term.
                  </Body>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recommended Profiles */}
        <div>
          <Heading level={2} className="mb-4">
            {searchQuery ? "Other learners on the platform" : "Recommended Profiles"}
          </Heading>
          {recommendedProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProfiles.map((user) => (
                <UserCard key={user.user_id} {...user} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Body className="text-muted-foreground">
                  No public profiles available at the moment.
                </Body>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

