import type { Exercise } from './types';

/**
 * Use an if/else chain to check if a number is positive, negative, or zero.
 */
export const ex4_if_positive_negative: Exercise = {
    id: 'ex4-if-positive-negative',
    title: 'If statement: check sign of a number',
    prompt:
        `Write a program that checks whether a number is positive, negative, or zero.
Print exactly one of these messages (case sensitive):
"Positive"
"Negative"
"Zero"

You can change the value of the variable if you like, but your if statement
must correctly identify all three cases.`,

    expected: {
        mode: 'stdout',
        expectedLines: ['Positive', 'Negative', 'Zero'],
        matchAny: true,
    },

    starter: {
        javascript: `// Use an if/else chain to print Positive, Negative, or Zero

`,

        typescript: `// Use an if/else chain to print Positive, Negative, or Zero

`,

        python: `# Use an if/elif/else chain to print Positive, Negative, or Zero

`,

        c: `#include <stdio.h>
// Use if/else if/else to print Positive, Negative, or Zero
int main(void){
    
}
`,

        cpp: `#include <iostream>
using namespace std;
// Use if/else if/else to print Positive, Negative, or Zero
int main(){
    
}
`,

        java: `public class Main {
    public static void main(String[] args){
        
    }
}
`,
    },
};