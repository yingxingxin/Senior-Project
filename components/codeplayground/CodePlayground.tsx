'use client';

import {ChangeEvent, JSX, useCallback, useEffect, useMemo, useState} from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import type {Exercise, Expected, Lang} from './exercises/types';
import { listForLang, getById } from './exercises';
import { EXERCISES } from './exercises';

// Types for optional TS transpiler on window
type TsModule = typeof import('typescript');
declare global { interface Window { ts?: TsModule } }

type GeneratedExercise = {
    prompt: string;
    expected: Expected;
    params: Record<string, number | string>;
};

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
    // Theme integration with app
    const { resolvedTheme } = useTheme();
    const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light';

    // UI state
    const [mode, setMode] = useState<Mode>('free');
    const [lang, setLang] = useState<Lang>('javascript');
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

    // When exercise/lang changes in exercise mode, seed the editor with the exercise starter
    useEffect((): void => {
        if (mode !== 'exercise') return;

        const ex: Exercise | undefined = getById(exerciseId);
        if (!ex) return;

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
        try {
            // make sure we have the data we need
            if (!exerciseId || !lang) {
                console.warn("Missing exerciseId or lang, skipping save");
                return;
            }

            const res = await fetch("/api/timed-runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exerciseId,
                    lang,
                    elapsedMs: elapsed,
                }),
            });

            if (!res.ok) {
                console.error("Timed run save failed:", await res.text());
                return;
            }

            const data: { ok: boolean; bestMs: number } = await res.json();
            console.log("Saved timed run:", data);

            if (data.ok) {
                // update the UI with the best time we got back from the API
                setBestTimeMs(data.bestMs);
            }
        } catch (err) {
            console.error("Error calling /api/timed-runs:", err);
        }
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

                let ok: boolean;

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
                    const elapsed: number = Date.now() - runStartMs;

                    setElapsedMs(elapsed);
                    setTimedRunActive(false);
                    setRunStartMs(null);

                    // Save to database (important: await so it's guaranteed to send)
                    await saveTimedRun(elapsed);

                    // Update UI best time (from DB or fallback to local calc)
                    setBestTimeMs(prev => (prev == null ? elapsed : Math.min(prev, elapsed)));
                }
            } else if (ex_expected.mode === 'html') {
                const ok: boolean = (ex_expected.requiredText ?? []).every((t: string) =>
                    (htmlPreview || '').includes(t)
                );

                setValidMsg(ok ? 'HTML contains required text' : 'HTML missing required text');

                // Timed run completion for HTML mode
                if (mode === 'exercise' && timedRunActive && runStartMs != null && ok) {
                    const elapsed: number = Date.now() - runStartMs;

                    setElapsedMs(elapsed);
                    setTimedRunActive(false);
                    setRunStartMs(null);

                    // Save to database (important: await so it's guaranteed to send)
                    await saveTimedRun(elapsed);

                    // Update UI best time (from DB or fallback to local calc)
                    setBestTimeMs(prev => (prev == null ? elapsed : Math.min(prev, elapsed)));
                }
            }
        }
    }, [lang, code, mode, exerciseId, runJsTs, runHtml, callExecute, htmlPreview]);

    const exerciseList = useMemo(() => listForLang(lang), [lang]);

    // ===================== UI =====================
    return (
        <div className="grid grid-cols-[260px_1fr] h-screen">
            {/* Sidebar */}
            <aside className="p-3 bg-background text-foreground border-r border-border">
                <h3 className="mt-0 font-semibold text-lg">Playground</h3>

                <label className="block mt-2.5 font-semibold text-sm">Mode</label>
                <select
                    value={mode}
                    onChange={e => setMode(e.target.value as Mode)}
                    className="w-full px-2 py-1 rounded border border-border bg-card text-foreground outline-none"
                >
                    <option value="exercise">Exercises</option>
                    <option value="free">Free Code</option>
                </select>

                <label className="block mt-3 font-semibold text-sm">Language</label>
                <select
                    value={lang}
                    onChange={e => setLang(e.target.value as Lang)}
                    className="w-full px-2 py-1 rounded border border-border bg-card text-foreground outline-none"
                >
                    {Object.keys(LANG_LABEL).map(k => (
                        <option key={k} value={k}>{LANG_LABEL[k as Lang]}</option>
                    ))}
                </select>

                {mode === 'exercise' && (
                    <>
                        {/* Exercise selector */}
                        <label className="block mt-3 font-semibold text-sm">
                            Exercise
                        </label>
                        <select
                            value={exerciseId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                setExerciseId(e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border border-border bg-card text-foreground outline-none"
                        >
                            {exerciseList.map((ex: Exercise) => (
                                <option key={ex.id} value={ex.id}>
                                    {ex.title}
                                </option>
                            ))}
                        </select>

                        {/* Exercise prompt */}
                        <div className="text-xs opacity-90 mt-2.5 whitespace-pre-wrap">
                            {generatedEx?.prompt ?? getById(exerciseId)?.prompt}
                        </div>

                        {/* ===== Timed run UI ===== */}
                        <hr className="mt-4 mb-3 border-0 border-t border-border" />

                        <div className="font-semibold mb-1">Timed run</div>

                        <div className="text-xs mb-2">
                            {timedRunActive
                                ? 'Timer running… solve the exercise!'
                                : 'Click "Start timed run" to attempt this exercise for time.'}
                        </div>

                        <div className="text-sm mb-1">
                            Current:{' '}
                            <strong>{formatMs(currentElapsedMs)}</strong>
                        </div>

                        {bestTimeMs != null && (
                            <div className="text-sm mb-2">
                                Best:{' '}
                                <strong>{formatMs(bestTimeMs)}</strong>
                            </div>
                        )}

                        <button
                            onClick={handleStartTimedRun}
                            className={cn(
                                "w-full mt-2 px-2.5 py-1.5 rounded border border-border bg-card text-foreground cursor-pointer",
                                "hover:bg-muted transition-colors",
                                timedRunActive && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={timedRunActive}
                        >
                            {timedRunActive ? 'Timed run in progress…' : 'Start timed run'}
                        </button>
                    </>
                )}

                <button
                    onClick={run}
                    className="w-full mt-4 px-3 py-2 rounded border-0 cursor-pointer bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                    Run
                </button>

                <button
                    onClick={() => {
                        setStdout('');
                        setStderr('');
                        setHtmlPreview('');
                        setValidMsg('');
                    }}
                    className="w-full mt-2 px-2.5 py-1.5 rounded border border-border bg-card text-foreground cursor-pointer hover:bg-muted transition-colors"
                >
                    Clear Output
                </button>
            </aside>

            {/* Editor + Output */}
            <main className="grid grid-rows-[1fr_220px] gap-2">
                <div>
                    <Editor
                        height="100%"
                        language={lang === 'cpp' ? 'cpp' : lang}
                        theme={monacoTheme}
                        value={code}
                        onChange={handleChange}
                        options={{ fontSize: 14, minimap: { enabled: false } }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <section className="p-2 border-t border-border bg-background text-foreground">
                        <div className="font-bold mb-1.5 text-foreground">
                            Console
                        </div>

                        {stdout && (
                            <pre className="m-0 whitespace-pre-wrap font-mono text-sm bg-muted text-foreground p-2 rounded">
                                {stdout}
                            </pre>
                        )}

                        {stderr && (
                            <pre className="m-0 whitespace-pre-wrap font-mono text-sm bg-muted text-destructive p-2 rounded">
                                {stderr}
                            </pre>
                        )}

                        {validMsg && (
                            <div className="mt-2 whitespace-pre-wrap text-sm">{validMsg}</div>
                        )}
                    </section>

                    <section className="p-2 border-t border-border">
                        <div className="font-bold mb-1.5">HTML Preview</div>
                        <iframe
                            title="preview"
                            className="w-full h-full border border-border bg-background rounded"
                            srcDoc={htmlPreview}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}
