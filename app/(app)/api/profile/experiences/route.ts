import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { replaceUserExperiences } from "@/src/db/queries/profile";
import { z } from "zod";

const experienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  organization: z.string().min(1, "Organization is required"),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  orderIndex: z.number().default(0),
});

const experiencesUpdateSchema = z.object({
  experiences: z.array(experienceSchema),
});

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const result = experiencesUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.issues },
        { status: 400 }
      );
    }

    const { experiences } = result.data;

    // Convert date strings to Date objects
    const experiencesWithDates = experiences.map((exp) => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : null,
      endDate: exp.isCurrent ? null : exp.endDate ? new Date(exp.endDate) : null,
    }));

    // Replace experiences
    const updatedExperiences = await replaceUserExperiences(
      userId,
      experiencesWithDates
    );

    return NextResponse.json({
      experiences: updatedExperiences,
      message: "Experiences updated successfully",
    });
  } catch (err) {
    console.error("Failed to update experiences:", err);
    return NextResponse.json(
      { error: "Failed to update experiences" },
      { status: 500 }
    );
  }
}

