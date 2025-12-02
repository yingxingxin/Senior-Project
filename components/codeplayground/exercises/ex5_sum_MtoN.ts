import type { Exercise } from "./types";

/**
 * Random integer helper (same pattern you used in ex1).
 */
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Dynamic randomized exercise:
 * Sum all numbers from M to N (inclusive) using a loop.
 */
export const ex5_sum_MtoN: Exercise = {
    id: "ex5-sum-MtoN",
    title: "Sum numbers M..N (random range)",

    prompt:
        "Given M = 1 and N = 5, write a program that computes and prints the sum of all integers from M to N (inclusive).",
    expected: {
        mode: "stdout",
        expectedLines: ["15"], // 1 + 2 + 3 + 4 + 5
        ignoreOrder: false,
    },

    generate: () => {
        const start: number = randInt(1, 10);

        const span: number = randInt(2, 8);
        const end: number = start + span;

        const count = end - start + 1;
        const sum = ((start + end) * count) / 2;

        const prompt = `Given M = ${start} and N = ${end}, write a program that computes and prints the sum of all integers from M to N (inclusive).`;

        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(sum)],
            ignoreOrder: false,
        };

        const params = { start, end, sum };

        return { prompt, expected, params };
    },

    starter: {
        javascript: `// Given M and N from the prompt,
// print the sum of all integers from M to N (inclusive).
`,

        typescript: `// Given M and N from the prompt,
// print the sum of all integers from M to N (inclusive).
`,

        python: `# Given M and N from the prompt,
# print the sum of all integers from M to N (inclusive).
`,


        c: `#include <stdio.h>

// Given M and N from the prompt,
// print the sum of all integers from M to N (inclusive).

int main(void) {

    return 0;
}`,

        cpp: `#include <iostream>
using namespace std;

// Given M and N from the prompt,
// print the sum of all integers from M to N (inclusive).

int main() {

    return 0;
}`,

        java: `public class Main {
    // Given M and N from the prompt,
    // print the sum of all integers from M to N (inclusive).
    public static void main(String[] args) {
      
    }
}`,
    },
};