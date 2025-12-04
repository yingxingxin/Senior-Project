import type { SkillLevel } from '@/src/db/schema/enums';

export interface QuizQuestionSeed {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface QuizSeed {
  slug: string;
  title: string;
  description: string;
  topic_slug: string;
  skill_level: SkillLevel;
  default_length: number;
  questions: QuizQuestionSeed[];
}

export function getProgrammingFoundationsQuizzes(): QuizSeed[] {
  return [
    // Quiz 1: Variables & Data Types (beginner, 5 questions)
    {
      slug: 'variables-and-data-types',
      title: 'Variables & Data Types',
      description: 'Test your understanding of variables, data types, and type coercion in programming.',
      topic_slug: 'programming_foundations',
      skill_level: 'beginner',
      default_length: 5,
      questions: [
        {
          prompt: 'Which of the following is **not** a primitive data type in most programming languages?',
          options: ['Integer', 'Boolean', 'Array', 'String'],
          correct_index: 2,
          explanation: 'Arrays are composite/reference types that hold collections of values, not primitive types. Primitive types are the basic building blocks like integers, booleans, and strings.',
        },
        {
          prompt: 'What is the result of `5 + "3"` in JavaScript?',
          options: ['"53"', '8', 'Error', '"8"'],
          correct_index: 0,
          explanation: 'JavaScript performs type coercion. When adding a number to a string, the number is converted to a string, resulting in string concatenation: "53".',
        },
        {
          prompt: 'Which keyword is used to declare a constant variable that cannot be reassigned?',
          options: ['var', 'let', 'const', 'static'],
          correct_index: 2,
          explanation: '`const` declares a variable that cannot be reassigned after initialization. This helps prevent accidental modifications and makes code more predictable.',
        },
        {
          prompt: 'What will `typeof undefined` return?',
          options: ['"null"', '"undefined"', '"object"', '"void"'],
          correct_index: 1,
          explanation: 'The `typeof` operator returns "undefined" for undefined values. This is useful for checking if a variable has been assigned a value.',
        },
        {
          prompt: 'Which data type would be most appropriate for storing a person\'s age?',
          options: ['String', 'Boolean', 'Integer', 'Float'],
          correct_index: 2,
          explanation: 'Age is typically a whole number, making Integer the most appropriate choice. While Float could work, using Integer is more precise and efficient for whole numbers.',
        },
      ],
    },

    // Quiz 2: Control Flow & Loops (beginner, 7 questions)
    {
      slug: 'control-flow-and-loops',
      title: 'Control Flow & Loops',
      description: 'Master conditional statements, loops, and program flow control.',
      topic_slug: 'programming_foundations',
      skill_level: 'beginner',
      default_length: 7,
      questions: [
        {
          prompt: 'Which loop is guaranteed to execute at least once?',
          options: ['for loop', 'while loop', 'do-while loop', 'for-in loop'],
          correct_index: 2,
          explanation: 'A do-while loop checks its condition after executing the loop body, guaranteeing at least one execution. Other loops check conditions before the first iteration.',
        },
        {
          prompt: 'What does the `break` statement do inside a loop?',
          options: [
            'Skips to the next iteration',
            'Exits the loop immediately',
            'Restarts the loop from the beginning',
            'Pauses the loop for debugging',
          ],
          correct_index: 1,
          explanation: '`break` immediately terminates the innermost loop and continues execution after the loop. Use `continue` to skip to the next iteration instead.',
        },
        {
          prompt: 'In an if-else-if chain, when is the `else` block executed?',
          options: [
            'When all conditions are true',
            'When the first condition is true',
            'When none of the conditions are true',
            'Always, after all other blocks',
          ],
          correct_index: 2,
          explanation: 'The `else` block acts as a fallback and only executes when all preceding `if` and `else if` conditions evaluate to false.',
        },
        {
          prompt: 'What is the output of this code?\n```\nfor (let i = 0; i < 3; i++) {\n  if (i === 1) continue;\n  console.log(i);\n}\n```',
          options: ['0, 1, 2', '0, 2', '1', '0, 1'],
          correct_index: 1,
          explanation: 'When `i` equals 1, `continue` skips the `console.log` and moves to the next iteration. So only 0 and 2 are printed.',
        },
        {
          prompt: 'Which operator is used for strict equality comparison (checking both value and type)?',
          options: ['==', '===', '!=', '='],
          correct_index: 1,
          explanation: '`===` is the strict equality operator that checks both value AND type. `==` performs type coercion before comparison, which can lead to unexpected results.',
        },
        {
          prompt: 'What is an infinite loop?',
          options: [
            'A loop that runs exactly 1000 times',
            'A loop with a complex condition',
            'A loop that never terminates because its condition is always true',
            'A loop inside another loop',
          ],
          correct_index: 2,
          explanation: 'An infinite loop occurs when the loop condition never becomes false, causing the loop to run forever. This is usually a bug unless intentionally designed (like game loops).',
        },
        {
          prompt: 'What does the ternary operator `condition ? a : b` return?',
          options: [
            'Always returns a',
            'Always returns b',
            'Returns a if condition is true, otherwise b',
            'Returns both a and b',
          ],
          correct_index: 2,
          explanation: 'The ternary operator is a shorthand for if-else. It evaluates the condition and returns the first value (a) if true, or the second value (b) if false.',
        },
      ],
    },

    // Quiz 3: Functions & Scope (intermediate, 7 questions)
    {
      slug: 'functions-and-scope',
      title: 'Functions & Scope',
      description: 'Understand function declarations, parameters, return values, and variable scope.',
      topic_slug: 'programming_foundations',
      skill_level: 'intermediate',
      default_length: 7,
      questions: [
        {
          prompt: 'What is a "pure function"?',
          options: [
            'A function that only uses primitive types',
            'A function with no parameters',
            'A function that always returns the same output for the same input and has no side effects',
            'A function that is written in a single line',
          ],
          correct_index: 2,
          explanation: 'Pure functions are predictable and easier to test. They don\'t modify external state or depend on anything other than their inputs.',
        },
        {
          prompt: 'What is the difference between function parameters and arguments?',
          options: [
            'They are the same thing',
            'Parameters are in the function definition; arguments are the actual values passed',
            'Arguments are in the function definition; parameters are the actual values passed',
            'Parameters are optional; arguments are required',
          ],
          correct_index: 1,
          explanation: 'Parameters are placeholders defined in the function signature. Arguments are the actual values passed when calling the function.',
        },
        {
          prompt: 'What is "hoisting" in JavaScript?',
          options: [
            'Moving variables to the global scope',
            'Declarations are moved to the top of their scope before code execution',
            'Converting functions to arrow functions',
            'Increasing function performance',
          ],
          correct_index: 1,
          explanation: 'Hoisting moves function and variable declarations to the top of their scope during compilation. However, only declarations are hoisted, not initializations.',
        },
        {
          prompt: 'What will this code output?\n```\nlet x = 10;\nfunction test() {\n  console.log(x);\n  let x = 20;\n}\ntest();\n```',
          options: ['10', '20', 'undefined', 'ReferenceError'],
          correct_index: 3,
          explanation: 'This is the "temporal dead zone". The inner `let x` is hoisted but not initialized, so accessing it before declaration throws a ReferenceError.',
        },
        {
          prompt: 'What is a closure?',
          options: [
            'A function that closes the program',
            'A function that has access to variables from its outer scope even after the outer function has returned',
            'A function with no return statement',
            'A function that only runs once',
          ],
          correct_index: 1,
          explanation: 'Closures "close over" variables from their containing scope, maintaining access to them. This is useful for creating private variables and factory functions.',
        },
        {
          prompt: 'What is the main advantage of using default parameters?',
          options: [
            'They make functions run faster',
            'They allow functions to work with fewer arguments than defined parameters',
            'They prevent functions from returning undefined',
            'They convert all parameters to strings',
          ],
          correct_index: 1,
          explanation: 'Default parameters provide fallback values when arguments are not passed or are undefined, making functions more flexible and reducing the need for manual checks.',
        },
        {
          prompt: 'In JavaScript, what does the `...args` syntax do in a function parameter list?',
          options: [
            'Spreads an array into individual elements',
            'Collects all remaining arguments into an array',
            'Makes all parameters optional',
            'Creates a copy of the arguments',
          ],
          correct_index: 1,
          explanation: 'The rest parameter syntax (...args) collects all remaining arguments into an array. This allows functions to accept any number of arguments.',
        },
      ],
    },

    // Quiz 4: Error Handling Basics (intermediate, 5 questions)
    {
      slug: 'error-handling-basics',
      title: 'Error Handling Basics',
      description: 'Learn how to handle errors gracefully using try-catch and understand error types.',
      topic_slug: 'programming_foundations',
      skill_level: 'intermediate',
      default_length: 5,
      questions: [
        {
          prompt: 'What is the purpose of a `finally` block in try-catch-finally?',
          options: [
            'It only runs if an error occurs',
            'It only runs if no error occurs',
            'It always runs, regardless of whether an error occurred',
            'It prevents errors from being thrown',
          ],
          correct_index: 2,
          explanation: 'The `finally` block always executes after try and catch, making it ideal for cleanup code like closing files or connections.',
        },
        {
          prompt: 'What type of error occurs when you try to access a property of `undefined`?',
          options: ['SyntaxError', 'TypeError', 'ReferenceError', 'RangeError'],
          correct_index: 1,
          explanation: 'TypeError occurs when an operation is performed on a value of the wrong type, like trying to access properties on undefined or null.',
        },
        {
          prompt: 'What happens if you throw an error inside a `catch` block?',
          options: [
            'It is automatically caught by the same catch block',
            'It propagates up to the next error handler',
            'It is silently ignored',
            'The program terminates immediately',
          ],
          correct_index: 1,
          explanation: 'Errors thrown in a catch block are not caught by that same catch. They propagate up the call stack to the next enclosing try-catch or crash the program.',
        },
        {
          prompt: 'When should you use try-catch?',
          options: [
            'Around every single line of code',
            'Only around code that might throw exceptions you want to handle',
            'Never, errors should crash the program',
            'Only in the main function',
          ],
          correct_index: 1,
          explanation: 'Use try-catch around code that might fail in ways you can recover from. Wrapping everything is excessive and makes debugging harder.',
        },
        {
          prompt: 'What is the difference between throwing an Error object vs a string?',
          options: [
            'No difference, they work exactly the same',
            'Error objects include stack traces and additional metadata; strings do not',
            'Strings are faster to throw',
            'Error objects can only be caught by try-catch',
          ],
          correct_index: 1,
          explanation: 'Error objects include valuable debugging information like stack traces, file names, and line numbers. Always throw Error objects for better debugging.',
        },
      ],
    },
  ];
}
