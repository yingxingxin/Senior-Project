import type { Exercise } from "./types";

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ex16_string_length: Exercise = {
    id: "ex16-string-length",
    title: "Compute the length of a string",

    prompt: "Given a string, print the number of characters in it.",
    expected: {
        mode: "stdout",
        expectedLines: ["4"],
        ignoreOrder: false,
    },

    generate: () => {
        const length = randInt(4, 10);
        const letters = "abcdefghijklmnopqrstuvwxyz";
        let s = "";
        for (let i = 0; i < length; i++) {
            const idx = randInt(0, letters.length - 1);
            s += letters[idx];
        }

        const prompt = `Given the string: "${s}", print the number of characters in it.`;

        return {
            prompt,
            expected: {
                mode: "stdout",
                expectedLines: [String(s.length)],
                ignoreOrder: false,
            },
            params: { s },
        };
    },

    starter: {
        javascript: `let s = "/* string here */";
`,

        typescript: `let s: string = "/* string here */";
`,

        python: `s = "/* string here */"
`,

        c: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "/* string here */";
  
    return 0;
}`,

        cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "/* string here */";
 
    return 0;
}`,

        java: `public class Main {
  public static void main(String[] args) {
    String s = "/* string here */";

  }
}`,
    },
};
