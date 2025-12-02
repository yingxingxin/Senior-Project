import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex01_add_two_numbers: Exercise = {
    id: "ex01-add-two-numbers",
    title: "Add two numbers",

    prompt: "Given A = 2 and B = 3, print their sum.",
    expected: {
        mode: "stdout",
        expectedLines: ["5"],
        ignoreOrder: false,
    },

    generate: () => {
        const a = randInt(1, 50);
        const b = randInt(1, 50);
        const sum = a + b;

        const prompt = `Given A = ${a} and B = ${b}, print their sum.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(sum)],
                ignoreOrder: false,
            },
            params: { a, b, sum },
        };
    },

    starter: {
        javascript: ``,

        typescript: ``,

        python: ``,

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