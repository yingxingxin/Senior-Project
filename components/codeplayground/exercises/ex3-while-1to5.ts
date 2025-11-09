import type { Exercise } from './types';

/**
 * Print the numbers 1..5 using a while-loop.
 */
export const ex3_while_1to5: Exercise = {
    id: 'ex3-while-1to5',
    title: 'While loop: print 1..5',
    prompt:
        `Write a program that uses a while-loop to print
the numbers 1, 2, 3, 4, 5 — each on its own line.

Expected output:
1
2
3
4
5`,

    expected: {
        mode: 'stdout',
        expectedLines: ['1','2','3','4','5'],
        ignoreOrder: false,
    },

    starter: {
        javascript: `// Use a while loop to print 1..5

`,

        typescript: `// Use a while loop to print 1..5

`,

        python: `# Use a while loop to print 1..5

`,

        c: `#include <stdio.h>
// Use a while loop to print 1..5
int main(void){
    
}
`,

        cpp: `#include <iostream>
using namespace std;
// Use a while loop to print 1..5
int main(){
    
}
`,

        java: `public class Main {
    // Use a while loop to print 1..5
    public static void main(String[] args){
        
    }
}
`,
    },
};