export const runtime = 'nodejs';

type Body = { language: 'c' | 'cpp' | 'java'; code: string; stdin?: string };

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const MAP: Record<Body['language'], { lang: string; version: string; filename: string }> = {
    c:    { lang: 'c',    version: '10.2.0', filename: 'main.c' },
    cpp:  { lang: 'cpp',  version: '10.2.0', filename: 'main.cpp' },
    java: { lang: 'java', version: '21.0.1', filename: 'Main.java' },
};

export async function POST(req: Request) {
    try {
        const { language, code, stdin } = (await req.json()) as Body;
        const cfg = MAP[language];
        if (!cfg) return new Response(JSON.stringify({ error: 'Unsupported language' }), { status: 400 });

        const resp = await fetch(PISTON_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                language: cfg.lang,
                version:  cfg.version,
                files:    [{ name: cfg.filename, content: code }],
                stdin:    stdin ?? '',
            }),
        });

        const data = await resp.json(); // { compile: {stdout,stderr,code}, run: {stdout,stderr,code}, ... }

        // bubble up both phases so we can display them
        return Response.json({
            compile: data.compile ?? null,
            run: data.run ?? null,
            success: !!data.run,
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message ?? 'exec_failed' }), { status: 500 });
    }
}