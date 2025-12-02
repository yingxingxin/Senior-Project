import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex10_sum_of_digits: Exercise = {
    id: "ex10-sum-of-digits",
    title: "Sum of digits of a number",

    prompt: "Given N = 123, compute the sum of its digits (1+2+3 = 6) and print it.",
    expected: {
        mode: "stdout",
        expectedLines: ["6"],
        ignoreOrder: false,
    },

    generate: () => {
        const N = randInt(100, 9999); // 3–4 digit number

        let temp = N;
        let sum = 0;
        while (temp > 0) {
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }

        const prompt = `Given N = ${N}, compute the sum of its digits and print the result.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(sum)],
                ignoreOrder: false,
            },
            params: { N, sum },
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