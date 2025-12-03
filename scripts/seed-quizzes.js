/**
 * Seed Script: Sample Quizzes
 * 
 * Creates sample quizzes for testing the quiz feature.
 * Run with: node scripts/seed-quizzes.js
 */

const postgres = require('postgres');
require('dotenv').config();

const sampleQuizzes = [
  // Variables and Types
  {
    slug: 'variables-and-types-beginner',
    title: 'Variables and Types: Beginner',
    description: 'Learn the basics of variables, data types, and simple assignments.',
    topic_slug: 'variables_and_types',
    skill_level: 'beginner',
    default_length: 5,
    questions: [
      {
        prompt: 'What is a variable in programming?',
        options: [
          'A fixed value that never changes',
          'A named storage location that holds a value',
          'A function that performs calculations',
          'A type of loop structure'
        ],
        correct_index: 1,
        explanation: 'A variable is a named storage location in memory that holds a value. You can change the value stored in a variable during program execution.'
      },
      {
        prompt: 'Which of the following is a valid variable name in most programming languages?',
        options: [
          '2myVariable',
          'my-variable',
          'myVariable',
          'my variable'
        ],
        correct_index: 2,
        explanation: 'Variable names typically cannot start with numbers, cannot contain hyphens or spaces. "myVariable" follows common naming conventions.'
      },
      {
        prompt: 'What is the purpose of data types?',
        options: [
          'To make code run faster',
          'To define what kind of data a variable can hold',
          'To create functions',
          'To format output'
        ],
        correct_index: 1,
        explanation: 'Data types define what kind of data a variable can store (e.g., numbers, text, true/false) and what operations can be performed on it.'
      },
      {
        prompt: 'Which data type is typically used to store whole numbers?',
        options: [
          'String',
          'Boolean',
          'Integer',
          'Float'
        ],
        correct_index: 2,
        explanation: 'Integers are used to store whole numbers (positive, negative, or zero) without decimal points.'
      },
      {
        prompt: 'What happens when you assign a new value to an existing variable?',
        options: [
          'The old value is preserved',
          'The old value is replaced with the new value',
          'An error occurs',
          'Both values are stored'
        ],
        correct_index: 1,
        explanation: 'When you assign a new value to a variable, it replaces the previous value. Variables can only hold one value at a time.'
      }
    ]
  },
  {
    slug: 'variables-and-types-intermediate',
    title: 'Variables and Types: Intermediate',
    description: 'Explore type conversion, constants, and variable scope concepts.',
    topic_slug: 'variables_and_types',
    skill_level: 'intermediate',
    default_length: 5,
    questions: [
      {
        prompt: 'What is type coercion?',
        options: [
          'Forcing a variable to be a specific type',
          'Automatic conversion of one data type to another',
          'Creating a new type',
          'Deleting a type'
        ],
        correct_index: 1,
        explanation: 'Type coercion is the automatic or implicit conversion of values from one data type to another, often happening during operations.'
      },
      {
        prompt: 'What is the difference between a constant and a variable?',
        options: [
          'Constants are faster',
          'Constants cannot be changed after declaration, variables can',
          'Variables are only used in functions',
          'There is no difference'
        ],
        correct_index: 1,
        explanation: 'A constant (const) is a value that cannot be reassigned after it is declared, while a variable can have its value changed.'
      },
      {
        prompt: 'What is variable scope?',
        options: [
          'The size of the variable',
          'The range of code where a variable is accessible',
          'The type of the variable',
          'The value of the variable'
        ],
        correct_index: 1,
        explanation: 'Variable scope refers to the region of code where a variable is accessible. Variables can have global scope or local scope.'
      },
      {
        prompt: 'What is a strongly typed language?',
        options: [
          'A language that requires explicit type declarations',
          'A language that only uses numbers',
          'A language that is difficult to learn',
          'A language without variables'
        ],
        correct_index: 0,
        explanation: 'A strongly typed language requires explicit type declarations and enforces type rules strictly, preventing implicit type conversions.'
      },
      {
        prompt: 'What is the purpose of type casting?',
        options: [
          'To break a variable',
          'To explicitly convert a value from one type to another',
          'To create a new variable',
          'To delete a variable'
        ],
        correct_index: 1,
        explanation: 'Type casting (or type conversion) is the explicit conversion of a value from one data type to another, giving you control over the conversion.'
      }
    ]
  },
  {
    slug: 'variables-and-types-advanced',
    title: 'Variables and Types: Advanced',
    description: 'Master advanced type systems, generics, and memory management.',
    topic_slug: 'variables_and_types',
    skill_level: 'advanced',
    default_length: 10,
    questions: [
      {
        prompt: 'What is a generic type?',
        options: [
          'A type that works with any data type',
          'A type that is always the same',
          'A type that cannot be used',
          'A type that only works with numbers'
        ],
        correct_index: 0,
        explanation: 'A generic type is a type that can work with any data type, allowing you to write flexible, reusable code that maintains type safety.'
      },
      {
        prompt: 'What is type inference?',
        options: [
          'Guessing the type',
          'Automatic determination of a variable\'s type by the compiler',
          'Manually setting the type',
          'Ignoring the type'
        ],
        correct_index: 1,
        explanation: 'Type inference is when the compiler automatically determines the type of a variable based on its initial value or usage context.'
      },
      {
        prompt: 'What is a union type?',
        options: [
          'A type that combines multiple types',
          'A type that only works in unions',
          'A type that cannot be changed',
          'A type that is always null'
        ],
        correct_index: 0,
        explanation: 'A union type allows a variable to hold values of multiple different types, providing flexibility while maintaining type safety.'
      },
      {
        prompt: 'What is memory allocation for variables?',
        options: [
          'The process of reserving memory space for a variable',
          'Deleting a variable',
          'Changing a variable\'s value',
          'Printing a variable'
        ],
        correct_index: 0,
        explanation: 'Memory allocation is the process of reserving a portion of computer memory to store a variable\'s value.'
      },
      {
        prompt: 'What is a reference type vs a value type?',
        options: [
          'Reference types store addresses, value types store data directly',
          'They are the same',
          'Value types are always larger',
          'Reference types cannot be changed'
        ],
        correct_index: 0,
        explanation: 'Value types store the actual data, while reference types store a reference (address) to where the data is stored in memory.'
      },
      {
        prompt: 'What is type erasure?',
        options: [
          'Removing type information at runtime',
          'Adding type information',
          'Changing types',
          'Creating new types'
        ],
        correct_index: 0,
        explanation: 'Type erasure is a process where generic type information is removed at runtime, typically used in languages like Java for backward compatibility.'
      },
      {
        prompt: 'What is a nullable type?',
        options: [
          'A type that can be null or a value',
          'A type that is always null',
          'A type that cannot be null',
          'A type that is undefined'
        ],
        correct_index: 0,
        explanation: 'A nullable type allows a variable to hold either a value of its base type or null, providing explicit handling of "no value" cases.'
      },
      {
        prompt: 'What is type narrowing?',
        options: [
          'Making a type more specific based on runtime checks',
          'Making a type more general',
          'Deleting type information',
          'Creating a new type'
        ],
        correct_index: 0,
        explanation: 'Type narrowing is the process of refining a type to a more specific type through conditional checks, improving type safety.'
      },
      {
        prompt: 'What is a type guard?',
        options: [
          'A runtime check that narrows a type',
          'A security feature',
          'A type that protects data',
          'A constant variable'
        ],
        correct_index: 0,
        explanation: 'A type guard is a function or expression that performs a runtime check to narrow down the type of a variable, enabling type-safe operations.'
      },
      {
        prompt: 'What is covariance and contravariance?',
        options: [
          'How generic types relate when dealing with inheritance',
          'Types that are always the same',
          'Types that cannot change',
          'Types that are always different'
        ],
        correct_index: 0,
        explanation: 'Covariance and contravariance describe how generic types behave with inheritance - whether they preserve or reverse the inheritance relationship.'
      }
    ]
  },
  // Loops Basics
  {
    slug: 'loops-basics-beginner',
    title: 'Loops Basics: Beginner',
    description: 'Introduction to loops, iteration, and basic loop structures.',
    topic_slug: 'loops_basics',
    skill_level: 'beginner',
    default_length: 5,
    questions: [
      {
        prompt: 'What is the purpose of a loop in programming?',
        options: [
          'To store data',
          'To repeat a block of code multiple times',
          'To create variables',
          'To define functions'
        ],
        correct_index: 1,
        explanation: 'Loops allow you to execute a block of code repeatedly, which is essential for processing collections of data or repeating operations.'
      },
      {
        prompt: 'Which loop type runs a specific number of times?',
        options: [
          'While loop',
          'For loop',
          'If statement',
          'Switch statement'
        ],
        correct_index: 1,
        explanation: 'A for loop typically runs a specific number of times, controlled by a counter variable that increments or decrements.'
      },
      {
        prompt: 'What is an infinite loop?',
        options: [
          'A loop that runs forever',
          'A loop that runs once',
          'A loop that never runs',
          'A loop that is very fast'
        ],
        correct_index: 0,
        explanation: 'An infinite loop is a loop that continues to execute indefinitely because its condition never becomes false. This is usually a bug.'
      },
      {
        prompt: 'What is the purpose of a loop counter?',
        options: [
          'To store the loop result',
          'To track how many times the loop has executed',
          'To break the loop',
          'To create variables'
        ],
        correct_index: 1,
        explanation: 'A loop counter (or index) is a variable that tracks the current iteration number, helping control how many times the loop executes.'
      },
      {
        prompt: 'What does "break" do in a loop?',
        options: [
          'Starts the loop',
          'Exits the loop immediately',
          'Skips to the next iteration',
          'Continues the loop'
        ],
        correct_index: 1,
        explanation: 'The "break" statement immediately exits the loop, regardless of whether the loop condition is still true.'
      }
    ]
  },
  {
    slug: 'loops-basics-intermediate',
    title: 'Loops Basics: Intermediate',
    description: 'Master nested loops, loop control, and iteration patterns.',
    topic_slug: 'loops_basics',
    skill_level: 'intermediate',
    default_length: 5,
    questions: [
      {
        prompt: 'What is a nested loop?',
        options: [
          'A loop inside another loop',
          'A broken loop',
          'A loop that runs backwards',
          'A loop with no condition'
        ],
        correct_index: 0,
        explanation: 'A nested loop is a loop that is placed inside another loop, allowing you to iterate over multi-dimensional data structures.'
      },
      {
        prompt: 'What does "continue" do in a loop?',
        options: [
          'Exits the loop',
          'Skips the rest of the current iteration and continues to the next',
          'Starts the loop over',
          'Pauses the loop'
        ],
        correct_index: 1,
        explanation: 'The "continue" statement skips the remaining code in the current iteration and moves to the next iteration of the loop.'
      },
      {
        prompt: 'What is iteration?',
        options: [
          'One execution of a loop body',
          'The loop condition',
          'The loop variable',
          'Breaking out of a loop'
        ],
        correct_index: 0,
        explanation: 'An iteration is one complete execution of the loop body. A loop with 5 iterations runs its body 5 times.'
      },
      {
        prompt: 'What is the difference between a for loop and a while loop?',
        options: [
          'For loops are faster',
          'For loops are typically used when you know the number of iterations, while loops for unknown iterations',
          'While loops are always better',
          'There is no difference'
        ],
        correct_index: 1,
        explanation: 'For loops are ideal when you know how many times to iterate, while while loops are better when the number of iterations depends on a condition.'
      },
      {
        prompt: 'What is a loop invariant?',
        options: [
          'A condition that is always true during loop execution',
          'A variable that changes',
          'A loop that never runs',
          'A type of loop'
        ],
        correct_index: 0,
        explanation: 'A loop invariant is a condition that remains true before and after each iteration, useful for understanding and proving loop correctness.'
      }
    ]
  },
  {
    slug: 'loops-basics-advanced',
    title: 'Loops Basics: Advanced',
    description: 'Advanced loop patterns, optimization, and functional iteration.',
    topic_slug: 'loops_basics',
    skill_level: 'advanced',
    default_length: 10,
    questions: [
      {
        prompt: 'What is tail recursion?',
        options: [
          'A recursive function where the recursive call is the last operation',
          'A type of loop',
          'A variable',
          'A function that never ends'
        ],
        correct_index: 0,
        explanation: 'Tail recursion is a form of recursion where the recursive call is the last operation in the function, allowing compiler optimization.'
      },
      {
        prompt: 'What is loop unrolling?',
        options: [
          'An optimization technique that reduces loop overhead',
          'Breaking a loop',
          'Making a loop run slower',
          'Creating nested loops'
        ],
        correct_index: 0,
        explanation: 'Loop unrolling is an optimization technique where the loop body is duplicated multiple times to reduce the overhead of loop control.'
      },
      {
        prompt: 'What is a generator function?',
        options: [
          'A function that yields values one at a time',
          'A function that creates loops',
          'A function that always returns the same value',
          'A broken function'
        ],
        correct_index: 0,
        explanation: 'A generator function yields values one at a time, allowing lazy evaluation and memory-efficient iteration over large datasets.'
      },
      {
        prompt: 'What is the time complexity of a nested loop?',
        options: [
          'O(n)',
          'O(n²)',
          'O(log n)',
          'O(1)'
        ],
        correct_index: 1,
        explanation: 'A nested loop where both loops iterate n times has O(n²) time complexity, as the inner loop runs n times for each of n outer iterations.'
      },
      {
        prompt: 'What is iterator invalidation?',
        options: [
          'When an iterator becomes invalid after modifying the collection',
          'When an iterator is created',
          'When an iterator is used correctly',
          'When a loop finishes'
        ],
        correct_index: 0,
        explanation: 'Iterator invalidation occurs when modifying a collection while iterating over it, causing the iterator to point to invalid or unexpected elements.'
      },
      {
        prompt: 'What is a range-based loop?',
        options: [
          'A loop that iterates over a range of values automatically',
          'A loop that only works with arrays',
          'A broken loop',
          'A loop that runs forever'
        ],
        correct_index: 0,
        explanation: 'A range-based loop (for-each loop) automatically iterates over all elements in a collection without needing explicit index management.'
      },
      {
        prompt: 'What is loop fusion?',
        options: [
          'Combining multiple loops into one',
          'Splitting a loop',
          'Breaking a loop',
          'Creating nested loops'
        ],
        correct_index: 0,
        explanation: 'Loop fusion is an optimization technique that combines multiple loops iterating over the same data into a single loop to reduce overhead.'
      },
      {
        prompt: 'What is a sentinel value?',
        options: [
          'A special value that marks the end of a sequence',
          'A loop counter',
          'A variable type',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A sentinel value is a special value (like null or -1) used to mark the end of a data sequence, often used in loop termination conditions.'
      },
      {
        prompt: 'What is early termination in loops?',
        options: [
          'Exiting a loop before all iterations complete',
          'Starting a loop early',
          'Running a loop forever',
          'Creating a new loop'
        ],
        correct_index: 0,
        explanation: 'Early termination exits a loop as soon as a condition is met, improving efficiency by avoiding unnecessary iterations.'
      },
      {
        prompt: 'What is the difference between map and forEach?',
        options: [
          'map returns a new array, forEach returns undefined',
          'They are identical',
          'forEach is faster',
          'map cannot be used in loops'
        ],
        correct_index: 0,
        explanation: 'map creates and returns a new array with transformed elements, while forEach executes a function for each element but returns undefined.'
      }
    ]
  },
  // Debugging Basics
  {
    slug: 'debugging-basics-beginner',
    title: 'Debugging Basics: Beginner',
    description: 'Learn fundamental debugging techniques and tools.',
    topic_slug: 'debugging_basics',
    skill_level: 'beginner',
    default_length: 5,
    questions: [
      {
        prompt: 'What is debugging?',
        options: [
          'Writing code',
          'Finding and fixing errors in code',
          'Deleting code',
          'Running code'
        ],
        correct_index: 1,
        explanation: 'Debugging is the process of identifying, locating, and fixing errors (bugs) in your code.'
      },
      {
        prompt: 'What is a breakpoint?',
        options: [
          'A point where code execution pauses',
          'A type of error',
          'A variable',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A breakpoint is a marker you set in your code that causes execution to pause, allowing you to inspect the program state.'
      },
      {
        prompt: 'What is the purpose of print statements in debugging?',
        options: [
          'To display output to users',
          'To track variable values and program flow',
          'To create errors',
          'To stop the program'
        ],
        correct_index: 1,
        explanation: 'Print statements (console.log, etc.) help you see what values variables have at different points in your program execution.'
      },
      {
        prompt: 'What is a syntax error?',
        options: [
          'An error in the structure of your code',
          'A logic error',
          'A runtime error',
          'A spelling mistake'
        ],
        correct_index: 0,
        explanation: 'A syntax error occurs when code violates the language\'s grammar rules, preventing it from being parsed correctly.'
      },
      {
        prompt: 'What is a runtime error?',
        options: [
          'An error that occurs while the program is running',
          'An error in syntax',
          'An error that never happens',
          'A type of variable'
        ],
        correct_index: 0,
        explanation: 'A runtime error occurs during program execution, often due to invalid operations like dividing by zero or accessing null references.'
      }
    ]
  },
  {
    slug: 'debugging-basics-intermediate',
    title: 'Debugging Basics: Intermediate',
    description: 'Advanced debugging techniques, logging, and error handling.',
    topic_slug: 'debugging_basics',
    skill_level: 'intermediate',
    default_length: 5,
    questions: [
      {
        prompt: 'What is step-through debugging?',
        options: [
          'Executing code line by line to inspect behavior',
          'Running code at full speed',
          'Skipping all code',
          'Deleting code'
        ],
        correct_index: 0,
        explanation: 'Step-through debugging allows you to execute code one line at a time, inspecting variable values and program state at each step.'
      },
      {
        prompt: 'What is a watch expression?',
        options: [
          'An expression you monitor during debugging',
          'A type of loop',
          'A variable name',
          'A function call'
        ],
        correct_index: 0,
        explanation: 'A watch expression is a variable or expression you monitor during debugging, automatically updating as the program executes.'
      },
      {
        prompt: 'What is the call stack?',
        options: [
          'A list of function calls leading to the current point',
          'A data structure',
          'A type of error',
          'A variable'
        ],
        correct_index: 0,
        explanation: 'The call stack shows the sequence of function calls that led to the current execution point, helping trace program flow.'
      },
      {
        prompt: 'What is exception handling?',
        options: [
          'Catching and managing errors gracefully',
          'Ignoring errors',
          'Creating errors',
          'Deleting errors'
        ],
        correct_index: 0,
        explanation: 'Exception handling uses try-catch blocks to catch errors and handle them gracefully, preventing program crashes.'
      },
      {
        prompt: 'What is logging?',
        options: [
          'Recording program events and state for debugging',
          'Creating errors',
          'Deleting code',
          'Running tests'
        ],
        correct_index: 0,
        explanation: 'Logging is the practice of recording program events, variable values, and state information to help diagnose issues.'
      }
    ]
  },
  {
    slug: 'debugging-basics-advanced',
    title: 'Debugging Basics: Advanced',
    description: 'Master advanced debugging, profiling, and performance analysis.',
    topic_slug: 'debugging_basics',
    skill_level: 'advanced',
    default_length: 10,
    questions: [
      {
        prompt: 'What is a profiler?',
        options: [
          'A tool that measures program performance',
          'A type of debugger',
          'A variable',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A profiler is a tool that measures program performance, identifying bottlenecks and resource usage patterns.'
      },
      {
        prompt: 'What is memory debugging?',
        options: [
          'Finding memory leaks and allocation issues',
          'Deleting memory',
          'Creating memory',
          'Ignoring memory'
        ],
        correct_index: 0,
        explanation: 'Memory debugging involves identifying memory leaks, invalid memory access, and inefficient memory usage patterns.'
      },
      {
        prompt: 'What is a race condition?',
        options: [
          'A bug where timing affects program behavior',
          'A type of loop',
          'A variable',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A race condition occurs when program behavior depends on the relative timing of events, often in concurrent or parallel code.'
      },
      {
        prompt: 'What is a debugger?',
        options: [
          'A tool for interactive debugging',
          'A type of error',
          'A programming language',
          'A variable type'
        ],
        correct_index: 0,
        explanation: 'A debugger is a tool that allows you to pause execution, inspect variables, step through code, and analyze program state.'
      },
      {
        prompt: 'What is a stack trace?',
        options: [
          'A report showing the call sequence when an error occurred',
          'A type of loop',
          'A variable',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A stack trace shows the sequence of function calls that led to an error, helping identify where the problem originated.'
      },
      {
        prompt: 'What is conditional breakpoint?',
        options: [
          'A breakpoint that only triggers when a condition is met',
          'A breakpoint that always triggers',
          'A type of error',
          'A variable'
        ],
        correct_index: 0,
        explanation: 'A conditional breakpoint pauses execution only when a specified condition is true, useful for debugging specific scenarios.'
      },
      {
        prompt: 'What is remote debugging?',
        options: [
          'Debugging code running on a different machine',
          'Debugging without a computer',
          'Debugging that is always remote',
          'A type of error'
        ],
        correct_index: 0,
        explanation: 'Remote debugging allows you to debug code running on a different machine or environment than your development setup.'
      },
      {
        prompt: 'What is a core dump?',
        options: [
          'A file containing program memory state at crash time',
          'A type of loop',
          'A variable',
          'A function'
        ],
        correct_index: 0,
        explanation: 'A core dump is a file containing the memory state of a program when it crashed, useful for post-mortem debugging.'
      },
      {
        prompt: 'What is symbolic debugging?',
        options: [
          'Debugging using variable names instead of memory addresses',
          'Debugging with symbols',
          'A type of error',
          'A programming language'
        ],
        correct_index: 0,
        explanation: 'Symbolic debugging uses variable names and source code information rather than raw memory addresses, making debugging easier.'
      },
      {
        prompt: 'What is a debug build?',
        options: [
          'A version with debugging information included',
          'A broken build',
          'A release build',
          'A test build'
        ],
        correct_index: 0,
        explanation: 'A debug build includes debugging symbols and information, making it easier to debug but typically larger and slower than release builds.'
      }
    ]
  }
];

async function seedQuizzes() {
  let sql;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    sql = postgres(process.env.DATABASE_URL);

    console.log('🌱 Seeding quizzes...\n');

    for (const quizData of sampleQuizzes) {
      // Insert quiz
      const [quiz] = await sql`
        INSERT INTO quizzes (slug, title, description, topic_slug, skill_level, default_length)
        VALUES (${quizData.slug}, ${quizData.title}, ${quizData.description}, ${quizData.topic_slug}, ${quizData.skill_level}, ${quizData.default_length})
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          topic_slug = EXCLUDED.topic_slug,
          skill_level = EXCLUDED.skill_level,
          default_length = EXCLUDED.default_length,
          updated_at = NOW()
        RETURNING id
      `;

      const quizId = quiz.id;

      // Delete existing questions for this quiz (in case of update)
      await sql`DELETE FROM quiz_questions WHERE quiz_id = ${quizId}`;

      // Insert questions
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        await sql`
          INSERT INTO quiz_questions (quiz_id, order_index, prompt, options, correct_index, explanation)
          VALUES (${quizId}, ${i + 1}, ${question.prompt}, ${JSON.stringify(question.options)}::jsonb, ${question.correct_index}, ${question.explanation || null})
        `;
      }

      console.log(`✓ Created quiz: "${quizData.title}" (${quizData.questions.length} questions)`);
    }

    console.log(`\nSuccessfully seeded ${sampleQuizzes.length} quizzes!`);
    console.log(`Total questions: ${sampleQuizzes.reduce((sum, q) => sum + q.questions.length, 0)}`);

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    if (sql) await sql.end();
    process.exit(1);
  }
}

seedQuizzes();

