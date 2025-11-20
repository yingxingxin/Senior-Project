/**
 * Prepared Queries - Users
 *
 * High-performance prepared statements for user-related database operations.
 * These queries are pre-compiled and cached for optimal performance.
 */

import { db } from '@/src/db';
import { users, assistants } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Get user with onboarding status
 *
 * Returns basic user information including onboarding completion status.
 * Used on landing page and auth flows.
 *
 * @param userId - The user's ID
 * @returns User object with id, name, email, onboardingCompletedAt
 *
 * @example
 * const user = await getUserWithOnboarding.execute({ userId: 123 });
 */
export const getUserWithOnboarding = db
  .select({
    userId: users.id,
    username: users.name,
    email: users.email,
    onboardingCompletedAt: users.onboarding_completed_at,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .limit(1)
  .prepare('get_user_with_onboarding');

/**
 * Get user with assistant information
 *
 * Returns user data joined with their selected assistant details.
 * Used on dashboard and main app pages.
 *
 * @param userId - The user's ID
 * @returns User object with assistant details
 *
 * @example
 * const userData = await getUserWithAssistant.execute({ userId: 123 });
 */
export const getUserWithAssistant = db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    skill_level: users.skill_level,
    assistant_persona: users.assistant_persona,
    assistant_id: users.assistant_id,
    // Assistant fields
    assistantName: assistants.name,
    assistantSlug: assistants.slug,
    assistantGender: assistants.gender,
    assistantAvatar: assistants.avatar_url,
    assistantTagline: assistants.tagline,
    assistantDescription: assistants.description,
  })
  .from(users)
  .leftJoin(assistants, eq(users.assistant_id, assistants.id))
  .where(eq(users.id, sql.placeholder('userId')))
  .limit(1)
  .prepare('get_user_with_assistant');

/**
 * Get user navbar data
 *
 * Returns minimal user info for navbar display (name, email, image).
 * Called on every page that displays the navbar.
 *
 * @param userId - The user's ID
 * @returns User object with name, email, image
 *
 * @example
 * const navData = await getUserNavbarData.execute({ userId: 123 });
 */
export const getUserNavbarData = db
  .select({
    name: users.name,
    email: users.email,
    image: users.image,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .limit(1)
  .prepare('get_user_navbar_data');

/**
 * Update user skill level
 *
 * Updates the user's skill level after onboarding quiz completion.
 *
 * @param userId - The user's ID
 * @param skillLevel - The skill level ('beginner' | 'intermediate' | 'advanced')
 *
 * @example
 * await updateUserSkillLevel.execute({ userId: 123, skillLevel: 'intermediate' });
 */
export const updateUserSkillLevel = db
  .update(users)
  .set({ skill_level: sql`${sql.placeholder('skillLevel')}` })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_skill_level');

/**
 * Update user profile
 *
 * Updates user profile fields (name, image, etc.).
 * Used in settings and admin panels.
 *
 * @param userId - The user's ID
 * @param name - Updated name
 * @param image - Updated image URL
 *
 * @example
 * await updateUserProfile.execute({ userId: 123, name: 'John', image: 'https://...' });
 */
export const updateUserProfile = db
  .update(users)
  .set({
    name: sql`${sql.placeholder('name')}`,
    image: sql`${sql.placeholder('image')}`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_profile');

/**
 * Update user role
 *
 * Updates user role (used by admin).
 *
 * @param userId - The user's ID
 * @param role - The role ('user' | 'admin')
 *
 * @example
 * await updateUserRole.execute({ userId: 123, role: 'admin' });
 */
export const updateUserRole = db
  .update(users)
  .set({ role: sql`${sql.placeholder('role')}` })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_role');

/**
 * Get user by ID (admin view)
 *
 * Returns complete user record for admin user detail pages.
 *
 * @param userId - The user's ID
 * @returns Complete user object
 *
 * @example
 * const user = await getAdminUserById.execute({ userId: 123 });
 */
export const getAdminUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .limit(1)
  .prepare('get_admin_user_by_id');

/**
 * Get user for onboarding flow
 *
 * Returns user data needed for onboarding validation and guards.
 * Used in onboarding actions to load current user state.
 *
 * @param userId - The user's ID
 * @returns User object with onboarding fields
 *
 * @example
 * const [user] = await getUserForOnboarding.execute({ userId: 123 });
 */
export const getUserForOnboarding = db
  .select({
    id: users.id,
    name: users.name,
    assistant_id: users.assistant_id,
    assistant_persona: users.assistant_persona,
    skill_level: users.skill_level,
    onboarding_completed_at: users.onboarding_completed_at,
    onboarding_step: users.onboarding_step,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder('userId')))
  .limit(1)
  .prepare('get_user_for_onboarding');

/**
 * Update user assistant selection
 *
 * Updates user's selected assistant and moves to skill quiz step.
 * Used during onboarding gender selection.
 *
 * @param userId - The user's ID
 * @param assistantId - The selected assistant ID
 *
 * @example
 * await updateUserAssistantSelection.execute({ userId: 123, assistantId: 2 });
 */
export const updateUserAssistantSelection = db
  .update(users)
  .set({
    assistant_id: sql`${sql.placeholder('assistantId')}`,
    onboarding_step: sql`'skill_quiz'`,
    onboarding_completed_at: sql`NULL`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_assistant_selection');

/**
 * Update user persona
 *
 * Updates user's assistant persona and moves to guided intro step.
 * Used during onboarding persona selection.
 *
 * @param userId - The user's ID
 * @param persona - The selected persona ('kind' | 'direct' | 'calm')
 *
 * @example
 * await updateUserPersona.execute({ userId: 123, persona: 'kind' });
 */
export const updateUserPersona = db
  .update(users)
  .set({
    assistant_persona: sql`${sql.placeholder('persona')}`,
    onboarding_step: sql`'guided_intro'`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_persona');

/**
 * Complete onboarding
 *
 * Marks onboarding as complete and clears onboarding step.
 * Used when user finishes onboarding flow.
 *
 * @param userId - The user's ID
 *
 * @example
 * await completeOnboarding.execute({ userId: 123 });
 */
export const completeOnboarding = db
  .update(users)
  .set({
    onboarding_completed_at: sql`NOW()`,
    onboarding_step: sql`NULL`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('complete_onboarding');

/**
 * Update user assistant (post-onboarding)
 *
 * Updates user's selected assistant without modifying onboarding state.
 * Used in Wardrobe/Settings after onboarding is complete.
 *
 * USER STORIES SUPPORTED:
 *   - F02-US03: Switch personalities later
 *   - F04-US01: Change assistant's gender after setup
 *
 * @param userId - The user's ID
 * @param assistantId - The selected assistant ID
 *
 * @example
 * await updateUserAssistantOnly.execute({ userId: 123, assistantId: 2 });
 */
export const updateUserAssistantOnly = db
  .update(users)
  .set({
    assistant_id: sql`${sql.placeholder('assistantId')}`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_assistant_only');

/**
 * Update user persona (post-onboarding)
 *
 * Updates user's assistant persona without modifying onboarding state.
 * Used in Wardrobe/Settings after onboarding is complete.
 *
 * USER STORIES SUPPORTED:
 *   - F02-US03: Switch personalities later
 *   - F04-US01: Change assistant's personality after setup
 *
 * @param userId - The user's ID
 * @param persona - The selected persona ('kind' | 'direct' | 'calm')
 *
 * @example
 * await updateUserPersonaOnly.execute({ userId: 123, persona: 'kind' });
 */
export const updateUserPersonaOnly = db
  .update(users)
  .set({
    assistant_persona: sql`${sql.placeholder('persona')}`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('update_user_persona_only');

/**
 * Reset onboarding
 *
 * Resets all onboarding progress to start from gender selection.
 * Used when user wants to restart onboarding.
 *
 * @param userId - The user's ID
 *
 * @example
 * await resetOnboarding.execute({ userId: 123 });
 */
export const resetOnboarding = db
  .update(users)
  .set({
    assistant_id: sql`NULL`,
    assistant_persona: sql`NULL`,
    skill_level: sql`'beginner'`,
    onboarding_step: sql`'gender'`,
    onboarding_completed_at: sql`NULL`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('reset_onboarding');

/**
 * Reset user onboarding (admin)
 *
 * Admin action to reset a user's onboarding to welcome step.
 * Clears all onboarding-related fields.
 *
 * @param userId - The user's ID
 *
 * @example
 * await resetUserOnboardingAdmin.execute({ userId: 123 });
 */
export const resetUserOnboardingAdmin = db
  .update(users)
  .set({
    onboarding_completed_at: sql`NULL`,
    onboarding_step: sql`'welcome'`,
    skill_level: sql`NULL`,
    assistant_id: sql`NULL`,
    assistant_persona: sql`NULL`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('reset_user_onboarding_admin');

/**
 * Complete user onboarding (admin)
 *
 * Admin action to mark a user's onboarding as complete.
 * Sets completion timestamp and clears onboarding step.
 *
 * @param userId - The user's ID
 *
 * @example
 * await completeUserOnboardingAdmin.execute({ userId: 123 });
 */
export const completeUserOnboardingAdmin = db
  .update(users)
  .set({
    onboarding_completed_at: sql`NOW()`,
    onboarding_step: sql`NULL`,
  })
  .where(eq(users.id, sql.placeholder('userId')))
  .prepare('complete_user_onboarding_admin');
