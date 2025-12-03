import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex13_min_in_list: Exercise = {
    id: "ex13-min-in-list",
    title: "Find the minimum value in a list",

    prompt: "Given a list of numbers, print the minimum value.",
    expected: {
        mode: "stdout",
        expectedLines: ["1"],
        ignoreOrder: false,
    },

    generate: () => {
        // 1. Pick a random list length between 5 and 10
        const length = randInt(5, 10);

        // 2. Build a random list of integers 1..99
        const nums: number[] = [];
        for (let i = 0; i < length; i++) {
            nums.push(randInt(1, 99));
        }

        // 3. Compute the minimum
        const minVal = Math.min(...nums);

        // 4. Prompt shown to the user
        const prompt = `Given the list: [${nums.join(", ")}], print the minimum value.`;

        // 5. Expected output for the grader
        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(minVal)],
            ignoreOrder: false as const,
        };

        // 6. Return object in the shape Exercise.generate expects
        return {
            prompt,
            expected,
            params: {
                // params must be Record<string, number | string>
                // so nums is stored as a single string
                nums: nums.join(" "),
                minVal,
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