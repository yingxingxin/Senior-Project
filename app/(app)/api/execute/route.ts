export const runtime = 'nodejs';

type Language = 'c' | 'cpp' | 'java' | 'python';

type Body = {
    language: Language;
    code: string;
    stdin?: string;
};

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

const MAP: Record<Language, { lang: string; version: string; filename: string }> = {
    c:     { lang: 'c',     version: '10.2.0', filename: 'main.c' },
    cpp:   { lang: 'cpp',   version: '10.2.0', filename: 'main.cpp' },
    java:  { lang: 'java',  version: '15.0.2', filename: 'Main.java' },
    python:{ lang: 'python',version: '3.10.0', filename: 'main.py' },
};

export async function POST(req: Request): Promise<Response> {
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

        // Shape only needs to satisfy your usage below
        type ExecuteResponse = {
            compile?: unknown | null;
            run?: unknown | null;
        };

        const data = (await resp.json()) as ExecuteResponse;

        return new Response(
            JSON.stringify({
                compile: data.compile ?? null,
                run: data.run ?? null,
                success: !!data.run,
            }),
            { status: 200, headers: { 'content-type': 'application/json' } }
        );
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ error: message }), { status: 500 });
    }
}