import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { rejectFriendRequest } from "@/src/db/queries/friends";

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

    await rejectFriendRequest(Number(friendshipId), receiverUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Reject Friend Request API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to reject friend request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

