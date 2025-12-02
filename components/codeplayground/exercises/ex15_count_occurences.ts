import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const ex15_count_occurrences: Exercise = {
    id: "ex15-count-occurrences",
    title: "Count occurrences in a list",
    prompt: "Given a list of numbers and a value V, count how many times V appears.",
    expected: {
        mode: "stdout",
        expectedLines: ["3"], // dummy fallback, will be replaced by generate()
        ignoreOrder: false,
    },

    generate: () => {
        // 1. Random list length
        const length = randInt(5, 10);

        // 2. Build random list 1..9
        const nums: number[] = [];
        for (let i = 0; i < length; i++) {
            nums.push(randInt(1, 9));
        }

        // 3. Pick a random value from the list to count
        const valueIndex = randInt(0, length - 1);
        const value = nums[valueIndex];

        // 4. Count occurrences
        const count = nums.filter((n) => n === value).length;

        // 5. Prompt shown to the student
        const prompt =
            `Given the list: [${nums.join(", ")}] and the value ${value}, ` +
            `print how many times ${value} appears in the list.`;

        // 6. Expected output for the grader
        const expected = {
            mode: "stdout" as const,
            expectedLines: [String(count)],
            ignoreOrder: false as const,
        };

        // 7. Return object that matches Exercise["generate"] type
        return {
            prompt,
            expected,
            params: {
                // MUST be number | string for each field:
                nums: nums.join(" "), // store list as string so it fits the type
                value,
                count,
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