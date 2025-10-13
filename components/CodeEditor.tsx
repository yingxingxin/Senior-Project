'use client';

import { useState } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';

type Props = {
    initialCode?: string;
    language?: string;
    onChange?: (value: string) => void; // your consumer still gets a plain string
};

export default function CodeEditor({
                                       initialCode = '// write code here',
                                       language = 'javascript',
                                       onChange,
                                   }: Props) {
    const [value, setValue] = useState(initialCode);

    const handleChange: OnChange = (v) => {
        const text = v ?? '';
        setValue(text);
        onChange?.(text);
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <Editor
                height="100%"
                value={value}                 // controlled
                defaultLanguage={language}
                theme="vs-dark"
                onChange={handleChange}       // ← correct signature
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