import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { createFriendRequest } from "@/src/db/queries/friends";
import { getUserProfileByHandle } from "@/src/db/queries/profile";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requesterUserId = Number(session.user.id);
    const body = await req.json();
    const { receiverUserId, receiverHandle } = body;

    let targetUserId: number;

    if (receiverUserId) {
      targetUserId = Number(receiverUserId);
    } else if (receiverHandle) {
      const profile = await getUserProfileByHandle(receiverHandle);
      if (!profile) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      targetUserId = profile.user_id;
    } else {
      return NextResponse.json(
        { error: "receiverUserId or receiverHandle required" },
        { status: 400 }
      );
    }

    const result = await createFriendRequest(requesterUserId, targetUserId);

    if (!result) {
      return NextResponse.json(
        { error: "Friend request already exists or users are already friends" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, friendship: result });
  } catch (error) {
    console.error("[Friend Request API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create friend request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

