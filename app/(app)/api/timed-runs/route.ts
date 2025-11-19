import { NextResponse } from 'next/server';
import { db, timedRuns } from 'src/db';
import { eq, and, asc } from 'drizzle-orm';
import { auth } from 'src/lib/auth';


type TimedRunPayload = {
    exerciseId: string;
    lang: string;
    elapsedMs: number;
};
type NewTimedRun = typeof timedRuns.$inferInsert;

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body = (await req.json()) as Partial<TimedRunPayload>;

        const exerciseId: string | undefined = body.exerciseId;
        const lang: string | undefined = body.lang;
        const elapsedMs: number | undefined = body.elapsedMs;

        if (!exerciseId || !lang || typeof elapsedMs !== 'number') {
            return NextResponse.json(
                { error: 'Missing exerciseId, lang, or elapsedMs' },
                { status: 400 },
            );
        }

        // 🔐 NEW: get logged-in user
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 },
            );
        }

        const userId = Number(session.user.id); // this should match users.id type

        const newRun: NewTimedRun = {
            exerciseId,
            lang,
            elapsedMs,
            userId,         // now a real value, not null
        };

        await db.insert(timedRuns).values(newRun);

        const best = await db
            .select({ bestMs: timedRuns.elapsedMs })
            .from(timedRuns)
            .where(
                and(
                    eq(timedRuns.exerciseId, exerciseId),
                    eq(timedRuns.lang, lang),
                    eq(timedRuns.userId, userId), // optional: per-user best
                ),
            )
            .orderBy(asc(timedRuns.elapsedMs))
            .limit(1);

        const bestMs: number = best[0]?.bestMs ?? elapsedMs;

        return NextResponse.json({ ok: true, bestMs });
    } catch (err) {
        console.error('Failed to save timed run', err);
        return NextResponse.json(
            { error: 'Failed to save timed run' },
            { status: 500 },
        );
    }
}