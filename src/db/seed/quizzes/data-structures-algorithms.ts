import type { QuizSeed } from './programming-foundations';

export function getDSAQuizzes(): QuizSeed[] {
  return [
    // Quiz 1: Arrays & Lists (beginner, 5 questions)
    {
      slug: 'arrays-and-lists',
      title: 'Arrays & Lists',
      description: 'Understand the fundamentals of arrays and linked lists, their operations and use cases.',
      topic_slug: 'data_structures_algorithms',
      skill_level: 'beginner',
      default_length: 5,
      questions: [
        {
          prompt: 'What is the time complexity of accessing an element by index in an array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correct_index: 0,
          explanation: 'Arrays provide O(1) constant time access because elements are stored in contiguous memory locations, allowing direct calculation of any element\'s address.',
        },
        {
          prompt: 'In a singly linked list, what information does each node contain?',
          options: [
            'Only data',
            'Data and a pointer to the next node',
            'Data and pointers to both next and previous nodes',
            'Only a pointer to the next node',
          ],
          correct_index: 1,
          explanation: 'Each node in a singly linked list contains its data plus a reference to the next node. Doubly linked lists also have a pointer to the previous node.',
        },
        {
          prompt: 'What is the main advantage of linked lists over arrays?',
          options: [
            'Faster random access',
            'Less memory usage',
            'Efficient insertion and deletion at any position',
            'Better cache performance',
          ],
          correct_index: 2,
          explanation: 'Linked lists excel at insertions/deletions because you only need to update pointers, not shift elements. Arrays must shift all subsequent elements.',
        },
        {
          prompt: 'What happens when you try to access an array index that is out of bounds?',
          options: [
            'It returns null',
            'It returns the last element',
            'It throws an error or returns undefined (language-dependent)',
            'It automatically expands the array',
          ],
          correct_index: 2,
          explanation: 'The behavior varies by language. JavaScript returns undefined, while languages like Java and Python throw an IndexOutOfBoundsException or IndexError.',
        },
        {
          prompt: 'What is the time complexity of inserting an element at the beginning of an array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correct_index: 1,
          explanation: 'Inserting at the beginning requires shifting all existing elements one position to the right, resulting in O(n) time complexity.',
        },
      ],
    },

    // Quiz 2: Stacks & Queues (intermediate, 7 questions)
    {
      slug: 'stacks-and-queues',
      title: 'Stacks & Queues',
      description: 'Master LIFO and FIFO data structures and their practical applications.',
      topic_slug: 'data_structures_algorithms',
      skill_level: 'intermediate',
      default_length: 7,
      questions: [
        {
          prompt: 'Which principle does a stack follow?',
          options: ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'Random access', 'Priority-based'],
          correct_index: 1,
          explanation: 'Stacks follow LIFO: the last element added is the first one removed, like a stack of plates.',
        },
        {
          prompt: 'Which data structure would be most appropriate for implementing an "Undo" feature?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correct_index: 1,
          explanation: 'A stack is perfect for Undo because you want to reverse the most recent action first (LIFO). Each action is pushed onto the stack and popped when undoing.',
        },
        {
          prompt: 'What is the time complexity of push and pop operations on a stack?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correct_index: 0,
          explanation: 'Both push and pop are O(1) because they only operate on the top of the stack, regardless of how many elements are in it.',
        },
        {
          prompt: 'Which real-world scenario best represents a queue?',
          options: [
            'A pile of books',
            'People waiting in line at a store',
            'Undo/Redo functionality',
            'A deck of cards being shuffled',
          ],
          correct_index: 1,
          explanation: 'A line at a store is FIFO: the first person to join the line is the first to be served, exactly like a queue data structure.',
        },
        {
          prompt: 'What operation adds an element to a queue?',
          options: ['push', 'enqueue', 'insert', 'append'],
          correct_index: 1,
          explanation: 'The standard terminology for adding to a queue is "enqueue". Removing is called "dequeue". Stacks use "push" and "pop".',
        },
        {
          prompt: 'What is a "priority queue"?',
          options: [
            'A queue where elements are processed in random order',
            'A queue where elements are dequeued based on priority, not arrival order',
            'A faster implementation of a regular queue',
            'A queue that can only hold priority values',
          ],
          correct_index: 1,
          explanation: 'Priority queues process elements based on priority values. Higher priority items are dequeued first, regardless of when they were added.',
        },
        {
          prompt: 'Which data structure would you use to check if parentheses in code are balanced?',
          options: ['Queue', 'Stack', 'Hash Map', 'Binary Tree'],
          correct_index: 1,
          explanation: 'A stack is ideal for matching parentheses. Push opening brackets onto the stack and pop when you find a closing bracket. If they match and the stack is empty at the end, the expression is balanced.',
        },
      ],
    },

    // Quiz 3: Trees & Graphs Intro (intermediate, 7 questions)
    {
      slug: 'trees-and-graphs-intro',
      title: 'Trees & Graphs Introduction',
      description: 'Learn the basics of hierarchical and networked data structures.',
      topic_slug: 'data_structures_algorithms',
      skill_level: 'intermediate',
      default_length: 7,
      questions: [
        {
          prompt: 'What is the root of a tree?',
          options: [
            'The last node added',
            'The topmost node with no parent',
            'Any node with children',
            'The node with the smallest value',
          ],
          correct_index: 1,
          explanation: 'The root is the topmost node in a tree structure. It has no parent and serves as the starting point for traversing the tree.',
        },
        {
          prompt: 'What is a "leaf" node in a tree?',
          options: [
            'A node with exactly one child',
            'A node with no children',
            'The root node',
            'A node at the second level',
          ],
          correct_index: 1,
          explanation: 'Leaf nodes are at the "bottom" of the tree with no children. They represent the endpoints of any path from the root.',
        },
        {
          prompt: 'What is the maximum number of children a node can have in a binary tree?',
          options: ['1', '2', '3', 'Unlimited'],
          correct_index: 1,
          explanation: 'In a binary tree, each node can have at most 2 children: a left child and a right child. This constraint gives binary trees their useful properties.',
        },
        {
          prompt: 'What is the difference between a tree and a graph?',
          options: [
            'Trees are faster than graphs',
            'Trees cannot have cycles; graphs can',
            'Graphs cannot have cycles; trees can',
            'There is no difference',
          ],
          correct_index: 1,
          explanation: 'Trees are acyclic (no cycles) and have a single root with a clear hierarchy. Graphs can have cycles and no designated root - nodes can connect to any other nodes.',
        },
        {
          prompt: 'What does "in-order traversal" of a binary search tree produce?',
          options: [
            'Elements in random order',
            'Elements in sorted ascending order',
            'Elements in reverse order',
            'Only leaf nodes',
          ],
          correct_index: 1,
          explanation: 'In-order traversal visits: left subtree, root, right subtree. For a BST, this produces elements in ascending sorted order.',
        },
        {
          prompt: 'What is the height of a tree?',
          options: [
            'The total number of nodes',
            'The number of leaf nodes',
            'The length of the longest path from root to any leaf',
            'The number of children of the root',
          ],
          correct_index: 2,
          explanation: 'Height is the length of the longest path from the root to any leaf, measured in edges. A single node tree has height 0.',
        },
        {
          prompt: 'In a directed graph, what does it mean for an edge to go from A to B?',
          options: [
            'You can travel from A to B and from B to A',
            'You can only travel from A to B, not the reverse',
            'A and B are the same node',
            'Neither A nor B can be visited',
          ],
          correct_index: 1,
          explanation: 'In a directed graph (digraph), edges have direction. An edge from A to B means you can traverse from A to B, but not necessarily from B to A unless there\'s another edge.',
        },
      ],
    },

    // Quiz 4: Sorting Algorithms (advanced, 10 questions)
    {
      slug: 'sorting-algorithms',
      title: 'Sorting Algorithms',
      description: 'Deep dive into various sorting algorithms, their complexities, and trade-offs.',
      topic_slug: 'data_structures_algorithms',
      skill_level: 'advanced',
      default_length: 10,
      questions: [
        {
          prompt: 'What is the average time complexity of QuickSort?',
          options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
          correct_index: 1,
          explanation: 'QuickSort averages O(n log n) with good pivot selection. However, worst case (already sorted array with poor pivot) is O(n^2).',
        },
        {
          prompt: 'Which sorting algorithm is considered "stable"?',
          options: ['QuickSort', 'HeapSort', 'Merge Sort', 'Selection Sort'],
          correct_index: 2,
          explanation: 'Merge Sort is stable: equal elements maintain their relative order. QuickSort and HeapSort are typically unstable. Selection Sort can be stable with careful implementation.',
        },
        {
          prompt: 'What is the space complexity of Merge Sort?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correct_index: 2,
          explanation: 'Merge Sort requires O(n) extra space for the temporary arrays used during merging. This is its main disadvantage compared to in-place algorithms.',
        },
        {
          prompt: 'Which sorting algorithm works by repeatedly finding the minimum element?',
          options: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort'],
          correct_index: 1,
          explanation: 'Selection Sort finds the minimum element in the unsorted portion and swaps it to the correct position, building the sorted portion from left to right.',
        },
        {
          prompt: 'When is Insertion Sort preferred over other algorithms?',
          options: [
            'For very large datasets',
            'For nearly sorted data or small datasets',
            'When memory is unlimited',
            'Never, it\'s always slower',
          ],
          correct_index: 1,
          explanation: 'Insertion Sort runs in O(n) for nearly sorted data and has low overhead for small datasets. Many hybrid sorts use Insertion Sort for small subarrays.',
        },
        {
          prompt: 'What is the worst-case time complexity of Bubble Sort?',
          options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
          correct_index: 2,
          explanation: 'Bubble Sort is O(n^2) in the worst case, making it inefficient for large datasets. It\'s mainly used for educational purposes.',
        },
        {
          prompt: 'What makes HeapSort efficient?',
          options: [
            'It uses recursion',
            'It uses a heap data structure to find max/min in O(log n)',
            'It divides the array into two halves',
            'It counts element frequencies',
          ],
          correct_index: 1,
          explanation: 'HeapSort builds a max-heap and repeatedly extracts the maximum. The heap structure allows finding and removing the max in O(log n), giving O(n log n) overall.',
        },
        {
          prompt: 'What is the key idea behind Merge Sort?',
          options: [
            'Selecting a pivot element',
            'Swapping adjacent elements',
            'Divide and conquer: split, sort, merge',
            'Building a heap',
          ],
          correct_index: 2,
          explanation: 'Merge Sort recursively divides the array in half, sorts each half, and merges them back together. The merging step combines two sorted arrays into one sorted array.',
        },
        {
          prompt: 'Which sorting algorithm is typically used as the default in many programming languages?',
          options: ['Bubble Sort', 'TimSort (hybrid)', 'Selection Sort', 'Radix Sort'],
          correct_index: 1,
          explanation: 'TimSort (used in Python and Java) combines Merge Sort and Insertion Sort. It\'s optimized for real-world data patterns and provides O(n log n) worst case.',
        },
        {
          prompt: 'What is "in-place" sorting?',
          options: [
            'Sorting that happens in a database',
            'Sorting that requires O(n) extra memory',
            'Sorting that uses only O(1) or O(log n) extra memory',
            'Sorting that doesn\'t change element positions',
          ],
          correct_index: 2,
          explanation: 'In-place algorithms sort using minimal extra memory (typically O(1) or O(log n) for recursion). QuickSort and HeapSort are in-place; Merge Sort is not.',
        },
      ],
    },

    // Quiz 5: Big-O Analysis (advanced, 5 questions)
    {
      slug: 'big-o-analysis',
      title: 'Big-O Analysis',
      description: 'Master algorithmic complexity analysis and understand performance trade-offs.',
      topic_slug: 'data_structures_algorithms',
      skill_level: 'advanced',
      default_length: 5,
      questions: [
        {
          prompt: 'Which of these complexities has the best performance for large n?',
          options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
          correct_index: 3,
          explanation: 'O(1) constant time is the best - it doesn\'t grow with input size. The order from best to worst is: O(1) < O(log n) < O(n) < O(n log n).',
        },
        {
          prompt: 'What is the time complexity of this code?\n```\nfor (i = 0; i < n; i++) {\n  for (j = 0; j < n; j++) {\n    print(i, j);\n  }\n}\n```',
          options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2n)'],
          correct_index: 2,
          explanation: 'Nested loops that both run n times result in n * n = n^2 operations, giving O(n^2) time complexity.',
        },
        {
          prompt: 'What does "amortized O(1)" mean?',
          options: [
            'Always exactly O(1)',
            'Average O(1) over many operations, even if some individual operations are slower',
            'O(1) only in the best case',
            'O(1) only for small inputs',
          ],
          correct_index: 1,
          explanation: 'Amortized analysis averages cost over many operations. For example, dynamic array append is O(n) when resizing, but amortized O(1) because resizing is rare.',
        },
        {
          prompt: 'What is the time complexity of binary search?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
          correct_index: 2,
          explanation: 'Binary search halves the search space each iteration. For n elements, you can halve at most log2(n) times before finding the element or determining it\'s not present.',
        },
        {
          prompt: 'If an algorithm has O(n^2 + n), what is its Big-O complexity?',
          options: ['O(n^2 + n)', 'O(n)', 'O(n^2)', 'O(2n^2)'],
          correct_index: 2,
          explanation: 'Big-O keeps only the dominant term and drops constants. As n grows large, n^2 dominates n, so O(n^2 + n) simplifies to O(n^2).',
        },
      ],
    },
  ];
}
