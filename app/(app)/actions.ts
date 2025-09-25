import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";
import {
  db,
  users,
  assistants,
  achievements,
  user_achievements,
  activity_events,
  lessons as lessonsTable
} from "@/src/db";
import { eq, desc, and, sql, count } from "drizzle-orm";

type Persona = "kind" | "direct" | "calm";
type Gender = "feminine" | "masculine" | "androgynous";

type Activity = {
  id: string;
  kind: "lesson" | "quiz" | "practice";
  title: string;
  progressPct?: number;
  scorePct?: number;
  timestamp: string;
  actionHref: string;
};

type Badge = {
  id: string;
  name: string;
  icon: "trophy" | "flame" | "award" | "star";
  earned: boolean;
  hint?: string;
};

type AssistantInfo = {
  id: number;
  name: string;
  slug: string;
  gender: Gender | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
};

type Lesson = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "standard" | "hard" | null;
  estimatedDurationSec: number | null;
};

export type DashboardData = {
  userName: string;
  email?: string;
  level: number;
  points: number;
  streakDays: number;
  persona: Persona;
  assistant: AssistantInfo;
  nextMilestonePoints: number;
  recent: Activity[];
  badges: Badge[];
  levelProgress: {
    level: number;
    percent: number;
    pointsToNext: number;
  };
  primaryAction: {
    title: string;
    cta: string;
    href: string;
  };
  assistantSpeech: string;
  lessons: Lesson[];
};

export type NavbarData = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
    initials: string;
  };
  stats: {
    level: number;
    streak: number;
    points: number;
  };
};

// Database query functions for dashboard

async function getUserStats(userId: number) {
  // Calculate stats from activity_events since we don't have a leaderboards table
  const events = await db
    .select({
      total_points: sql<number>`COALESCE(SUM(${activity_events.points_delta}), 0)`,
      event_count: count(),
      last_active: sql<Date>`MAX(${activity_events.occurred_at})`,
    })
    .from(activity_events)
    .where(eq(activity_events.user_id, userId));

  const totalPoints = events[0]?.total_points || 0;
  const xp = totalPoints; // XP equals points for simplicity
  const level = Math.floor(xp / 1000) + 1;
  const xpToNext = 1000 - (xp % 1000);

  // Simple streak calculation based on consecutive days with activity
  const streakDays = await calculateStreakDays(userId);

  return {
    userId,
    totalPoints,
    level,
    xp,
    xpToNext,
    currentStreak: streakDays,
    longestStreak: streakDays, // For now, same as current
    lastActiveDate: events[0]?.last_active || null,
    updatedAt: new Date()
  };
}

async function calculateStreakDays(userId: number): Promise<number> {
  // Get distinct days with activity in the last 30 days
  const recentActivity = await db
    .select({
      date: sql<string>`DATE(${activity_events.occurred_at})`,
    })
    .from(activity_events)
    .where(and(
      eq(activity_events.user_id, userId),
      sql`${activity_events.occurred_at} > NOW() - INTERVAL '30 days'`
    ))
    .groupBy(sql`DATE(${activity_events.occurred_at})`)
    .orderBy(desc(sql`DATE(${activity_events.occurred_at})`));

  if (recentActivity.length === 0) return 0;

  // Check for consecutive days
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];

  // If the most recent activity isn't today or yesterday, streak is broken
  const mostRecent = recentActivity[0].date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0;
  }

  // Count consecutive days
  for (let i = 1; i < recentActivity.length; i++) {
    const curr = new Date(recentActivity[i - 1].date);
    const prev = new Date(recentActivity[i].date);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function getRecentActivities(userId: number, limit = 5): Promise<Activity[]> {
  const activities = await db
    .select()
    .from(activity_events)
    .where(eq(activity_events.user_id, userId))
    .orderBy(desc(activity_events.occurred_at))
    .limit(limit);

  // Transform database activities to dashboard format
  return activities.map(activity => {
    const now = new Date();
    const occurred = new Date(activity.occurred_at!);
    const hoursDiff = Math.floor((now.getTime() - occurred.getTime()) / (1000 * 60 * 60));
    const daysDiff = Math.floor(hoursDiff / 24);

    const timestamp = hoursDiff < 1
      ? 'Just now'
      : hoursDiff < 24
      ? `${hoursDiff}h ago`
      : `${daysDiff}d ago`;

    // Determine activity type from event_type
    let kind: Activity['kind'] = 'lesson';
    let title = 'Activity';

    if (activity.event_type?.includes('quiz')) {
      kind = 'quiz';
      title = 'Quiz Activity';
    } else if (activity.event_type?.includes('lesson')) {
      kind = 'lesson';
      title = 'Lesson Activity';
    } else if (activity.event_type === 'achievement_unlocked') {
      kind = 'practice';
      title = 'Achievement Unlocked';
    }

    // Generate action href based on activity type and IDs
    let actionHref = '#';
    if (activity.lesson_id) {
      actionHref = `/learn/lesson/${activity.lesson_id}`;
    } else if (activity.quiz_id) {
      actionHref = `/learn/quiz/${activity.quiz_id}`;
    }

    return {
      id: activity.id.toString(),
      kind,
      title,
      progressPct: activity.event_type === 'lesson_completed' ? 100 :
                   activity.event_type === 'lesson_progressed' ? 50 : undefined,
      scorePct: activity.event_type === 'quiz_perfect' ? 100 :
                activity.event_type === 'quiz_submitted' ? 75 : undefined,
      timestamp,
      actionHref
    };
  });
}

async function getUserAchievements(userId: number): Promise<Badge[]> {
  const allAchievements = await db
    .select({
      id: achievements.id,
      code: achievements.code,
      name: achievements.name,
      description: achievements.description,
      icon_url: achievements.icon_url,
      points_reward: achievements.points_reward,
      is_active: achievements.is_active,
      earned: sql<boolean>`CASE WHEN ${user_achievements.user_id} IS NOT NULL THEN true ELSE false END`,
      unlocked_at: user_achievements.unlocked_at
    })
    .from(achievements)
    .leftJoin(
      user_achievements,
      and(
        eq(user_achievements.achievement_id, achievements.id),
        eq(user_achievements.user_id, userId)
      )
    )
    .where(eq(achievements.is_active, true));

  // Transform to dashboard badge format
  return allAchievements.map(achievement => {
    // Map icon URL to icon type, or use default
    let icon: Badge['icon'] = 'trophy';
    if (achievement.icon_url?.includes('flame')) icon = 'flame';
    else if (achievement.icon_url?.includes('star')) icon = 'star';
    else if (achievement.icon_url?.includes('award')) icon = 'award';

    return {
      id: achievement.id.toString(),
      name: achievement.name,
      icon,
      earned: achievement.earned || false,
      hint: !achievement.earned ? achievement.description || undefined : undefined
    };
  });
}

// Leveling System:
// - Every 1000 XP = 1 level
// - Level 1: 0-999 XP
// - Level 2: 1000-1999 XP
// - Level 3: 2000-2999 XP, etc.
// - This is dynamically calculated based on total XP
// - XP and points can be the same or different depending on your needs
// - You can modify the XP per level by changing the divisor (1000)

function calculateLevelProgress(xp: number) {
  const XP_PER_LEVEL = 1000; // Configurable: change this to adjust leveling speed
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInCurrentLevel;
  const progressPercent = Math.floor((xpInCurrentLevel / XP_PER_LEVEL) * 100);

  return {
    level,
    percent: progressPercent,
    pointsToNext: xpToNext
  };
}

export async function getExploreData(): Promise<DashboardData> {
  const session = await auth.api.getSession({ headers: await headers() });

  // Since layout.tsx checks for authentication and onboarding completion,
  // we can assume the user is authenticated and has completed onboarding
  // when this function is called from /home
  if (!session?.user?.id) {
    // This should not happen as layout redirects unauthenticated users
    throw new Error("User not authenticated");
  }

  const userId = Number(session.user.id);

  const [userData] = await db
    .select({
        id: users.id,
        name: users.name,
        email: users.email,
        assistant_persona: users.assistant_persona,
        assistant_id: users.assistant_id,
        // Assistant fields
        assistantName: assistants.name,
        assistantSlug: assistants.slug,
        assistantGender: assistants.gender,
        assistantAvatar: assistants.avatar_url,
        assistantTagline: assistants.tagline,
        assistantDescription: assistants.description,
      })
      .from(users)
      .leftJoin(assistants, eq(users.assistant_id, assistants.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      // This shouldn't happen if onboarding is complete
      throw new Error("User data not found");
    }

    const userName = userData.name || userData.email?.split("@")[0] || "User";
    const email = userData.email || undefined;
    const persona = userData.assistant_persona as Persona || "kind";

    // User must have assistant data if onboarding is complete
    if (!userData.assistant_id || !userData.assistantName) {
      throw new Error("Assistant data not found - onboarding may be incomplete");
    }

    const assistantInfo: AssistantInfo = {
      id: userData.assistant_id,
      name: userData.assistantName,
      slug: userData.assistantSlug || "nova-feminine",
      gender: userData.assistantGender as Gender | null,
      avatarUrl: userData.assistantAvatar,
      tagline: userData.assistantTagline,
      description: userData.assistantDescription,
    }

  // Fetch real user stats
  const stats = await getUserStats(userId);
  const points = stats.totalPoints;
  const level = stats.level;
  const streakDays = stats.currentStreak;
  const levelProgress = calculateLevelProgress(stats.xp);

  // Calculate next milestone (every 1000 points)
  let nextMilestonePoints = Math.ceil(points / 1000) * 1000 || 100;
  if (nextMilestonePoints === points) {
    nextMilestonePoints += 1000;
  }

  // Fetch recent activities
  let recent = await getRecentActivities(userId);

  // If no recent activities, provide some defaults
  if (recent.length === 0) {
    recent = [
      {
        id: "default1",
        kind: "lesson",
        title: "Get Started with Learning",
        progressPct: 0,
        timestamp: "Start now",
        actionHref: "/learn/start",
      },
    ];
  }

  // Fetch achievements/badges
  let badges = await getUserAchievements(userId);

  // If no achievements exist in DB, provide defaults
  if (badges.length === 0) {
    badges = [
      {
        id: "default1",
        name: "First Lesson",
        icon: "trophy",
        earned: true,
      },
    ];
  }

  // Choose primary action based on recent activity
  const primaryAction = recent[0] && recent[0].kind === "lesson" && (recent[0].progressPct ?? 0) < 100
    ? { title: recent[0].title, cta: "Continue", href: recent[0].actionHref }
    : recent[0] && recent[0].kind === "quiz"
    ? { title: recent[0].title, cta: "Review quiz", href: recent[0].actionHref }
    : { title: "Practice Session", cta: "Start practice", href: "/practice" };

  // Build assistant speech with assistant's name
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const tone = persona === "direct"
    ? "Quick 10-minute push to keep the streak."
    : persona === "calm"
    ? "Steady pace, clear steps."
    : "I am here with you. Let us make this fun.";
  const assistantSpeech = `${greet}, ${userName}! I'm ${assistantInfo.name}. Ready for "${primaryAction.title}"? ${tone}`;

  // Fetch featured lessons for explore section
  const lessons = await db
    .select({
      id: lessonsTable.id,
      slug: lessonsTable.slug,
      title: lessonsTable.title,
      description: lessonsTable.description,
      difficulty: lessonsTable.difficulty,
      estimatedDurationSec: lessonsTable.estimated_duration_sec,
    })
    .from(lessonsTable)
    .limit(3);

  return {
    userName,
    email,
    level,
    points,
    streakDays,
    persona,
    assistant: assistantInfo,
    nextMilestonePoints,
    recent,
    badges,
    levelProgress,
    primaryAction,
    assistantSpeech,
    lessons,
  };
}

export async function getUserNavbarData(): Promise<NavbarData | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  // Fetch user data with image
  const [userData] = await db
    .select({
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userData) {
    return null;
  }

  // Get user stats (reuse existing function)
  const stats = await getUserStats(userId);

  // Generate initials from name or email
  const displayName = userData.name || userData.email?.split("@")[0] || "U";
  const nameParts = displayName.split(" ");
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  return {
    user: {
      name: userData.name || userData.email?.split("@")[0] || "User",
      email: userData.email || "",
      avatarUrl: userData.image,
      initials,
    },
    stats: {
      level: stats.level,
      streak: stats.currentStreak,
      points: stats.totalPoints,
    },
  };
}