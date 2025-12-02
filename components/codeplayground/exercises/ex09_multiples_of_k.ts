import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex09_multiples_of_K: Exercise = {
    id: "ex09-multiples-of-K",
    title: "Print multiples of K between M and N",

    prompt: "Given M = 1, N = 10, and K = 3, print all multiples of K between M and N.",
    expected: {
        mode: "stdout",
        expectedLines: ["3", "6", "9"],
        ignoreOrder: false,
    },

    generate: () => {
        // 1. Pick random M, N, K
        const M = randInt(1, 5);        // start
        const N = randInt(M + 5, M + 15); // end > M
        const K = randInt(2, 5);        // divisor

        // 2. Build the list of multiples
        const multiples: number[] = [];
        for (let i = M; i <= N; i++) {
            if (i % K === 0) {
                multiples.push(i);
            }
        }

        // 3. Prompt shown to the user
        const prompt = `Between ${M} and ${N}, print all multiples of ${K}, one per line.`;

        // 4. Expected output for the grader
        const expected = {
            mode: "stdout" as const,
            expectedLines: multiples.map((n) => String(n)),
            ignoreOrder: false as const,
        };

        // 5. Return exactly what Exercise.generate expects
        return {
            prompt,
            expected,
            params: {
                M,
                N,
                K,
                // pack multiples into a single string so it fits Record<string, number | string>
                multiples: multiples.join(" "),
            },
        };
    },

    starter: {
        javascript: `
        `,

        typescript: `
        `,

        python: `
        `,

        c: `#include <stdio.h>
int main(void) {

    return 0;
}`,

        cpp: `#include <iostream>
using namespace std;
int main() {

    return 0;
}`,

        java: `public class Main {
  public static void main(String[] args) {

  }
}`,
    },
};