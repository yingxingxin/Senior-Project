import type { Exercise } from "./types";

/** Random integer helper (same as ex1, ex2, ex3) */
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Count how many EVEN numbers exist between M and N (inclusive).
 */
export const ex6_count_evens_MtoN: Exercise = {
    id: "ex6-count-evens-MtoN",
    title: "Count even numbers from M..N (random range)",

    prompt:
        "Given M = 1 and N = 10, write a program that counts how many even numbers are in the range M..N (inclusive).",
    expected: {
        mode: "stdout",
        expectedLines: ["5"], // evens: 2,4,6,8,10
        ignoreOrder: false,
    },

    generate: () => {
        const start = randInt(1, 10);
        const span = randInt(3, 10);
        const end = start + span;

        let count = 0;
        for (let i = start; i <= end; i++) {
            if (i % 2 === 0) count++;
        }

        const prompt = `Given M = ${start} and N = ${end}, write a program that counts how many even numbers are in the range M..N (inclusive).`;

        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(count)],
            ignoreOrder: false,
        };

        const params = { start, end, count };

        return { prompt, expected, params };
    },

    starter: {
        javascript: `// Given M and N from the prompt,
// count how many numbers between M and N (inclusive) are even.
`,

        typescript: `// Given M and N from the prompt,
// count how many numbers between M and N (inclusive) are even.
`,

        python: `# Given M and N from the prompt,
# count how many numbers between M and N (inclusive) are even.
`,

        c: `#include <stdio.h>

// Given M and N from the prompt,
// count how many numbers between M and N (inclusive) are even.

int main(void) {
    
    return 0;
}`,

        cpp: `#include <iostream>
using namespace std;

// Count EVEN numbers from M to N inclusive.

int main() {
   
    return 0;
}`,

        java: `public class Main {
    // Count EVEN numbers from M to N inclusive.
    public static void main(String[] args) {
       
    }
}`,
    },
};