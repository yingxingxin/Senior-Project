'use client';

import dynamic from 'next/dynamic';

const CodeEditor = dynamic(() => import('../../components/CodeEditor'), {
    ssr: false,
    loading: () => <div style={{ padding: 24 }}>Loading editor…</div>,
});

export default function EditorClient() {
    return <CodeEditor language="javascript" initialCode="// hello world" />;
}