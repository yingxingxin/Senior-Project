/**
 * Shared Enums
 *
 * This file contains enums that are used across multiple schema categories.
 */

import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Difficulty levels used across quizzes, lessons, and user preferences
 */
export const difficultyEnum = pgEnum('difficulty', ['easy', 'standard', 'hard']);

// Enum helper exports for form and validation layers
export const difficultyValues = difficultyEnum.enumValues;
export type Difficulty = (typeof difficultyValues)[number];
