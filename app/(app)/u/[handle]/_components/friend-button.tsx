"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FriendshipStatus } from "@/src/db/queries/friends";

interface FriendButtonProps {
  profileUserId: number;
  handle: string;
  friendshipStatus: FriendshipStatus;
  accentColor?: string;
}

export function FriendButton({
  profileUserId,
  handle,
  friendshipStatus,
  accentColor,
}: FriendButtonProps) {
  const [status, setStatus] = React.useState<FriendshipStatus>(friendshipStatus);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleAddFriend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverUserId: profileUserId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send friend request");
      }

      setStatus("pending_outgoing");
    } catch (error) {
      console.error("[Friend Button] Error:", error);
      alert(error instanceof Error ? error.message : "Failed to send friend request");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "friends") {
    return (
      <Button
        variant="outline"
        disabled
        className="gap-2"
        style={
          accentColor
            ? {
                borderColor: accentColor,
                color: accentColor,
              }
            : undefined
        }
      >
        <UserCheck className="h-4 w-4" />
        Friends
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Clock className="h-4 w-4" />
        Request Sent
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <Button
        variant="default"
        onClick={() => router.push("/friends")}
        className="gap-2"
        style={
          accentColor
            ? {
                backgroundColor: accentColor,
                borderColor: accentColor,
              }
            : undefined
        }
      >
        <UserPlus className="h-4 w-4" />
        Respond to Request
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleAddFriend}
      disabled={isLoading}
      className="gap-2"
      style={
        accentColor
          ? {
              backgroundColor: accentColor,
              borderColor: accentColor,
            }
          : undefined
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Add Friend
        </>
      )}
    </Button>
  );
}

