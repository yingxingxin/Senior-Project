// app/api/execute/route.ts
export const runtime = 'nodejs'; // ensure server-side execution

type Body = {
    language: 'c' | 'cpp' | 'java';
    code: string;
    stdin?: string;
};

// Free Piston API (sandboxed compiler runner)
const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Map languages to Piston identifiers
const MAP: Record<Body['language'], { lang: string; version: string; filename: string }> = {
    c:    { lang: 'c',    version: '10.2.0', filename: 'main.c' },
    cpp:  { lang: 'cpp',  version: '10.2.0', filename: 'main.cpp' },
    java: { lang: 'java', version: '21.0.1', filename: 'Main.java' }, // must contain `public class Main`
};

export async function POST(req: Request) {
    try {
        const { language, code, stdin } = (await req.json()) as Body;

        const langConfig = MAP[language];
        if (!langConfig)
            return new Response(JSON.stringify({ error: 'Unsupported language' }), { status: 400 });

        const response = await fetch(PISTON_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: langConfig.lang,
                version: langConfig.version,
                files: [{ name: langConfig.filename, content: code }],
                stdin: stdin ?? '',
            }),
        });

        const data = await response.json();

        return Response.json({
            stdout: data.run?.stdout ?? '',
            stderr: data.run?.stderr ?? '',
            code: data.run?.code ?? 0,
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message ?? 'Execution failed' }), {
            status: 500,
        });
    }
}