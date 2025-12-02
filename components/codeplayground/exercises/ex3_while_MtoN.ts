import type { Exercise } from "./types";


function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Dynamic randomized WHILE-loop exercise:
 * Print numbers M..N using a while-loop.
 */
export const ex3_while_MtoN: Exercise = {
    id: "ex3-while-MtoN",
    title: "While loop: print M..N (random range)",


    prompt:
        "Write a program using a while-loop to print the numbers from START to END, each number on its own line.",

    expected: {
        mode: "stdout",
        expectedLines: ["1", "2", "3", "4", "5"],
        ignoreOrder: false,
    },

    starter: {
        javascript: `// Print numbers START..END using a while-loop

`,

        typescript: `// Print numbers START..END using a while-loop

}
`,

        python: `# Print numbers START..END using a while-loop

`,

        c: `#include <stdio.h>

// Print numbers START..END using a while-loop
int main(void) {

    return 0;
}
`,

        cpp: `#include <iostream>
using namespace std;

// Print numbers START..END using a while-loop
int main() {

    return 0;
}
`,

        java: `public class Main {
    // Print numbers START..END using a while-loop
    public static void main(String[] args) {

    }
}
`,
    },


    generate: () => {

        const start = randInt(1, 5);  // 1..5
        const span = randInt(2, 5);   // at least 2 numbers
        const end = start + span;


        const prompt = `Write a program using a while-loop to print the numbers from ${start} to ${end}, each number on its own line.`;


        const expected = {
            mode: "stdout",
            expectedLines: Array.from(
                { length: end - start + 1 },
                (_, i) => String(start + i),
            ),
            ignoreOrder: false,
        } as const;

        return {
            prompt,
            expected,
            params: { start, end },
        };
    },
};