'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';

// ---------------------------------------------
// Supported languages
// ---------------------------------------------
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

// Sample snippets for each language
const LANGUAGE_OPTIONS: { id: Lang; label: string; sample: string }[] = [
    {
        id: 'javascript',
        label: 'JavaScript',
        sample: `// JS
console.log('hello from JS');`,
    },
    {
        id: 'typescript',
        label: 'TypeScript',
        sample: `// TS
const greet = (name: string): string => \`Hello \${name}\`;
console.log(greet('TypeScript'));`,
    },
    {
        id: 'python',
        label: 'Python',
        sample: `# Python
print("hello from Python")`,
    },
    {
        id: 'html',
        label: 'HTML',
        sample: `<!doctype html>
<html>
  <body>
    <h1>Hello from HTML</h1>
    <p>Edit this HTML and click Run to refresh the preview.</p>
    <script>console.log('JS inside iframe');</script>
  </body>
</html>`,
    },
    {
        id: 'sql',
        label: 'SQL (SQLite)',
        sample: `-- SQL (SQLite in browser)
CREATE TABLE todos(id INTEGER PRIMARY KEY, title TEXT);
INSERT INTO todos(title) VALUES ('write code'), ('ship app');
SELECT * FROM todos;`,
    },
    {
        id: 'c',
        label: 'C',
        sample: `#include <stdio.h>
int main() {
  printf("hello from C\\n");
  return 0;
}`,
    },
    {
        id: 'cpp',
        label: 'C++',
        sample: `#include <bits/stdc++.h>
using namespace std;
int main(){
  cout << "hello from C++\\n";
  return 0;
}`,
    },
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

declare global {
    interface Window {
        loadPyodide?: any;
        pyodide?: any;
    }
}

export default function CodePlayground() {
    // UI state
    const [language, setLanguage] = useState<Lang>('javascript');
    const [theme, setTheme] = useState<Theme>('vs-dark');
    const [value, setValue] = useState<string>(
        LANGUAGE_OPTIONS.find(o => o.id === 'javascript')!.sample
    );
    const [consoleLines, setConsoleLines] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    // HTML preview iframe
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // -------------------------
    // TypeScript: lazy import compiler
    // -------------------------
    const tsRef = useRef<any>(null);
    const ensureTS = useCallback(async () => {
        if (!tsRef.current) {
            const ts = await import('typescript'); // pulled client-side only when needed
            tsRef.current = ts;
        }
        return tsRef.current;
    }, []);

    // -------------------------
    // Python: load Pyodide once
    // -------------------------
    const [pyReady, setPyReady] = useState(false);
    useEffect(() => {
        if (pyReady) return;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
            window.pyodide = await window.loadPyodide?.();
            setPyReady(true);
        };
        document.body.appendChild(script);
        return () => {
            script.remove();
        };
    }, [pyReady]);

// -------------------------
// SQL: init sql.js + in-memory DB (CDN loader; no bundling)
// -------------------------
    const sqlDbRef = useRef<any>(null);
    const [sqlReady, setSqlReady] = useState(false);

    useEffect(() => {
        let mounted = true;
        // already loaded?
        if ((window as any).initSqlJs && !sqlDbRef.current) {
            (async () => {
                const SQL = await (window as any).initSqlJs({
                    locateFile: (file: string) =>
                        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
                });
                if (mounted) {
                    sqlDbRef.current = new SQL.Database();
                    setSqlReady(true);
                }
            })();
            return () => { mounted = false; };
        }

        // inject script tag for browser build
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
        script.async = true;
        script.onload = async () => {
            const SQL = await (window as any).initSqlJs({
                locateFile: (file: string) =>
                    `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
            });
            if (mounted) {
                sqlDbRef.current = new SQL.Database();
                setSqlReady(true);
            }
        };
        document.body.appendChild(script);

        return () => {
            mounted = false;
            script.remove();
        };
    }, []);

    // handy derived/utility stuff
    const selected = useMemo(
        () => LANGUAGE_OPTIONS.find(o => o.id === language)!,
        [language]
    );

    const handleChange: OnChange = v => setValue(v ?? '');
    const clearConsole = useCallback(() => setConsoleLines([]), []);
    const appendLogs = useCallback((...lines: string[]) => {
        setConsoleLines(prev => [...prev, ...lines]);
    }, []);

    // ---------------------------------------------
    // Runners
    // ---------------------------------------------

    // JS (native eval in sandboxed Function)
    const runJS = useCallback(() => {
        const logs: string[] = [];
        const fakeConsole = {
            log: (...args: any[]) => logs.push(args.map(String).join(' ')),
            error: (...args: any[]) => logs.push('[error] ' + args.map(String).join(' ')),
            warn: (...args: any[]) => logs.push('[warn] ' + args.map(String).join(' ')),
            info: (...args: any[]) => logs.push('[info] ' + args.map(String).join(' ')),
        };
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('console', value);
            fn(fakeConsole);
        } catch (e: any) {
            logs.push('[throw] ' + (e?.message ?? String(e)));
        }
        appendLogs('— run (JS) —', ...logs);
    }, [appendLogs, value]);

    // TS → transpile to JS → run
    const runTS = useCallback(async () => {
        try {
            const ts = await ensureTS();
            const transpiled = ts
                .transpileModule(value, {
                    compilerOptions: {
                        target: ts.ScriptTarget.ES2020,
                        module: ts.ModuleKind.ESNext,
                    },
                })
                .outputText;

            const logs: string[] = [];
            const fakeConsole = {
                log: (...args: any[]) => logs.push(args.map(String).join(' ')),
                error: (...args: any[]) => logs.push('[error] ' + args.map(String).join(' ')),
            };
            // eslint-disable-next-line no-new-func
            const fn = new Function('console', transpiled);
            fn(fakeConsole);
            appendLogs('— run (TS→JS) —', ...logs);
        } catch (e: any) {
            appendLogs('— run (TS→JS) —', '[throw] ' + (e?.message ?? String(e)));
        }
    }, [appendLogs, ensureTS, value]);

    // Python via Pyodide
    const runPy = useCallback(async () => {
        if (!pyReady || !window.pyodide) {
            appendLogs('[python] runtime not ready yet…');
            return;
        }
        try {
            const out = await window.pyodide.runPythonAsync(value);
            if (out !== undefined) appendLogs(String(out));
            else appendLogs('— run (Python) —');
        } catch (e: any) {
            appendLogs('[python throw] ' + (e?.message ?? String(e)));
        }
    }, [appendLogs, pyReady, value]);

    // HTML → render into iframe
    const runHTML = useCallback(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(value);
        doc.close();
        appendLogs('— rendered HTML in preview —');
    }, [appendLogs, value]);

    // SQL (SQLite in memory)
    const runSQL = useCallback(() => {
        if (!sqlReady || !sqlDbRef.current) {
            appendLogs('[sql] engine not ready');
            return;
        }
        try {
            // Split statements on trailing semicolons across lines
            const statements = value
                .split(/;\s*$/m)
                .map(s => s.trim())
                .filter(Boolean);
            let printed = false;
            statements.forEach(stmt => {
                const res = sqlDbRef.current.exec(stmt);
                if (res && res.length) {
                    printed = true;
                    res.forEach(({ columns, values }: any) => {
                        const header = columns.join(' | ');
                        const rows = values.map((r: any[]) => r.join(' | '));
                        appendLogs('— SQL result —', header, ...rows);
                    });
                }
            });
            if (!printed) appendLogs('— SQL ok —');
        } catch (e: any) {
            appendLogs('[sql error] ' + (e?.message ?? String(e)));
        }
    }, [appendLogs, sqlReady, value]);

    // C / C++ / Java via backend API
    const runViaBackend = useCallback(
        async (lang: 'c' | 'cpp' | 'java') => {
            try {
                const resp = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ language: lang, code: value }),
                });
                const json = await resp.json();
                if (json.error) {
                    appendLogs(`[${lang}] error: ${json.error}`);
                    return;
                }
                const out =
                    (json.stdout || '') + (json.stderr ? '\n[stderr]\n' + json.stderr : '');
                appendLogs(`— run (${lang}) —`, out || '(no output)');
            } catch (e: any) {
                appendLogs(`[${lang}] network error: ${e?.message ?? String(e)}`);
            }
        },
        [appendLogs, value]
    );

    // Main Run button dispatcher
    const run = useCallback(async () => {
        setRunning(true);
        try {
            if (language === 'javascript') runJS();
            else if (language === 'typescript') await runTS();
            else if (language === 'python') await runPy();
            else if (language === 'html') runHTML();
            else if (language === 'sql') runSQL();
            else if (language === 'c' || language === 'cpp' || language === 'java')
                await runViaBackend(language);
        } finally {
            setRunning(false);
        }
    }, [language, runHTML, runJS, runPy, runSQL, runTS, runViaBackend]);

    // When switching languages, load a sample for convenience
    const loadSample = useCallback((lang: Lang) => {
        const opt = LANGUAGE_OPTIONS.find(o => o.id === lang)!;
        setValue(opt.sample);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
            {/* Toolbar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderBottom: '1px solid #2a2a2a',
                }}
            >
                <label>
                    Language:{' '}
                    <select
                        value={language}
                        onChange={e => {
                            const lang = e.target.value as Lang;
                            setLanguage(lang);
                            loadSample(lang);
                        }}
                    >
                        {LANGUAGE_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Theme:{' '}
                    <select value={theme} onChange={e => setTheme(e.target.value as Theme)}>
                        <option value="vs-dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </label>

                <button onClick={run} disabled={running} style={{ padding: '6px 10px' }}>
                    {running ? 'Running…' : '▶ Run'}
                </button>

                <button onClick={clearConsole} style={{ padding: '6px 10px' }}>
                    Clear Console
                </button>

                <div style={{ marginLeft: 'auto', opacity: 0.75, fontSize: 12 }}>
                    {LANGUAGE_OPTIONS.find(o => o.id === language)!.label} • {theme}
                </div>
            </div>

            {/* Editor */}
            <div style={{ flex: 1 }}>
                <Editor
                    height="100%"
                    value={value}
                    language={language}
                    defaultLanguage={language}
                    theme={theme}
                    onChange={handleChange}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>

            {/* Console / Preview area */}
            <div style={{ height: 220, display: 'flex', borderTop: '1px solid #2a2a2a' }}>
                {/* Left: console text */}
                <div
                    style={{
                        flex: 1,
                        background: theme === 'vs-dark' ? '#111' : '#fafafa',
                        color: theme === 'vs-dark' ? '#ddd' : '#111',
                        padding: 8,
                        overflow: 'auto',
                        fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 13,
                    }}
                >
                    {consoleLines.length === 0 ? (
                        <div style={{ opacity: 0.6 }}>Console output will appear here…</div>
                    ) : (
                        consoleLines.map((line, i) => <div key={i}>{line}</div>)
                    )}
                </div>

                {/* Right: HTML preview iframe (used only for HTML) */}
                <div style={{ width: 360, borderLeft: '1px solid #2a2a2a' }}>
                    <iframe
                        ref={iframeRef}
                        title="preview"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
}