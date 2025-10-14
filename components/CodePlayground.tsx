'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import loader from '@monaco-editor/loader';

/* ============================== Monaco AMD paths ============================== */
/** Monaco 0.54 needs extra AMD paths. The loader type only exposes `vs`,
 *  so we widen the type (without using `any`) and configure the extra paths. */
type LoaderWithConfig = { config: (opts: { paths: Record<string, string> }) => void };
(loader as unknown as LoaderWithConfig).config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs',
        'error-stack-parser':
            'https://cdn.jsdelivr.net/npm/error-stack-parser@2.1.4/dist/error-stack-parser.min',
        stackframe:
            'https://cdn.jsdelivr.net/npm/stackframe@1.3.4/dist/stackframe.min',
    },
});

/* ============================== Types & Samples ============================== */

type Lang =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'html'
    | 'sql'
    | 'c'
    | 'cpp'
    | 'java';

type Theme = 'vs-dark' | 'light';

const LANGUAGE_OPTIONS: { id: Lang; label: string; sample: string }[] = [
    { id: 'javascript', label: 'JavaScript', sample: `// JS\nconsole.log('hello from JS');` },
    {
        id: 'typescript',
        label: 'TypeScript',
        sample: `// TS\nconst msg = (n: string) => \`hello from \${n}\`;\nconsole.log(msg('TypeScript'));`,
    },
    { id: 'python', label: 'Python', sample: `# Python\nprint("hello from Python")` },
    {
        id: 'html',
        label: 'HTML',
        sample: `<!doctype html><html><body><h1>Hello HTML</h1></body></html>`,
    },
    {
        id: 'sql',
        label: 'SQL',
        sample: `CREATE TABLE test(id INTEGER, name TEXT);
INSERT INTO test VALUES(1,'A'),(2,'B');
SELECT * FROM test;`,
    },
    { id: 'c', label: 'C', sample: `#include <stdio.h>\nint main(){ printf("hello from C\\n"); return 0; }` },
    { id: 'cpp', label: 'C++', sample: `#include <iostream>\nint main(){ std::cout<<"hello from C++\\n"; }` },
    {
        id: 'java',
        label: 'Java',
        sample: `public class Main {
  public static void main(String[] args) {
    System.out.println("hello from Java");
  }
}`,
    },
];

/* ============================== Minimal externals typing ============================== */

type Pyodide = {
    setStdout?: (cfg: { batched?: (s: string) => void; raw?: (s: string) => void; write?: (s: string) => void }) => void;
    setStderr?: (cfg: { batched?: (s: string) => void; raw?: (s: string) => void; write?: (s: string) => void }) => void;
    runPython?: (code: string) => unknown;
};
type SqlJsResult = { columns: string[]; values: unknown[][] };
type SqlJsDatabase = { exec: (sql: string) => SqlJsResult[] };
type SqlJsNamespace = { Database: new () => SqlJsDatabase };

declare global {
    interface Window {
        loadPyodide?: () => Promise<Pyodide>;
        pyodide?: Pyodide;
        __pyodidePromise?: Promise<Pyodide>;
        initSqlJs?: (cfg: { locateFile: (f: string) => string }) => Promise<SqlJsNamespace>;
    }
}

/** Remove any half-loaded pyodide globals before retrying */
function cleanPyodideGlobals() {
    const w = window as unknown as Record<string, unknown>;
    delete w.pyodide;
    delete w.loadPyodide;
    delete w.__pyodidePromise;
}

/** load a <script> with timeout */
function loadScript(src: string, timeoutMs = 15000) {
    return new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        const timer = setTimeout(() => { s.remove(); reject(new Error(`timeout ${src}`)); }, timeoutMs);
        s.src = src;
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.onload = () => { clearTimeout(timer); resolve(); };
        s.onerror = () => { clearTimeout(timer); reject(new Error(`failed ${src}`)); };
        document.body.appendChild(s);
    });
}

/** Pyodide multi-CDN loader with backoff */
async function loadPyodideRobust(log: (s: string) => void, attempt = 1): Promise<Pyodide> {
    const cdns = [
        'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js',
        'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
        'https://unpkg.com/pyodide@0.25.0/full/pyodide.js',
    ];
    cleanPyodideGlobals();
    let lastErr: unknown = null;
    for (const url of cdns) {
        try {
            log(`loading ${url}`);
            await loadScript(url);
            const py = await window.loadPyodide?.();
            if (!py) throw new Error('loadPyodide returned null');
            return py;
        } catch (e: unknown) {
            lastErr = e;
            const msg = e instanceof Error ? e.message : String(e);
            log('failed ' + msg);
            cleanPyodideGlobals();
        }
    }
    if (attempt < 3) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
        log(`retrying in ${delay}ms…`);
        await new Promise(r => setTimeout(r, delay));
        return loadPyodideRobust(log, attempt + 1);
    }
    throw (lastErr instanceof Error ? lastErr : new Error('all Pyodide CDNs failed'));
}

/* ============================== Component ============================== */

export default function CodePlayground() {
    // UI state
    const [language, setLanguage] = useState<Lang>('javascript');
    const [theme, setTheme] = useState<Theme>('vs-dark');
    const [value, setValue] = useState(LANGUAGE_OPTIONS[0].sample);
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    // engine flags
    const [pyReady, setPyReady] = useState(false);
    const [pyStatus, setPyStatus] = useState('not loaded');
    const [sqlReady, setSqlReady] = useState(false);

    // refs
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const sqlDbRef = useRef<SqlJsDatabase | null>(null);
    const tsRef = useRef<typeof import('typescript') | null>(null);

    // helpers
    const handleChange: OnChange = (v) => setValue(v ?? '');

    const clearConsole = useCallback(() => setConsoleLines([]), []);

    const appendLogs = useCallback((...lines: string[]) => {
        setConsoleLines(prev => [...prev, ...lines]);
    }, []);

    const loadSample = useCallback((lang: Lang) => {
        const found = LANGUAGE_OPTIONS.find(o => o.id === lang);
        if (found) setValue(found.sample);
    }, []);

    const isDark = theme === 'vs-dark';
    const selectStyle: React.CSSProperties = useMemo(() => ({
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#111827',
        border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
        padding: '4px 8px',
        borderRadius: 6,
        colorScheme: 'light',
    }), [isDark]);

    /* -------------------------- Python (Pyodide) -------------------------- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setPyStatus('loading…');
                const py = await loadPyodideRobust(s => setPyStatus(s));
                if (!cancelled) {
                    window.pyodide = py;
                    setPyReady(true);
                    setPyStatus('ready');
                }
            } catch (e: unknown) {
                if (!cancelled) {
                    const msg = e instanceof Error ? e.message : String(e);
                    setPyStatus('failed: ' + msg);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // IMPORTANT: in Pyodide ≥0.25 pass ONLY ONE of raw/batched/write
    useEffect(() => {
        const py = window.pyodide;
        if (!pyReady || !py) return;

        py.setStdout?.({
            batched: (s: string) => { if (s) appendLogs(s); },
        });

        py.setStderr?.({
            batched: (s: string) => { if (s) appendLogs('[python stderr] ' + s); },
        });
    }, [pyReady, appendLogs]);

    /* -------------------------- SQL (sql.js) -------------------------- */
    useEffect(() => {
        let mounted = true;
        async function initDb() {
            try {
                const SQL = await window.initSqlJs?.({
                    locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`,
                });
                if (mounted && SQL) {
                    sqlDbRef.current = new SQL.Database();
                    setSqlReady(true);
                }
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                appendLogs('[sql] ' + msg);
            }
        }

        if (typeof window.initSqlJs === 'function') initDb();
        else {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
            s.async = true;
            s.crossOrigin = 'anonymous';
            s.onload = () => initDb();
            s.onerror = () => appendLogs('[sql] load failed');
            document.body.appendChild(s);
        }
        return () => { mounted = false; };
    }, [appendLogs]);

    /* ============================== Runners ============================== */

    // Capture console for JS/TS
    function makeCapturingConsole(push: (s: string) => void): Console {
        return {
            log: (...a: unknown[]) => push(a.map(x => String(x)).join(' ')),
            info: (...a: unknown[]) => push(a.map(x => String(x)).join(' ')),
            warn: (...a: unknown[]) => push('[warn] ' + a.map(x => String(x)).join(' ')),
            error: (...a: unknown[]) => push('[error] ' + a.map(x => String(x)).join(' ')),
            // the rest of Console methods aren’t needed; fall back to no-ops
            assert: (() => undefined) as Console['assert'],
            clear: (() => undefined) as Console['clear'],
            count: (() => undefined) as Console['count'],
            countReset: (() => undefined) as Console['countReset'],
            debug: (() => undefined) as Console['debug'],
            dir: (() => undefined) as Console['dir'],
            dirxml: (() => undefined) as Console['dirxml'],
            group: (() => undefined) as Console['group'],
            groupCollapsed: (() => undefined) as Console['groupCollapsed'],
            groupEnd: (() => undefined) as Console['groupEnd'],
            table: (() => undefined) as Console['table'],
            time: (() => undefined) as Console['time'],
            timeEnd: (() => undefined) as Console['timeEnd'],
            timeLog: (() => undefined) as Console['timeLog'],
            timeStamp: (() => undefined) as Console['timeStamp'],
            trace: (() => undefined) as Console['trace'],
            profile: (() => undefined) as Console['profile'],
            profileEnd: (() => undefined) as Console['profileEnd'],
        } as Console;
    }

    const runJS = () => {
        const lines: string[] = [];
        const c = makeCapturingConsole(s => lines.push(s));
        try {
            const fn = new Function('console', value);
            fn(c);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            lines.push('[throw] ' + msg);
        }
        if (lines.length) appendLogs(...lines);
    };

    const ensureTS = useCallback(async () => {
        if (!tsRef.current) tsRef.current = await import('typescript');
        return tsRef.current;
    }, []);

    const runTS = async () => {
        const ts = await ensureTS();
        const transpiled = ts.transpileModule(value, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
        }).outputText;

        const lines: string[] = [];
        const c = makeCapturingConsole(s => lines.push(s));
        try {
            const fn = new Function('console', transpiled);
            fn(c);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            lines.push('[throw] ' + msg);
        }
        if (lines.length) appendLogs(...lines);
    };

    const runHTML = () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;
        doc.open();
        const html = value.includes('<html')
            ? value
            : `<!doctype html><html><head></head><body>${value}</body></html>`;
        doc.write(html);
        doc.close();
    };

    const runSQL = () => {
        if (!sqlReady || !sqlDbRef.current) { appendLogs('[sql] not ready'); return; }
        try {
            const result = sqlDbRef.current.exec(value);
            if (result && result.length) {
                result.forEach((r) => {
                    appendLogs(r.columns.join(' | '), ...r.values.map((row) => row.join(' | ')));
                });
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            appendLogs('[sql] ' + msg);
        }
    };

    // Backend: only stdout/stderr (no compile noise)
    type BackendRun = { run?: { stdout?: string; stderr?: string } | null };
    const runViaBackend = async (lang: 'c' | 'cpp' | 'java' | 'python') => {
        try {
            const resp = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ language: lang, code: value }),
            });
            if (!resp.ok) {
                const text = await resp.text().catch(() => '');
                appendLogs(`[${lang}] HTTP ${resp.status}${text ? `: ${text}` : ''}`);
                return;
            }
            const data = (await resp.json()) as BackendRun;
            const out = data?.run?.stdout?.trim?.() ?? '';
            const err = data?.run?.stderr?.trim?.() ?? '';
            if (out) appendLogs(out);
            if (err) appendLogs('[stderr] ' + err);
            if (!out && !err) appendLogs('(no output)');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            appendLogs(`[${lang}] ${msg}`);
        }
    };

    const run = async () => {
        setRunning(true);
        try {
            if (language === 'javascript') runJS();
            else if (language === 'typescript') await runTS();
            else if (language === 'python' || language === 'c' || language === 'cpp' || language === 'java')
                await runViaBackend(language);
            else if (language === 'html') runHTML();
            else if (language === 'sql') runSQL();
        } finally {
            setRunning(false);
        }
    };

    /* ============================== UI ============================== */

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: 8, borderBottom: '1px solid #2a2a2a' }}>
                <label>Language{' '}
                    <select
                        style={selectStyle}
                        value={language}
                        onChange={e => { const l = e.target.value as Lang; setLanguage(l); loadSample(l); }}
                    >
                        {LANGUAGE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                </label>

                <label>Theme{' '}
                    <select style={selectStyle} value={theme} onChange={e => setTheme(e.target.value as Theme)}>
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </label>

                <button onClick={run} disabled={running} style={{ padding: '6px 10px', borderRadius: 6 }}>
                    {running ? 'Running…' : '▶ Run'}
                </button>
                <button onClick={clearConsole} style={{ padding: '6px 10px', borderRadius: 6 }}>Clear</button>

                <button
                    onClick={async () => {
                        setPyReady(false);
                        setPyStatus('retrying…');
                        try {
                            const py = await loadPyodideRobust(s => setPyStatus(s));
                            window.pyodide = py;
                            setPyReady(true);
                            setPyStatus('ready');
                        } catch {
                            setPyStatus('failed');
                        }
                    }}
                    style={{ padding: '6px 10px', borderRadius: 6 }}
                    title="Retry loading Python"
                >
                    Retry Python
                </button>

                <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.85 }}>
                    Python: <b style={{ color: pyReady ? '#16a34a' : '#dc2626' }}>{pyReady ? 'ready' : 'not ready'}</b>
                    {' '}(<span>{pyStatus}</span>) • SQL{' '}
                    <b style={{ color: sqlReady ? '#16a34a' : '#dc2626' }}>{sqlReady ? 'ready' : 'not ready'}</b>
                </div>
            </div>

            {/* Editor */}
            <div style={{ flex: 1 }}>
                <Editor
                    height="100%"
                    value={value}
                    language={language}
                    theme={theme}
                    onChange={handleChange}
                    options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
                />
            </div>

            {/* Console + HTML preview */}
            <div style={{ height: 220, display: 'flex', borderTop: '1px solid #2a2a2a' }}>
                <div style={{
                    flex: 1,
                    background: isDark ? '#111' : '#fafafa',
                    color: isDark ? '#ddd' : '#111',
                    padding: 8,
                    overflow: 'auto',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                }}>
                    {consoleLines.length === 0
                        ? <div style={{ opacity: 0.6 }}>Console output will appear here…</div>
                        : consoleLines.map((line, i) => <div key={i}>{line}</div>)
                    }
                </div>
                <div style={{ width: 360, borderLeft: '1px solid #2a2a2a' }}>
                    <iframe ref={iframeRef} title="preview" style={{ width: '100%', height: '100%', border: 'none' }} />
                </div>
            </div>
        </div>
    );
}