/**
 * Database Schema Index
 *
 * Re-exports all schema definitions from organized category files.
 * This allows imports to continue working from '@/db/schema' without
 * needing to know the internal file organization.
 */

// Shared Enums
export * from './enums';

// Authentication & Identity
export * from './auth';

// Learning Content & Resources
export * from './lessons';

// Quizzes & Assessment
export * from './quizzes';
export * from './quiz-progress';

// Progress & Gamification
export * from './progress';

// User Preferences & Settings
export * from './preferences';

// Exercise timed runs
export * from "./timedRuns";
