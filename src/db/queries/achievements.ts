/**
 * Prepared Queries - Achievements
 *
 * High-performance prepared statements for achievement and gamification tracking.
 */

import { db } from '@/src/db';
import { achievements, user_achievements } from '@/src/db/schema';
import { and, eq, sql } from 'drizzle-orm';

/**
 * Get user achievements with earned status
 *
 * Returns all achievements with indication of whether the user has earned them.
 * Uses LEFT JOIN to show both earned and unearned achievements.
 * Called on dashboard for badge display.
 *
 * @param userId - The user's ID
 * @returns Array of achievements with earned status
 *
 * @example
 * const badges = await getUserAchievements.execute({ userId: 123 });
 * badges.forEach(badge => {
 *   console.log(`${badge.name}: ${badge.earned ? 'Earned!' : 'Not earned'}`);
 * });
 */
export const getUserAchievements = db
  .select({
    id: achievements.id,
    code: achievements.code,
    name: achievements.name,
    description: achievements.description,
    icon_url: achievements.icon_url,
    points_reward: achievements.points_reward,
    is_active: achievements.is_active,
    rarity: achievements.rarity,
    earned: sql<boolean>`CASE WHEN ${user_achievements.user_id} IS NOT NULL THEN true ELSE false END`,
    unlocked_at: user_achievements.unlocked_at,
  })
  .from(achievements)
  .leftJoin(
    user_achievements,
    and(
      eq(user_achievements.achievement_id, achievements.id),
      eq(user_achievements.user_id, sql.placeholder('userId'))
    )
  )
  .where(eq(achievements.is_active, true))
  .prepare('get_user_achievements');

/**
 * Get earned achievements only
 *
 * Returns only achievements that the user has unlocked.
 * Useful for profile pages or achievement history.
 *
 * @param userId - The user's ID
 * @returns Array of earned achievements
 *
 * @example
 * const earnedBadges = await getEarnedAchievements.execute({ userId: 123 });
 */
export const getEarnedAchievements = db
  .select({
    id: achievements.id,
    code: achievements.code,
    name: achievements.name,
    description: achievements.description,
    icon_url: achievements.icon_url,
    points_reward: achievements.points_reward,
    rarity: achievements.rarity,
    unlocked_at: user_achievements.unlocked_at,
  })
  .from(user_achievements)
  .innerJoin(achievements, eq(user_achievements.achievement_id, achievements.id))
  .where(eq(user_achievements.user_id, sql.placeholder('userId')))
  .prepare('get_earned_achievements');
