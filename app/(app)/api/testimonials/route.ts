import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import {
  createTestimonial,
  getTestimonialsForProfile,
} from "@/src/db/queries/testimonials";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorUserId = Number(session.user.id);
    const body = await req.json();
    const { recipientUserId, body: testimonialBody } = body;

    if (!recipientUserId || !testimonialBody) {
      return NextResponse.json(
        { error: "recipientUserId and body are required" },
        { status: 400 }
      );
    }

    const testimonial = await createTestimonial(
      authorUserId,
      Number(recipientUserId),
      testimonialBody
    );

    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    console.error("[Create Testimonial API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create testimonial",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientUserId = searchParams.get("recipient");

    if (!recipientUserId) {
      return NextResponse.json(
        { error: "recipient query parameter required" },
        { status: 400 }
      );
    }

    const testimonials = await getTestimonialsForProfile(
      Number(recipientUserId)
    );

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("[Get Testimonials API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch testimonials",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

