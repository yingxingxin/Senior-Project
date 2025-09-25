import { asc, eq } from 'drizzle-orm';

import { assistants, db, users } from '@/src/db';

export interface AssistantOption {
  id: number;
  name: string;
  slug: string;
  gender: string | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
}

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

export async function getAssistantNameForUser(userId: number): Promise<string | null> {
  const [row] = await db
    .select({
      name: assistants.name,
    })
    .from(users)
    .innerJoin(assistants, eq(users.assistant_id, assistants.id))
    .where(eq(users.id, userId))
    .limit(1);

  return row?.name ?? null;
}
