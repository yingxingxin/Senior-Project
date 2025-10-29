import { NextResponse } from 'next/server';

type Language = 'c' | 'cpp' | 'java' | 'python';

interface Body {
    language: Language;
    code: string;
    version?: string;
}

// Piston API endpoint (public sandbox for multiple runtimes)
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// map each language to runtime + file info
const RUNTIME_MAP: Record<Language, { lang: string; version: string; filename: string }> = {
    c: { lang: 'c', version: '10.2.0', filename: 'main.c' },
    cpp: { lang: 'cpp', version: '10.2.0', filename: 'main.cpp' },
    java: { lang: 'java', version: '15.0.2', filename: 'Main.java' },
    python: { lang: 'python', version: '3.10.0', filename: 'main.py' },
};

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Body;
        const { language, code, version } = body;

        if (!language || !RUNTIME_MAP[language]) {
            return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
        }

        const runtime = RUNTIME_MAP[language];
        const payload = {
            language: runtime.lang,
            version: version || runtime.version,
            files: [
                {
                    name: runtime.filename,
                    content: code,
                },
            ],
            stdin: '',
        };

        const resp = await fetch(PISTON_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!resp.ok) {
            const text = await resp.text();
            return NextResponse.json({ error: text }, { status: resp.status });
        }

        const data = await resp.json();

        // Ensure consistent shape
        const compileOut = data.compile || {};
        const runOut = data.run || data;
        return NextResponse.json({
            compile: {
                stdout: compileOut.stdout ?? '',
                stderr: compileOut.stderr ?? '',
            },
            run: {
                stdout: runOut.stdout ?? '',
                stderr: runOut.stderr ?? '',
            },
            success: true,
        });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message ?? String(e), success: false },
            { status: 500 }
        );
    }
}