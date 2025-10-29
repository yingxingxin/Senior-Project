

export type Lang =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'html'
    | 'sql'
    | 'c'
    | 'cpp'
    | 'java';

export type StarterMap = Partial<Record<Lang, string>>;

export type Expected =
    | {
    mode: 'stdout';
    expectedLines: string[];
    ignoreOrder?: boolean;
    matchAny?: boolean;
    requiredText?: string[];
}
    | {
    mode: 'html';
    requiredText: string[]; // must appear in rendered HTML
};

export type Exercise = {
    id: string;
    title: string;
    prompt: string;           // human-readable instructions
    starter: StarterMap;      // starter code per language
    expected: Expected;       // how we validate
    tags?: string[];
};