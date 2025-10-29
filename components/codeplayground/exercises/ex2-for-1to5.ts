import type { Exercise } from './types';

/**
 * Print the numbers 1..5 using a for-loop (each on its own line).
 * We only include languages that actually have a for-loop.
 */
export const ex2_for_1to5: Exercise = {
    id: 'ex2-for-1to5',
    title: 'For loop: print 1..5',
    prompt:
        `Write a program that prints the numbers 1, 2, 3, 4, 5
(each number on its own line) using a for-loop.

Expected output (exactly):
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
        javascript: `// Use a for loop to print 1..5, one per line.
        
}
`,

        typescript: `// Use a for loop to print 1..5, one per line.
        
}
`,

        python: `# Use a for loop to print 1..5, one per line.

`,

        c: `#include <stdio.h>
// Use a for loop to print 1..5, one per line.
int main(void){
    
}
`,

        cpp: `#include <iostream>
using namespace std;
// Use a for loop to print 1..5, one per line.
int main(){
    
}
`,

        java: `public class Main {
    // Use a for loop to print 1..5, one per line.
    public static void main(String[] args){
        
    }
}
`,

        // Not including html/sql here (no real for-loop). By omitting them,
        // your listForLang(lang) will hide this exercise for those languages.
    },
};

export class ex2 {
}