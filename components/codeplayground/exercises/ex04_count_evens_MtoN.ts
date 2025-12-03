import type { Exercise } from "./types";


function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const ex04_count_evens_MtoN: Exercise = {


    id: "ex04-count-evens-MtoN",
    title: "Count even numbers between M and N",

    prompt: "Given M = 1 and N = 5, count how many numbers are even.",
    expected: {
        mode: "stdout",
        expectedLines: ["2"],
        ignoreOrder: false,
    },

    generate: () => {
        const start = randInt(1, 10);
        const span = randInt(2, 10);
        const end = start + span;

        let count = 0;
        for (let i = start; i <= end; i++) {
            if (i % 2 === 0) count++;
        }

        const prompt = `Given M = ${start} and N = ${end}, count how many numbers between M and N (inclusive) are even.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(count)],
                ignoreOrder: false,
            },
            params: { start, end, count },
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