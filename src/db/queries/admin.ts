/**
 * Prepared Queries - Admin
 *
 * High-performance prepared statements for admin dashboard and user management.
 */

import { db } from '@/src/db';
import { users, lessons, quizzes } from '@/src/db/schema';
import { count, gte, sql } from 'drizzle-orm';

/**
 * Get total user count
 *
 * Returns the total number of users in the system.
 * Used on admin dashboard.
 *
 * @returns Count of users
 *
 * @example
 * const [result] = await getAdminUserCount.execute({});
 * console.log('Total users:', result.c);
 */
export const getAdminUserCount = db
  .select({ c: count() })
  .from(users)
  .limit(1)
  .prepare('get_admin_user_count');

/**
 * Get total lesson count
 *
 * Returns the total number of lessons in the system.
 * Used on admin dashboard.
 *
 * @returns Count of lessons
 *
 * @example
 * const [result] = await getAdminLessonCount.execute({});
 */
export const getAdminLessonCount = db
  .select({ c: count() })
  .from(lessons)
  .limit(1)
  .prepare('get_admin_lesson_count');

/**
 * Get total quiz count
 *
 * Returns the total number of quizzes in the system.
 * Used on admin dashboard.
 *
 * @returns Count of quizzes
 *
 * @example
 * const [result] = await getAdminQuizCount.execute({});
 */
export const getAdminQuizCount = db
  .select({ c: count() })
  .from(quizzes)
  .limit(1)
  .prepare('get_admin_quiz_count');

/**
 * Get new user count since date
 *
 * Returns count of users who joined after a specific date.
 * Used for admin dashboard "New this week/month" stats.
 *
 * @param startDate - The start date to count from
 * @returns Count of new users
 *
 * @example
 * const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
 * const [result] = await getNewUserCount.execute({ startDate: weekAgo });
 * console.log('New users this week:', result.c);
 */
export const getNewUserCount = db
  .select({ c: count() })
  .from(users)
  .where(gte(users.created_at, sql.placeholder('startDate')))
  .limit(1)
  .prepare('get_new_user_count');
