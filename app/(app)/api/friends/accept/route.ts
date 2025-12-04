import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { acceptFriendRequest } from "@/src/db/queries/friends";
import { getUserProfileByUserId } from "@/src/db/queries/profile";
import { enqueueNotification } from "@/src/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const receiverUserId = Number(session.user.id);
    const body = await req.json();
    const { friendshipId } = body;

    if (!friendshipId) {
      return NextResponse.json(
        { error: "friendshipId required" },
        { status: 400 }
      );
    }

    const friendship = await acceptFriendRequest(Number(friendshipId), receiverUserId);

    // Send notification to the original requester that their request was accepted
    const accepterProfile = await getUserProfileByUserId(String(receiverUserId));
    const accepterName = accepterProfile?.display_name || session.user.name || "Someone";
    const accepterHandle = accepterProfile?.handle;

    await enqueueNotification({
      userId: friendship.requester_user_id,
      type: "friend_accepted",
      title: "Friend Request Accepted",
      message: `${accepterName} accepted your friend request`,
      link: accepterHandle ? `/u/${accepterHandle}` : "/friends",
      data: {
        accepterId: receiverUserId,
        accepterName: accepterName,
        accepterHandle: accepterHandle,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Accept Friend Request API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to accept friend request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

