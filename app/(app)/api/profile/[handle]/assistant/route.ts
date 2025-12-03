import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getUserProfileByHandle } from "@/src/db/queries/profile";
import { getUserActivityStats, getRecentActivityWithDetails } from "@/src/db/queries/activities";
import { getEarnedAchievements } from "@/src/db/queries/achievements";
import { db } from "@/src/db";
import { users, assistants, user_lesson_progress, quiz_attempts } from "@/src/db/schema";
import { eq, count, sql } from "drizzle-orm";
import {
  buildProfileAssistantPrompt,
  ALLOWED_QUESTION_TYPES,
  type ProfileQuestionType,
} from "@/src/lib/ai/profileAssistant";
import { openrouter } from "@/src/lib/openrouter";
import { generateText } from "ai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o-mini"; // Fast, cost-effective model for short responses

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  // Try to get user ID from session first
  // Otherwise use IP address (hashed for privacy)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  return `profile-assistant:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

interface AssistantRequest {
  questionType: ProfileQuestionType;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(req);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429 }
      );
    }

    // Validate API key
    if (!OPENROUTER_API_KEY) {
      console.error("[Profile Assistant] OpenRouter API key not configured");
      return NextResponse.json(
        { error: "Assistant service is not available" },
        { status: 500 }
      );
    }

    const { handle } = await params;
    const body = (await req.json()) as AssistantRequest;
    const { questionType } = body;

    // Validate question type
    if (!questionType || !ALLOWED_QUESTION_TYPES.includes(questionType)) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      );
    }

    // Get profile data
    const profileData = await getUserProfileByHandle(handle);
    if (!profileData) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if profile is public
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const isOwner = session?.user
      ? Number(session.user.id) === profileData.user_id
      : false;

    if (!profileData.is_public && !isOwner) {
      return NextResponse.json(
        { error: "Profile is not public" },
        { status: 403 }
      );
    }

    // Get user and assistant info
    const [user] = await db
      .select({
        id: users.id,
        assistant_id: users.assistant_id,
        assistant_persona: users.assistant_persona,
      })
      .from(users)
      .where(eq(users.id, profileData.user_id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get assistant info if configured
    let assistantPersona = null;
    if (user.assistant_id) {
      const [assistant] = await db
        .select()
        .from(assistants)
        .where(eq(assistants.id, user.assistant_id))
        .limit(1);

      if (assistant) {
        assistantPersona = {
          name: assistant.name,
          tagline: assistant.tagline,
          description: assistant.description,
          persona: user.assistant_persona,
        };
      }
    }

    // Get learning stats
    const [activityStats] = await getUserActivityStats.execute({
      userId: profileData.user_id,
    });

    const totalPoints = activityStats?.total_points || 0;
    const level = Math.floor(totalPoints / 1000) + 1;

    // Get recent activity for context
    const recentActivityRaw = await getRecentActivityWithDetails.execute({
      userId: profileData.user_id,
      limit: 5,
    });

    // Get lesson/quiz completion counts
    const [lessonStats] = await db
      .select({
        completed: sql<number>`COUNT(*)::integer`,
      })
      .from(user_lesson_progress)
      .where(eq(user_lesson_progress.user_id, profileData.user_id));

    const [quizStats] = await db
      .select({
        submitted: sql<number>`COUNT(*)::integer`,
      })
      .from(quiz_attempts)
      .where(eq(quiz_attempts.user_id, profileData.user_id));

    // Calculate streak (simplified - last 30 days)
    const { getStreakDays } = await import("@/src/db/queries/activities");
    const streakDays = await getStreakDays.execute({ userId: profileData.user_id });
    const currentStreak = streakDays.length;

    // Get achievements
    const earnedAchievements = await getEarnedAchievements.execute({
      userId: profileData.user_id,
    });

    // Build public data structures
    const publicProfileData = {
      displayName: profileData.display_name || profileData.handle,
      handle: profileData.handle,
      tagline: profileData.tagline,
      bio: profileData.bio,
      projects: profileData.projects.map((p) => ({
        title: p.title,
        description: p.description,
        techStack: p.tech_stack,
      })),
      experiences: profileData.experiences.map((e) => ({
        role: e.role,
        organization: e.organization,
        startDate: e.start_date,
        endDate: e.end_date,
        isCurrent: e.is_current,
        description: e.description,
      })),
    };

    const publicLearningData = {
      totalPoints,
      level,
      currentStreak,
      lessonsCompleted: lessonStats?.completed || 0,
      quizzesSubmitted: quizStats?.submitted || 0,
      lastActiveDate: activityStats?.last_active || null,
      recentActivity: recentActivityRaw.map((a) => ({
        eventType: a.eventType,
        lessonTitle: a.lessonTitle,
        quizTopic: a.quizTopic,
      })),
    };

    const publicAchievementsData = {
      achievements: earnedAchievements.map((a) => ({
        name: a.name,
        description: a.description,
        rarity: a.rarity,
        unlockedAt: a.unlocked_at,
      })),
    };

    // Build prompts
    const { systemPrompt, userPrompt } = buildProfileAssistantPrompt(
      publicProfileData,
      publicLearningData,
      publicAchievementsData,
      assistantPersona,
      questionType
    );

    // Call LLM
    const result = await generateText({
      model: openrouter(MODEL),
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
      maxTokens: 200, // Short responses
    });

    // Log request (without sensitive data)
    console.log("[Profile Assistant]", {
      handle,
      questionType,
      userId: session?.user?.id || "anonymous",
      responseLength: result.text.length,
    });

    return NextResponse.json({
      questionType,
      answer: result.text,
      assistantName: assistantPersona?.name || "Assistant",
    });
  } catch (error) {
    console.error("[Profile Assistant] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate assistant response",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

