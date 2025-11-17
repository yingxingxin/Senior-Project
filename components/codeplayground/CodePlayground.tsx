'use client';

import {ChangeEvent, JSX, useCallback, useEffect, useMemo, useState} from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';


import type {Exercise, Expected, Lang} from './exercises/types';
import { listForLang, getById } from './exercises';
import { EXERCISES } from './exercises';

// Types for optional TS transpiler on window
type TsModule = typeof import('typescript');
declare global { interface Window { ts?: TsModule } }

type GeneratedExercise = {
    prompt: string;
    expected: Expected; // <–– this is your existing Expected type
    params: Record<string, number | string>;
};

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
    c: `#include <stdio.h>\n\nint main(){ \n    printf("hello from C\\n"); \n    return 0; \n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main(){ \n    std::cout << "hello from C++\\n";\n    return 0; \n}`,
    java: `public class Main {\n    public static void main(String[] args){ \n        System.out.println("hello from Java");\n    }\n}`,
};

const EXECUTE_URL = '/api/execute';

export default function CodePlayground(): JSX.Element {
    // UI state
    const [mode, setMode] = useState<Mode>('free');
    const [lang, setLang] = useState<Lang>('javascript');
    const [theme, setTheme] = useState<Theme>('vs-dark');
    const [exerciseId, setExerciseId] = useState<string>(EXERCISES[0].id);

    // Code + results
    const [code, setCode] = useState<string>(DEFAULT_SNIPPET['javascript']);
    const [stdout, setStdout] = useState<string>('');
    const [stderr, setStderr] = useState<string>('');
    const [htmlPreview, setHtmlPreview] = useState<string>('');
    const [validMsg, setValidMsg] = useState<string>('');
    const [generatedEx, setGeneratedEx] = useState<GeneratedExercise | null>(null);

    // Timer state (for exercises)
    const [timedRunActive, setTimedRunActive] = useState<boolean>(false);
    const [runStartMs, setRunStartMs] = useState<number | null>(null);
    const [elapsedMs, setElapsedMs] = useState<number | null>(null);
    const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);

    const [nowMs, setNowMs] = useState(Date.now());


    // appendOut helper removed (unused)
    const isDark = theme === 'vs-dark';

    const sidebarStyles: React.CSSProperties = {
        backgroundColor: isDark ? '#111' : '#f5f5f5',
        color: isDark ? '#eee' : '#111',
        borderRight: isDark ? '1px solid #333' : '1px solid #ddd',
    };

    const runButtonStyles: React.CSSProperties = {
        width: '100%',
        marginTop: 16,
        padding: '8px 12px',
        borderRadius: 4,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isDark ? '#1e90ff' : '#1976d2',
        color: '#fff',
        fontWeight: 600,
    };

    const secondaryButtonStyles: React.CSSProperties = {
        width: '100%',
        marginTop: 8,
        padding: '6px 10px',
        borderRadius: 4,
        border: isDark ? '1px solid #555' : '1px solid #ccc',
        backgroundColor: isDark ? '#222' : '#fff',
        color: isDark ? '#eee' : '#222',
        cursor: 'pointer',
    };

    const consoleStyles: React.CSSProperties = {
        marginTop: 4,
        padding: 8,
        borderRadius: 4,
        backgroundColor: isDark ? '#111' : '#f5f5f5',
        color: isDark ? '#eee' : '#111',
        whiteSpace: 'pre-wrap',
    };

    const selectStyles: React.CSSProperties = {
        width: '100%',
        padding: '4px 6px',
        borderRadius: 4,
        border: isDark ? '1px solid #555' : '1px solid #ccc',
        backgroundColor: isDark ? '#222' : '#fff',
        color: isDark ? '#f5f5f5' : '#111',
        // optional: smooth out native look a bit
        outline: 'none',
    };

    const consoleContainerStyles: React.CSSProperties = {
        padding: 8,
        borderTop: isDark ? '1px solid #555' : '1px solid #ccc',
        backgroundColor: isDark ? '#111' : '#fff',
        color: isDark ? '#f5f5f5' : '#111',
    };

    const consolePreStyles: React.CSSProperties = {
        margin: 0,
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: 14,
        backgroundColor: isDark ? '#000' : '#fafafa',
        color: isDark ? '#eee' : '#111',
        padding: 8,
        borderRadius: 4,
    };

    // When exercise/lang changes in exercise mode, seed the editor with the exercise starter
    useEffect((): void => {
        if (mode !== 'exercise') return;

        const ex: Exercise | undefined = getById(exerciseId);
        if (!ex) return;

        // 🔹 NEW: generate dynamic prompt/expected if this exercise supports it
        if (ex.generate) {
            setGeneratedEx(ex.generate());
        } else {
            setGeneratedEx(null);
        }

        // existing logic to load starter code, reset outputs, etc.
        const starter: string = ex.starter[lang] ?? DEFAULT_SNIPPET[lang];
        setCode(starter);
        setStdout('');
        setStderr('');
        setHtmlPreview('');
        setValidMsg('');
    }, [mode, exerciseId, lang]);

    useEffect((): void => {
        if (mode !== 'free') return;

        const starter: string = DEFAULT_SNIPPET[lang];
        setCode(starter);
        setStdout('');
        setStderr('');
        setHtmlPreview('');
        setValidMsg('');
    }, [mode, lang]);

    useEffect(() => {
        if (!runStartMs) return;
        const id = setInterval(() => setNowMs(Date.now()), 100);
        return () => clearInterval(id);
    }, [runStartMs]);

    const currentElapsedMs = runStartMs ? nowMs - runStartMs : elapsedMs;

    function formatMs(ms: number | null): string {
        if (ms == null) return '--.-- s';
        return (ms / 1000).toFixed(2) + ' s';
    }

    const handleChange: OnChange = value => setCode(value ?? '');

    const handleStartTimedRun = () => {
        if (mode !== 'exercise') return;

        // reset outputs
        setStdout('');
        setStderr('');
        setHtmlPreview('');
        setValidMsg('');
        setElapsedMs(null);

        // force a fresh generated exercise instance (new random numbers)
        const ex = getById(exerciseId);
        if (!ex) return;

        if (ex.generate) {
            const g = ex.generate();
            setGeneratedEx(g);
        } else {
            setGeneratedEx(null);
        }

        const starter: string = ex.starter[lang] ?? DEFAULT_SNIPPET[lang];
        setCode(starter);

        setTimedRunActive(true);
        setRunStartMs(Date.now());
    };

    async function saveTimedRun(elapsed: number) {
        // TODO: implement API call + database save in part three
        console.log('Timed run completed in', elapsed, 'ms');
    }

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

            const ex_expected = generatedEx?.expected ?? ex.expected;

            if (ex_expected.mode === 'stdout') {
                // Expected lines from the exercise
                const want: string[] = (ex_expected.expectedLines ?? []).map(s => s.trim());

                // Actual lines from program output
                const gotLines: string[] = (out.stdout || '')
                    .split(/\r?\n/)
                    .map((s: string) => s.trim())
                    .filter(Boolean);

                let ok: boolean;  // <-- we will set this below

                if (ex_expected.matchAny) {
                    // Pass if ANY expected line appears anywhere in the output
                    ok = gotLines.some((g: string) => want.includes(g));
                } else if (ex_expected.ignoreOrder) {
                    // Pass if sets of lines match, order-insensitive
                    const wantSet = new Set(want);
                    const gotSet  = new Set(gotLines);
                    ok =
                        wantSet.size === gotSet.size &&
                        [...wantSet].every(w => gotSet.has(w));
                } else {
                    // Default: exact sequence match
                    ok =
                        want.length === gotLines.length &&
                        want.every((w: string, i: number) => w === gotLines[i]);
                }

                setValidMsg(
                    ok
                        ? 'Output accepted'
                        : `Output mismatch.\nExpected ${
                            ex_expected.matchAny ? 'any of' : 'exactly'
                        }:\n${want.join('\n')}\nGot:\n${gotLines.join('\n') || '(no output)'}`
                );

                // ===== Timed run completion (stdout mode) =====
                if (mode === 'exercise' && timedRunActive && runStartMs != null && ok) {
                    const elapsed = Date.now() - runStartMs;

                    setElapsedMs(elapsed);
                    setTimedRunActive(false);
                    setRunStartMs(null);

                    setBestTimeMs(prev =>
                        prev == null ? elapsed : Math.min(prev, elapsed)
                    );

                    // Comment this in when your /api/timed-run endpoint is ready:
                    // void saveTimedRun(elapsed);
                }
            } else if (ex_expected.mode === 'html') {
                const ok: boolean = (ex_expected.requiredText ?? []).every((t: string) =>
                    (htmlPreview || '').includes(t)
                );

                setValidMsg(ok ? 'HTML contains required text' : 'HTML missing required text');

                // Timed run completion for HTML mode
                if (mode === 'exercise' && timedRunActive && runStartMs != null && ok) {
                    const elapsed = Date.now() - runStartMs;

                    setElapsedMs(elapsed);
                    setTimedRunActive(false);
                    setRunStartMs(null);

                    setBestTimeMs(prev =>
                        prev == null ? elapsed : Math.min(prev, elapsed)
                    );

                    void saveTimedRun(elapsed);
                }
            }
        }
    }, [lang, code, mode, exerciseId, runJsTs, runHtml, callExecute, htmlPreview]);

    const exerciseList = useMemo(() => listForLang(lang), [lang]);

    // ===================== UI =====================
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ padding: 12, ...sidebarStyles }}>
                <h3 style={{ marginTop: 0 }}>Playground</h3>

                <label style={{ display: 'block', marginTop: 10, fontWeight: 600 }}>Mode</label>
                <select value={mode} onChange={e => setMode(e.target.value as Mode)} style={selectStyles}>
                    <option value="exercise">Exercises</option>
                    <option value="free">Free Code</option>
                </select>

                <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Language</label>
                <select value={lang} onChange={e => setLang(e.target.value as Lang)} style={selectStyles}>
                    {Object.keys(LANG_LABEL).map(k => (
                        <option key={k} value={k}>{LANG_LABEL[k as Lang]}</option>
                    ))}
                </select>

                <label style={{ display: 'block', marginTop: 12, fontWeight: 600 }}>Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value as Theme)} style={selectStyles}>
                    <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                </select>

                {mode === 'exercise' && (
                    <>
                        {/* Exercise selector */}
                        <label
                            style={{
                                display: 'block',
                                marginTop: 12,
                                fontWeight: 600,
                            }}
                        >
                            Exercise
                        </label>
                        <select
                            value={exerciseId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                setExerciseId(e.target.value)
                            }
                            style={selectStyles}
                        >
                            {exerciseList.map((ex: Exercise) => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.title}
                                </option>
                            ))}
                        </select>

                        {/* Exercise prompt */}
                        <div
                            style={{
                                fontSize: 12,
                                opacity: 0.9,
                                marginTop: 10,
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {generatedEx?.prompt ?? getById(exerciseId)?.prompt}
                        </div>

                        {/* ===== Timed run UI ===== */}
                        <hr
                            style={{
                                marginTop: 16,
                                marginBottom: 12,
                                border: 'none',
                                borderTop: isDark ? '1px solid #333' : '1px solid #ddd',
                            }}
                        />

                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Timed run</div>

                        <div style={{ fontSize: 12, marginBottom: 8 }}>
                            {timedRunActive
                                ? 'Timer running… solve the exercise!'
                                : 'Click “Start timed run” to attempt this exercise for time.'}
                        </div>

                        <div style={{ fontSize: 14, marginBottom: 4 }}>
                            Current:{' '}
                            <strong>{formatMs(currentElapsedMs)}</strong>
                        </div>

                        {bestTimeMs != null && (
                            <div style={{ fontSize: 14, marginBottom: 8 }}>
                                Best:{' '}
                                <strong>{formatMs(bestTimeMs)}</strong>
                            </div>
                        )}

                        <button
                            onClick={handleStartTimedRun}
                            style={secondaryButtonStyles}
                            disabled={timedRunActive}
                        >
                            {timedRunActive ? 'Timed run in progress…' : 'Start timed run'}
                        </button>
                    </>
                )}

                <button onClick={run} style={runButtonStyles}>
                    Run
                </button>

                <button
                    onClick={() => {
                        setStdout('');
                        setStderr('');
                        setHtmlPreview('');
                        setValidMsg('');
                    }}
                    style={secondaryButtonStyles}
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
                    <section style={consoleContainerStyles}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: isDark ? '#fff' : '#111' }}>
                            Console
                        </div>

                        {stdout && (
                            <pre style={consolePreStyles}>
            {stdout}
        </pre>
                        )}

                        {stderr && (
                            <pre
                                style={{
                                    ...consolePreStyles,
                                    color: isDark ? '#ff8080' : '#c00',
                                }}
                            >
            {stderr}
        </pre>
                        )}

                        {validMsg && (
                            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{validMsg}</div>
                        )}
                    </section>

                    <section
                        style={{
                            padding: 8,
                            borderTop: isDark ? '1px solid #333' : '1px solid #ddd',
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>HTML Preview</div>
                        <iframe
                            title="preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: isDark ? '1px solid #444' : '1px solid #ccc',
                                background: isDark ? '#111' : '#fff',
                            }}
                            srcDoc={htmlPreview}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}