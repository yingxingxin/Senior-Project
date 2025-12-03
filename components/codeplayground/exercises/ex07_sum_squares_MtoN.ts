import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex07_sum_squares_MtoN: Exercise = {
    id: "ex07-sum-squares-MtoN",
    title: "Sum of squares from M to N",

    prompt: "Given M = 1 and N = 3, compute 1^2 + 2^2 + 3^2 and print the result.",
    expected: {
        mode: "stdout",
        expectedLines: ["14"],
        ignoreOrder: false,
    },

    generate: () => {
        const start = randInt(1, 10);
        const span = randInt(2, 8);
        const end = start + span;

        let total = 0;
        for (let i = start; i <= end; i++) {
            total += i * i;
        }

        const prompt = `Given M = ${start} and N = ${end}, compute the sum of squares M^2 + (M+1)^2 + ... + N^2 and print the result.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(total)],
                ignoreOrder: false,
            },
            params: { start, end, total },
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