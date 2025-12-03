import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex08_power_A_to_B: Exercise = {
    id: "ex08-power-A-to-B",
    title: "Compute A^B using a loop",

    prompt: "Given A = 2 and B = 3, compute A^B (2^3 = 8) and print it.",
    expected: {
        mode: "stdout",
        expectedLines: ["8"],
        ignoreOrder: false,
    },

    generate: () => {
        const A = randInt(2, 9);
        const B = randInt(1, 5);

        let result = 1;
        for (let i = 0; i < B; i++) {
            result *= A;
        }

        const prompt = `Given A = ${A} and B = ${B}, compute A^B using a loop (do not use built-in power functions) and print the result.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(result)],
                ignoreOrder: false,
            },
            params: { A, B, result },
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