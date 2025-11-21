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
  inputSchema: z.object({}),
  execute: async () => {
    const context = await loadUserPersonalizationContext(userId);

    // Format as clear, readable text for the AI
    const lines = [
      '# User Personalization Context',
      '',
      '## Learning Preferences',
      `- Skill Level: ${context.skillLevel}`,
      `- Teaching Style: ${context.assistantPersona}`,
      `- Preferred Language: ${context.languagePreference || 'Not specified'}`,
      `- Preferred Paradigm: ${context.paradigmPreference || 'Not specified'}`,
      '',
      '## Learning History',
      `- Lessons Completed: ${context.completedLessonsCount}`,
      `- Current Streak: ${context.currentStreak} days`,
      `- Total Points: ${context.totalPoints}`,
      '',
      '## Recent Topics',
      ...context.recentTopics.map(topic => `- ${topic}`),
      '',
      '**Recommendation:** Tailor the lesson to match the user\'s skill level and teaching style preferences.',
    ];

    return lines.join('\n');
  },
});
