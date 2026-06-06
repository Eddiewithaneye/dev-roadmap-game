export type LanguageCategory = "language";

export type LanguageDefinition = {
  id: string;
  name: string;
  category: LanguageCategory;
  manifestation: string;
  shortDescription: string;
  attackPattern: string;
  stats: {
    damage: number;
    cooldown: number;
    range: number;
  };
  codexEntry?: string;
};

export const LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript",
    category: "language",
    manifestation: "Event Spark Wand",
    shortDescription:
      "A language used to add behavior and interactivity to web apps.",
    attackPattern: "chain-spark",
    stats: {
      damage: 18,
      cooldown: 3,
      range: 6,
    },
    codexEntry:
      "JavaScript powers dynamic behavior on websites and is one of the core technologies of the web. It can run in browsers and on servers through environments like Node.js.",
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "language",
    manifestation: "Typebound Grimoire",
    shortDescription:
      "A typed superset of JavaScript that helps catch errors before runtime.",
    attackPattern: "precision-bolt",
    stats: {
      damage: 20,
      cooldown: 3,
      range: 7,
    },
    codexEntry:
      "TypeScript extends JavaScript with static typing and tooling that helps developers find bugs before running their code. It is commonly used in large web applications.",
  },
  {
    id: "python",
    name: "Python",
    category: "language",
    manifestation: "Indentation Familiar",
    shortDescription:
      "A readable general-purpose language used across apps, data, and automation.",
    attackPattern: "homing-helper",
    stats: {
      damage: 14,
      cooldown: 2,
      range: 5,
    },
    codexEntry:
      "Python is known for its readable syntax and significant indentation. It is widely used for automation, web development, data science, artificial intelligence, and scripting.",
  },
  {
    id: "sql",
    name: "SQL",
    category: "language",
    manifestation: "Query Bow",
    shortDescription:
      "A language used to query and work with structured data.",
    attackPattern: "piercing-row-shot",
    stats: {
      damage: 24,
      cooldown: 4,
      range: 8,
    },
    codexEntry:
      "SQL is the standard language for querying and managing data in relational databases. It allows developers to search, filter, update, and organize structured information.",
  },
  {
    id: "java",
    name: "Java",
    category: "language",
    manifestation: "JVM Colossus",
    shortDescription:
      "A widely used object-oriented language built for portability and scale.",
    attackPattern: "heavy-slam",
    stats: {
      damage: 28,
      cooldown: 5,
      range: 4,
    },
    codexEntry:
      "Java is an object-oriented language designed to run on the Java Virtual Machine (JVM). Its portability and mature ecosystem make it popular for enterprise applications and backend systems.",
  },
  {
    id: "csharp",
    name: "C#",
    category: "language",
    manifestation: "LINQ Chakram",
    shortDescription:
      "A modern language commonly used for applications and game development.",
    attackPattern: "ricochet-query",
    stats: {
      damage: 22,
      cooldown: 3,
      range: 6,
    },
    codexEntry:
      "C# is a language created by Microsoft and is commonly used for desktop applications, cloud services, web development, and game development through Unity.",
  },
  {
    id: "cpp",
    name: "C++",
    category: "language",
    manifestation: "Pointer Lance",
    shortDescription:
      "A high-performance language used in engines and systems.",
    attackPattern: "piercing-charge",
    stats: {
      damage: 36,
      cooldown: 7,
      range: 8,
    },
    codexEntry:
      "C++ provides high performance and direct control over system resources. It is widely used in game engines, graphics software, operating systems, and other performance-critical applications.",
  },
  {
    id: "rust",
    name: "Rust",
    category: "language",
    manifestation: "Borrower's Shield",
    shortDescription:
      "A systems language focused on memory safety and performance.",
    attackPattern: "counter-spike",
    stats: {
      damage: 30,
      cooldown: 5,
      range: 5,
    },
    codexEntry:
      "Rust is designed to provide memory safety without sacrificing performance. Its ownership and borrowing system helps prevent common bugs such as data races and invalid memory access.",
  },
  {
    id: "go",
    name: "Go",
    category: "language",
    manifestation: "Goroutine Totem",
    shortDescription:
      "A fast and simple language designed for scalable backend services.",
    attackPattern: "split-shot",
    stats: {
      damage: 17,
      cooldown: 2,
      range: 7,
    },
    codexEntry:
      "Go was created at Google to simplify large-scale software development. It is known for fast compilation, simple syntax, and built-in concurrency through goroutines.",

  },
  {
    id: "kotlin",
    name: "Kotlin",
    category: "language",
    manifestation: "Nullbane Saber",
    shortDescription:
      "A concise language commonly used for Android and backend development.",
    attackPattern: "swift-slash",
    stats: {
      damage: 21,
      cooldown: 3,
      range: 5,
    },
    codexEntry:
      "Kotlin is a statically typed language that interoperates with Java. It is the preferred language for modern Android development and is also used for backend services.",
  },
  {
    id: "swift",
    name: "Swift",
    category: "language",
    manifestation: "Optional Dagger",
    shortDescription:
      "A modern language built for Apple platforms.",
    attackPattern: "blink-strike",
    stats: {
      damage: 23,
      cooldown: 2,
      range: 6,
    },
    codexEntry:
      "Swift is Apple's modern programming language for iOS, macOS, watchOS, and tvOS development. It emphasizes safety, performance, and ease of use.",

  },
  {
    id: "ruby",
    name: "Ruby",
    category: "language",
    manifestation: "Rails Chariot",
    shortDescription:
      "A developer-friendly language known for elegant syntax.",
    attackPattern: "guided-charge",
    stats: {
      damage: 16,
      cooldown: 2,
      range: 6,
    },
    codexEntry:
      "Ruby is a dynamic programming language designed for simplicity and developer happiness. It is best known for the Ruby on Rails web development framework.",

  },
  {
    id: "php",
    name: "PHP",
    category: "language",
    manifestation: "Server Sigil",
    shortDescription:
      "A scripting language that powers a large portion of the web.",
    attackPattern: "portal-bolt",
    stats: {
      damage: 19,
      cooldown: 3,
      range: 7,
    },
    codexEntry:
      "PHP is a server-side scripting language commonly used to build websites and web applications. It powers many content management systems, including WordPress.",
  },
  {
    id: "scala",
    name: "Scala",
    category: "language",
    manifestation: "Pattern-Match Mask",
    shortDescription:
      "A language blending object-oriented and functional programming.",
    attackPattern: "adaptive-cast",
    stats: {
      damage: 27,
      cooldown: 4,
      range: 7,
    },
    codexEntry:
      "Scala combines object-oriented and functional programming concepts. It runs on the JVM and is often used in data processing, distributed systems, and backend development.",
  },
  {
    id: "elixir",
    name: "Elixir",
    category: "language",
    manifestation: "Phoenix Process Brazier",
    shortDescription:
      "A functional language built for fault-tolerant systems.",
    attackPattern: "rebirth-flame",
    stats: {
      damage: 25,
      cooldown: 4,
      range: 6,
    },
    codexEntry:
      "Elixir is a functional language built on the Erlang VM. It excels at highly concurrent, fault-tolerant applications and real-time systems.",
  },
  {
    id: "haskell",
    name: "Haskell",
    category: "language",
    manifestation: "Lazy Evaluation Orb",
    shortDescription:
      "A purely functional language focused on correctness and abstraction.",
    attackPattern: "delayed-burst",
    stats: {
      damage: 32,
      cooldown: 6,
      range: 8,
    },
    codexEntry:
      "Haskell is a purely functional programming language known for its powerful type system and lazy evaluation, where computations are performed only when needed.",
  },
  {
    id: "lua",
    name: "Lua",
    category: "language",
    manifestation: "Embedded Moonstone",
    shortDescription:
      "A lightweight scripting language commonly embedded in applications.",
    attackPattern: "augment-spell",
    stats: {
      damage: 15,
      cooldown: 2,
      range: 5,
    },
    codexEntry:
      "Lua is a lightweight scripting language frequently embedded into games and applications. It is popular for modding, customization, and extending existing software.",
  },
] as const satisfies readonly LanguageDefinition[];
