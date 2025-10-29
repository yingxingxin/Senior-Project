'use client';

import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';

import type { Lang } from './exercises/types';
import { listForLang, getById } from './exercises';
import { EXERCISES } from './exercises';

// Types for optional TS transpiler on window
type TsModule = typeof import('typescript');
declare global { interface Window { ts?: TsModule } }

type Theme = 'vs-dark' | 'light';
type Mode = 'free' | 'exercise';

const LANG_LABEL: Record<Lang, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    sql: 'SQL',
    c: 'C',
    cpp: 'C++',
    java: 'Java',
};

// ========== starter snippets (used in Free mode or if an exercise has no starter) ==========
const DEFAULT_SNIPPET: Record<Lang, string> = {
    javascript: `console.log('hello from JS')`,
    typescript: `const msg: string = 'hello from TS';\nconsole.log(msg)`,
    python: `print("hello from Python")`,
    html: `<!doctype html><html><body><h1>Hello HTML</h1></body></html>`,
    sql: `-- demo
CREATE TABLE t(id INTEGER, name TEXT);
INSERT INTO t VALUES(1,'A'),(2,'B');
SELECT * FROM t;`,
    c: `#include <stdio.h>\nint main(){ printf("hello from C\\n"); return 0; }`,
    cpp: `#include <iostream>\nint main(){ std::cout << "hello from C++\\n"; return 0; }`,
    java: `public class Main { public static void main(String[] args){ System.out.println("hello from Java"); } }`,
};

const EXECUTE_URL = '/api/execute';

export default function CodePlayground(): JSX.Element {
    // UI state
    const [mode, setMode] = useState<Mode>('exercise');
    const [lang, setLang] = useState<Lang>('javascript');
    const [theme, setTheme] = useState<Theme>('vs-dark');
    const [exerciseId, setExerciseId] = useState<string>(EXERCISES[0].id);

    // Code + results
    const [code, setCode] = useState<string>(DEFAULT_SNIPPET['javascript']);
    const [stdout, setStdout] = useState<string>('');
    const [stderr, setStderr] = useState<string>('');
    const [htmlPreview, setHtmlPreview] = useState<string>('');
    const [validMsg, setValidMsg] = useState<string>('');

    // appendOut helper removed (unused)

    // When exercise/lang changes in exercise mode, seed the editor with the exercise starter
    useEffect(() => {
        if (mode !== 'exercise') return;
        const ex = getById(exerciseId);
        if (!ex) return;
        const starter = ex.starter[lang] ?? DEFAULT_SNIPPET[lang];
        setCode(starter);
        setStdout('');
        setStderr('');
        setHtmlPreview('');
        setValidMsg('');
    }, [mode, exerciseId, lang]);

    // When language changes in free mode, load default snippet
    useEffect(() => {
        if (mode !== 'free') return;
        setCode(DEFAULT_SNIPPET[lang]);
        setStdout('');
        setStderr('');
        setHtmlPreview('');
        setValidMsg('');
    }, [mode, lang]);

    const handleChange: OnChange = value => setCode(value ?? '');

    // ===================== Runners =====================

    // JS & TS run client-side; for TS we attempt to transpile via typescript if present
    const runJsTs = useCallback(async (src: string, isTs: boolean) => {
        setStdout(''); setStderr(''); setHtmlPreview(''); setValidMsg('');

        let js = src;
        if (isTs) {
            try {
                // lazy load the TS transpiler only if needed
                const ts: TsModule = (window.ts ?? (await import('typescript')));
                js = ts.transpileModule(src, {
                    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
                }).outputText;
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                setStderr('TypeScript transpile error: ' + message);
                return { stdout: '', stderr: message };
            }
        }

        try {
            const lines: string[] = [];
            const fakeConsole = {
                log: (...a: unknown[]) => lines.push(String(a.map(String).join(' '))),
                error: (...a: unknown[]) => lines.push('[error] ' + String(a.map(String).join(' '))),
                warn: (...a: unknown[]) => lines.push('[warn] ' + String(a.map(String).join(' '))),
                info: (...a: unknown[]) => lines.push(String(a.map(String).join(' '))),
            };
            const fn = new Function('console', js);
            fn(fakeConsole);
            const out = lines.join('\n') || '(no output)';
            setStdout(out);
            return { stdout: out, stderr: '' };
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            setStderr(message);
            return { stdout: '', stderr: message };
        }
    }, []);

    const runHtml = useCallback(async (src: string) => {
        setStdout(''); setStderr(''); setValidMsg('');
        setHtmlPreview(src);
        return { stdout: '(rendered HTML in preview)', stderr: '' };
    }, []);

    // Calls your serverless /api/execute; this matches the route I gave you earlier
    const callExecute = useCallback(async (language: Lang, src: string) => {
        setValidMsg('');
        setHtmlPreview('');
        setStderr('');
        setStdout('');

        try {
            const resp = await fetch(EXECUTE_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    // 🔧 FIXED: the API expects "language", not "lang"
                    language,
                    code: src,
                    // optional runtime hints (Piston accepts these versions)
                    version:
                        language === 'python' ? '3.10.0'
                            : language === 'java'   ? '15.0.2'
                                : language === 'cpp'    ? '10.2.0'
                                    : language === 'c'      ? '10.2.0'
                                        : undefined,
                }),
            });

            const text = await resp.text();

            // Try to parse JSON; if it's not JSON, show raw
            let parsed: unknown;
            try { parsed = JSON.parse(text); } catch { parsed = null; }

            type Output = { stdout?: string; stderr?: string };
            type ExecResponse = {
                compile?: Output;
                run?: Output;
                error?: string;
                stdout?: string;
                stderr?: string;
            };
            const data: Partial<ExecResponse> = (parsed && typeof parsed === 'object') ? (parsed as Partial<ExecResponse>) : {};

            if (!resp.ok) {
                const msg = data.error ?? text ?? `HTTP ${resp.status}`;
                setStderr(String(msg));
                return { stdout: '', stderr: String(msg) };
            }

            const compileOut: Output = data.compile ?? {};
            const runOut: Output = data.run ?? data;

            const out = [compileOut.stdout, runOut.stdout].filter(Boolean).join('');
            const err = [compileOut.stderr, runOut.stderr].filter(Boolean).join('');

            setStdout((out ?? '').trim());
            setStderr((err ?? '').trim());
            return { stdout: (out ?? '').trim(), stderr: (err ?? '').trim() };
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            setStderr(message);
            return { stdout: '', stderr: message };
        }
    }, []);

    const run = useCallback(async () => {
        const src = code;

        let out = { stdout: '', stderr: '' };

        if (lang === 'javascript') out = await runJsTs(src, false);
        else if (lang === 'typescript') out = await runJsTs(src, true);
        else if (lang === 'html') out = await runHtml(src);
        else out = await callExecute(lang, src);

        // Exercise validation
        if (mode === 'exercise') {
            const ex = getById(exerciseId);
            if (!ex) return;

            if (ex.expected.mode === 'stdout') {
                const want = ex.expected.expectedLines ?? [];
                const gotLines = (out.stdout || '')
                    .split(/\r?\n/)
                    .map(s => s.trim())
                    .filter(Boolean);

                let ok = false;

                if (ex.expected.matchAny) {
                    //  Pass if ANY expected line appears anywhere in the output
                    ok = gotLines.some(gl => want.includes(gl));

                    // (Optional stricter variant—uncomment if you want exactly ONE line total)
                    // ok = gotLines.length === 1 && want.includes(gotLines[0]);
                } else if (ex.expected.ignoreOrder) {
                    const gotSet = new Set(gotLines);
                    ok = want.every(w => gotSet.has(w));
                } else {
                    ok = want.length === gotLines.length && want.every((w, i) => w === gotLines[i]);
                }

                setValidMsg(
                    ok
                        ? ' Output accepted'
                        : ` Output mismatch.\nExpected ${
                            ex.expected.matchAny ? 'any of' : 'exactly'
                        }:\n${want.join('\n')}\nGot:\n${gotLines.join('\n') || '(no output)'}`
                );
            } else if (ex.expected.mode === 'html') {
                const ok = (ex.expected.requiredText ?? []).every(t =>
                    (htmlPreview || '').includes(t)
                );
                setValidMsg(ok ? ' HTML contains required text' : ' HTML missing required text');
            }
        }
    }, [lang, code, mode, exerciseId, runJsTs, runHtml, callExecute, htmlPreview]);

    const exerciseList = useMemo(() => listForLang(lang), [lang]);

    // ===================== UI =====================
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ padding: 12, borderRight: '1px solid #333' }}>
                <h3 style={{ marginTop: 0 }}>Playground</h3>

                <label style={{ display: 'block', marginTop: 10, fontWeight: 600 }}>Mode</label>
                <select value={mode} onChange={e => setMode(e.target.value as Mode)} style={{ width: '100%' }}>
                    <option value="exercise">Exercises</option>
                    <option value="free">Free Code</option>
                </select>

                <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Language</label>
                <select value={lang} onChange={e => setLang(e.target.value as Lang)} style={{ width: '100%' }}>
                    {Object.keys(LANG_LABEL).map(k => (
                        <option key={k} value={k}>{LANG_LABEL[k as Lang]}</option>
                    ))}
                </select>

                <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value as Theme)} style={{ width: '100%' }}>
                    <option value="vs-dark">Dark</option>
                    <option value="light">Light</option>
                </select>

                {mode === 'exercise' && (
                    <>
                        <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Exercise</label>
                        <select
                            value={exerciseId}
                            onChange={e => setExerciseId(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            {exerciseList.map(ex => (
                                <option key={ex.id} value={ex.id}>{ex.title}</option>
                            ))}
                        </select>

                        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 10, whiteSpace: 'pre-wrap' }}>
                            {getById(exerciseId)?.prompt}
                        </div>
                    </>
                )}

                <button onClick={run} style={{ marginTop: 16, width: '100%' }}>Run</button>
                <button
                    onClick={() => { setStdout(''); setStderr(''); setHtmlPreview(''); setValidMsg(''); }}
                    style={{ marginTop: 8, width: '100%' }}
                >
                    Clear Output
                </button>
            </aside>

            {/* Editor + Output */}
            <main style={{ display: 'grid', gridTemplateRows: '1fr 220px', gap: 8 }}>
                <div>
                    <Editor
                        height="100%"
                        language={lang === 'cpp' ? 'cpp' : lang}
                        theme={theme}
                        value={code}
                        onChange={handleChange}
                        options={{ fontSize: 14, minimap: { enabled: false } }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <section style={{ padding: 8, borderTop: '1px solid #333' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Console</div>
                        {stdout && <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{stdout}</pre>}
                        {stderr && <pre style={{ margin: 0, color: '#f66', whiteSpace: 'pre-wrap' }}>{stderr}</pre>}
                        {validMsg && <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{validMsg}</div>}
                    </section>

                    <section style={{ padding: 8, borderTop: '1px solid #333' }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>HTML Preview</div>
                        <iframe
                            title="preview"
                            style={{ width: '100%', height: '100%', border: '1px solid #444', background: '#fff' }}
                            srcDoc={htmlPreview}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}