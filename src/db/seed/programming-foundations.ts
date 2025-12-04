import { generateCalloutJson, generateCodeBlockJson, generateFlipCardJson, generateDragOrderExerciseJson } from './helpers';

/**
 * Programming Foundations Course Content
 * Target: Beginners with no programming experience
 * Language: Python
 */

export function getProgrammingFoundationsLessons(courseId: number) {
  return [
    {
      slug: "programming-foundations-0-showcase",
      title: "Interactive Features Demo",
      description: "Explore all the interactive learning features available in this course",
      difficulty: "easy" as const,
      estimated_duration_sec: 900,
      parent_lesson_id: courseId,
      order_index: 0,
      icon: "🎨",
      is_published: true,
    },
    {
      slug: "programming-foundations-1-introduction",
      title: "Introduction to Programming",
      description: "Learn what programming is and why it matters in today's world",
      difficulty: "easy" as const,
      estimated_duration_sec: 1800,
      parent_lesson_id: courseId,
      order_index: 1,
      icon: "📚",
      is_published: true,
    },
    {
      slug: "programming-foundations-2-variables",
      title: "Variables and Data Types",
      description: "Understand how to store and work with different types of data",
      difficulty: "easy" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 2,
      icon: "📝",
      is_published: true,
    },
    {
      slug: "programming-foundations-3-control-structures",
      title: "Control Structures",
      description: "Learn to make decisions and control program flow",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 3,
      icon: "🔀",
      is_published: true,
    },
    {
      slug: "programming-foundations-4-functions",
      title: "Functions and Methods",
      description: "Organize your code into reusable blocks with functions",
      difficulty: "standard" as const,
      estimated_duration_sec: 3600,
      parent_lesson_id: courseId,
      order_index: 4,
      icon: "⚡",
      is_published: true,
    },
    {
      slug: "programming-foundations-5-arrays",
      title: "Lists and Collections",
      description: "Work with collections of data using lists",
      difficulty: "standard" as const,
      estimated_duration_sec: 2700,
      parent_lesson_id: courseId,
      order_index: 5,
      icon: "📊",
      is_published: true,
    },
  ];
}

export function getLesson0Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "callouts-showcase",
      title: "Callouts - Highlight Important Information",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Different Callout Types' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Callouts help draw attention to important information. Here are all the available types:' }] },
          generateCalloutJson('tip', 'Tips provide helpful suggestions and best practices.').content[0],
          generateCalloutJson('info', 'Info callouts provide additional context and background information.').content[0],
          generateCalloutJson('success', 'Success callouts highlight positive outcomes and achievements.').content[0],
          generateCalloutJson('warning', 'Warnings alert you to potential pitfalls and important caveats.').content[0],
          generateCalloutJson('error', 'Error callouts point out common mistakes to avoid.').content[0],
          generateCalloutJson('note', 'Notes provide supplementary information worth remembering.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "code-blocks-showcase",
      title: "Code Blocks - Syntax Highlighted Examples",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Enhanced Code Blocks' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Code blocks support syntax highlighting for multiple languages:' }] },
          { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Python Example' }] },
          generateCodeBlockJson('python', 'def greet(name):\n    print(f"Hello, {name}!")\n    return True\n\ngreet("World")', 'example.py').content[0],
          { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'JavaScript Example' }] },
          generateCodeBlockJson('javascript', 'function calculateSum(numbers) {\n  return numbers.reduce((a, b) => a + b, 0);\n}\n\nconsole.log(calculateSum([1, 2, 3, 4, 5]));', 'sum.js').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "quiz-showcase",
      title: "Quiz Questions - Test Your Knowledge",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Quiz' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Test your understanding with interactive multiple-choice questions:' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'The print() function in Python displays output to the console.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What function displays output in Python?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'echo()' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'print()' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'output()' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'display()' }] }] },
            ],
          },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "drag-order-showcase",
      title: "Drag & Drop - Order Steps Correctly",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Ordering Exercise' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Practice by arranging items in the correct order:' }] },
          generateDragOrderExerciseJson().content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "flip-cards-showcase",
      title: "Flip Cards - Review Key Concepts",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Flash Cards' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Click on cards to reveal the answer:' }] },
          generateFlipCardJson().content[0],
        ],
      },
    },
  ];
}

export function getLesson1Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-programming",
      title: "What is Programming?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Programming?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Programming is the art of giving instructions to a computer. Think of it like writing a very detailed recipe—except instead of cooking food, you\'re telling a computer exactly what to do, step by step.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Computers are incredibly fast but surprisingly literal. They do exactly what you tell them—nothing more, nothing less. This means your instructions need to be precise and unambiguous.' }] },
          generateCalloutJson('info', 'A program is simply a set of instructions written in a language that computers can understand and execute.').content[0],
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Real-World Analogy' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Imagine giving directions to someone who takes everything literally. If you say "walk forward," they\'ll walk until they hit a wall. You need to say "walk forward 10 steps, then stop." Programming works the same way—you must be explicit about every action.' }] },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "how-computers-execute-code",
      title: "How Computers Execute Code",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'How Computers Execute Code' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'When you write code, it goes through a process before the computer can run it. Your human-readable code gets translated into machine code—a language of 1s and 0s that the computer\'s processor understands.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'The Execution Process' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '1. You write code in a programming language (like Python)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '2. An interpreter or compiler translates your code' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '3. The computer executes the instructions line by line' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '4. Results are displayed or stored' }] },
          generateCalloutJson('tip', 'Python is an interpreted language, meaning your code is translated and executed line by line in real-time. This makes it great for learning and quick experimentation!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "programming-languages",
      title: "Programming Languages",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Programming Languages' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Just like humans have many languages (English, Spanish, Mandarin), computers have many programming languages. Each language has its own syntax (grammar rules) and is suited for different tasks.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Popular Languages' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Python' },
            { type: 'text', text: ' - Great for beginners, data science, and automation' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'JavaScript' },
            { type: 'text', text: ' - Powers interactive websites and web applications' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Java' },
            { type: 'text', text: ' - Used for Android apps and enterprise software' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'C++' },
            { type: 'text', text: ' - High performance, used in games and systems programming' }
          ]},
          generateCalloutJson('note', 'In this course, we\'ll use Python because of its clean, readable syntax that\'s perfect for learning programming concepts.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "your-first-program",
      title: "Your First Program",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Your First Program' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Let\'s write your first program! By tradition, every programmer\'s first program displays "Hello, World!" on the screen. It\'s simple but meaningful—you\'re communicating with a computer!' }] },
          generateCodeBlockJson('python', 'print("Hello, World!")', 'hello.py').content[0],
          { type: 'paragraph', content: [{ type: 'text', text: 'When you run this code, Python executes the print() function, which displays the text inside the parentheses to the screen.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Breaking It Down' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'print' },
            { type: 'text', text: ' - A built-in function that outputs text' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '( )' },
            { type: 'text', text: ' - Parentheses hold what we want to print' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '"Hello, World!"' },
            { type: 'text', text: ' - The text (string) to display' }
          ]},
          generateCalloutJson('success', 'Congratulations! You now understand the basic structure of a program. Every complex application, from video games to AI, is built from simple instructions like this.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "comments-and-readability",
      title: "Comments and Code Readability",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Comments and Code Readability' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Good programmers write code that humans can understand, not just computers. Comments are notes you leave in your code to explain what it does.' }] },
          generateCodeBlockJson('python', '# This is a comment - Python ignores this line\nprint("Hello!")  # Comments can also go at the end of a line\n\n# Comments help explain WHY you wrote something\n# They\'re essential for complex code', 'comments.py').content[0],
          generateCalloutJson('tip', 'Write comments for your future self. Code you wrote 6 months ago might as well have been written by a stranger!').content[0],
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Best Practices' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Use comments to explain WHY, not WHAT (the code shows what)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Keep comments up to date when you change code' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Use meaningful variable names to reduce the need for comments' }] },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 5,
      slug: "lesson-1-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Let\'s test what you\'ve learned about programming basics!' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'The print() function in Python displays text or values to the screen. It\'s one of the most commonly used functions for output.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does the print() function do in Python?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Saves data to a file' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Displays output to the screen' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Creates a new variable' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Prints a physical document' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'c',
              explanation: 'Comments (lines starting with #) are ignored by Python. They\'re notes for humans reading the code, not instructions for the computer.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What happens when Python encounters a line starting with #?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It throws an error' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It prints the line' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It ignores the line (it\'s a comment)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It runs faster' }] }] },
            ],
          },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 6,
      slug: "key-terms",
      title: "Key Terms",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Key Terms to Remember' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Click the cards to reveal definitions:' }] },
          {
            type: 'flipCardGroup',
            attrs: { columns: 2 },
            content: [
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Program' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A set of instructions that tells a computer what to do.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Syntax' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The rules that define how code must be written in a programming language.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Interpreter' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A program that executes code line by line (Python uses this).' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Comment' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A note in code that the computer ignores, written for human readers.' }] }] },
                ],
              },
            ],
          },
        ],
      },
    },
  ];
}

export function getLesson2Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-are-variables",
      title: "What Are Variables?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What Are Variables?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Variables are like labeled boxes where you store information. Just like you might have a box labeled "Photos" that contains your pictures, a variable has a name and holds a value.' }] },
          generateCodeBlockJson('python', '# Creating variables\nname = "Alice"\nage = 25\nis_student = True\n\nprint(name)    # Output: Alice\nprint(age)     # Output: 25', 'variables.py').content[0],
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Why Use Variables?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Store data for later use' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Make code readable (descriptive names)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Change values in one place' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Perform calculations and transformations' }] },
          generateCalloutJson('tip', 'Choose descriptive variable names! "user_age" is much clearer than "x" or "a".').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "naming-variables",
      title: "Naming Variables",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Naming Variables' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python has rules for naming variables:' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Rules (Must Follow)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Must start with a letter or underscore (_)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Can contain letters, numbers, and underscores' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Cannot use reserved words (like "print", "if", "for")' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '• Case-sensitive (name ≠ Name ≠ NAME)' }] },
          generateCodeBlockJson('python', '# Valid variable names\nuser_name = "Alice"\n_private = 42\ncount2 = 10\n\n# Invalid variable names (will cause errors)\n# 2count = 10    # Can\'t start with number\n# my-var = 5    # Can\'t use hyphens\n# class = "A"   # Can\'t use reserved words', 'naming.py').content[0],
          generateCalloutJson('info', 'Python convention is snake_case for variables (words_separated_by_underscores).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "data-types-intro",
      title: "Data Types",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Data Types' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Every piece of data has a type. Python needs to know what kind of data you\'re working with so it knows what operations are allowed.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Core Data Types' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'int' },
            { type: 'text', text: ' - Whole numbers: 42, -7, 0' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'float' },
            { type: 'text', text: ' - Decimal numbers: 3.14, -0.5, 2.0' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'str' },
            { type: 'text', text: ' - Text (strings): "Hello", \'World\'' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'bool' },
            { type: 'text', text: ' - True or False values' }
          ]},
          generateCodeBlockJson('python', '# Check the type of any variable\nage = 25\nprint(type(age))      # <class \'int\'>\n\ntemperature = 98.6\nprint(type(temperature))  # <class \'float\'>\n\nname = "Alice"\nprint(type(name))     # <class \'str\'>\n\nis_active = True\nprint(type(is_active))  # <class \'bool\'>', 'types.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "strings-in-depth",
      title: "Working with Strings",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Working with Strings' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Strings are sequences of characters (text). They\'re one of the most commonly used data types.' }] },
          generateCodeBlockJson('python', '# Creating strings\nsingle = \'Hello\'\ndouble = "World"\nmulti_line = """This string\nspans multiple\nlines"""\n\n# Combining strings (concatenation)\nfull_name = "Alice" + " " + "Smith"\nprint(full_name)  # Alice Smith\n\n# String with variables (f-strings)\nname = "Bob"\nage = 30\nmessage = f"My name is {name} and I am {age} years old"\nprint(message)', 'strings.py').content[0],
          generateCalloutJson('tip', 'F-strings (formatted strings) are the cleanest way to include variables in text. Just add f before the quote and use {variable_name}.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "numbers-and-math",
      title: "Numbers and Math Operations",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Numbers and Math Operations' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python can perform all standard math operations with numbers.' }] },
          generateCodeBlockJson('python', '# Basic math\na = 10\nb = 3\n\nprint(a + b)   # Addition: 13\nprint(a - b)   # Subtraction: 7\nprint(a * b)   # Multiplication: 30\nprint(a / b)   # Division: 3.333...\nprint(a // b)  # Floor division: 3 (rounds down)\nprint(a % b)   # Modulo (remainder): 1\nprint(a ** b)  # Exponent: 1000 (10^3)', 'math.py').content[0],
          generateCalloutJson('warning', 'Division (/) always returns a float in Python 3, even if the result is a whole number. Use // for integer division.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 5,
      slug: "type-conversion",
      title: "Type Conversion",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Type Conversion' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Sometimes you need to convert data from one type to another. Python provides built-in functions for this.' }] },
          generateCodeBlockJson('python', '# Converting between types\nnum_str = "42"\nnum_int = int(num_str)    # String to integer\nprint(num_int + 8)        # 50\n\nage = 25\nage_str = str(age)        # Integer to string\nprint("Age: " + age_str)  # Age: 25\n\nprice = 19.99\nprice_int = int(price)    # Float to integer (truncates)\nprint(price_int)          # 19', 'conversion.py').content[0],
          generateCalloutJson('error', 'You can\'t convert invalid strings to numbers. int("hello") will crash! Always validate user input.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 6,
      slug: "lesson-2-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'c',
              explanation: 'Strings in Python are created by wrapping text in quotes (single or double). Numbers without quotes are integers or floats.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the data type of "42" (with quotes)?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'int' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'float' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'str (string)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'bool' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'The modulo operator (%) returns the remainder of division. 10 ÷ 3 = 3 remainder 1.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does 10 % 3 return in Python?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '3' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '3.33' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '0.3' }] }] },
            ],
          },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 7,
      slug: "key-terms-2",
      title: "Key Terms",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Key Terms' }] },
          {
            type: 'flipCardGroup',
            attrs: { columns: 2 },
            content: [
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Variable' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A named container that stores a value which can be used and changed throughout your program.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Data Type' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A classification that specifies what kind of value a variable holds (int, float, str, bool).' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'String' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A sequence of characters (text) enclosed in quotes.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Type Conversion' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Converting a value from one data type to another (e.g., int() to str()).' }] }] },
                ],
              },
            ],
          },
        ],
      },
    },
  ];
}

export function getLesson3Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "intro-control-flow",
      title: "Introduction to Control Flow",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction to Control Flow' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'So far, our programs run from top to bottom, executing every line. But real programs need to make decisions and repeat actions. Control flow lets you direct which code runs and when.' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Two Main Types' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Conditional Statements' },
            { type: 'text', text: ' - Run code only if certain conditions are true' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Loops' },
            { type: 'text', text: ' - Repeat code multiple times' }
          ]},
          generateCalloutJson('info', 'Control flow is what separates simple scripts from powerful programs. It\'s the foundation of all logic in programming.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "comparison-operators",
      title: "Comparison Operators",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Comparison Operators' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Before making decisions, you need to compare values. Comparison operators return True or False.' }] },
          generateCodeBlockJson('python', '# Comparison operators\na = 10\nb = 5\n\nprint(a == b)   # Equal to: False\nprint(a != b)   # Not equal to: True\nprint(a > b)    # Greater than: True\nprint(a < b)    # Less than: False\nprint(a >= b)   # Greater than or equal: True\nprint(a <= b)   # Less than or equal: False', 'comparisons.py').content[0],
          generateCalloutJson('warning', 'Don\'t confuse = (assignment) with == (comparison). a = 5 sets a to 5, while a == 5 checks if a equals 5.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "if-statements",
      title: "If Statements",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'If Statements' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'The if statement runs code only when a condition is true.' }] },
          generateCodeBlockJson('python', 'age = 18\n\nif age >= 18:\n    print("You are an adult")\n    print("You can vote")\n\nprint("This always runs")  # Outside the if block', 'if_basic.py').content[0],
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Indentation Matters!' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python uses indentation (spaces) to determine which code belongs to the if block. Everything indented after the if runs when the condition is true.' }] },
          generateCalloutJson('tip', 'Use 4 spaces for indentation (most editors do this automatically when you press Tab).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "if-else-elif",
      title: "If-Else and Elif",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'If-Else and Elif' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Use else to run code when the condition is false. Use elif (else if) to check multiple conditions.' }] },
          generateCodeBlockJson('python', 'score = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelif score >= 60:\n    grade = "D"\nelse:\n    grade = "F"\n\nprint(f"Your grade is: {grade}")  # Output: Your grade is: B', 'grades.py').content[0],
          generateCalloutJson('note', 'Python checks conditions top to bottom and runs the first block that\'s true. Once one matches, it skips the rest.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "logical-operators",
      title: "Logical Operators",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Logical Operators' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Combine multiple conditions using and, or, and not.' }] },
          generateCodeBlockJson('python', 'age = 25\nhas_license = True\n\n# and - both conditions must be true\nif age >= 18 and has_license:\n    print("You can drive")\n\n# or - at least one condition must be true\nif age < 13 or age >= 65:\n    print("Eligible for discount")\n\n# not - reverses the condition\nis_banned = False\nif not is_banned:\n    print("Welcome!")', 'logical.py').content[0],
          generateCalloutJson('tip', 'Read conditions out loud: "if age is greater than 18 AND has license" helps you understand the logic.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 5,
      slug: "while-loops",
      title: "While Loops",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'While Loops' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A while loop repeats code as long as a condition is true.' }] },
          generateCodeBlockJson('python', '# Count from 1 to 5\ncount = 1\n\nwhile count <= 5:\n    print(count)\n    count = count + 1  # or: count += 1\n\nprint("Done!")\n\n# Output:\n# 1\n# 2\n# 3\n# 4\n# 5\n# Done!', 'while_loop.py').content[0],
          generateCalloutJson('error', 'Watch out for infinite loops! Always make sure the condition will eventually become False. If you forget to update count, the loop runs forever.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 6,
      slug: "for-loops",
      title: "For Loops",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'For Loops' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A for loop iterates over a sequence (like a range of numbers or a list).' }] },
          generateCodeBlockJson('python', '# Using range() to loop a specific number of times\nfor i in range(5):\n    print(i)  # Prints 0, 1, 2, 3, 4\n\n# range(start, stop)\nfor i in range(1, 6):\n    print(i)  # Prints 1, 2, 3, 4, 5\n\n# Looping through a string\nfor letter in "Hello":\n    print(letter)  # Prints H, e, l, l, o', 'for_loop.py').content[0],
          generateCalloutJson('info', 'range(5) generates numbers 0 through 4. The stop value is not included!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 7,
      slug: "break-continue",
      title: "Break and Continue",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Break and Continue' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Control loop execution with break (exit the loop) and continue (skip to next iteration).' }] },
          generateCodeBlockJson('python', '# break - exit the loop entirely\nfor num in range(10):\n    if num == 5:\n        break\n    print(num)  # Prints 0, 1, 2, 3, 4\n\n# continue - skip this iteration, continue to next\nfor num in range(5):\n    if num == 2:\n        continue\n    print(num)  # Prints 0, 1, 3, 4 (skips 2)', 'break_continue.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 8,
      slug: "lesson-3-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'range(3) generates 0, 1, 2 (three numbers starting from 0). The stop value (3) is not included.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does range(3) generate?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '1, 2, 3' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '0, 1, 2' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '0, 1, 2, 3' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '3' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'a',
              explanation: 'The "and" operator requires both conditions to be true. Since 5 > 3 is true AND 10 > 5 is true, the result is True.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the result of: 5 > 3 and 10 > 5?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'True' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'False' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Error' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: '5' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

export function getLesson4Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-are-functions",
      title: "What Are Functions?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What Are Functions?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Functions are reusable blocks of code that perform a specific task. Instead of writing the same code multiple times, you write it once in a function and call it whenever you need it.' }] },
          generateCodeBlockJson('python', '# Without functions (repetitive)\nprint("Hello, Alice!")\nprint("Welcome to the program.")\n\nprint("Hello, Bob!")\nprint("Welcome to the program.")\n\n# With a function (reusable)\ndef greet(name):\n    print(f"Hello, {name}!")\n    print("Welcome to the program.")\n\ngreet("Alice")\ngreet("Bob")', 'functions_intro.py').content[0],
          generateCalloutJson('tip', 'Functions help you follow the DRY principle: Don\'t Repeat Yourself!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "defining-functions",
      title: "Defining Functions",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Defining Functions' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Use the def keyword to define a function.' }] },
          generateCodeBlockJson('python', '# Basic function structure\ndef function_name():\n    # Code block (indented)\n    print("This is inside the function")\n\n# Calling the function\nfunction_name()  # Runs the code inside', 'defining.py').content[0],
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Anatomy of a Function' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'def' },
            { type: 'text', text: ' - Keyword that starts a function definition' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'function_name' },
            { type: 'text', text: ' - Name you choose (use snake_case)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '()' },
            { type: 'text', text: ' - Parentheses for parameters (can be empty)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: ':' },
            { type: 'text', text: ' - Colon marks the start of the function body' }
          ]},
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "parameters-arguments",
      title: "Parameters and Arguments",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Parameters and Arguments' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Parameters let you pass data into functions. They\'re like variables that receive values when the function is called.' }] },
          generateCodeBlockJson('python', '# Parameters are defined in the function\ndef greet(name):       # "name" is a parameter\n    print(f"Hello, {name}!")\n\n# Arguments are passed when calling\ngreet("Alice")         # "Alice" is an argument\ngreet("Bob")\n\n# Multiple parameters\ndef add(a, b):\n    result = a + b\n    print(f"{a} + {b} = {result}")\n\nadd(5, 3)   # Output: 5 + 3 = 8\nadd(10, 20) # Output: 10 + 20 = 30', 'parameters.py').content[0],
          generateCalloutJson('info', 'Parameter = variable in function definition. Argument = actual value passed when calling.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "return-values",
      title: "Return Values",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Return Values' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Functions can send back a result using the return keyword. This lets you use the function\'s output in other parts of your code.' }] },
          generateCodeBlockJson('python', '# Function that returns a value\ndef add(a, b):\n    return a + b\n\n# Store the returned value\nresult = add(5, 3)\nprint(result)  # Output: 8\n\n# Use directly in expressions\ntotal = add(10, 20) + add(5, 5)\nprint(total)   # Output: 40\n\n# Multiple operations\ndef calculate_area(width, height):\n    area = width * height\n    return area\n\nroom_area = calculate_area(10, 12)\nprint(f"Room area: {room_area} sq ft")  # Output: Room area: 120 sq ft', 'return.py').content[0],
          generateCalloutJson('note', 'A function without a return statement returns None by default.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "default-parameters",
      title: "Default Parameters",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Default Parameters' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'You can give parameters default values. If the caller doesn\'t provide that argument, the default is used.' }] },
          generateCodeBlockJson('python', '# Default parameter values\ndef greet(name, greeting="Hello"):\n    print(f"{greeting}, {name}!")\n\ngreet("Alice")              # Output: Hello, Alice!\ngreet("Bob", "Hi")          # Output: Hi, Bob!\ngreet("Carol", "Welcome")   # Output: Welcome, Carol!\n\n# Multiple defaults\ndef make_coffee(size="medium", milk=False, sugar=0):\n    order = f"{size} coffee"\n    if milk:\n        order += " with milk"\n    if sugar > 0:\n        order += f" and {sugar} sugar(s)"\n    return order\n\nprint(make_coffee())                    # medium coffee\nprint(make_coffee("large", True, 2))    # large coffee with milk and 2 sugar(s)', 'defaults.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 5,
      slug: "scope",
      title: "Variable Scope",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Variable Scope' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Scope determines where a variable can be accessed. Variables created inside a function are local—they only exist inside that function.' }] },
          generateCodeBlockJson('python', '# Local scope - variable only exists inside function\ndef my_function():\n    local_var = "I\'m local"\n    print(local_var)\n\nmy_function()  # Works: prints "I\'m local"\n# print(local_var)  # Error! local_var doesn\'t exist here\n\n# Global scope - variable accessible everywhere\nglobal_var = "I\'m global"\n\ndef another_function():\n    print(global_var)  # Can read global variables\n\nanother_function()  # Works: prints "I\'m global"', 'scope.py').content[0],
          generateCalloutJson('warning', 'Avoid modifying global variables inside functions. It makes code hard to understand and debug.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 6,
      slug: "lesson-4-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'd',
              explanation: 'The return keyword sends a value back to the caller. Without return, the function would print but not give back a usable value.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What keyword sends a value back from a function?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'send' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'output' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'give' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'return' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'When greeting is not provided, it uses the default value "Hello". So greet("Alice") outputs "Hello, Alice!"',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Given: def greet(name, greeting="Hello"): print(f"{greeting}, {name}!"). What does greet("Alice") print?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Error' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello, Alice!' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: ', Alice!' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

export function getLesson5Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "intro-to-lists",
      title: "Introduction to Lists",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction to Lists' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Lists let you store multiple values in a single variable. They\'re ordered, changeable, and can contain different data types.' }] },
          generateCodeBlockJson('python', '# Creating lists\nfruits = ["apple", "banana", "cherry"]\nnumbers = [1, 2, 3, 4, 5]\nmixed = [1, "hello", True, 3.14]\nempty = []\n\nprint(fruits)   # [\'apple\', \'banana\', \'cherry\']\nprint(len(fruits))  # 3 (number of items)', 'lists_intro.py').content[0],
          generateCalloutJson('info', 'Lists are one of Python\'s most versatile data structures. You\'ll use them constantly!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "accessing-elements",
      title: "Accessing List Elements",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Accessing List Elements' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Access items by their index (position). Python uses zero-based indexing, meaning the first item is at index 0.' }] },
          generateCodeBlockJson('python', 'fruits = ["apple", "banana", "cherry", "date"]\n\n# Positive indexing (from start)\nprint(fruits[0])   # apple (first item)\nprint(fruits[1])   # banana (second item)\nprint(fruits[3])   # date (fourth item)\n\n# Negative indexing (from end)\nprint(fruits[-1])  # date (last item)\nprint(fruits[-2])  # cherry (second to last)', 'indexing.py').content[0],
          generateCalloutJson('warning', 'Accessing an index that doesn\'t exist causes an IndexError. Always check the list length first!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "modifying-lists",
      title: "Modifying Lists",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Modifying Lists' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Lists are mutable—you can change their contents after creation.' }] },
          generateCodeBlockJson('python', 'fruits = ["apple", "banana", "cherry"]\n\n# Change an item\nfruits[1] = "blueberry"\nprint(fruits)  # [\'apple\', \'blueberry\', \'cherry\']\n\n# Add items\nfruits.append("date")       # Add to end\nprint(fruits)  # [\'apple\', \'blueberry\', \'cherry\', \'date\']\n\nfruits.insert(1, "apricot") # Insert at index 1\nprint(fruits)  # [\'apple\', \'apricot\', \'blueberry\', \'cherry\', \'date\']\n\n# Remove items\nfruits.remove("cherry")     # Remove by value\npopped = fruits.pop()       # Remove and return last item\nprint(popped)  # date\nprint(fruits)  # [\'apple\', \'apricot\', \'blueberry\']', 'modifying.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "list-slicing",
      title: "List Slicing",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'List Slicing' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Slicing lets you extract a portion of a list using [start:stop:step].' }] },
          generateCodeBlockJson('python', 'numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\n\n# Basic slicing [start:stop] (stop is excluded)\nprint(numbers[2:5])    # [2, 3, 4]\nprint(numbers[:4])     # [0, 1, 2, 3] (from start)\nprint(numbers[6:])     # [6, 7, 8, 9] (to end)\n\n# With step [start:stop:step]\nprint(numbers[::2])    # [0, 2, 4, 6, 8] (every 2nd)\nprint(numbers[1::2])   # [1, 3, 5, 7, 9] (odd positions)\n\n# Reverse a list\nprint(numbers[::-1])   # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]', 'slicing.py').content[0],
          generateCalloutJson('tip', 'Slicing creates a new list—the original remains unchanged.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "looping-through-lists",
      title: "Looping Through Lists",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Looping Through Lists' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Use for loops to process each item in a list.' }] },
          generateCodeBlockJson('python', 'fruits = ["apple", "banana", "cherry"]\n\n# Loop through items\nfor fruit in fruits:\n    print(fruit)\n\n# Loop with index using enumerate()\nfor index, fruit in enumerate(fruits):\n    print(f"{index}: {fruit}")\n# Output:\n# 0: apple\n# 1: banana\n# 2: cherry\n\n# Sum all numbers in a list\nnumbers = [10, 20, 30, 40]\ntotal = 0\nfor num in numbers:\n    total += num\nprint(f"Sum: {total}")  # Sum: 100', 'looping.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 5,
      slug: "list-methods",
      title: "Common List Methods",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Common List Methods' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python lists come with many built-in methods.' }] },
          generateCodeBlockJson('python', 'numbers = [3, 1, 4, 1, 5, 9, 2, 6]\n\n# Sorting\nnumbers.sort()              # Sort in place\nprint(numbers)              # [1, 1, 2, 3, 4, 5, 6, 9]\n\nnumbers.sort(reverse=True)  # Sort descending\nprint(numbers)              # [9, 6, 5, 4, 3, 2, 1, 1]\n\n# Other useful methods\nprint(numbers.count(1))     # 2 (count occurrences)\nprint(numbers.index(5))     # 2 (find index of value)\n\nnumbers.reverse()           # Reverse in place\nprint(numbers)              # [1, 1, 2, 3, 4, 5, 6, 9]\n\n# Check if item exists\nprint(5 in numbers)         # True\nprint(10 in numbers)        # False', 'methods.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 6,
      slug: "list-comprehensions",
      title: "List Comprehensions",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'List Comprehensions' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'List comprehensions are a concise way to create lists. They\'re a Python favorite!' }] },
          generateCodeBlockJson('python', '# Traditional way\nsquares = []\nfor x in range(5):\n    squares.append(x ** 2)\nprint(squares)  # [0, 1, 4, 9, 16]\n\n# List comprehension (same result, one line)\nsquares = [x ** 2 for x in range(5)]\nprint(squares)  # [0, 1, 4, 9, 16]\n\n# With condition\neven_squares = [x ** 2 for x in range(10) if x % 2 == 0]\nprint(even_squares)  # [0, 4, 16, 36, 64]\n\n# Transform strings\nnames = ["alice", "bob", "charlie"]\nupper_names = [name.upper() for name in names]\nprint(upper_names)  # [\'ALICE\', \'BOB\', \'CHARLIE\']', 'comprehensions.py').content[0],
          generateCalloutJson('tip', 'List comprehensions are powerful but don\'t overuse them. If it gets too complex, use a regular for loop.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 7,
      slug: "lesson-5-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'Python uses zero-based indexing, so index 0 is the first element. fruits[0] returns "apple".',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Given fruits = ["apple", "banana", "cherry"], what is fruits[0]?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'banana' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'apple' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'cherry' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Error' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'c',
              explanation: 'The append() method adds an item to the end of a list.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which method adds an item to the end of a list?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'add()' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'insert()' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'append()' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'push()' }] }] },
            ],
          },
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 8,
      slug: "key-terms-5",
      title: "Key Terms",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Key Terms' }] },
          {
            type: 'flipCardGroup',
            attrs: { columns: 2 },
            content: [
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'An ordered, mutable collection of items enclosed in square brackets.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Index' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The position of an element in a list, starting from 0.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Slicing' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Extracting a portion of a list using [start:stop:step] syntax.' }] }] },
                ],
              },
              {
                type: 'flipCard',
                content: [
                  { type: 'flipCardFront', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List Comprehension' }] }] },
                  { type: 'flipCardBack', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A concise way to create lists using a single line of code with an expression and loop.' }] }] },
                ],
              },
            ],
          },
        ],
      },
    },
  ];
}
