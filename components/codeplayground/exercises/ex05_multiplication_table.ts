import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const ex05_multiplication_table: Exercise = {
    id: "ex05-multiplication-table",
    title: "Multiplication table for N",

    prompt: "Print the multiplication table for N from 1 to K.",
    expected: {
        mode: "stdout",
        expectedLines: ["2", "4", "6"],
        ignoreOrder: false,
    },

    generate: () => {
        const n = randInt(2, 12);
        const k = randInt(5, 10);

        const lines: string[] = [];
        for (let i = 1; i <= k; i++) lines.push(String(n * i));

        const prompt = `Print the multiplication table for N = ${n} from 1 to ${k}. (One product per line.)`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: lines,
                ignoreOrder: false,
            },
            params: { n, k },
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