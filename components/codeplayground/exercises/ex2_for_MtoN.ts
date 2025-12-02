import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Dynamic randomized for-loop exercise:
 * Print numbers M..N using a for-loop.
 */
export const ex2_for_MtoN: Exercise = {
    id: "ex2-for-MtoN",
    title: "For loop: print M..N (random range)",

    prompt: "Write a program that prints the numbers from 1 to 5, " +
        "each number on its own line, using a for-loop.",
    expected: {
        mode: "stdout",
        expectedLines: ["1", "2", "3", "4", "5"],
        ignoreOrder: false,
    },

    starter: {
        javascript: `// Use a for loop to print numbers from start to end (inclusive).
// Replace START and END with the actual numbers.
`,
        typescript: `// Use a for loop to print numbers from start to end (inclusive).
// Replace START and END with the actual numbers.
`,
        python: `# Use a for loop to print numbers from start to end (inclusive).
# Replace START and END with the actual numbers.
`,
        c: `#include <stdio.h>

// Use a for loop to print numbers from start to end (inclusive).
int main(void) {

  return 0;
}`,
        cpp: `#include <iostream>
using namespace std;

// Use a for loop to print numbers from start to end (inclusive).
int main() {

  return 0;
}`,
        java: `public class Main {
  // Use a for loop to print numbers from start to end (inclusive).
  public static void main(String[] args) {
    
  }
}`,
    },

    generate: () => {

        const start = randInt(1, 5);         // 1..5
        const span = randInt(2, 5);          // at least 2
        const end = start + span;           // end > start


        const prompt =
            `Write a program that prints the numbers from ${start} to ${end}, ` +
            `each number on its own line, using a for-loop.`;

        const expected = {
            mode: "stdout" as const,
            expectedLines: Array.from(
                { length: end - start + 1 },
                (_, i) => String(start + i),
            ),
            ignoreOrder: false,
        };

        return {
            prompt,
            expected,
            params: { start, end },
        };
    },
};