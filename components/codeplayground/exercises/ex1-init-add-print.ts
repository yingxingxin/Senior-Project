

import type { Exercise } from './types';

export const ex1: Exercise = {
    id: 'ex1-init-add-print',
    title: 'Init, add, and print three variables',
    prompt: `Initialize two variables a=5 and b=7, compute c=a+b, and print each value
on its own line exactly as:
a=5
b=7
c=12`,
    expected: {
        mode: 'stdout',
        expectedLines: ['a=5', 'b=7', 'c=12'],
        ignoreOrder: false,
    },
    starter: {
        javascript: `// Set a and b, compute c, then print as:
`,

        typescript: `// Set a and b, compute c, then print as above
`,

        python: `# Set a and b, compute c, then print as required
`,

        html: `<!-- Write script that prints to console (open console to see) -->
<script>
  
  
</script>
<div>Open the console for output</div>`,

        sql: `-- Use a SELECT with literals and aliases to produce the three rows:
-- a=5, b=7, c=12
SELECT 'a=' || 5 AS x
UNION ALL SELECT 'b=' || 7
UNION ALL SELECT 'c=' || (5+7);`,

        c: `#include <stdio.h>
int main() {
    
}`,

        cpp: `#include <iostream>
using namespace std;
int main() {
    
}`,

        java: `public class Main {
    public static void main(String[] args) {
        
    }
}`,
    },
};