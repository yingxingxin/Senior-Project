import type { QuizSeed } from './programming-foundations';

export function getOOPQuizzes(): QuizSeed[] {
  return [
    // Quiz 1: Classes & Objects (beginner, 5 questions)
    {
      slug: 'classes-and-objects',
      title: 'Classes & Objects',
      description: 'Understand the building blocks of object-oriented programming.',
      topic_slug: 'oop_principles',
      skill_level: 'beginner',
      default_length: 5,
      questions: [
        {
          prompt: 'What is a class in object-oriented programming?',
          options: [
            'A specific instance of an object',
            'A blueprint or template for creating objects',
            'A function that returns a value',
            'A type of variable',
          ],
          correct_index: 1,
          explanation: 'A class is a blueprint that defines the properties (attributes) and behaviors (methods) that objects of that type will have. Objects are instances created from classes.',
        },
        {
          prompt: 'What is the difference between a class and an object?',
          options: [
            'They are the same thing',
            'A class is the template; an object is an instance of that template',
            'An object is the template; a class is an instance',
            'Classes are only used in JavaScript',
          ],
          correct_index: 1,
          explanation: 'A class defines the structure, while an object is a concrete instance. For example, "Car" is a class; "my red Toyota" is an object of that class.',
        },
        {
          prompt: 'What is a constructor?',
          options: [
            'A method that destroys objects',
            'A special method called when creating a new object instance',
            'A method that returns the object\'s type',
            'A private variable',
          ],
          correct_index: 1,
          explanation: 'Constructors initialize a new object\'s state. They\'re called automatically when you create an object with `new ClassName()` and typically set up initial property values.',
        },
        {
          prompt: 'What does the `this` keyword refer to inside a class method?',
          options: [
            'The class itself',
            'The current object instance',
            'The parent class',
            'The global scope',
          ],
          correct_index: 1,
          explanation: '`this` refers to the specific object instance that called the method. It allows methods to access and modify that instance\'s properties.',
        },
        {
          prompt: 'What are "instance variables" (or "properties")?',
          options: [
            'Variables shared by all instances of a class',
            'Variables that belong to a specific object instance',
            'Variables that can only be numbers',
            'Variables that are automatically deleted',
          ],
          correct_index: 1,
          explanation: 'Instance variables store data unique to each object. Each instance has its own copy. Class/static variables are shared across all instances.',
        },
      ],
    },

    // Quiz 2: Encapsulation & Abstraction (intermediate, 7 questions)
    {
      slug: 'encapsulation-and-abstraction',
      title: 'Encapsulation & Abstraction',
      description: 'Learn how to hide complexity and protect data in OOP.',
      topic_slug: 'oop_principles',
      skill_level: 'intermediate',
      default_length: 7,
      questions: [
        {
          prompt: 'What is encapsulation?',
          options: [
            'Creating multiple classes',
            'Bundling data and methods together while restricting direct access to internal state',
            'Making all variables public',
            'Deleting objects when they\'re no longer needed',
          ],
          correct_index: 1,
          explanation: 'Encapsulation hides internal state and requires interaction through methods. This protects data integrity and allows implementation changes without affecting users of the class.',
        },
        {
          prompt: 'What is the purpose of getter and setter methods?',
          options: [
            'To make code longer',
            'To provide controlled access to private properties',
            'To delete properties',
            'To create new classes',
          ],
          correct_index: 1,
          explanation: 'Getters and setters allow validation, computed properties, and the ability to change internal implementation without breaking code that uses the class.',
        },
        {
          prompt: 'What does "private" access modifier mean?',
          options: [
            'Accessible from anywhere',
            'Accessible only within the same class',
            'Accessible from subclasses only',
            'Accessible within the same package',
          ],
          correct_index: 1,
          explanation: 'Private members can only be accessed from within the class that defines them. This is the strictest access level and enforces encapsulation.',
        },
        {
          prompt: 'What is abstraction in OOP?',
          options: [
            'Making code as complex as possible',
            'Hiding implementation details and showing only essential features',
            'Creating abstract art in code',
            'Making all methods public',
          ],
          correct_index: 1,
          explanation: 'Abstraction simplifies complexity by exposing only what\'s necessary. Users interact with a simple interface without needing to understand the underlying implementation.',
        },
        {
          prompt: 'What is the difference between an interface and an abstract class?',
          options: [
            'They are identical',
            'Interfaces define only method signatures; abstract classes can have implementations',
            'Abstract classes cannot have methods',
            'Interfaces can be instantiated; abstract classes cannot',
          ],
          correct_index: 1,
          explanation: 'Interfaces define a contract (what methods must exist). Abstract classes can include shared implementation code that subclasses inherit.',
        },
        {
          prompt: 'Why is encapsulation important?',
          options: [
            'It makes code run faster',
            'It reduces file size',
            'It protects data integrity and allows safe modifications to internal implementation',
            'It is required by all programming languages',
          ],
          correct_index: 2,
          explanation: 'Encapsulation prevents invalid states, allows validation in setters, and lets you change internal implementation without breaking code that uses the class.',
        },
        {
          prompt: 'What does "protected" access modifier typically mean?',
          options: [
            'Accessible from anywhere',
            'Only accessible within the same class',
            'Accessible within the class and its subclasses',
            'Not accessible at all',
          ],
          correct_index: 2,
          explanation: 'Protected members are accessible in the defining class and all subclasses. This allows inheritance while still hiding details from external code.',
        },
      ],
    },

    // Quiz 3: Inheritance & Polymorphism (intermediate, 7 questions)
    {
      slug: 'inheritance-and-polymorphism',
      title: 'Inheritance & Polymorphism',
      description: 'Master code reuse through inheritance and flexible behavior with polymorphism.',
      topic_slug: 'oop_principles',
      skill_level: 'intermediate',
      default_length: 7,
      questions: [
        {
          prompt: 'What is inheritance in OOP?',
          options: [
            'Copying code between files',
            'A mechanism where a class acquires properties and methods from another class',
            'Deleting unused code',
            'Creating multiple instances of a class',
          ],
          correct_index: 1,
          explanation: 'Inheritance allows a child class to inherit attributes and methods from a parent class, promoting code reuse and establishing "is-a" relationships.',
        },
        {
          prompt: 'What keyword is typically used to inherit from a parent class?',
          options: ['implements', 'extends', 'inherits', 'uses'],
          correct_index: 1,
          explanation: 'Most languages use `extends` for class inheritance. `implements` is typically used for interfaces.',
        },
        {
          prompt: 'What is method overriding?',
          options: [
            'Creating a new method with a different name',
            'Providing a specific implementation of a method in a subclass that already exists in the parent class',
            'Making a method private',
            'Deleting a method from the parent class',
          ],
          correct_index: 1,
          explanation: 'Overriding allows subclasses to provide their own specific behavior for inherited methods while maintaining the same method signature.',
        },
        {
          prompt: 'What is polymorphism?',
          options: [
            'Having multiple constructors',
            'The ability to treat objects of different types through a common interface',
            'Creating multiple classes with the same name',
            'A type of encryption',
          ],
          correct_index: 1,
          explanation: 'Polymorphism means "many forms". It allows code to work with objects of different types as long as they share a common interface or parent class.',
        },
        {
          prompt: 'What is the "super" keyword used for?',
          options: [
            'Creating a new superclass',
            'Accessing parent class methods and constructors',
            'Making methods run faster',
            'Declaring global variables',
          ],
          correct_index: 1,
          explanation: '`super` references the parent class. It\'s commonly used to call the parent\'s constructor or to access overridden methods from the parent class.',
        },
        {
          prompt: 'What is method overloading?',
          options: [
            'Creating methods that are too complex',
            'Multiple methods with the same name but different parameters',
            'Methods that run multiple times',
            'Inheriting methods from multiple classes',
          ],
          correct_index: 1,
          explanation: 'Overloading allows multiple methods with the same name but different parameter lists. The correct method is chosen based on the arguments passed.',
        },
        {
          prompt: 'What is the "Liskov Substitution Principle"?',
          options: [
            'Subclasses should add as many methods as possible',
            'Objects of a superclass should be replaceable with objects of its subclasses without breaking the program',
            'All classes should be abstract',
            'Inheritance should never be used',
          ],
          correct_index: 1,
          explanation: 'LSP states that subclasses must be usable wherever their parent class is expected. Violating this leads to unexpected behavior and bugs.',
        },
      ],
    },

    // Quiz 4: Design Patterns Intro (advanced, 10 questions)
    {
      slug: 'design-patterns-intro',
      title: 'Design Patterns Introduction',
      description: 'Explore common design patterns and when to apply them.',
      topic_slug: 'oop_principles',
      skill_level: 'advanced',
      default_length: 10,
      questions: [
        {
          prompt: 'What is a design pattern?',
          options: [
            'A specific code library',
            'A reusable solution to a commonly occurring problem in software design',
            'A way to format code',
            'A programming language feature',
          ],
          correct_index: 1,
          explanation: 'Design patterns are proven, reusable solutions to common problems. They\'re templates that can be adapted to various situations, not specific code to copy.',
        },
        {
          prompt: 'What problem does the Singleton pattern solve?',
          options: [
            'Creating multiple instances of a class',
            'Ensuring only one instance of a class exists throughout the application',
            'Connecting to multiple databases',
            'Sorting data efficiently',
          ],
          correct_index: 1,
          explanation: 'Singleton ensures a class has only one instance and provides global access to it. Common uses include configuration managers, logging, and connection pools.',
        },
        {
          prompt: 'What is the Factory pattern used for?',
          options: [
            'Manufacturing physical products',
            'Creating objects without specifying the exact class to create',
            'Destroying unused objects',
            'Connecting to factories via API',
          ],
          correct_index: 1,
          explanation: 'Factory pattern creates objects without exposing instantiation logic. This allows for flexibility in object creation and makes code more maintainable.',
        },
        {
          prompt: 'What does the Observer pattern enable?',
          options: [
            'Watching employees work',
            'One-to-many dependency where multiple objects are notified of state changes',
            'Debugging code visually',
            'Optimizing database queries',
          ],
          correct_index: 1,
          explanation: 'Observer allows objects to subscribe to events. When the observed object changes, all subscribers are automatically notified. Used in event systems and reactive programming.',
        },
        {
          prompt: 'What is the Strategy pattern?',
          options: [
            'A way to plan software development',
            'Defining a family of algorithms that can be selected at runtime',
            'A game development technique',
            'A database optimization method',
          ],
          correct_index: 1,
          explanation: 'Strategy pattern encapsulates algorithms in separate classes, making them interchangeable. This allows changing behavior at runtime without modifying the client code.',
        },
        {
          prompt: 'What is the Decorator pattern used for?',
          options: [
            'Making UI look prettier',
            'Adding new behavior to objects dynamically without altering their structure',
            'Decorating code with comments',
            'Creating festive themes',
          ],
          correct_index: 1,
          explanation: 'Decorator wraps objects to add functionality. Unlike inheritance, decorators can be applied at runtime and combined in various ways.',
        },
        {
          prompt: 'Which pattern would you use to convert one interface to another?',
          options: ['Singleton', 'Factory', 'Adapter', 'Observer'],
          correct_index: 2,
          explanation: 'Adapter pattern converts one interface into another that clients expect. It\'s like a power adapter that lets incompatible devices work together.',
        },
        {
          prompt: 'What is Dependency Injection?',
          options: [
            'Injecting malicious code',
            'Providing dependencies to a class from outside rather than creating them internally',
            'Adding more dependencies to a project',
            'A type of SQL injection',
          ],
          correct_index: 1,
          explanation: 'DI passes dependencies to objects rather than having them create dependencies themselves. This improves testability, flexibility, and follows the Inversion of Control principle.',
        },
        {
          prompt: 'What problem does the Builder pattern solve?',
          options: [
            'Building physical structures',
            'Constructing complex objects step by step with optional parameters',
            'Building faster processors',
            'Creating simple objects',
          ],
          correct_index: 1,
          explanation: 'Builder separates object construction from its representation. It\'s useful for objects with many optional parameters, avoiding telescoping constructors.',
        },
        {
          prompt: 'Which SOLID principle does the Open/Closed Principle represent?',
          options: [
            'Classes should be responsible for one thing only',
            'Classes should be open for extension but closed for modification',
            'Depend on abstractions, not concretions',
            'Clients should not depend on interfaces they don\'t use',
          ],
          correct_index: 1,
          explanation: 'Open/Closed means you can extend behavior by adding new code, not by modifying existing working code. This reduces the risk of introducing bugs.',
        },
      ],
    },
  ];
}
