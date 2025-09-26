import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';

import { db, skill_options, skill_questions } from '@/src/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Return 3-5 ordered questions with options
  const questions = await db.query.skill_questions.findMany({
    orderBy: asc(skill_questions.order_index),
    with: {
      options: {
        orderBy: asc(skill_options.order_index),
      },
    },
    limit: 5,
  });

  return NextResponse.json({ questions: questions.map(q => ({
    id: q.id,
    text: q.text,
    orderIndex: q.order_index,
    options: q.options.map(o => ({ id: o.id, text: o.text, orderIndex: o.order_index })),
  })) });
}


