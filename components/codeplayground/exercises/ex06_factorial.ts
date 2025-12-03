import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex06_factorial: Exercise = {
    id: "ex06-factorial",
    title: "Factorial of N",

    prompt: "Given N = 5, compute N! (factorial) and print it.",
    expected: {
        mode: "stdout",
        expectedLines: ["120"],
        ignoreOrder: false,
    },

    generate: () => {
        const n = randInt(3, 8);
        let f = 1;
        for (let i = 1; i <= n; i++) f *= i;

        const prompt = `Given N = ${n}, compute N! (factorial) and print it.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(f)],
                ignoreOrder: false,
            },
            params: { n, f },
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