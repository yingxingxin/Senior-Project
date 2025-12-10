import { NextResponse } from 'next/server';
import { db, assistants } from '@/src/db';
import { asc } from 'drizzle-orm';

/**
 * GET /api/assistants
 * 
 * Returns list of all available assistants for the playground.
 */
export async function GET() {
  try {
    const allAssistants = await db
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

    return NextResponse.json(allAssistants);
  } catch (error) {
    console.error('[Assistants API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
}

