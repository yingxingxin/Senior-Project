import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex11_reverse_number: Exercise = {
    id: "ex11-reverse-number",
    title: "Reverse the digits of a number",

    prompt: "Given N = 1234, print its reverse (4321).",
    expected: {
        mode: "stdout",
        expectedLines: ["4321"],
        ignoreOrder: false,
    },

    generate: () => {
        const N = randInt(100, 9999); // 3–4 digits

        let temp = N;
        let reversed = 0;
        while (temp > 0) {
            const digit = temp % 10;
            reversed = reversed * 10 + digit;
            temp = Math.floor(temp / 10);
        }

        const prompt = `Given N = ${N}, reverse its digits and print the reversed number.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(reversed)],
                ignoreOrder: false,
            },
            params: { N, reversed },
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