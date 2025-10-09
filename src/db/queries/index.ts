/**
 * Prepared Queries Index
 *
 * Central export point for all prepared database queries.
 * Import from here to access any prepared statement.
 *
 * @example
 * import { getUserWithOnboarding, getRecentActivities } from '@/src/db/queries';
 *
 * const user = await getUserWithOnboarding.execute({ userId: 123 });
 * const activities = await getRecentActivities.execute({ userId: 123, limit: 5 });
 */

// User queries
export * from './users';

// Activity and statistics queries
export * from './activities';

// Achievement queries
export * from './achievements';

// Quiz queries
export * from './quizzes';

// Lesson queries
export * from './lessons';

// Admin queries
export * from './admin';
