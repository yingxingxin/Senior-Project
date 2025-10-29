'use client';

import dynamic from 'next/dynamic';

// load the playground only on the client (Monaco, Pyodide, etc.)
const CodePlayground = dynamic(() => import('../../components/codeplayground/CodePlayground'), {
    ssr: false,
    loading: () => <div style={{ padding: 24 }}>Loading editor…</div>,
});

export default function EditorClient() {
    return <CodePlayground />;
}