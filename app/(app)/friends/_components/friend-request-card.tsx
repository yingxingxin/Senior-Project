"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FriendRequestCardProps {
  requestId: number;
  requesterUserId: number;
  requesterHandle: string;
  requesterDisplayName: string | null;
  requesterAvatarUrl: string | null;
  createdAt: Date;
}

export function FriendRequestCard({
  requestId,
  requesterHandle,
  requesterDisplayName,
  requesterAvatarUrl,
  createdAt,
}: FriendRequestCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRemoved, setIsRemoved] = React.useState(false);
  const router = useRouter();

  const displayName = requesterDisplayName || requesterHandle;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendshipId: requestId }),
      });

      if (!res.ok) {
        throw new Error("Failed to accept friend request");
      }

      router.refresh();
    } catch (error) {
      console.error("[Friend Request Card] Error:", error);
      alert("Failed to accept friend request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendshipId: requestId }),
      });

      if (!res.ok) {
        throw new Error("Failed to reject friend request");
      }

      setIsRemoved(true);
    } catch (error) {
      console.error("[Friend Request Card] Error:", error);
      alert("Failed to reject friend request");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRemoved) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link href={`/u/${requesterHandle}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={requesterAvatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/u/${requesterHandle}`}>
              <Heading level={4} className="mb-1 truncate">
                {displayName}
              </Heading>
              <Muted className="text-sm">@{requesterHandle}</Muted>
            </Link>
            <Muted className="text-xs mt-1">
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Muted>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

