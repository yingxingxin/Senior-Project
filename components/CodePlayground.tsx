'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import loader from '@monaco-editor/loader';

/** Monaco 0.54 needs extra AMD paths. TS types only allow `vs`,
 *  so cast to `any` to silence the type error. */
(loader as any).config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs',
        'error-stack-parser':
            'https://cdn.jsdelivr.net/npm/error-stack-parser@2.1.4/dist/error-stack-parser.min',
        stackframe:
            'https://cdn.jsdelivr.net/npm/stackframe@1.3.4/dist/stackframe.min',
    },
} as any);

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

/* ============================== Globals & Loaders ============================== */

declare global {
    interface Window {
        loadPyodide?: any;
        pyodide?: any;
        __pyodidePromise?: Promise<any>;
        initSqlJs?: (cfg: { locateFile: (f: string) => string }) => Promise<any>;
    }
}

/** Remove any half-loaded pyodide globals before retrying */
function cleanPyodideGlobals() {
    try { delete (window as any).pyodide; } catch {}
    try { delete (window as any).loadPyodide; } catch {}
    try { delete (window as any).__pyodidePromise; } catch {}
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
async function loadPyodideRobust(log: (s: string) => void, attempt = 1): Promise<any> {
    const cdns = [
        'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js',
        'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js',
        'https://unpkg.com/pyodide@0.25.0/full/pyodide.js',
    ];
    cleanPyodideGlobals();
    let lastErr: any = null;
    for (const url of cdns) {
        try {
            log(`loading ${url}`);
            await loadScript(url);
            const py = await (window as any).loadPyodide?.();
            if (!py) throw new Error('loadPyodide returned null');
            return py;
        } catch (e: any) {
            lastErr = e;
            log('failed ' + (e?.message ?? String(e)));
            cleanPyodideGlobals();
        }
    }
    if (attempt < 3) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
        log(`retrying in ${delay}ms…`);
        await new Promise(r => setTimeout(r, delay));
        return loadPyodideRobust(log, attempt + 1);
    }
    throw lastErr ?? new Error('all Pyodide CDNs failed');
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
    const sqlDbRef = useRef<any>(null);
    const tsRef = useRef<any>(null);

    // helpers
    const selected = useMemo(
        () => LANGUAGE_OPTIONS.find(o => o.id === language)!,
        [language]
    );
    const handleChange: OnChange = v => setValue(v ?? '');
    const clearConsole = () => setConsoleLines([]);
    const appendLogs = (...lines: string[]) =>
        setConsoleLines(prev => [...prev, ...lines]);
    const loadSample = (lang: Lang) =>
        setValue(LANGUAGE_OPTIONS.find(o => o.id === lang)!.sample);

    const isDark = theme === 'vs-dark';
    const selectStyle: React.CSSProperties = {
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#e5e7eb' : '#111827',
        border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
        padding: '4px 8px',
        borderRadius: 6,
        colorScheme: 'light',
    };

    /* -------------------------- Python (Pyodide) -------------------------- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setPyStatus('loading…');
                const py = await loadPyodideRobust(s => setPyStatus(s));
                if (!cancelled) {
                    (window as any).pyodide = py;
                    setPyReady(true);
                    setPyStatus('ready');
                }
            } catch (e: any) {
                if (!cancelled) setPyStatus('failed: ' + (e?.message ?? String(e)));
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // IMPORTANT: in Pyodide ≥0.25 pass ONLY ONE of raw/batched/write
    useEffect(() => {
        const py = (window as any).pyodide;
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
                const SQL = await (window as any).initSqlJs({
                    locateFile: (f: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`,
                });
                if (mounted) {
                    sqlDbRef.current = new SQL.Database();
                    setSqlReady(true);
                }
            } catch (e: any) {
                appendLogs('[sql] ' + (e?.message ?? e));
            }
        }

        if (typeof (window as any).initSqlJs === 'function') initDb();
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
    }, []);

    /* ============================== Runners ============================== */

    // Capture console for JS/TS
    function makeCapturingConsole(push: (s: string) => void) {
        return {
            log: (...a: any[]) => push(a.map(x => String(x)).join(' ')),
            info: (...a: any[]) => push(a.map(x => String(x)).join(' ')),
            warn: (...a: any[]) => push('[warn] ' + a.map(x => String(x)).join(' ')),
            error: (...a: any[]) => push('[error] ' + a.map(x => String(x)).join(' ')),
        } as Console;
    }

    const runJS = () => {
        const lines: string[] = [];
        const c = makeCapturingConsole(s => lines.push(s));
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('console', value);
            fn(c);
        } catch (e: any) {
            lines.push('[throw] ' + (e?.message ?? String(e)));
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
            // eslint-disable-next-line no-new-func
            const fn = new Function('console', transpiled);
            fn(c);
        } catch (e: any) {
            lines.push('[throw] ' + (e?.message ?? String(e)));
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
                result.forEach((r: any) => {
                    appendLogs(r.columns.join(' | '), ...r.values.map((row: any[]) => row.join(' | ')));
                });
            }
        } catch (e: any) {
            appendLogs('[sql] ' + (e?.message ?? String(e)));
        }
    };

    // Backend: only stdout (and stderr if present). No raw/compile noise.
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
            const data = await resp.json();
            const out = data?.run?.stdout?.trim?.() ?? '';
            const err = data?.run?.stderr?.trim?.() ?? '';
            if (out) appendLogs(out);
            if (err) appendLogs('[stderr] ' + err);
            if (!out && !err) appendLogs('(no output)');
        } catch (e: any) {
            appendLogs(`[${lang}] ${e?.message ?? String(e)}`);
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
                <label>Language:{' '}
                    <select
                        style={selectStyle}
                        value={language}
                        onChange={e => { const l = e.target.value as Lang; setLanguage(l); loadSample(l); }}
                    >
                        {LANGUAGE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                    </select>
                </label>

                <label>Theme:{' '}
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
                            (window as any).pyodide = py;
                            setPyReady(true);
                            setPyStatus('ready');
                        } catch (e: any) {
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
                    {' '}(<span>{pyStatus}</span>) • SQL:{' '}
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