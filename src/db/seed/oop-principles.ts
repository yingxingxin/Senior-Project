import { generateCalloutJson, generateCodeBlockJson } from './helpers';

/**
 * Object-Oriented Programming Course Content
 * Target: Intermediate learners with basic programming knowledge
 * Language: Python
 */

export function getOOPLessons(courseId: number) {
  return [
    {
      slug: "oop-1-fundamentals",
      title: "OOP Fundamentals",
      description: "Understand objects, classes, and the basics of object-oriented thinking",
      difficulty: "standard" as const,
      estimated_duration_sec: 2700,
      parent_lesson_id: courseId,
      order_index: 0,
      icon: "{}",
      is_published: true,
    },
    {
      slug: "oop-2-encapsulation",
      title: "Encapsulation",
      description: "Learn to hide implementation details and protect data",
      difficulty: "standard" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 1,
      icon: "[]",
      is_published: true,
    },
    {
      slug: "oop-3-inheritance",
      title: "Inheritance",
      description: "Create class hierarchies and reuse code through inheritance",
      difficulty: "standard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 2,
      icon: "->",
      is_published: true,
    },
    {
      slug: "oop-4-polymorphism",
      title: "Polymorphism",
      description: "Write flexible code that works with different types",
      difficulty: "standard" as const,
      estimated_duration_sec: 2700,
      parent_lesson_id: courseId,
      order_index: 3,
      icon: "**",
      is_published: true,
    },
    {
      slug: "oop-5-abstraction",
      title: "Abstraction",
      description: "Hide complexity behind simple interfaces",
      difficulty: "standard" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 4,
      icon: "~~",
      is_published: true,
    },
    {
      slug: "oop-6-solid",
      title: "SOLID Principles",
      description: "Learn the five principles of good object-oriented design",
      difficulty: "hard" as const,
      estimated_duration_sec: 3600,
      parent_lesson_id: courseId,
      order_index: 5,
      icon: "S",
      is_published: true,
    },
    {
      slug: "oop-7-composition",
      title: "Composition vs Inheritance",
      description: "Know when to use composition instead of inheritance",
      difficulty: "standard" as const,
      estimated_duration_sec: 2400,
      parent_lesson_id: courseId,
      order_index: 6,
      icon: "+",
      is_published: true,
    },
    {
      slug: "oop-8-patterns",
      title: "Common Design Patterns",
      description: "Introduction to Factory, Singleton, and Observer patterns",
      difficulty: "hard" as const,
      estimated_duration_sec: 3000,
      parent_lesson_id: courseId,
      order_index: 7,
      icon: "*",
      is_published: true,
    },
  ];
}

// Lesson 1: OOP Fundamentals
export function getOOPLesson1Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-oop",
      title: "What is Object-Oriented Programming?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Object-Oriented Programming?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Object-Oriented Programming (OOP) is a way of organizing code around "objects" - bundles of related data and behavior. Instead of writing long procedural scripts, you model your program as interacting objects.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Think of objects like real-world things: a Car object has data (color, speed, fuel level) and behavior (accelerate, brake, turn).' }] },
          generateCalloutJson('info', 'OOP helps manage complexity by organizing code into logical units. It\'s the dominant paradigm in software development.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "classes-and-objects",
      title: "Classes and Objects",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Classes and Objects' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A class is a blueprint for creating objects. An object is an instance of a class.' }] },
          generateCodeBlockJson('python', 'class Dog:\n    """A class representing a dog"""\n    \n    def __init__(self, name, breed):\n        # Instance attributes - unique to each object\n        self.name = name\n        self.breed = breed\n        self.energy = 100\n    \n    def bark(self):\n        """A method - a function that belongs to the class"""\n        return f"{self.name} says woof!"\n    \n    def play(self):\n        self.energy -= 10\n        return f"{self.name} is playing! Energy: {self.energy}"\n\n# Creating objects (instances)\ndog1 = Dog("Buddy", "Golden Retriever")\ndog2 = Dog("Max", "Beagle")\n\nprint(dog1.bark())  # Buddy says woof!\nprint(dog2.bark())  # Max says woof!\nprint(dog1.play())  # Buddy is playing! Energy: 90', 'classes.py').content[0],
          generateCalloutJson('tip', '__init__ is the constructor - it runs when you create a new object. self refers to the current instance.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "attributes-methods",
      title: "Attributes and Methods",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Attributes and Methods' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Attributes are data stored in an object. Methods are functions that belong to an object.' }] },
          generateCodeBlockJson('python', 'class BankAccount:\n    # Class attribute - shared by all instances\n    bank_name = "PyBank"\n    \n    def __init__(self, owner, balance=0):\n        # Instance attributes - unique to each object\n        self.owner = owner\n        self.balance = balance\n    \n    def deposit(self, amount):\n        """Method that modifies instance state"""\n        if amount > 0:\n            self.balance += amount\n            return f"Deposited ${amount}. New balance: ${self.balance}"\n        return "Invalid amount"\n    \n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount\n            return f"Withdrew ${amount}. New balance: ${self.balance}"\n        return "Insufficient funds"\n\naccount = BankAccount("Alice", 1000)\nprint(account.deposit(500))   # Deposited $500. New balance: $1500\nprint(account.withdraw(200))  # Withdrew $200. New balance: $1300\nprint(account.bank_name)      # PyBank (class attribute)', 'attributes.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "oop-fundamentals-quiz",
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
              explanation: 'A class is a blueprint that defines attributes and methods. An object is a specific instance created from that blueprint.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is the relationship between a class and an object?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'They are the same thing' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A class is a blueprint, an object is an instance' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'An object contains multiple classes' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Objects are only used in Python' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 2: Encapsulation
export function getOOPLesson2Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-encapsulation",
      title: "What is Encapsulation?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Encapsulation?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Encapsulation is bundling data and the methods that operate on that data within a single unit (class), and restricting direct access to some of the object\'s components.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'It\'s like a car: you use the pedals and steering wheel (public interface), but the engine internals are hidden (private implementation).' }] },
          generateCalloutJson('info', 'Encapsulation protects data from accidental modification and allows you to change implementation without affecting code that uses the class.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "access-modifiers",
      title: "Access Modifiers in Python",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Access Modifiers in Python' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python uses naming conventions for access control:' }] },
          generateCodeBlockJson('python', 'class Person:\n    def __init__(self, name, age, ssn):\n        self.name = name        # Public - accessible anywhere\n        self._age = age          # Protected - convention, "internal use"\n        self.__ssn = ssn         # Private - name mangling applied\n    \n    def get_age(self):\n        """Getter for protected attribute"""\n        return self._age\n    \n    def set_age(self, age):\n        """Setter with validation"""\n        if 0 <= age <= 150:\n            self._age = age\n        else:\n            raise ValueError("Invalid age")\n\nperson = Person("Alice", 30, "123-45-6789")\n\nprint(person.name)     # Works - public\nprint(person._age)     # Works but discouraged - protected\n# print(person.__ssn)  # AttributeError - name mangled to _Person__ssn', 'access.py').content[0],
          generateCalloutJson('note', 'Python doesn\'t enforce private - it trusts developers. The double underscore triggers name mangling, not true privacy.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "properties",
      title: "Properties and Decorators",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Properties and Decorators' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Properties let you define getters and setters that look like attribute access:' }] },
          generateCodeBlockJson('python', 'class Temperature:\n    def __init__(self, celsius=0):\n        self._celsius = celsius\n    \n    @property\n    def celsius(self):\n        """Getter for celsius"""\n        return self._celsius\n    \n    @celsius.setter\n    def celsius(self, value):\n        """Setter with validation"""\n        if value < -273.15:\n            raise ValueError("Below absolute zero!")\n        self._celsius = value\n    \n    @property\n    def fahrenheit(self):\n        """Computed property - no setter needed"""\n        return self._celsius * 9/5 + 32\n\ntemp = Temperature(25)\nprint(temp.celsius)     # 25 (uses getter)\nprint(temp.fahrenheit)  # 77.0 (computed property)\n\ntemp.celsius = 30       # Uses setter\nprint(temp.fahrenheit)  # 86.0', 'properties.py').content[0],
          generateCalloutJson('tip', 'Use properties when you need validation, computed values, or want to add logic to attribute access without changing the interface.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "encapsulation-quiz",
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
              explanation: 'In Python, double underscore prefix (__) triggers name mangling, making the attribute harder to access from outside the class.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'In Python, what does a double underscore prefix (like __variable) indicate?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Public attribute' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Static attribute' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Private (name mangled) attribute' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Constant' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 3: Inheritance
export function getOOPLesson3Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-inheritance",
      title: "What is Inheritance?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Inheritance?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Inheritance allows a class (child) to inherit attributes and methods from another class (parent). It\'s for "is-a" relationships.' }] },
          generateCodeBlockJson('python', 'class Animal:\n    """Parent/Base class"""\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        return "Some sound"\n    \n    def eat(self):\n        return f"{self.name} is eating"\n\nclass Dog(Animal):\n    """Child class - inherits from Animal"""\n    def __init__(self, name, breed):\n        super().__init__(name)  # Call parent constructor\n        self.breed = breed\n    \n    def speak(self):  # Override parent method\n        return f"{self.name} says woof!"\n    \n    def fetch(self):  # New method specific to Dog\n        return f"{self.name} is fetching"\n\ndog = Dog("Buddy", "Golden Retriever")\nprint(dog.eat())    # Buddy is eating (inherited)\nprint(dog.speak())  # Buddy says woof! (overridden)\nprint(dog.fetch())  # Buddy is fetching (new)', 'inheritance.py').content[0],
          generateCalloutJson('info', 'super() lets you call the parent class\'s methods. Always call super().__init__() if you override __init__.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "method-overriding",
      title: "Method Overriding",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Method Overriding' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Child classes can override parent methods to provide specialized behavior:' }] },
          generateCodeBlockJson('python', 'class Shape:\n    def area(self):\n        raise NotImplementedError("Subclass must implement")\n    \n    def describe(self):\n        return f"I am a shape with area {self.area()}"\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    \n    def area(self):\n        return self.width * self.height\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        self.radius = radius\n    \n    def area(self):\n        import math\n        return math.pi * self.radius ** 2\n\nrect = Rectangle(4, 5)\ncircle = Circle(3)\n\nprint(rect.describe())    # I am a shape with area 20\nprint(circle.describe())  # I am a shape with area 28.27...', 'overriding.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "multiple-inheritance",
      title: "Multiple Inheritance",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Multiple Inheritance' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Python supports multiple inheritance - a class can inherit from multiple parents:' }] },
          generateCodeBlockJson('python', 'class Flyable:\n    def fly(self):\n        return "Flying!"\n\nclass Swimmable:\n    def swim(self):\n        return "Swimming!"\n\nclass Duck(Flyable, Swimmable):\n    """Duck can both fly and swim"""\n    def __init__(self, name):\n        self.name = name\n    \n    def quack(self):\n        return f"{self.name} says quack!"\n\nduck = Duck("Donald")\nprint(duck.fly())    # Flying! (from Flyable)\nprint(duck.swim())   # Swimming! (from Swimmable)\nprint(duck.quack())  # Donald says quack! (own method)', 'multiple.py').content[0],
          generateCalloutJson('warning', 'Multiple inheritance can cause complexity (diamond problem). Prefer composition or mixins for simpler designs.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "inheritance-quiz",
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
              explanation: 'super() is used to call a method from the parent class, commonly used in __init__ to initialize parent attributes.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does super() do in Python?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Calls the parent class method' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Creates a new class' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Deletes an object' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Makes a method private' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 4: Polymorphism
export function getOOPLesson4Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-polymorphism",
      title: "What is Polymorphism?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Polymorphism?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Polymorphism means "many forms". It allows different classes to be treated through the same interface, with each class responding in its own way.' }] },
          generateCodeBlockJson('python', 'class Cat:\n    def speak(self):\n        return "Meow!"\n\nclass Dog:\n    def speak(self):\n        return "Woof!"\n\nclass Duck:\n    def speak(self):\n        return "Quack!"\n\n# Polymorphism in action - same interface, different behavior\ndef animal_sound(animal):\n    """Works with any object that has a speak() method"""\n    print(animal.speak())\n\n# Different types, same function\nfor animal in [Cat(), Dog(), Duck()]:\n    animal_sound(animal)\n\n# Output:\n# Meow!\n# Woof!\n# Quack!', 'polymorphism.py').content[0],
          generateCalloutJson('info', 'Polymorphism lets you write flexible code that works with different types without knowing the specific type.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "duck-typing",
      title: "Duck Typing",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Duck Typing' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '"If it walks like a duck and quacks like a duck, it\'s a duck." Python doesn\'t require explicit interfaces - if an object has the right methods, it works.' }] },
          generateCodeBlockJson('python', 'class Robot:\n    """Not an Animal, but has speak()"""\n    def speak(self):\n        return "Beep boop!"\n\nclass FileWriter:\n    """Has write(), so can be used where files are expected"""\n    def __init__(self):\n        self.data = []\n    \n    def write(self, text):\n        self.data.append(text)\n\ndef save_data(file_like, data):\n    """Works with anything that has write()"""\n    file_like.write(data)\n\n# Works with actual file\nwith open("test.txt", "w") as f:\n    save_data(f, "Hello")\n\n# Also works with our custom class!\nwriter = FileWriter()\nsave_data(writer, "Hello")\nprint(writer.data)  # [\'Hello\']', 'duck_typing.py').content[0],
          generateCalloutJson('tip', 'Duck typing is powerful but be careful - typos in method names cause runtime errors, not compile-time errors.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "polymorphism-quiz",
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
              explanation: 'Duck typing means Python cares about what methods an object has, not what class it is.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What is "duck typing" in Python?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A type of inheritance' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Object behavior matters more than type' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A way to create duck objects' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Static type checking' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 5: Abstraction
export function getOOPLesson5Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "what-is-abstraction",
      title: "What is Abstraction?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What is Abstraction?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Abstraction hides complex implementation details and shows only the necessary features. It\'s about exposing "what" something does, not "how" it does it.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Like a TV remote: you press buttons (interface), but don\'t need to know about the circuits inside (implementation).' }] },
          generateCalloutJson('info', 'Abstraction reduces complexity by hiding unnecessary details. Users interact with a simple interface.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "abstract-classes",
      title: "Abstract Base Classes",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Abstract Base Classes' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Abstract classes can\'t be instantiated directly. They define a template that subclasses must follow.' }] },
          generateCodeBlockJson('python', 'from abc import ABC, abstractmethod\n\nclass PaymentProcessor(ABC):\n    """Abstract base class - can\'t instantiate directly"""\n    \n    @abstractmethod\n    def process_payment(self, amount):\n        """Subclasses MUST implement this"""\n        pass\n    \n    def validate_amount(self, amount):\n        """Regular method - inherited by all subclasses"""\n        return amount > 0\n\nclass CreditCardProcessor(PaymentProcessor):\n    def process_payment(self, amount):\n        if self.validate_amount(amount):\n            return f"Processing ${amount} via credit card"\n        return "Invalid amount"\n\nclass PayPalProcessor(PaymentProcessor):\n    def process_payment(self, amount):\n        if self.validate_amount(amount):\n            return f"Processing ${amount} via PayPal"\n        return "Invalid amount"\n\n# processor = PaymentProcessor()  # Error! Can\'t instantiate abstract\ncc = CreditCardProcessor()\nprint(cc.process_payment(100))  # Processing $100 via credit card', 'abstract.py').content[0],
          generateCalloutJson('tip', 'Use ABC when you want to ensure subclasses implement specific methods. It catches missing implementations at instantiation.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "abstraction-quiz",
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
              explanation: 'Abstract classes cannot be instantiated directly - they serve as blueprints for other classes.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What happens if you try to instantiate an abstract class directly?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It works normally' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It creates an empty object' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It raises an error' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'It creates a copy of the class' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 6: SOLID Principles
export function getOOPLesson6Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "solid-intro",
      title: "Introduction to SOLID",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'The SOLID Principles' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'SOLID is an acronym for five design principles that make software more maintainable and flexible:' }] },
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'S' },
            { type: 'text', text: ' - Single Responsibility: A class should have one job' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'O' },
            { type: 'text', text: ' - Open/Closed: Open for extension, closed for modification' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'L' },
            { type: 'text', text: ' - Liskov Substitution: Subtypes must be substitutable for base types' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'I' },
            { type: 'text', text: ' - Interface Segregation: Many specific interfaces over one general' }
          ]},
          { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'D' },
            { type: 'text', text: ' - Dependency Inversion: Depend on abstractions, not concretions' }
          ]},
          generateCalloutJson('info', 'SOLID principles guide you toward code that\'s easier to maintain, test, and extend.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "srp",
      title: "Single Responsibility Principle",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Single Responsibility Principle (SRP)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'A class should have only one reason to change - one job.' }] },
          generateCodeBlockJson('python', '# BAD - User class does too much\nclass UserBad:\n    def __init__(self, name):\n        self.name = name\n    \n    def save_to_database(self):  # Database logic\n        pass\n    \n    def send_email(self):  # Email logic\n        pass\n    \n    def generate_report(self):  # Reporting logic\n        pass\n\n# GOOD - Separate responsibilities into different classes\nclass User:\n    def __init__(self, name):\n        self.name = name\n\nclass UserRepository:\n    def save(self, user):\n        # Database logic only\n        pass\n\nclass EmailService:\n    def send(self, user, message):\n        # Email logic only\n        pass\n\nclass ReportGenerator:\n    def generate_user_report(self, user):\n        # Reporting logic only\n        pass', 'srp.py').content[0],
          generateCalloutJson('tip', 'If you can describe a class\'s purpose without using "and", it probably follows SRP.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "ocp",
      title: "Open/Closed Principle",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Open/Closed Principle (OCP)' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Classes should be open for extension but closed for modification. Add new functionality by adding new code, not changing existing code.' }] },
          generateCodeBlockJson('python', '# BAD - Need to modify class for each new discount\nclass DiscountBad:\n    def calculate(self, price, customer_type):\n        if customer_type == "regular":\n            return price * 0.9\n        elif customer_type == "vip":\n            return price * 0.8\n        # Adding new type requires modifying this class!\n\n# GOOD - Extend through new classes\nclass Discount:\n    def calculate(self, price):\n        raise NotImplementedError\n\nclass RegularDiscount(Discount):\n    def calculate(self, price):\n        return price * 0.9\n\nclass VIPDiscount(Discount):\n    def calculate(self, price):\n        return price * 0.8\n\nclass NewYearDiscount(Discount):  # Easy to add!\n    def calculate(self, price):\n        return price * 0.7', 'ocp.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "solid-quiz",
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
              explanation: 'The Single Responsibility Principle states that a class should have only one reason to change - one job.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'What does the "S" in SOLID stand for?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Single Responsibility' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Simple Structure' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Secure Serialization' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Static Scope' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 7: Composition vs Inheritance
export function getOOPLesson7Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "composition-intro",
      title: "Composition vs Inheritance",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Composition vs Inheritance' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Inheritance models "is-a" relationships (Dog is an Animal). Composition models "has-a" relationships (Car has an Engine).' }] },
          generateCodeBlockJson('python', '# Inheritance - Dog IS an Animal\nclass Animal:\n    def eat(self):\n        return "Eating"\n\nclass Dog(Animal):\n    def bark(self):\n        return "Woof!"\n\n# Composition - Car HAS an Engine\nclass Engine:\n    def start(self):\n        return "Engine started"\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()  # Composition - contains an Engine\n    \n    def start(self):\n        return self.engine.start()  # Delegates to engine\n\ncar = Car()\nprint(car.start())  # Engine started', 'comp_vs_inh.py').content[0],
          generateCalloutJson('tip', '"Favor composition over inheritance" - It\'s more flexible because you can change behavior at runtime.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "when-to-use",
      title: "When to Use Each",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'When to Use Each' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Use inheritance when there\'s a clear "is-a" relationship and you want to share implementation.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Use composition when you want flexibility, or when the relationship is "has-a" or "uses-a".' }] },
          generateCodeBlockJson('python', '# Inheritance problem: Rigid hierarchy\nclass FlyingBird:\n    def fly(self): pass\n\nclass Penguin(FlyingBird):  # Oops! Penguins can\'t fly!\n    pass\n\n# Composition solution: Flexible behaviors\nclass FlyBehavior:\n    def fly(self):\n        return "Flying!"\n\nclass NoFlyBehavior:\n    def fly(self):\n        return "Can\'t fly"\n\nclass Bird:\n    def __init__(self, fly_behavior):\n        self.fly_behavior = fly_behavior\n    \n    def perform_fly(self):\n        return self.fly_behavior.fly()\n\nsparrow = Bird(FlyBehavior())\npenguin = Bird(NoFlyBehavior())\n\nprint(sparrow.perform_fly())  # Flying!\nprint(penguin.perform_fly())  # Can\'t fly', 'when_to_use.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "composition-quiz",
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
              explanation: 'Composition models "has-a" relationships where one object contains another, like a Car having an Engine.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which relationship does composition model?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'is-a' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'has-a' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'was-a' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'will-be-a' }] }] },
            ],
          },
        ],
      },
    },
  ];
}

// Lesson 8: Design Patterns
export function getOOPLesson8Sections(lessonId: number) {
  return [
    {
      lesson_id: lessonId,
      order_index: 0,
      slug: "patterns-intro",
      title: "What are Design Patterns?",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'What are Design Patterns?' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Design patterns are reusable solutions to common problems in software design. They\'re templates, not code you copy-paste.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Patterns are categorized as: Creational (creating objects), Structural (composing objects), Behavioral (object interaction).' }] },
          generateCalloutJson('info', 'Don\'t overuse patterns! Apply them when you see the problem they solve, not just because they exist.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 1,
      slug: "singleton",
      title: "Singleton Pattern",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Singleton Pattern' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Singleton ensures a class has only one instance and provides global access to it. Use for things like database connections or configuration.' }] },
          generateCodeBlockJson('python', 'class DatabaseConnection:\n    _instance = None\n    \n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n            cls._instance.connected = False\n        return cls._instance\n    \n    def connect(self):\n        if not self.connected:\n            print("Connecting to database...")\n            self.connected = True\n        else:\n            print("Already connected")\n\n# Both variables reference the SAME instance\ndb1 = DatabaseConnection()\ndb2 = DatabaseConnection()\n\nprint(db1 is db2)  # True - same object!\ndb1.connect()      # Connecting to database...\ndb2.connect()      # Already connected', 'singleton.py').content[0],
          generateCalloutJson('warning', 'Singletons can make testing harder and hide dependencies. Consider dependency injection as an alternative.').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 2,
      slug: "factory",
      title: "Factory Pattern",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Factory Pattern' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Factory pattern creates objects without specifying the exact class. It centralizes object creation logic.' }] },
          generateCodeBlockJson('python', 'class Dog:\n    def speak(self):\n        return "Woof!"\n\nclass Cat:\n    def speak(self):\n        return "Meow!"\n\nclass Bird:\n    def speak(self):\n        return "Tweet!"\n\nclass AnimalFactory:\n    """Centralizes creation logic"""\n    @staticmethod\n    def create_animal(animal_type):\n        animals = {\n            "dog": Dog,\n            "cat": Cat,\n            "bird": Bird\n        }\n        animal_class = animals.get(animal_type.lower())\n        if animal_class:\n            return animal_class()\n        raise ValueError(f"Unknown animal: {animal_type}")\n\n# Client code doesn\'t need to know about concrete classes\ndog = AnimalFactory.create_animal("dog")\ncat = AnimalFactory.create_animal("cat")\n\nprint(dog.speak())  # Woof!\nprint(cat.speak())  # Meow!', 'factory.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 3,
      slug: "observer",
      title: "Observer Pattern",
      body_md: "",
      body_json: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Observer Pattern' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Observer defines a one-to-many dependency where multiple objects get notified when one object changes. Think YouTube subscriptions.' }] },
          generateCodeBlockJson('python', 'class YouTubeChannel:\n    def __init__(self, name):\n        self.name = name\n        self.subscribers = []\n    \n    def subscribe(self, subscriber):\n        self.subscribers.append(subscriber)\n    \n    def unsubscribe(self, subscriber):\n        self.subscribers.remove(subscriber)\n    \n    def upload_video(self, title):\n        print(f"{self.name} uploaded: {title}")\n        self.notify_all(title)\n    \n    def notify_all(self, title):\n        for subscriber in self.subscribers:\n            subscriber.notify(self.name, title)\n\nclass Subscriber:\n    def __init__(self, name):\n        self.name = name\n    \n    def notify(self, channel, video):\n        print(f"  {self.name} notified: New video \'{video}\' from {channel}")\n\nchannel = YouTubeChannel("TechTips")\nalice = Subscriber("Alice")\nbob = Subscriber("Bob")\n\nchannel.subscribe(alice)\nchannel.subscribe(bob)\nchannel.upload_video("Python Tips")\n# Output:\n# TechTips uploaded: Python Tips\n#   Alice notified: New video \'Python Tips\' from TechTips\n#   Bob notified: New video \'Python Tips\' from TechTips', 'observer.py').content[0],
        ],
      },
    },
    {
      lesson_id: lessonId,
      order_index: 4,
      slug: "patterns-quiz",
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
              explanation: 'The Singleton pattern ensures only one instance of a class exists throughout the application.',
            },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Which pattern ensures only one instance of a class exists?' }] },
              { type: 'quizOption', attrs: { id: 'a' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Factory' }] }] },
              { type: 'quizOption', attrs: { id: 'b' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Singleton' }] }] },
              { type: 'quizOption', attrs: { id: 'c' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Observer' }] }] },
              { type: 'quizOption', attrs: { id: 'd' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Strategy' }] }] },
            ],
          },
        ],
      },
    },
  ];
}
