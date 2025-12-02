import type { Exercise } from './types';

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex1: Exercise = {
    id: 'ex1-init-add-print',
    title: 'Init, add, and print three variables',

    prompt:
        'Initialize two variables a and b, compute c=a+b, and print a, b, and c on separate lines.',
    expected: {
        mode: 'stdout',
        expectedLines: ['a=5', 'b=7', 'c=12'],
        ignoreOrder: false,
    },

    generate: () => {
        const a = randInt(1, 20);
        const b = randInt(1, 20);
        const c = a + b;

        const prompt = `Initialize two variables a=${a} and b=${b}, compute c=a+b, and print each value on its own line exactly as:
a=${a}
b=${b}
c=${c}`;

        const expected = {
            mode: 'stdout' as const,
            expectedLines: [`a=${a}`, `b=${b}`, `c=${c}`],
            ignoreOrder: false,
        };

        return {
            prompt,
            expected,
            params: { a, b, c },
        };
    },

    starter: {
        javascript: `// Set a and b, compute c, then print as shown in the prompt
`,
        typescript: `// Set a and b, compute c, then print as shown in the prompt
`,
        python: `# Set a and b, compute c, then print as shown in the prompt
`,
        html: `<!-- Write script that prints to console (open console to see) -->
<script>
// your code here
</script>
<div>Open the console for output</div>`,
        c: `#include <stdio.h>

int main() {
    // your code
    return 0;
}
`,
        cpp: `#include <iostream>
using namespace std;

int main() {
    // your code
    return 0;
}
`,
        java: `public class Main {
    public static void main(String[] args) {
        // your code
    }
}`,
    },

    tags: ['intro', 'addition'],
};