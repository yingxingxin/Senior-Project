export const runtime = 'nodejs';

type Body = { language: 'c' | 'cpp' | 'java' | 'python'; code: string; stdin?: string };

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const MAP: Record<Body['language'], { lang: string; version: string; filename: string }> = {
    c:    { lang: 'c',    version: '10.2.0', filename: 'main.c' },
    cpp:  { lang: 'cpp',  version: '10.2.0', filename: 'main.cpp' },
    java: { lang: 'java', version: '15.0.2', filename: 'Main.java' },
    python: { lang: 'python', version: '3.10.0', filename: 'main.py' },
};

export async function POST(req: Request) {
    try {
        const { language, code, stdin } = (await req.json()) as Body;
        const cfg = MAP[language];
        if (!cfg) {
            return new Response(JSON.stringify({ error: 'Unsupported language' }), { status: 400 });
        }

        const payload = {
            language: cfg.lang,
            version: cfg.version,
            files: [{ name: cfg.filename, content: code }],
            stdin: stdin ?? '',
        };

        const resp = await fetch(PISTON_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!resp.ok) {
            const text = await resp.text();
            return new Response(JSON.stringify({ http: resp.status, body: text }), { status: 502 });
        }

        const data = await resp.json();
        return Response.json({
            compile: data.compile ?? null,
            run: data.run ?? null,
            success: !!data.run,
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message ?? 'exec_failed' }), { status: 500 });
    }
}