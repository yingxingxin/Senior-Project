import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex14_average_of_list: Exercise = {
    id: "ex14-average-of-list",
    title: "Average of numbers in a list (integer)",

    prompt:
        "Given a list of numbers, compute the average and print it as an integer (floor).",
    expected: {
        mode: "stdout",
        expectedLines: ["3"],
        ignoreOrder: false,
    },

    generate: () => {
        // 1. Pick a random list length between 3 and 7
        const length = randInt(3, 7);

        // 2. Build a random list of ints 1..20
        const nums: number[] = [];
        for (let i = 0; i < length; i++) {
            nums.push(randInt(1, 20));
        }

        // 3. Sum & average (floored)
        const sum = nums.reduce((acc, n) => acc + n, 0);
        const avgFloor = Math.floor(sum / length);

        // 4. Prompt text
        const prompt =
            `Given the list: [${nums.join(", ")}], ` +
            `compute the average and print it as an integer (floor, ignore decimals).`;

        // 5. Expected output for the grader
        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(avgFloor)],
            ignoreOrder: false as const,
        };

        // 6. Return the generated exercise data
        return {
            prompt,
            expected,
            params: {
                // params must be Record<string, number | string>
                nums: nums.join(" "),  // store list as a single string
                sum,
                avgFloor,
            },
        };
    },

    starter: {
        javascript: `let nums = [/* numbers here */];

`,

        typescript: `let nums: number[] = [/* numbers here */];

`,

        python: `nums = [/* numbers here */]

`,

        c: `#include <stdio.h>

int main(void) {
    int nums[] = { /* numbers here */ };

    return 0;
}`,

        cpp: `#include <iostream>
using namespace std;

int main() {
    int nums[] = { /* numbers here */ };

    return 0;
}`,

        java: `public class Main {
  public static void main(String[] args) {
    int[] nums = { /* numbers here */ };

  }
}`,
    },
};