import { generateCalloutJson, generateCodeBlockJson } from './helpers';

/**
 * Data Structures & Algorithms Course Content
 * Target: Intermediate learners with basic programming knowledge
 * Language: Python
 */

export function getDSALessons(courseId: number) {
  return [
    {
      slug: "dsa-1-big-o",
      title: "Big O Notation",
      description: "Learn to analyze algorithm efficiency with time and space complexity",
      difficulty: "standard" as const,
      estimated_duration_sec: 2700,
      parent_lesson_id: courseId,
      order_index: 0,
      icon: "O",
      is_published: true,
    },
    {
      slug: "dsa-2-arrays-strings",
      title: "Arrays and Strings",
      description: "Master array operations and common string manipulation techniques",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 1,
      icon: "[]",
      is_published: true,
    },
    {
      slug: "dsa-3-linked-lists",
      title: "Linked Lists",
      description: "Understand singly and doubly linked lists and their operations",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 2,
      icon: "->",
      is_published: true,
    },
    {
      slug: "dsa-4-stacks-queues",
      title: "Stacks and Queues",
      description: "Learn LIFO and FIFO data structures and their applications",
      difficulty: "standard" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 3,
      icon: "|>",
      is_published: true,
    },
    {
      slug: "dsa-5-hash-tables",
      title: "Hash Tables",
      description: "Understand hashing, collision handling, and dictionary implementations",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 4,
      icon: "#",
      is_published: true,
    },
    {
      slug: "dsa-6-trees",
      title: "Trees and Binary Search Trees",
      description: "Learn tree structures, traversals, and binary search tree operations",
      difficulty: "hard" as const,
      estimated_duration_sec: 3600,
      parent_lesson_id: courseId,
      order_index: 5,
      icon: "^",
      is_published: true,
    },
    {
      slug: "dsa-7-graphs",
      title: "Graphs",
      description: "Explore graph representations and traversal algorithms",
      difficulty: "hard" as const,
      estimated_duration_sec: 3600,
      parent_lesson_id: courseId,
      order_index: 6,
      icon: "*",
      is_published: true,
    },
    {
      slug: "dsa-8-sorting",
      title: "Sorting Algorithms",
      description: "Compare and implement common sorting algorithms",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 7,
      icon: "v",
      is_published: true,
    },
    {
      slug: "dsa-9-searching",
      title: "Searching Algorithms",
      description: "Master binary search and other searching techniques",
      difficulty: "standard" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 8,
      icon: "?",
      is_published: true,
    },
    {
      slug: "dsa-10-recursion",
      title: "Recursion",
      description: "Understand recursive thinking and solve problems recursively",
      difficulty: "hard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 9,
      icon: "@",
      is_published: true,
    },
  ];
}

// Lesson 1: Big O Notation
export function getDSALesson1Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-big-o",
      title: "What is Big O Notation?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Big O Notation?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Big O notation is a mathematical way to describe how an algorithm\'s performance scales as input size grows. It answers the question: "How does my code slow down as the data gets bigger?"' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Instead of measuring exact time (which varies by computer), Big O describes the rate of growth. It focuses on the worst-case scenario and ignores constants.' }] },
          generateCalloutJson('info', 'Big O is about scalability, not speed. An O(n) algorithm might be slower than O(n^2) for small inputs, but will always win for large inputs.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "common-complexities",
      title: "Common Time Complexities",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Common Time Complexities' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'From fastest to slowest, here are the most common Big O complexities:' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(1) - Constant' },
            { type: 'text', text: ': Same time regardless of input size (array access)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(log n) - Logarithmic' },
            { type: 'text', text: ': Halves the problem each step (binary search)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(n) - Linear' },
            { type: 'text', text: ': Time grows proportionally with input (simple loop)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(n log n) - Linearithmic' },
            { type: 'text', text: ': Efficient sorting algorithms (merge sort)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(n^2) - Quadratic' },
            { type: 'text', text: ': Nested loops (bubble sort)' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(2^n) - Exponential' },
            { type: 'text', text: ': Doubles with each input (naive recursion)' }
          ]},
          generateCalloutJson('warning', 'Avoid O(n^2) and worse for large datasets. An O(n^2) algorithm on 1 million items needs 1 trillion operations!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "analyzing-code",
      title: "Analyzing Code Complexity",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Analyzing Code Complexity' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Let\'s analyze some real code examples:' }] },
          generateCodeBlockJson('python', '# O(1) - Constant time\ndef get_first(arr):\n    return arr[0]  # Always one operation\n\n# O(n) - Linear time\ndef find_max(arr):\n    max_val = arr[0]\n    for num in arr:      # Loop runs n times\n        if num > max_val:\n            max_val = num\n    return max_val\n\n# O(n^2) - Quadratic time\ndef has_duplicates(arr):\n    for i in range(len(arr)):       # n times\n        for j in range(len(arr)):   # n times each\n            if i != j and arr[i] == arr[j]:\n                return True\n    return False', 'complexity.py').content[0],
          generateCalloutJson('tip', 'Count the loops! One loop = O(n), nested loops = O(n^2), loop that halves = O(log n).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "space-complexity",
      title: "Space Complexity",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Space Complexity' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Space complexity measures how much extra memory an algorithm needs. It uses the same O notation.' }] },
          generateCodeBlockJson('python', '# O(1) space - constant extra memory\ndef sum_array(arr):\n    total = 0           # Just one variable\n    for num in arr:\n        total += num\n    return total\n\n# O(n) space - grows with input\ndef double_all(arr):\n    result = []          # New array of size n\n    for num in arr:\n        result.append(num * 2)\n    return result\n\n# O(1) space alternative (modifies in place)\ndef double_in_place(arr):\n    for i in range(len(arr)):\n        arr[i] *= 2\n    return arr', 'space.py').content[0],
          generateCalloutJson('note', 'Sometimes you can trade space for time or vice versa. Using a hash table (O(n) space) can turn O(n^2) time into O(n) time.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "big-o-quiz",
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
              explanation: 'Binary search halves the search space with each comparison, giving O(log n) time complexity.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the time complexity of binary search?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(1)' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n)' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(log n)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n^2)' }] }] },
            ],
          },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'b',
              explanation: 'Two nested loops each iterating n times results in n * n = n^2 operations.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the time complexity of two nested for loops, each iterating n times?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n)' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n^2)' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(2n)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(log n)' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 2: Arrays and Strings
export function getDSALesson2Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "array-basics",
      title: "Array Fundamentals",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Array Fundamentals' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Arrays are the most fundamental data structure. They store elements in contiguous memory, allowing O(1) access by index.' }] },
          generateCodeBlockJson('python', '# Array operations and their time complexity\narr = [10, 20, 30, 40, 50]\n\n# O(1) - Access by index\nfirst = arr[0]\nlast = arr[-1]\n\n# O(1) - Append to end (amortized)\narr.append(60)\n\n# O(n) - Insert at beginning (shifts all elements)\narr.insert(0, 5)\n\n# O(n) - Search by value\nindex = arr.index(30)  # Linear search\n\n# O(n) - Delete (shifts elements after)\narr.remove(30)', 'arrays.py').content[0],
          generateCalloutJson('tip', 'Always consider whether you need random access. If not, a linked list might be better for frequent insertions.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "two-pointer-technique",
      title: "Two-Pointer Technique",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Two-Pointer Technique' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'The two-pointer technique uses two indices to traverse an array, often from opposite ends. It\'s powerful for problems involving pairs or partitioning.' }] },
          generateCodeBlockJson('python', '# Example: Check if array has two numbers that sum to target\ndef two_sum_sorted(arr, target):\n    """Works on sorted arrays - O(n) time, O(1) space"""\n    left, right = 0, len(arr) - 1\n    \n    while left < right:\n        current_sum = arr[left] + arr[right]\n        if current_sum == target:\n            return [left, right]\n        elif current_sum < target:\n            left += 1      # Need larger sum\n        else:\n            right -= 1     # Need smaller sum\n    \n    return None\n\n# Example usage\nnums = [1, 2, 4, 6, 8, 9, 14, 15]\nprint(two_sum_sorted(nums, 13))  # [1, 5] -> 2 + 11 = 13', 'two_pointer.py').content[0],
          generateCalloutJson('info', 'Two pointers can reduce O(n^2) brute force solutions to O(n) for many problems involving pairs or subarrays.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "sliding-window",
      title: "Sliding Window",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Sliding Window Technique' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'The sliding window pattern maintains a "window" of elements as you iterate through an array. It\'s perfect for subarray/substring problems.' }] },
          generateCodeBlockJson('python', '# Find maximum sum of k consecutive elements\ndef max_sum_subarray(arr, k):\n    """O(n) time using sliding window"""\n    if len(arr) < k:\n        return None\n    \n    # Calculate sum of first window\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    \n    # Slide the window: add right element, remove left\n    for i in range(k, len(arr)):\n        window_sum += arr[i] - arr[i - k]\n        max_sum = max(max_sum, window_sum)\n    \n    return max_sum\n\n# Example\nnums = [2, 1, 5, 1, 3, 2]\nprint(max_sum_subarray(nums, 3))  # 9 (5 + 1 + 3)', 'sliding_window.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "string-operations",
      title: "String Operations",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'String Operations' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Strings are essentially character arrays. Understanding their immutability in Python is crucial for performance.' }] },
          generateCodeBlockJson('python', '# Strings are immutable - concatenation creates new strings\n# This is O(n^2) for n concatenations!\nresult = ""\nfor char in "hello":\n    result += char  # Creates new string each time!\n\n# Better: Use join() - O(n)\nchars = [\'h\', \'e\', \'l\', \'l\', \'o\']\nresult = \'\'.join(chars)  # Single string creation\n\n# Common string operations\ns = "hello world"\n\n# O(n) - Reverse\nreversed_s = s[::-1]\n\n# O(n) - Check palindrome\nis_palindrome = s == s[::-1]\n\n# O(n*m) - Find substring\nindex = s.find("world")  # Returns 6', 'strings.py').content[0],
          generateCalloutJson('warning', 'String concatenation in a loop is O(n^2) in Python! Use join() or list append instead.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "arrays-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'a',
              explanation: 'Arrays provide O(1) random access because elements are stored in contiguous memory and we can calculate any position instantly.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the time complexity of accessing an element by index in an array?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(1)' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n)' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(log n)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n^2)' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 3: Linked Lists
export function getDSALesson3Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "linked-list-basics",
      title: "What is a Linked List?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is a Linked List?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A linked list is a linear data structure where elements (nodes) are connected via pointers. Unlike arrays, elements are not stored in contiguous memory.' }] },
          generateCodeBlockJson('python', 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None  # Pointer to next node\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n    \n    def append(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        \n        current = self.head\n        while current.next:\n            current = current.next\n        current.next = new_node\n    \n    def display(self):\n        current = self.head\n        while current:\n            print(current.data, end=" -> ")\n            current = current.next\n        print("None")', 'linked_list.py').content[0],
          generateCalloutJson('info', 'Linked lists excel at insertions/deletions (O(1) if you have the node) but sacrifice random access (O(n)).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "linked-list-operations",
      title: "Linked List Operations",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Common Operations' }] },
          generateCodeBlockJson('python', 'class LinkedList:\n    # ... (previous code)\n    \n    def prepend(self, data):  # O(1)\n        new_node = Node(data)\n        new_node.next = self.head\n        self.head = new_node\n    \n    def delete(self, data):  # O(n) - need to find node\n        if not self.head:\n            return\n        \n        if self.head.data == data:\n            self.head = self.head.next\n            return\n        \n        current = self.head\n        while current.next:\n            if current.next.data == data:\n                current.next = current.next.next\n                return\n            current = current.next\n    \n    def search(self, data):  # O(n)\n        current = self.head\n        position = 0\n        while current:\n            if current.data == data:\n                return position\n            current = current.next\n            position += 1\n        return -1', 'll_operations.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "doubly-linked",
      title: "Doubly Linked Lists",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Doubly Linked Lists' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A doubly linked list has pointers in both directions, allowing traversal forwards and backwards.' }] },
          generateCodeBlockJson('python', 'class DNode:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n        self.prev = None  # Additional pointer!\n\nclass DoublyLinkedList:\n    def __init__(self):\n        self.head = None\n        self.tail = None  # Track both ends\n    \n    def append(self, data):  # O(1) with tail pointer!\n        new_node = DNode(data)\n        if not self.head:\n            self.head = self.tail = new_node\n            return\n        \n        new_node.prev = self.tail\n        self.tail.next = new_node\n        self.tail = new_node\n    \n    def prepend(self, data):  # O(1)\n        new_node = DNode(data)\n        if not self.head:\n            self.head = self.tail = new_node\n            return\n        \n        new_node.next = self.head\n        self.head.prev = new_node\n        self.head = new_node', 'doubly_linked.py').content[0],
          generateCalloutJson('tip', 'Use doubly linked lists when you need to traverse both directions or delete nodes given just the node reference.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "ll-quiz",
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
              explanation: 'With only a head pointer, you must traverse from the beginning to find the second-to-last node, which takes O(n) time.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the time complexity of deleting the last element in a singly linked list (with only head pointer)?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(1)' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n)' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(log n)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n^2)' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 4: Stacks and Queues
export function getDSALesson4Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "stack-basics",
      title: "Stacks - LIFO",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Stacks - Last In, First Out' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A stack is like a stack of plates - you can only add or remove from the top. The last item added is the first one removed (LIFO).' }] },
          generateCodeBlockJson('python', '# Stack using Python list\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):    # O(1)\n        self.items.append(item)\n    \n    def pop(self):           # O(1)\n        if not self.is_empty():\n            return self.items.pop()\n        return None\n    \n    def peek(self):          # O(1) - see top without removing\n        if not self.is_empty():\n            return self.items[-1]\n        return None\n    \n    def is_empty(self):      # O(1)\n        return len(self.items) == 0\n\n# Example usage\nstack = Stack()\nstack.push(1)\nstack.push(2)\nstack.push(3)\nprint(stack.pop())  # 3 (last in, first out)', 'stack.py').content[0],
          generateCalloutJson('info', 'Common stack applications: undo functionality, browser back button, function call stack, expression evaluation.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "stack-applications",
      title: "Stack Applications",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Stack Applications' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'One classic use of stacks is validating balanced parentheses:' }] },
          generateCodeBlockJson('python', 'def is_balanced(expression):\n    """Check if parentheses are balanced"""\n    stack = []\n    pairs = {\')\': \'(\', \'}\': \'{\', \']\': \'[\'}\n    \n    for char in expression:\n        if char in \'({[\':\n            stack.append(char)\n        elif char in \')}]\':\n            if not stack or stack[-1] != pairs[char]:\n                return False\n            stack.pop()\n    \n    return len(stack) == 0\n\n# Test cases\nprint(is_balanced("({[]})"))   # True\nprint(is_balanced("([)]"))     # False\nprint(is_balanced("((()"))     # False', 'balanced.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "queue-basics",
      title: "Queues - FIFO",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Queues - First In, First Out' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A queue is like a line at a store - the first person in line is the first one served (FIFO).' }] },
          generateCodeBlockJson('python', 'from collections import deque\n\n# Using deque for efficient queue (O(1) on both ends)\nclass Queue:\n    def __init__(self):\n        self.items = deque()\n    \n    def enqueue(self, item):  # O(1) - add to back\n        self.items.append(item)\n    \n    def dequeue(self):        # O(1) - remove from front\n        if not self.is_empty():\n            return self.items.popleft()\n        return None\n    \n    def front(self):          # O(1) - peek at front\n        if not self.is_empty():\n            return self.items[0]\n        return None\n    \n    def is_empty(self):\n        return len(self.items) == 0\n\n# Example\nqueue = Queue()\nqueue.enqueue(1)\nqueue.enqueue(2)\nqueue.enqueue(3)\nprint(queue.dequeue())  # 1 (first in, first out)', 'queue.py').content[0],
          generateCalloutJson('warning', 'Don\'t use list.pop(0) for queues - it\'s O(n)! Use collections.deque for O(1) operations.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "sq-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'a',
              explanation: 'LIFO means Last In, First Out - the most recently added item is removed first, like a stack of plates.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does LIFO stand for in the context of stacks?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Last In, First Out' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First In, First Out' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Last In, Last Out' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Linear In, Fast Out' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 5: Hash Tables
export function getDSALesson5Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "hash-basics",
      title: "What is a Hash Table?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is a Hash Table?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A hash table (dictionary in Python) stores key-value pairs and provides average O(1) lookup, insertion, and deletion. It uses a hash function to map keys to array indices.' }] },
          generateCodeBlockJson('python', '# Python dictionaries are hash tables\nphonebook = {}\n\n# O(1) average - insertion\nphonebook["Alice"] = "555-1234"\nphonebook["Bob"] = "555-5678"\nphonebook["Carol"] = "555-9012"\n\n# O(1) average - lookup\nprint(phonebook["Alice"])  # 555-1234\n\n# O(1) average - check existence\nif "Bob" in phonebook:\n    print("Found Bob!")\n\n# O(1) average - deletion\ndel phonebook["Carol"]\n\n# O(n) - iterate all\nfor name, number in phonebook.items():\n    print(f"{name}: {number}")', 'hash_table.py').content[0],
          generateCalloutJson('info', 'Hash tables are the secret weapon for turning O(n) searches into O(1) lookups. Always consider if a hash table can help!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "hash-functions",
      title: "How Hashing Works",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'How Hashing Works' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A hash function converts a key into an array index. Good hash functions distribute keys evenly to minimize collisions.' }] },
          generateCodeBlockJson('python', '# Simple hash function example\ndef simple_hash(key, size):\n    """Convert string key to index"""\n    total = 0\n    for char in key:\n        total += ord(char)  # ASCII value\n    return total % size    # Keep within array bounds\n\n# Example\nsize = 10\nprint(simple_hash("Alice", size))  # 5\nprint(simple_hash("Bob", size))    # 6\nprint(simple_hash("Ace", size))    # 5 (collision!)\n\n# Python\'s built-in hash\nprint(hash("Alice"))  # More sophisticated hash', 'hashing.py').content[0],
          generateCalloutJson('warning', 'When two keys hash to the same index, it\'s called a collision. Hash tables must handle collisions gracefully.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "hash-applications",
      title: "Hash Table Applications",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Common Applications' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Hash tables are incredibly useful for counting, caching, and de-duplication:' }] },
          generateCodeBlockJson('python', '# Count frequency of elements\ndef count_frequency(items):\n    freq = {}\n    for item in items:\n        freq[item] = freq.get(item, 0) + 1\n    return freq\n\nwords = ["apple", "banana", "apple", "cherry", "banana", "apple"]\nprint(count_frequency(words))\n# {\'apple\': 3, \'banana\': 2, \'cherry\': 1}\n\n# Two Sum problem - O(n) with hash table\ndef two_sum(nums, target):\n    seen = {}  # value -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return None\n\nprint(two_sum([2, 7, 11, 15], 9))  # [0, 1]', 'hash_apps.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "hash-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'a',
              explanation: 'Hash tables provide O(1) average case for lookup, insertion, and deletion due to direct indexing via hash functions.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the average time complexity for lookup in a hash table?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(1)' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n)' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(log n)' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'O(n^2)' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 6: Trees
export function getDSALesson6Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "tree-basics",
      title: "Tree Fundamentals",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Tree Fundamentals' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A tree is a hierarchical data structure with nodes connected by edges. It has a root node at the top, and each node can have children.' }] },
          generateCodeBlockJson('python', 'class TreeNode:\n    def __init__(self, value):\n        self.value = value\n        self.left = None    # Left child\n        self.right = None   # Right child\n\n# Creating a binary tree\n#        1\n#       / \\\n#      2   3\n#     / \\\n#    4   5\n\nroot = TreeNode(1)\nroot.left = TreeNode(2)\nroot.right = TreeNode(3)\nroot.left.left = TreeNode(4)\nroot.left.right = TreeNode(5)', 'tree_basics.py').content[0],
          generateCalloutJson('info', 'Terminology: Root (top node), Leaf (no children), Height (longest path to leaf), Depth (distance from root).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "tree-traversals",
      title: "Tree Traversals",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Tree Traversals' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'There are three main ways to traverse a binary tree:' }] },
          generateCodeBlockJson('python', 'def inorder(node):\n    """Left -> Root -> Right (gives sorted order for BST)"""\n    if node:\n        inorder(node.left)\n        print(node.value, end=" ")\n        inorder(node.right)\n\ndef preorder(node):\n    """Root -> Left -> Right (useful for copying trees)"""\n    if node:\n        print(node.value, end=" ")\n        preorder(node.left)\n        preorder(node.right)\n\ndef postorder(node):\n    """Left -> Right -> Root (useful for deleting trees)"""\n    if node:\n        postorder(node.left)\n        postorder(node.right)\n        print(node.value, end=" ")\n\n# For tree: 1->(2->(4,5), 3)\n# Inorder:   4 2 5 1 3\n# Preorder:  1 2 4 5 3\n# Postorder: 4 5 2 3 1', 'traversals.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "bst",
      title: "Binary Search Trees",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Binary Search Trees' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A BST is a binary tree where: all left descendants < node < all right descendants. This property enables O(log n) search.' }] },
          generateCodeBlockJson('python', 'class BST:\n    def __init__(self):\n        self.root = None\n    \n    def insert(self, value):\n        if not self.root:\n            self.root = TreeNode(value)\n            return\n        self._insert_recursive(self.root, value)\n    \n    def _insert_recursive(self, node, value):\n        if value < node.value:\n            if node.left:\n                self._insert_recursive(node.left, value)\n            else:\n                node.left = TreeNode(value)\n        else:\n            if node.right:\n                self._insert_recursive(node.right, value)\n            else:\n                node.right = TreeNode(value)\n    \n    def search(self, value):  # O(log n) average\n        return self._search_recursive(self.root, value)\n    \n    def _search_recursive(self, node, value):\n        if not node or node.value == value:\n            return node\n        if value < node.value:\n            return self._search_recursive(node.left, value)\n        return self._search_recursive(node.right, value)', 'bst.py').content[0],
          generateCalloutJson('warning', 'A BST can degrade to O(n) if values are inserted in sorted order (becomes a linked list). Balanced trees like AVL solve this.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "trees-quiz",
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
              explanation: 'Inorder traversal (Left -> Root -> Right) visits nodes in sorted order for a BST.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which traversal gives elements in sorted order for a BST?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Preorder' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Inorder' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Postorder' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Level order' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 7: Graphs
export function getDSALesson7Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "graph-basics",
      title: "What is a Graph?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is a Graph?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A graph consists of vertices (nodes) connected by edges. Unlike trees, graphs can have cycles and multiple paths between nodes.' }] },
          generateCodeBlockJson('python', '# Graph represented as adjacency list\nclass Graph:\n    def __init__(self):\n        self.graph = {}  # Dictionary of lists\n    \n    def add_vertex(self, vertex):\n        if vertex not in self.graph:\n            self.graph[vertex] = []\n    \n    def add_edge(self, v1, v2):\n        # For undirected graph, add both directions\n        self.graph[v1].append(v2)\n        self.graph[v2].append(v1)\n\n# Create a simple graph\n#   A --- B\n#   |     |\n#   C --- D\n\ng = Graph()\nfor v in [\'A\', \'B\', \'C\', \'D\']:\n    g.add_vertex(v)\ng.add_edge(\'A\', \'B\')\ng.add_edge(\'A\', \'C\')\ng.add_edge(\'B\', \'D\')\ng.add_edge(\'C\', \'D\')', 'graph_basics.py').content[0],
          generateCalloutJson('info', 'Real-world graphs: social networks (people & friendships), maps (cities & roads), web pages (pages & links).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "bfs",
      title: "Breadth-First Search",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Breadth-First Search (BFS)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'BFS explores all neighbors before moving deeper. It uses a queue and finds the shortest path in unweighted graphs.' }] },
          generateCodeBlockJson('python', 'from collections import deque\n\ndef bfs(graph, start):\n    """Visit all vertices in breadth-first order"""\n    visited = set()\n    queue = deque([start])\n    visited.add(start)\n    \n    while queue:\n        vertex = queue.popleft()\n        print(vertex, end=" ")\n        \n        for neighbor in graph[vertex]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n\n# Using our graph from before\n# bfs(g.graph, \'A\')  # Output: A B C D', 'bfs.py').content[0],
          generateCalloutJson('tip', 'BFS is perfect for finding shortest paths and level-order traversal. Think "explore layer by layer".').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "dfs",
      title: "Depth-First Search",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Depth-First Search (DFS)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'DFS explores as deep as possible before backtracking. It uses a stack (or recursion) and is useful for path finding and cycle detection.' }] },
          generateCodeBlockJson('python', 'def dfs_recursive(graph, vertex, visited=None):\n    """Visit all vertices in depth-first order"""\n    if visited is None:\n        visited = set()\n    \n    visited.add(vertex)\n    print(vertex, end=" ")\n    \n    for neighbor in graph[vertex]:\n        if neighbor not in visited:\n            dfs_recursive(graph, neighbor, visited)\n\ndef dfs_iterative(graph, start):\n    """Iterative version using explicit stack"""\n    visited = set()\n    stack = [start]\n    \n    while stack:\n        vertex = stack.pop()\n        if vertex not in visited:\n            visited.add(vertex)\n            print(vertex, end=" ")\n            stack.extend(graph[vertex])', 'dfs.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "graph-quiz",
      title: "Check Your Understanding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Check Your Understanding' }] },
          {
            type: 'quizQuestion',
            attrs: {
              correctOptionId: 'a',
              explanation: 'BFS explores level by level, guaranteeing the shortest path is found first in unweighted graphs.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which algorithm finds the shortest path in an unweighted graph?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'BFS' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'DFS' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Binary Search' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Merge Sort' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 8: Sorting
export function getDSALesson8Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "sorting-basics",
      title: "Sorting Overview",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Sorting Overview' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Sorting arranges elements in a specific order. Different algorithms have different time/space trade-offs.' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(n^2) algorithms' },
            { type: 'text', text: ': Bubble Sort, Selection Sort, Insertion Sort - simple but slow' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O(n log n) algorithms' },
            { type: 'text', text: ': Merge Sort, Quick Sort, Heap Sort - efficient for large data' }
          ]},
          generateCalloutJson('info', 'Python\'s built-in sort() uses Timsort, a hybrid algorithm with O(n log n) worst case.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "bubble-sort",
      title: "Bubble Sort",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Bubble Sort' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Bubble sort repeatedly swaps adjacent elements if they\'re in wrong order. Simple but O(n^2).' }] },
          generateCodeBlockJson('python', 'def bubble_sort(arr):\n    """O(n^2) time, O(1) space"""\n    n = len(arr)\n    for i in range(n):\n        swapped = False\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n                swapped = True\n        if not swapped:  # Early exit if already sorted\n            break\n    return arr\n\nnums = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(nums))  # [11, 12, 22, 25, 34, 64, 90]', 'bubble.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "merge-sort",
      title: "Merge Sort",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Merge Sort' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Merge sort uses divide and conquer: split array in half, sort each half, then merge. O(n log n) guaranteed.' }] },
          generateCodeBlockJson('python', 'def merge_sort(arr):\n    """O(n log n) time, O(n) space"""\n    if len(arr) <= 1:\n        return arr\n    \n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    \n    return merge(left, right)\n\ndef merge(left, right):\n    """Merge two sorted arrays"""\n    result = []\n    i = j = 0\n    \n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    \n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result', 'merge_sort.py').content[0],
          generateCalloutJson('tip', 'Merge sort is stable (preserves order of equal elements) and has guaranteed O(n log n), but uses O(n) extra space.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "quick-sort",
      title: "Quick Sort",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Quick Sort' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Quick sort picks a pivot, partitions elements around it, then recursively sorts partitions. Average O(n log n).' }] },
          generateCodeBlockJson('python', 'def quick_sort(arr):\n    """O(n log n) average, O(n^2) worst case"""\n    if len(arr) <= 1:\n        return arr\n    \n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    return quick_sort(left) + middle + quick_sort(right)\n\nnums = [3, 6, 8, 10, 1, 2, 1]\nprint(quick_sort(nums))  # [1, 1, 2, 3, 6, 8, 10]', 'quick_sort.py').content[0],
          generateCalloutJson('warning', 'Quick sort can degrade to O(n^2) with poor pivot selection. Random pivot choice helps avoid this.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "sorting-quiz",
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
              explanation: 'Merge sort guarantees O(n log n) in all cases, while quick sort can degrade to O(n^2).',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which sorting algorithm guarantees O(n log n) worst-case time?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quick Sort' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bubble Sort' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Merge Sort' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Selection Sort' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 9: Searching
export function getDSALesson9Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "linear-search",
      title: "Linear Search",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Linear Search' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Linear search checks each element one by one until the target is found. It works on any list but is O(n).' }] },
          generateCodeBlockJson('python', 'def linear_search(arr, target):\n    """O(n) time, O(1) space"""\n    for i, element in enumerate(arr):\n        if element == target:\n            return i\n    return -1\n\nnums = [5, 2, 8, 1, 9, 3]\nprint(linear_search(nums, 8))  # 2\nprint(linear_search(nums, 7))  # -1', 'linear_search.py').content[0],
          generateCalloutJson('note', 'Linear search is the only option for unsorted data. For sorted data, always use binary search.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "binary-search",
      title: "Binary Search",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Binary Search' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Binary search halves the search space with each comparison. It requires sorted data but achieves O(log n).' }] },
          generateCodeBlockJson('python', 'def binary_search(arr, target):\n    """O(log n) time, O(1) space - requires sorted array!"""\n    left, right = 0, len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        \n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1  # Search right half\n        else:\n            right = mid - 1  # Search left half\n    \n    return -1\n\n# Must be sorted!\nnums = [1, 2, 3, 5, 8, 9, 12, 15, 20]\nprint(binary_search(nums, 8))   # 4\nprint(binary_search(nums, 10))  # -1', 'binary_search.py').content[0],
          generateCalloutJson('tip', 'Binary search is incredibly powerful. Searching 1 billion sorted items takes only ~30 comparisons!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "binary-variations",
      title: "Binary Search Variations",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Binary Search Variations' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Binary search can be adapted to find first/last occurrence or insertion point:' }] },
          generateCodeBlockJson('python', 'def binary_search_first(arr, target):\n    """Find first occurrence of target"""\n    left, right = 0, len(arr) - 1\n    result = -1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            result = mid\n            right = mid - 1  # Keep searching left\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    \n    return result\n\n# Python\'s bisect module\nimport bisect\n\nnums = [1, 2, 2, 2, 3, 4]\n# Find insertion point\nprint(bisect.bisect_left(nums, 2))   # 1 (first 2)\nprint(bisect.bisect_right(nums, 2))  # 4 (after last 2)', 'binary_variations.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "search-quiz",
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
              explanation: 'Binary search requires sorted data because it relies on knowing whether the target is in the left or right half based on comparison.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is required for binary search to work?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unique elements' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sorted data' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Linked list' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hash function' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 10: Recursion
export function getDSALesson10Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "recursion-basics",
      title: "What is Recursion?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Recursion?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Recursion is when a function calls itself. Every recursive function needs a base case (stopping condition) and a recursive case (calls itself with smaller input).' }] },
          generateCodeBlockJson('python', '# Classic example: Factorial\ndef factorial(n):\n    # Base case\n    if n <= 1:\n        return 1\n    # Recursive case\n    return n * factorial(n - 1)\n\n# How it works:\n# factorial(4)\n# = 4 * factorial(3)\n# = 4 * 3 * factorial(2)\n# = 4 * 3 * 2 * factorial(1)\n# = 4 * 3 * 2 * 1\n# = 24\n\nprint(factorial(5))  # 120', 'recursion_basics.py').content[0],
          generateCalloutJson('warning', 'Always ensure your base case is reachable! Without it, you\'ll get infinite recursion (stack overflow).').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "recursion-examples",
      title: "Recursive Examples",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Common Recursive Problems' }] },
          generateCodeBlockJson('python', '# Fibonacci - classic recursion (but inefficient!)\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\n# Sum of array elements\ndef sum_array(arr):\n    if len(arr) == 0:\n        return 0\n    return arr[0] + sum_array(arr[1:])\n\n# Reverse a string\ndef reverse_string(s):\n    if len(s) <= 1:\n        return s\n    return reverse_string(s[1:]) + s[0]\n\nprint(fib(10))              # 55\nprint(sum_array([1,2,3,4])) # 10\nprint(reverse_string("hello"))  # "olleh"', 'recursion_examples.py').content[0],
          generateCalloutJson('info', 'Recursion makes some problems elegant, but each call uses stack memory. Very deep recursion can cause stack overflow.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "recursion-vs-iteration",
      title: "Recursion vs Iteration",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Recursion vs Iteration' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Any recursive solution can be converted to iteration (and vice versa). Choose based on readability and efficiency.' }] },
          generateCodeBlockJson('python', '# Recursive factorial - elegant but uses O(n) stack space\ndef factorial_recursive(n):\n    if n <= 1:\n        return 1\n    return n * factorial_recursive(n - 1)\n\n# Iterative factorial - uses O(1) space\ndef factorial_iterative(n):\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n\n# Both return same result\nprint(factorial_recursive(5))  # 120\nprint(factorial_iterative(5))  # 120', 'rec_vs_iter.py').content[0],
          generateCalloutJson('tip', 'Use recursion when the problem is naturally recursive (trees, graphs) or when it significantly simplifies code.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "memoization",
      title: "Memoization",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Memoization' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Memoization caches results of expensive recursive calls to avoid redundant calculations.' }] },
          generateCodeBlockJson('python', '# Naive Fibonacci - O(2^n) exponential!\ndef fib_naive(n):\n    if n <= 1:\n        return n\n    return fib_naive(n-1) + fib_naive(n-2)\n\n# Memoized Fibonacci - O(n) linear!\ndef fib_memo(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)\n    return memo[n]\n\n# Python\'s built-in memoization\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib_cached(n):\n    if n <= 1:\n        return n\n    return fib_cached(n-1) + fib_cached(n-2)\n\nprint(fib_cached(50))  # 12586269025 (instant!)', 'memoization.py').content[0],
          generateCalloutJson('success', 'Memoization turns exponential O(2^n) algorithms into linear O(n) by trading space for time!').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "recursion-quiz",
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
              explanation: 'The base case is the condition that stops recursion. Without it, the function would call itself forever.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the base case in recursion?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The first recursive call' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The largest input' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The condition that stops recursion' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'The return type' }] }] },
            ],
          },
        ],
      },
    },
  ];
}
