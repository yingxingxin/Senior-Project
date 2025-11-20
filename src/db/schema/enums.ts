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

/**
 * Skill level for initial placement from onboarding quiz
 * Used in users table and quizzes table
 */
export const skillLevelEnum = pgEnum('skill_level', ['beginner', 'intermediate', 'advanced']);

// Enum helper exports for form and validation layers
export const difficultyValues = difficultyEnum.enumValues;
export type Difficulty = (typeof difficultyValues)[number];

export const skillLevelValues = skillLevelEnum.enumValues;
export type SkillLevel = (typeof skillLevelValues)[number];
