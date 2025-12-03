import { NextResponse } from 'next/server';
import { db } from 'src/db';
import { timedRuns } from 'src/db/schema/timedRuns';
import { users } from 'src/db/schema/auth';
import { and, eq, sql } from 'drizzle-orm';

export async function GET(req: Request): Promise<NextResponse> {
    const url = new URL(req.url);

    const exerciseId = url.searchParams.get('exerciseId'); // e.g. "ex1-init-add-print"
    const lang = url.searchParams.get('lang');             // e.g. "python", "javascript", or "all"
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : 20;

    // Build WHERE conditions based on filters
    const conditions = [];
    if (exerciseId) {
        conditions.push(eq(timedRuns.exerciseId, exerciseId));
    }
    if (lang && lang !== 'all') {
        conditions.push(eq(timedRuns.lang, lang));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    // Query: best time per user for this exercise/lang
    const rows = await db
        .select({
            userId: users.id,
            name: users.name,
            email: users.email,
            exerciseId: timedRuns.exerciseId,
            lang: timedRuns.lang,
            bestMs: sql<number>`MIN(${timedRuns.elapsedMs})`,
        })
        .from(timedRuns)
        .innerJoin(users, eq(timedRuns.userId, users.id))
        .where(whereClause)
        .groupBy(
            users.id,
            users.name,
            users.email,
            timedRuns.exerciseId,
            timedRuns.lang,
        )
        .orderBy(sql`MIN(${timedRuns.elapsedMs}) ASC`)
        .limit(limit);

    return NextResponse.json({ entries: rows });
}