import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPendingRequests, getFriends } from "@/src/db/queries/friends";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { UserCheck, UserX, Users } from "lucide-react";
import Link from "next/link";
import { FriendRequestCard } from "./_components/friend-request-card";
import { FriendCard } from "./_components/friend-card";

export default async function FriendsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Get pending requests and friends
  const [pendingRequests, friends] = await Promise.all([
    getPendingRequests(userId),
    getFriends(userId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Heading level={1} className="mb-8">
          Friends & Requests
        </Heading>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Pending Friend Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    requestId={request.id}
                    requesterUserId={request.requester_user_id}
                    requesterHandle={request.requester_handle}
                    requesterDisplayName={request.requester_display_name}
                    requesterAvatarUrl={request.requester_avatar_url}
                    createdAt={request.created_at}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.user_id}
                    user_id={friend.user_id}
                    handle={friend.handle}
                    display_name={friend.display_name}
                    tagline={friend.tagline}
                    avatar_url={friend.avatar_url}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Body className="text-muted-foreground">
                  No friends yet. Start by sending friend requests from user profiles!
                </Body>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

