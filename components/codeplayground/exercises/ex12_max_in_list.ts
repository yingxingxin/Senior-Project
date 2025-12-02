import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex12_max_in_list: Exercise = {
    id: "ex12-max-in-list",
    title: "Find the maximum value in a list",

    prompt: "Given a list of numbers, print the maximum value.",
    expected: {
        mode: "stdout",
        expectedLines: ["10"],
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

        // 3. Compute the maximum
        const maxVal = Math.max(...nums);

        // 4. Prompt shown to the user
        const prompt = `Given the list: [${nums.join(", ")}], print the maximum value.`;

        // 5. Expected output for the grader
        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(maxVal)],
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
                maxVal,
            },
        };
    },

    starter: {
        javascript: `let nums = [/* numbers here */];

`,

        typescript: `let nums: number[] = [/* numbers here */];

let maxVal: number = nums[0];
for (let i = 0; i < nums.length; i++) {
  if (nums[i] > maxVal) {
    maxVal = nums[i];
  }
}
console.log(maxVal);`,

        python: `nums = [/* numbers here */]

max_val = nums[0]
for n in nums:
    if n > max_val:
        max_val = n

print(max_val)`,

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