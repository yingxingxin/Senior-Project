import { db, assistants } from './index';

import { ASSISTANT_FIXTURES } from '../lib/onboarding/fixtures';

type AssistantSeed = typeof assistants.$inferInsert;

export async function seed() {
  for (const option of ASSISTANT_FIXTURES) {
    await db
      .insert(assistants)
      .values(option as AssistantSeed)
      .onConflictDoUpdate({
        target: assistants.slug,
        set: {
          name: option.name,
          gender: option.gender,
          avatarPng: option.avatarPng,
          tagline: option.tagline,
          description: option.description,
          updatedAt: new Date(),
        },
      });
  }
}

(async () => {
  await seed();
})();