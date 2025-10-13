'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

type Props = {
    initialCode?: string;
    language?: string;
    onChange?: (value: string) => void;
};

export default function CodeEditor({
                                       initialCode = '// write code here',
                                       language = 'javascript',
                                       onChange,
                                   }: Props) {
    const [value, setValue] = useState(initialCode);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={initialCode}
                theme="vs-dark"
                onChange={(v: string) => {
                    const text = v ?? '';
                    setValue(text);
                    onChange?.(text);
                }}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
}