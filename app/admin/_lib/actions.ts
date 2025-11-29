'use server';

import { sql, count, eq, gte, lt, and, desc } from "drizzle-orm";

import {
  db,
  users,
  lessons,
  quizzes,
  user_lesson_progress,
  activity_events,
  sessions,
  quiz_attempts,
} from "@/src/db";
import {
  getAdminUserCount,
  getAdminLessonCount,
  getAdminQuizCount,
  getNewUserCount,
} from "@/src/db/queries";

export type RangeKey = "7d" | "30d" | "90d";

type RangeMeta = {
  now: Date;
  start: Date;
  prevStart: Date;
  prevEnd: Date;
  days: number;
};

type RecentActivityRow = Awaited<ReturnType<typeof getRecentActivity>>[number];

export type AdminDashboard = {
  meta: RangeMeta;
  totals: {
    users: number;
    lessons: number;
    quizzes: number;
  };
  kpis: {
    newUsers: { now: number; prev: number };
    lessonsCompleted: { now: number; prev: number };
    quizAttempts: { now: number; prev: number };
    dau: number;
    activeUsers: number;
  };
  pendingOnboarding: number;
  recentActivity: RecentActivityRow[];
  recentLessons: { id: number; title: string | null; updatedAt: Date | null }[];
  recentQuizzes: { id: number; topic: string | null; createdAt: Date | null }[];
};

async function getRecentActivity() {
  return db
    .select({
      id: activity_events.id,
      userId: activity_events.user_id,
      type: activity_events.event_type,
      at: activity_events.occurred_at,
      name: users.name,
      email: users.email,
    })
    .from(activity_events)
    .leftJoin(users, eq(activity_events.user_id, users.id))
    .orderBy(desc(activity_events.occurred_at))
    .limit(12);
}

export async function getAdminDashboard(range: RangeKey): Promise<AdminDashboard> {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEnd = start;
  const meta: RangeMeta = { now, start, prevStart, prevEnd, days };
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalLessons,
    totalQuizzes,
    newUsersNow,
    newUsersPrev,
    completedNow,
    completedPrev,
    attemptsNow,
    attemptsPrev,
    dau,
    activeUsers,
    pendingOnboarding,
    recentActivity,
    recentLessons,
    recentQuizzes,
  ] = await Promise.all([
    getAdminUserCount.execute({}),
    getAdminLessonCount.execute({}),
    getAdminQuizCount.execute({}),
    getNewUserCount.execute({ startDate: start.toISOString() }),
    db
      .select({ c: count() })
      .from(users)
      .where(and(gte(users.created_at, prevStart), lt(users.created_at, prevEnd)))
      .limit(1),
    db
      .select({ c: count() })
      .from(user_lesson_progress)
      .where(and(eq(user_lesson_progress.is_completed, true), gte(user_lesson_progress.completed_at, start)))
      .limit(1),
    db
      .select({ c: count() })
      .from(user_lesson_progress)
      .where(
        and(
          eq(user_lesson_progress.is_completed, true),
          gte(user_lesson_progress.completed_at, prevStart),
          lt(user_lesson_progress.completed_at, prevEnd)
        )
      )
      .limit(1),
    db
      .select({ c: count() })
      .from(quiz_attempts)
      .where(gte(quiz_attempts.completed_at, start))
      .limit(1),
    db
      .select({ c: count() })
      .from(quiz_attempts)
      .where(and(gte(quiz_attempts.completed_at, prevStart), lt(quiz_attempts.completed_at, prevEnd)))
      .limit(1),
    db
      .select({ c: sql<number>`COUNT(DISTINCT ${sessions.user_id})` })
      .from(sessions)
      .where(gte(sessions.updated_at, todayStart))
      .limit(1),
    db
      .select({ c: sql<number>`COUNT(DISTINCT ${sessions.user_id})` })
      .from(sessions)
      .where(gte(sessions.updated_at, start))
      .limit(1),
    db
      .select({ c: count() })
      .from(users)
      .where(sql`${users.onboarding_completed_at} IS NULL`)
      .limit(1),
    getRecentActivity(),
    db
      .select({
        id: lessons.id,
        title: lessons.title,
        updatedAt: lessons.updated_at,
      })
      .from(lessons)
      .orderBy(desc(lessons.updated_at))
      .limit(5),
    db
      .select({
        id: quizzes.id,
        topic: quizzes.topic_slug,
        createdAt: quizzes.created_at,
      })
      .from(quizzes)
      .orderBy(desc(quizzes.created_at))
      .limit(5),
  ]);

  return {
    meta,
    totals: {
      users: totalUsers[0]?.c ?? 0,
      lessons: totalLessons[0]?.c ?? 0,
      quizzes: totalQuizzes[0]?.c ?? 0,
    },
    kpis: {
      newUsers: { now: newUsersNow[0]?.c ?? 0, prev: newUsersPrev[0]?.c ?? 0 },
      lessonsCompleted: { now: completedNow[0]?.c ?? 0, prev: completedPrev[0]?.c ?? 0 },
      quizAttempts: { now: attemptsNow[0]?.c ?? 0, prev: attemptsPrev[0]?.c ?? 0 },
      dau: dau[0]?.c ?? 0,
      activeUsers: activeUsers[0]?.c ?? 0,
    },
    pendingOnboarding: pendingOnboarding[0]?.c ?? 0,
    recentActivity,
    recentLessons,
    recentQuizzes,
  };
}
