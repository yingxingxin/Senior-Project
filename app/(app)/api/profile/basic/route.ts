import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { upsertUserProfile } from "@/src/db/queries/profile";
import { z } from "zod";

const profileUpdateSchema = z.object({
  handle: z
    .string()
    .min(1, "Handle is required")
    .max(100, "Handle must be 100 characters or less")
    .regex(
      /^[a-z0-9_-]+$/,
      "Handle can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  displayName: z.string().max(255).nullable().optional(),
  tagline: z.string().max(255).nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional().or(z.literal("")),
  websiteUrl: z.string().url().nullable().optional().or(z.literal("")),
  githubUrl: z.string().url().nullable().optional().or(z.literal("")),
  linkedinUrl: z.string().url().nullable().optional().or(z.literal("")),
  xUrl: z.string().url().nullable().optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

export async function PATCH(req: Request): Promise<NextResponse> {
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
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Normalize handle
    const normalizedHandle = data.handle.toLowerCase().trim();

    // Try to upsert profile
    try {
      const profile = await upsertUserProfile(userId, {
        handle: normalizedHandle,
        displayName: data.displayName || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
        websiteUrl: data.websiteUrl || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        xUrl: data.xUrl || null,
        isPublic: data.isPublic,
      });

      return NextResponse.json({ profile });
    } catch (err) {
      // Check if it's a unique constraint violation (handle conflict)
      if (
        err instanceof Error &&
        (err.message.includes("unique") ||
          err.message.includes("duplicate") ||
          err.message.includes("violates unique constraint"))
      ) {
        return NextResponse.json(
          { error: "This handle is already taken" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("Failed to update profile:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

