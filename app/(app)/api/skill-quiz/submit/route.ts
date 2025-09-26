import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { db, skill_options, users } from '@/src/db';
import { auth } from '@/src/lib/auth';
import { skillLevelEnum } from '@/src/db/schema';

const SubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number(),
    optionId: z.number(),
  })).min(1),
});

function mapScoreToLevel(score: number, total: number) {
  if (score <= 1) return 'beginner' as const;
  if (score <= 3) return 'intermediate' as const;
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

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const answers = parsed.data.answers;
  const optionIds = answers.map(a => a.optionId);

  const options = await db.select().from(skill_options).where(inArray(skill_options.id, optionIds));

  const correctSet = new Set(options.filter(o => o.is_correct).map(o => o.id));
  const score = answers.reduce((acc, a) => acc + (correctSet.has(a.optionId) ? 1 : 0), 0);
  const level = mapScoreToLevel(score, answers.length);

  await db.update(users)
    .set({ skill_level: level, onboarding_step: 'persona' })
    .where(eq(users.id, Number(session.user.id)));

  return NextResponse.json({
    score,
    total: answers.length,
    level,
    suggestedCourse: suggestedCourseFor(level),
    next: '/onboarding/persona',
  });
}


