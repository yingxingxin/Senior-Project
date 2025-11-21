/**
 * Personalization Tool for AI Agent
 *
 * Allows the AI to fetch user learning preferences and history
 * to personalize lesson content.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { loadUserPersonalizationContext } from '../personalization';

/**
 * Get user personalization data
 */
export const getUserPersonalizationTool = (userId: number) => tool({
  description: 'Get the user\'s learning preferences, skill level, and history to personalize the lesson content.',
  parameters: z.object({}),
  execute: async () => {
    const context = await loadUserPersonalizationContext(userId);

    return {
      success: true,
      preferences: {
        skillLevel: context.skillLevel,
        assistantPersona: context.assistantPersona,
        preferredLanguage: context.languagePreference || 'Not specified',
        preferredParadigm: context.paradigmPreference || 'Not specified',
      },
      learningStats: {
        lessonsCompleted: context.completedLessonsCount,
        currentStreak: context.currentStreak,
        totalPoints: context.totalPoints,
      },
      recentTopics: context.recentTopics,
      message: `User is ${context.skillLevel} level, prefers ${context.assistantPersona} teaching style`,
    };
  },
});
