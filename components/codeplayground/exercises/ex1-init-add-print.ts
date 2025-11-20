import type { Exercise } from './types';

// Helper for random ints
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex1: Exercise = {
    id: 'ex1-init-add-print',
    title: 'Init, add, and print three variables',

    // Static defaults (required by the Exercise type).
    // These are basically fallbacks; CodePlayground will
    // use the generated values once we wire it up.
    prompt:
        'Initialize two variables a and b, compute c=a+b, and print a, b, and c on separate lines.',
    expected: {
        mode: 'stdout',
        expectedLines: ['a=5', 'b=7', 'c=12'],
        ignoreOrder: false,
    },

    // Dynamic generator for random numbers
    generate: () => {
        // 1. Random numbers:
        const a = randInt(1, 20);
        const b = randInt(1, 20);
        const c = a + b;

        // 2. Prompt shown to the user (with actual numbers)
        const prompt = `Initialize two variables a=${a} and b=${b}, compute c=a+b, and print each value on its own line exactly as:
a=${a}
b=${b}
c=${c}`;

        // 3. What output your grader expects
        const expected = {
            mode: 'stdout' as const,
            expectedLines: [`a=${a}`, `b=${b}`, `c=${c}`],
            ignoreOrder: false,
        };

        // 4. Return the fully generated exercise data
        return {
            prompt,
            expected,
            params: { a, b, c },
        };
    },

    // Starter code (keep whatever you had, I’m just giving basic defaults)
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