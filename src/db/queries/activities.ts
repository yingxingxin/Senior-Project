/**
 * Prepared Queries - Activities
 *
 * High-performance prepared statements for activity tracking and statistics.
 * These are the most frequently called queries in the application.
 */

import { db } from '@/src/db';
import { activity_events, lessons, quizzes, achievements } from '@/src/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

/**
 * Get user activity stats
 *
 * Calculates total points, event count, and last active date for a user.
 * Called on every dashboard load.
 *
 * @param userId - The user's ID
 * @returns Object with total_points, event_count, last_active
 *
 * @example
 * const stats = await getUserActivityStats.execute({ userId: 123 });
 * console.log(stats[0].total_points); // Total XP/points
 */
export const getUserActivityStats = db
  .select({
    total_points: sql<number>`COALESCE(SUM(${activity_events.points_delta}), 0)`,
    event_count: count(),
    last_active: sql<Date>`MAX(${activity_events.occurred_at})`,
  })
  .from(activity_events)
  .where(eq(activity_events.user_id, sql.placeholder('userId')))
  .prepare('get_user_activity_stats');

/**
 * Get recent activities with limit
 *
 * Returns the user's most recent activity events, ordered by occurrence date.
 * Used for activity feed on dashboard.
 *
 * @param userId - The user's ID
 * @param limit - Number of activities to return
 * @returns Array of activity events
 *
 * @example
 * const activities = await getRecentActivities.execute({ userId: 123, limit: 5 });
 */
export const getRecentActivities = db
  .select()
  .from(activity_events)
  .where(eq(activity_events.user_id, sql.placeholder('userId')))
  .orderBy(desc(activity_events.occurred_at))
  .limit(sql.placeholder('limit'))
  .prepare('get_recent_activities');

/**
 * Get streak calculation data
 *
 * Returns distinct activity dates for the last 30 days, used to calculate streaks.
 * Called on dashboard load for streak display.
 *
 * @param userId - The user's ID
 * @returns Array of dates with activity
 *
 * @example
 * const streakData = await getStreakDays.execute({ userId: 123 });
 * // Process dates to calculate consecutive streak
 */
export const getStreakDays = db
  .select({
    date: sql<string>`DATE(${activity_events.occurred_at})`,
  })
  .from(activity_events)
  .where(
    and(
      eq(activity_events.user_id, sql.placeholder('userId')),
      sql`${activity_events.occurred_at} > NOW() - INTERVAL '30 days'`
    )
  )
  .groupBy(sql`DATE(${activity_events.occurred_at})`)
  .orderBy(desc(sql`DATE(${activity_events.occurred_at})`))
  .prepare('get_streak_days');

/**
 * Get recent activity with details (joins)
 *
 * Returns recent activities with related lesson, quiz, and achievement details.
 * Used in admin user detail pages.
 *
 * @param userId - The user's ID
 * @param limit - Number of activities to return
 * @returns Array of activity events with joined details
 *
 * @example
 * const activities = await getRecentActivityWithDetails.execute({ userId: 123, limit: 10 });
 */
export const getRecentActivityWithDetails = db
  .select({
    id: activity_events.id,
    eventType: activity_events.event_type,
    occurredAt: activity_events.occurred_at,
    pointsDelta: activity_events.points_delta,
    lessonId: activity_events.lesson_id,
    quizId: activity_events.quiz_id,
    achievementId: activity_events.achievement_id,
    lessonTitle: lessons.title,
    quizTopic: quizzes.topic_slug,
    achievementName: achievements.name,
  })
  .from(activity_events)
  .leftJoin(lessons, eq(activity_events.lesson_id, lessons.id))
  .leftJoin(quizzes, eq(activity_events.quiz_id, quizzes.id))
  .leftJoin(achievements, eq(activity_events.achievement_id, achievements.id))
  .where(eq(activity_events.user_id, sql.placeholder('userId')))
  .orderBy(desc(activity_events.occurred_at))
  .limit(sql.placeholder('limit'))
  .prepare('get_recent_activity_with_details');

/**
 * Insert activity event
 *
 * Records a new activity event (lesson start, quiz complete, achievement unlock, etc.).
 * One of the most frequently called inserts in the application.
 *
 * @param userId - The user's ID
 * @param eventType - Type of event (lesson_started, quiz_completed, etc.)
 * @param pointsDelta - Points earned from this activity
 * @param lessonId - (Optional) Related lesson ID
 * @param quizId - (Optional) Related quiz ID
 * @param quizAttemptId - (Optional) Related quiz attempt ID
 * @param achievementId - (Optional) Related achievement ID
 *
 * @example
 * await insertActivityEvent.execute({
 *   userId: 123,
 *   eventType: 'lesson_completed',
 *   pointsDelta: 100,
 *   lessonId: 5,
 *   quizId: null,
 *   quizAttemptId: null,
 *   achievementId: null,
 * });
 */
export const insertActivityEvent = db
  .insert(activity_events)
  .values({
    user_id: sql.placeholder('userId'),
    event_type: sql.placeholder('eventType'),
    points_delta: sql.placeholder('pointsDelta'),
    lesson_id: sql.placeholder('lessonId'),
    quiz_id: sql.placeholder('quizId'),
    quiz_attempt_id: sql.placeholder('quizAttemptId'),
    achievement_id: sql.placeholder('achievementId'),
  })
  .prepare('insert_activity_event');
