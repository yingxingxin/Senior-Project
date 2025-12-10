
import EditorClient from '@/app/editor/EditorClient';   // client wrapper for CodePlayground
import type { JSX } from 'react';

export default function EditorPage(): JSX.Element {
    return (
        <main className="min-h-dvh flex-1 bg-background">
            <EditorClient />
        </main>
    );
}