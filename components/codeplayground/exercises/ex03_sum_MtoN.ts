import type { Exercise } from "./types";


function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex03_sum_MtoN: Exercise = {
    id: "ex03-sum-MtoN",
    title: "Sum numbers from M to N",

    prompt: "Given M = 1 and N = 5, print their sum (1+2+3+4+5).",
    expected: {
        mode: "stdout",
        expectedLines: ["15"],
        ignoreOrder: false,
    },

    generate: () => {
        const start = randInt(1, 10);
        const span = randInt(2, 8);
        const end = start + span;

        const count = end - start + 1;
        const sum = ((start + end) * count) / 2;

        const prompt = `Given M = ${start} and N = ${end}, print the sum of all integers from M to N (inclusive).`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(sum)],
                ignoreOrder: false,
            },
            params: { start, end, sum },
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
int main() {

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