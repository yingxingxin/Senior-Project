import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { replaceUserProjects } from "@/src/db/queries/profile";
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  techStack: z.string().nullable().optional(),
  linkUrl: z.string().url().nullable().optional().or(z.literal("")),
  orderIndex: z.number().default(0),
});

const projectsUpdateSchema = z.object({
  projects: z.array(projectSchema),
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
    const result = projectsUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.errors },
        { status: 400 }
      );
    }

    const { projects } = result.data;

    // Replace projects
    const updatedProjects = await replaceUserProjects(userId, projects);

    return NextResponse.json({
      projects: updatedProjects,
      message: "Projects updated successfully",
    });
  } catch (err) {
    console.error("Failed to update projects:", err);
    return NextResponse.json(
      { error: "Failed to update projects" },
      { status: 500 }
    );
  }
}

