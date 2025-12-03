import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import {
  deleteTestimonial,
  updateTestimonialVisibility,
} from "@/src/db/queries/testimonials";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipientUserId = Number(session.user.id);
    const { id } = await params;
    const testimonialId = Number(id);

    if (isNaN(testimonialId)) {
      return NextResponse.json(
        { error: "Invalid testimonial ID" },
        { status: 400 }
      );
    }

    await deleteTestimonial(testimonialId, recipientUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Testimonial API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete testimonial",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipientUserId = Number(session.user.id);
    const { id } = await params;
    const testimonialId = Number(id);
    const body = await req.json();
    const { isPublic } = body;

    if (isNaN(testimonialId)) {
      return NextResponse.json(
        { error: "Invalid testimonial ID" },
        { status: 400 }
      );
    }

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean" },
        { status: 400 }
      );
    }

    await updateTestimonialVisibility(testimonialId, recipientUserId, isPublic);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Update Testimonial API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update testimonial",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

