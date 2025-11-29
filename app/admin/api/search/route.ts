import { NextRequest, NextResponse } from "next/server";
import { db, users, lessons, quizzes } from "@/src/db";
import { or, ilike, desc } from "drizzle-orm";
import { requireAdmin } from "@/app/admin/_lib/admin-guard";

export const dynamic = "force-dynamic";

/**
 * Global admin search API
 *
 * Searches across users, lessons, and quizzes.
 * Returns up to 5 results per category for quick search.
 */
export async function GET(request: NextRequest) {
  // Verify admin access
  await requireAdmin();

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({
      users: [],
      lessons: [],
      quizzes: [],
    });
  }

  const searchPattern = `%${query}%`;

  // Search users by name or email
  const userResults = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(
      or(
        ilike(users.name, searchPattern),
        ilike(users.email, searchPattern)
      )
    )
    .orderBy(desc(users.created_at))
    .limit(5);

  // Search lessons by title, description, or slug
  const lessonResults = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      slug: lessons.slug,
      difficulty: lessons.difficulty,
    })
    .from(lessons)
    .where(
      or(
        ilike(lessons.title, searchPattern),
        ilike(lessons.description, searchPattern),
        ilike(lessons.slug, searchPattern)
      )
    )
    .orderBy(desc(lessons.updated_at))
    .limit(5);

  // Search quizzes by title, description, or topic
  const quizResults = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      slug: quizzes.slug,
      topicSlug: quizzes.topic_slug,
      skillLevel: quizzes.skill_level,
    })
    .from(quizzes)
    .where(
      or(
        ilike(quizzes.title, searchPattern),
        ilike(quizzes.description, searchPattern),
        ilike(quizzes.topic_slug, searchPattern)
      )
    )
    .orderBy(desc(quizzes.created_at))
    .limit(5);

  return NextResponse.json({
    users: userResults,
    lessons: lessonResults,
    quizzes: quizResults,
  });
}
