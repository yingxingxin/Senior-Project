import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getPendingRequests } from "@/src/db/queries/friends";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const receiverUserId = Number(session.user.id);
    const requests = await getPendingRequests(receiverUserId);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[Pending Requests API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pending requests",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

