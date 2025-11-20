'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { updateUserAssistantOnly, updateUserPersonaOnly, getAssistantById } from '@/src/db/queries';
import type { AssistantPersona } from '@/src/db/schema';

/**
 * Update user's assistant (gender)
 *
 * Changes the user's assistant selection after onboarding.
 * Used in Wardrobe/Settings feature.
 *
 * USER STORIES SUPPORTED:
 *   - F04-US01: Change assistant's gender after setup
 *   - F02-US03: Switch personalities later (related)
 *
 * @param assistantId - The selected assistant ID
 * @returns Success status
 */
export async function updateAssistantGenderAction(assistantId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error('Not authenticated');
  }

  const userId = Number(session.user.id);

  // Verify assistant exists
  const [assistant] = await getAssistantById.execute({ assistantId });
  if (!assistant) {
    throw new Error('Assistant not found');
  }

  // Update assistant
  await updateUserAssistantOnly.execute({ userId, assistantId });

  // TODO: emit analytics event `assistant_gender_changed`

  revalidatePath('/settings/assistant');
  revalidatePath('/home');

  return { success: true };
}

/**
 * Update user's assistant personality
 *
 * Changes the user's personality selection after onboarding.
 * Used in Wardrobe/Settings feature.
 *
 * USER STORIES SUPPORTED:
 *   - F02-US03: Switch personalities later
 *   - F04-US01: Change assistant's personality after setup (related)
 *
 * @param persona - The selected persona ('calm' | 'kind' | 'direct')
 * @returns Success status
 */
export async function updateAssistantPersonalityAction(persona: AssistantPersona) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error('Not authenticated');
  }

  const userId = Number(session.user.id);

  // Update persona
  await updateUserPersonaOnly.execute({ userId, persona });

  // TODO: emit analytics event `assistant_personality_changed`

  revalidatePath('/settings/assistant');
  revalidatePath('/home');

  return { success: true };
}
