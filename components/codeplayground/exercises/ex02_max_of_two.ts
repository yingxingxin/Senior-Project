import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex02_max_of_two: Exercise = {
    id: "ex02-max-of-two",
    title: "Print the larger of two numbers",

    prompt: "Given A = 2 and B = 5, print the larger number.",
    expected: {
        mode: "stdout",
        expectedLines: ["5"],
        ignoreOrder: false,
    },

    generate: () => {
        const a = randInt(1, 99);
        let b = randInt(1, 99);
        while (a === b) b = randInt(1, 99);
        const max = a > b ? a : b;

        const prompt = `Given A = ${a} and B = ${b}, print the larger number.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(max)],
                ignoreOrder: false,
            },
            params: { a, b, max },
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