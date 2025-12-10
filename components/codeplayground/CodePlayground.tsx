'use client';

import {ChangeEvent, JSX, useCallback, useEffect, useMemo, useState} from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Icons
import { Code, Play, X, Settings, Timer, Trophy } from 'lucide-react';

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

    const [runButtonPressed, setRunButtonPressed] = useState(false);

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

    const handleRun = useCallback(async () => {
        // Animation for button press
        setRunButtonPressed(true);
        setTimeout(() => setRunButtonPressed(false), 150);

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
    }, [lang, code, mode, exerciseId, runJsTs, runHtml, callExecute, htmlPreview, timedRunActive, runStartMs, generatedEx]);

    const exerciseList = useMemo(() => listForLang(lang), [lang]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
            },
        },
    };

    // ===================== UI =====================
    return (
        <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
            {/* Two-column VN layout with decorative bar */}
            <div className="grid grid-cols-[280px_1fr_120px] h-full gap-4 p-4">
                {/* Left Column - Control Panel */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Card className="h-full rounded-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm font-semibold text-muted-foreground">
                                    Scene Settings
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
                            {/* Mode Selector */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <Label htmlFor="mode" className="text-xs font-medium flex items-center gap-1.5">
                                    <Settings className="h-3 w-3" />
                                    Mode
                                </Label>
                                <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
                                    <SelectTrigger id="mode" className="rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="exercise">Exercises</SelectItem>
                                        <SelectItem value="free">Free Code</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* Language Selector */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <Label htmlFor="language" className="text-xs font-medium flex items-center gap-1.5">
                                    <Code className="h-3 w-3" />
                                    Language
                                </Label>
                                <Select value={lang} onValueChange={(value) => setLang(value as Lang)}>
                                    <SelectTrigger id="language" className="rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(LANG_LABEL).map(k => (
                                            <SelectItem key={k} value={k}>
                                                {LANG_LABEL[k as Lang]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* Exercise Selector (only in exercise mode) */}
                            {mode === 'exercise' && (
                                <motion.div 
                                    variants={itemVariants} 
                                    className="space-y-2"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Label htmlFor="exercise" className="text-xs font-medium">
                                        Exercise
                                    </Label>
                                    <Select
                                        value={exerciseId}
                                        onValueChange={(value) => setExerciseId(value)}
                                    >
                                        <SelectTrigger id="exercise" className="rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {exerciseList.map((ex: Exercise) => (
                                                <SelectItem key={ex.id} value={ex.id}>
                                                    {ex.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Exercise prompt */}
                                    <div className="text-xs opacity-80 mt-2.5 whitespace-pre-wrap p-2 rounded-md bg-muted/50 border border-border/50 max-h-32 overflow-y-auto">
                                        {generatedEx?.prompt ?? getById(exerciseId)?.prompt}
                                    </div>

                                    <Separator className="my-3" />

                                    {/* Timed run UI */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                                            <Timer className="h-3 w-3" />
                                            Timed run
                                        </div>
                                        <div className="text-xs opacity-80">
                                            {timedRunActive
                                                ? 'Timer running… solve the exercise!'
                                                : 'Click "Start timed run" to attempt this exercise for time.'}
                                        </div>
                                        <div className="text-xs">
                                            Current: <strong>{formatMs(currentElapsedMs)}</strong>
                                        </div>
                                        {bestTimeMs != null && (
                                            <div className="text-xs flex items-center gap-1">
                                                <Trophy className="h-3 w-3 text-yellow-500" />
                                                Best: <strong>{formatMs(bestTimeMs)}</strong>
                                            </div>
                                        )}
                                        <Button
                                            onClick={handleStartTimedRun}
                                            disabled={timedRunActive}
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-full"
                                        >
                                            {timedRunActive ? 'Timed run in progress…' : 'Start timed run'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <Separator className="my-3" />

                            {/* Action Buttons */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <Button
                                    onClick={handleRun}
                                    className={cn(
                                        "w-full rounded-full font-semibold shadow-md transition-all",
                                        runButtonPressed && "scale-95"
                                    )}
                                    size="lg"
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Run
                                </Button>
                                <Button
                                    onClick={() => {
                                        setStdout('');
                                        setStderr('');
                                        setHtmlPreview('');
                                        setValidMsg('');
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full rounded-full"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Output
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Center Column - Scene Frame */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col h-full"
                >
                    <Card className="h-full rounded-2xl border-2 border-border/50 bg-card/95 backdrop-blur-sm shadow-lg flex flex-col overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-semibold">Playground – Script</CardTitle>
                                </div>
                                <Badge variant="secondary" className="rounded-full">
                                    {LANG_LABEL[lang]}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                            {/* Editor */}
                            <div className="flex-1 relative border-b border-border/30">
                                <div className="absolute inset-0 p-2">
                                    <Editor
                                        height="100%"
                                        language={lang === 'cpp' ? 'cpp' : lang}
                                        theme={monacoTheme}
                                        value={code}
                                        onChange={handleChange}
                                        options={{ fontSize: 14, minimap: { enabled: false } }}
                                    />
                                </div>
                            </div>

                            {/* Bottom Output Area - VN Dialogue Box */}
                            <div className="h-[220px] border-t-2 border-border/50 bg-muted/30 backdrop-blur-sm">
                                <Tabs defaultValue="console" className="h-full flex flex-col">
                                    <div className="px-4 pt-3 pb-2 border-b border-border/50 flex items-center justify-end">
                                        <TabsList className="h-8">
                                            <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
                                            <TabsTrigger value="preview" className="text-xs">HTML Preview</TabsTrigger>
                                        </TabsList>
                                    </div>
                                    <TabsContent value="console" className="flex-1 m-0 p-4 overflow-auto">
                                        <ScrollArea className="h-full">
                                            <div className="space-y-2" style={{ lineHeight: '1.6' }}>
                                                {stdout && (
                                                    <pre className="m-0 whitespace-pre-wrap font-mono text-sm bg-muted/50 text-foreground p-3 rounded-lg border border-border/50">
                                                        {stdout}
                                                    </pre>
                                                )}
                                                {stderr && (
                                                    <pre className="m-0 whitespace-pre-wrap font-mono text-sm bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
                                                        {stderr}
                                                    </pre>
                                                )}
                                                {validMsg && (
                                                    <div className="whitespace-pre-wrap text-sm p-3 rounded-lg bg-muted/50 border border-border/50">
                                                        {validMsg}
                                                    </div>
                                                )}
                                                {!stdout && !stderr && !validMsg && (
                                                    <div className="text-sm text-muted-foreground italic">
                                                        No output yet. Run your code to see results here.
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                    <TabsContent value="preview" className="flex-1 m-0 p-4">
                                        <div className="h-full rounded-lg border-2 border-border/50 bg-background overflow-hidden">
                                            <iframe
                                                title="preview"
                                                className="w-full h-full border-0"
                                                srcDoc={htmlPreview}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column - Decorative Animated Bar */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative h-full"
                >
                    <div className="h-full w-full relative overflow-hidden rounded-2xl">
                        {/* Animated gradient background */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                                background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1), transparent)',
                            }}
                            animate={{
                                opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        
                        {/* Floating orbs */}
                        <motion.div
                            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary/30 blur-sm"
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary/20 blur-sm"
                            animate={{
                                y: [0, 15, 0],
                                opacity: [0.2, 0.5, 0.2],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5,
                            }}
                        />
                        <motion.div
                            className="absolute top-3/4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/25 blur-md"
                            animate={{
                                y: [0, -15, 0],
                                opacity: [0.25, 0.55, 0.25],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1,
                            }}
                        />

                        {/* Decorative lines */}
                        <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"
                            animate={{
                                opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <motion.div
                            className="absolute top-0 left-1/4 w-px bg-gradient-to-b from-primary/30 to-transparent"
                            style={{ height: '33%' }}
                            animate={{
                                opacity: [0.2, 0.5, 0.2],
                                height: ['33%', '40%', '33%'],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <motion.div
                            className="absolute top-0 right-1/4 w-px bg-gradient-to-b from-primary/30 to-transparent"
                            style={{ height: '33%' }}
                            animate={{
                                opacity: [0.2, 0.5, 0.2],
                                height: ['33%', '40%', '33%'],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.3,
                            }}
                        />

                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
                            animate={{
                                y: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />

                        {/* Border glow */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/10" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
