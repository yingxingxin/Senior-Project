'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { eq, inArray, asc } from 'drizzle-orm';

import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import {
  db,
  assistants,
  users,
  quizzes,
  quiz_questions,
  quiz_options,
  quiz_attempts,
  quiz_attempt_answers,
} from '@/src/db';
import {
  insertActivityEvent,
  getUserForOnboarding,
  updateUserAssistantSelection,
  updateUserPersona,
  completeOnboarding,
  resetOnboarding,
  getQuizAttemptCount,
} from '@/src/db/queries';
import { getAssistantById } from '@/src/db/queries/lessons';
import type { AssistantPersona, OnboardingStep, SkillLevel } from '@/src/db/schema';
import { getOnboardingStepHref } from '@/app/onboarding/_lib/steps';
import type { OnboardingUserGuard, AssistantOption } from '@/app/onboarding/_lib/guard';

export async function getAssistantOptions(): Promise<AssistantOption[]> {
  const rows = await db
    .select({
      id: assistants.id,
      name: assistants.name,
      slug: assistants.slug,
      gender: assistants.gender,
      avatarUrl: assistants.avatar_url,
      tagline: assistants.tagline,
      description: assistants.description,
    })
    .from(assistants)
    .orderBy(asc(assistants.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    gender: row.gender,
    avatarUrl: row.avatarUrl,
    tagline: row.tagline,
    description: row.description,
  }));
}

/**
 * Internal implementation of user loading.
 * Wrapped with cache() to deduplicate requests in the same render tree.
 */
const loadActiveUserImpl = cache(async (
  userId?: number,
  requireIncomplete = false
): Promise<OnboardingUserGuard> => {
  let sessionUserId: number;

  if (userId) {
    // Auth already done by caller (e.g., layout)
    sessionUserId = userId;
  } else {
    // Perform auth check (e.g., called from server action)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Not authenticated');
    }

    sessionUserId = Number(session.user.id);
  }

  const [r] = await getUserForOnboarding.execute({ userId: sessionUserId });

  if (!r) throw new Error('User not found');

  if (requireIncomplete && r.onboarding_completed_at) {
    throw new Error('Onboarding already completed');
  }

  return {
    id: r.id,
    name: r.name,
    assistantId: r.assistant_id,
    assistantPersona: r.assistant_persona as AssistantPersona | null,
    skillLevel: r.skill_level as SkillLevel,
    currentStep: r.onboarding_step as OnboardingStep | null,
    completedAt: r.onboarding_completed_at,
  };
});

/**
 * Loads user data for onboarding flow.
 * Automatically deduplicates requests within the same render tree.
 *
 * @param userId - Optional. If provided, skips auth check (used when layout already authenticated).
 *                 If not provided, performs auth check (used by server actions).
 * @param requireIncomplete - If true, throws error if onboarding is already completed
 * @returns User data needed for onboarding guards and context
 */
export async function loadActiveUser(
  userId?: number,
  requireIncomplete = false
): Promise<OnboardingUserGuard> {
  return loadActiveUserImpl(userId, requireIncomplete);
}
  
export async function selectAssistantGenderAction(assistantId: number) {
  const user = await loadActiveUser(undefined, true);

  const [assistant] = await getAssistantById.execute({ assistantId });

  if (!assistant) {
    throw new Error('Assistant option not found');
  }

  await updateUserAssistantSelection.execute({ userId: user.id, assistantId });

  // TODO: emit analytics event `assistant_gender_selected`.

  revalidatePath('/onboarding');

  return {
    nextStep: 'skill_quiz' as const,
    nextHref: getOnboardingStepHref('skill_quiz'),
  };
}

export async function selectAssistantPersonaAction(persona: AssistantPersona) {
  const user = await loadActiveUser(undefined, true);

  if (!user.assistantId) {
    throw new Error('Select an assistant before choosing a persona');
  }

  await updateUserPersona.execute({ userId: user.id, persona });

  // TODO: emit analytics event `assistant_persona_selected`.

  revalidatePath('/onboarding');

  return {
    nextStep: 'guided_intro' as const,
    nextHref: getOnboardingStepHref('guided_intro'),
  };
}

export async function completeOnboardingAction() {
  const user = await loadActiveUser(undefined, true);

  if (!user.assistantId || !user.assistantPersona) {
    throw new Error('Complete all onboarding steps before finishing');
  }

  await completeOnboarding.execute({ userId: user.id });

  // TODO: emit analytics event `onboarding_completed` with duration metadata.
  // should activity events be updated to support onboarding_completed?

  revalidatePath('/onboarding');
  revalidatePath('/home');

  return { completed: true, redirectTo: '/home' } as const;
}

export async function resetOnboardingAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error('Not authenticated');
  }

  const userId = Number(session.user.id);

  // Reset all onboarding progress
  await resetOnboarding.execute({ userId });

  // TODO: emit analytics event `onboarding_restarted`

  revalidatePath('/onboarding');

  return { success: true, redirectTo: getOnboardingStepHref('gender') } as const;
}

// Skill Quiz Server Actions

// Server function
export async function getSkillQuizQuestions() {
  // Find the skill assessment quiz
  const skillQuiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.topic, 'Skill Assessment'),
  });

  if (!skillQuiz) {
    throw new Error('Skill assessment quiz not found. Please run migrations and seed.');
  }

  // Get questions with options for the skill assessment quiz
  const questions = await db.query.quiz_questions.findMany({
    where: eq(quiz_questions.quiz_id, skillQuiz.id),
    orderBy: asc(quiz_questions.order_index),
    with: {
      options: {
        orderBy: asc(quiz_options.order_index),
      },
    },
    limit: 5,
  });

  return questions.map(q => ({
    id: q.id,
    text: q.text,
    orderIndex: q.order_index,
    options: q.options.map(o => ({
      id: o.id,
      text: o.text,
      orderIndex: o.order_index
    })),
  }));
}

// Server actions for skill quiz
type SkillQuizSubmission = {
  answers: Array<{
    questionId: number;
    optionId: number;
  }>;
};

function mapScoreToLevel(score: number, total: number) {
  const percentage = (score / total) * 100;
  if (percentage <= 40) return 'beginner' as const;
  if (percentage <= 70) return 'intermediate' as const;
  return 'advanced' as const;
}

function suggestedCourseFor(level: 'beginner' | 'intermediate' | 'advanced') {
  switch (level) {
    case 'beginner':
      return 'Python Intro';
    case 'intermediate':
      return 'Python Fundamentals + Projects';
    case 'advanced':
      return 'Data Structures & Algorithms in Python';
  }
}

export async function submitSkillQuizAnswers(submission: SkillQuizSubmission) {
  console.log('[Server Action] submitSkillQuizAnswers called with:', submission);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    console.error('[Server Action] Unauthorized - no session');
    throw new Error('Unauthorized');
  }

  const userId = Number(session.user.id);
  console.log('[Server Action] User ID:', userId);
  const answers = submission.answers;
  console.log('[Server Action] Processing answers:', answers);

  // Find the skill assessment quiz
  console.log('[Server Action] Finding skill assessment quiz...');
  const skillQuiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.topic, 'Skill Assessment'),
  });

  if (!skillQuiz) {
    console.error('[Server Action] Skill assessment quiz not found');
    throw new Error('Skill assessment quiz not found. Please run migrations and seed.');
  }

  console.log('[Server Action] Found quiz:', skillQuiz.id);

  // Check how many attempts the user has made
  const existingAttempts = await getQuizAttemptCount.execute({
    userId,
    quizId: skillQuiz.id
  });

  const attemptNumber = existingAttempts.length > 0
    ? Math.max(...existingAttempts.map(a => a.attempt_number)) + 1
    : 1;

  // Create a quiz attempt
  const [attempt] = await db.insert(quiz_attempts).values({
    user_id: userId,
    quiz_id: skillQuiz.id,
    attempt_number: attemptNumber,
    started_at: new Date(),
    submitted_at: new Date(),
    duration_sec: 0, // Could be tracked client-side if needed
  }).returning();

  // Get all the options to check correctness
  const optionIds = answers.map(a => a.optionId);
  const options = await db
    .select({
      id: quiz_options.id,
      is_correct: quiz_options.is_correct,
      question_id: quiz_options.question_id,
    })
    .from(quiz_options)
    .where(inArray(quiz_options.id, optionIds));

  // Create answer records
  const answerRecords = answers.map(answer => ({
    attempt_id: attempt.id,
    question_id: answer.questionId,
    selected_option_id: answer.optionId,
    time_taken_ms: 0, // Could be tracked client-side if needed
  }));

  await db.insert(quiz_attempt_answers).values(answerRecords);

  // Calculate score
  const correctSet = new Set(options.filter(o => o.is_correct).map(o => o.id));
  const score = answers.reduce((acc, a) => acc + (correctSet.has(a.optionId) ? 1 : 0), 0);
  const level = mapScoreToLevel(score, answers.length);

  console.log('[Server Action] Quiz results:', {
    score,
    total: answers.length,
    level,
    percentage: (score / answers.length) * 100,
  });

  // Update user's skill level and onboarding step
  console.log('[Server Action] Updating user skill level and onboarding step...');
  await db.update(users)
    .set({
      skill_level: level,
      onboarding_step: 'persona'
    })
    .where(eq(users.id, userId));

  // Log activity event for quiz submission
  const pointsEarned = score * 10; // 10 points per correct answer
  await insertActivityEvent.execute({
    userId,
    eventType: 'quiz_submitted',
    pointsDelta: pointsEarned,
    lessonId: null,
    quizId: skillQuiz.id,
    quizAttemptId: attempt.id,
    achievementId: null,
  });

  // If perfect score, log additional achievement
  if (score === answers.length) {
    await insertActivityEvent.execute({
      userId,
      eventType: 'quiz_perfect',
      pointsDelta: 20, // Bonus points for perfect score
      lessonId: null,
      quizId: skillQuiz.id,
      quizAttemptId: attempt.id,
      achievementId: null,
    });
  }

  revalidatePath('/onboarding/skill-quiz');
  revalidatePath('/onboarding/persona');

  const result = {
    score,
    total: answers.length,
    level,
    suggestedCourse: suggestedCourseFor(level),
    next: '/onboarding/persona',
  };

  console.log('[Server Action] Returning result:', result);
  return result;
}
