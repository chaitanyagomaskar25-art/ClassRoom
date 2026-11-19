/**
 * BCA (Hons. with Research)
 * Official Syllabus Context for AI-Powered Question Synthesis
 */

export const officialSyllabus = [
  {
    "semester": 1,
    "title": "Semester 1 – Computing Foundations & Core Principles",
    "subjects": [
      {
        "id": "sem1-1",
        "code": "0610311011",
        "name": "Foundations of IT",
        "nature": "DSC",
        "credits": 4,
        "description": "Learn computer fundamentals, hardware and software, number systems, binary arithmetic, logic gates, computer networks, and practical labs.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Computer Fundamentals & Architecture",
            "topics": [
              "Historical evolution of computing devices and generational classifications.",
              "Von Neumann architecture: Central Processing Unit (CPU), ALU, registers, control unit.",
              "Memory hierarchy: Primary cache (L1/L2/L3), RAM, ROM, and secondary storage media.",
              "Input/Output peripheral devices, device controllers, and bus architectures."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Number Systems & Digital Logic Gates",
            "topics": [
              "Positional number systems: Binary, octal, decimal, and hexadecimal representations.",
              "Number base conversions and signed binary arithmetic (1's and 2's complement).",
              "Fundamental logic gates: AND, OR, NOT, NAND, NOR, XOR, and XNOR.",
              "Truth tables, Boolean algebra laws, De Morgan's theorems, and basic combinational circuits."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Software Systems & OS Concepts",
            "topics": [
              "Software taxonomy: System software vs. Application software.",
              "Language processors: Compilers, interpreters, assemblers, linkers, and loaders.",
              "Operating system roles: Process scheduling, memory allocation, and file systems.",
              "Introduction to multi-user environments: Linux kernel architecture and Windows OS overview."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Networking Foundations & Internet Protocols",
            "topics": [
              "Data communication concepts, transmission modes, and physical media (guided vs. unguided).",
              "Network topologies: Star, Mesh, Bus, Ring, and Hybrid architectures.",
              "Layered communications: OSI 7-layer reference model vs. TCP/IP suite.",
              "Internet fundamentals: IPv4 addressing, DNS resolution, HTTP/HTTPS, and network security basics."
            ]
          }
        ]
      },
      {
        "id": "sem1-2",
        "code": "0610311020",
        "name": "Mathematics for Computer Science",
        "nature": "DSC",
        "credits": 4,
        "description": "Arithmetic, algebra, matrices, exponents, and logarithms tailored for computing and algorithm analysis.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Arithmetic, Relations & Set Theory",
            "topics": [
              "Divisibility theory, greatest common divisor (GCD), and modular arithmetic.",
              "Set operations, power sets, Venn diagrams, and Cartesian products.",
              "Relations: Reflexive, symmetric, transitive, and equivalence relations.",
              "Functions: Injective, surjective, bijective mappings, and composition of functions."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Algebra, Exponents & Logarithms",
            "topics": [
              "Polynomial operations, roots of quadratic equations, and algebraic identities.",
              "Laws of exponents, scientific notation, and radix arithmetic.",
              "Logarithmic functions, base changes, natural logarithms, and computational scaling.",
              "Mathematical growth rates and foundations of Big-O asymptotic notation."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Matrix Algebra & Linear Systems",
            "topics": [
              "Matrix classifications, matrix addition, scalar multiplication, and matrix products.",
              "Determinants of square matrices, properties of determinants, and minors/cofactors.",
              "Matrix inversion via adjugate matrix and Gauss-Jordan elimination.",
              "Solving systems of linear equations using Cramer's rule and matrix methods."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Propositional Logic & Combinatorics",
            "topics": [
              "Propositions, truth tables, logical connectives (conjunction, disjunction, implication).",
              "Tautologies, logical equivalence laws, and rules of deductive inference.",
              "Permutations and combinations: Factorial notation and selection formulas.",
              "Pigeonhole principle and the principle of mathematical induction."
            ]
          }
        ]
      },
      {
        "id": "sem1-3",
        "code": "0610311031",
        "name": "Database Management System",
        "nature": "DSC",
        "credits": 4,
        "description": "DBMS concepts, SQL Part 1, SQL Part 2, relational algebra, transactions, ACID properties, and normalization.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Database Architecture & ER Modeling",
            "topics": [
              "Limitations of file-processing systems vs. database management approach.",
              "Three-schema architecture, data abstraction, and logical/physical data independence.",
              "Entity-Relationship (ER) modeling: Entities, attributes, relationship sets, and cardinalities.",
              "Keys: Super keys, candidate keys, primary keys, and foreign key integrity constraints."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Relational Algebra & SQL Foundations (Part 1)",
            "topics": [
              "Relational algebra operations: Selection, projection, Cartesian product, union, and difference.",
              "Join operations: Theta join, natural join, equi join, and outer joins.",
              "SQL Data Definition Language (DDL): CREATE, ALTER, DROP, and TRUNCATE.",
              "SQL Data Manipulation Language (DML): INSERT, UPDATE, DELETE, and basic SELECT queries."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Advanced SQL Queries & Constraints (Part 2)",
            "topics": [
              "Aggregate functions: COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING clauses.",
              "Nested subqueries, correlated subqueries, and EXISTS / NOT EXISTS operators.",
              "Multi-table joins: INNER, LEFT OUTER, RIGHT OUTER, and FULL OUTER joins.",
              "Views, database indexes, and constraint declarations (CHECK, UNIQUE, NOT NULL)."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Schema Normalization & Transaction Management",
            "topics": [
              "Functional dependencies, Armstrong's axioms, and schema anomalies.",
              "Normalization stages: First Normal Form (1NF), 2NF, 3NF, and Boyce-Codd (BCNF).",
              "Transaction concept and ACID properties (Atomicity, Consistency, Isolation, Durability).",
              "Transaction states, serializability, and concurrency control using lock protocols."
            ]
          }
        ]
      },
      {
        "id": "sem1-4",
        "code": "0610312011",
        "name": "Problem Solving and Programming Fundamentals 1",
        "nature": "DSC",
        "credits": 4,
        "description": "Programming fundamentals, block coding, algorithms, pseudocode, arrays, strings, and programming projects.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Problem Solving & Algorithmic Design",
            "topics": [
              "Problem-solving methodology: Understanding requirements, planning, and testing.",
              "Visual algorithm design: Flowchart symbols, guidelines, and control flow trace.",
              "Pseudocode conventions and structured representation of algorithmic logic.",
              "Introduction to block-based visual programming constructs (Scratch/Blockly principles)."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Control Flow & Iteration Structures",
            "topics": [
              "Primitive data types, variables, constants, and arithmetic/logical operators.",
              "Conditional branching: if, if-else, nested if, and switch-case selection statements.",
              "Iterative loops: Entry-controlled (for, while) vs. Exit-controlled (do-while) constructs.",
              "Loop control statements (break, continue) and nested loops for matrix and pattern rendering."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Modular Programming & Functions",
            "topics": [
              "Concept of modular software development, function declaration, and prototype definition.",
              "Parameter passing mechanisms: Call by value vs. Call by reference/pointer.",
              "Variable lifetime and visibility: Scope rules (local, global, static storage classes).",
              "Recursive functions: Base conditions, recursive step, and call stack visualization."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Arrays, Strings & Programming Projects",
            "topics": [
              "One-dimensional arrays: Declaration, contiguous allocation, traversal, and linear search.",
              "Array manipulation: Binary search, bubble sort, selection sort algorithms.",
              "Two-dimensional arrays: Matrix representation, matrix addition, and multiplication.",
              "Character arrays, null-terminated strings, string manipulation library functions, and project work."
            ]
          }
        ]
      },
      {
        "id": "sem1-5",
        "code": "0610315010",
        "name": "Environmental Studies for Technology",
        "nature": "VAC",
        "credits": 3,
        "description": "Green computing, data for nature, clean energy, recycling, and sustainable technology.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Ecosystems, Resources & Climate Change",
            "topics": [
              "Ecosystem structures, energy flow, food webs, and ecological balance.",
              "Renewable and non-renewable natural resources: Water, mineral, forest, and energy.",
              "Global climate change, greenhouse gas emissions, and computing carbon footprints.",
              "International treaties and national environmental legislative frameworks."
            ]
          },
          {
            "unit": "Unit II",
            "title": "E-Waste Lifecycle, Hazards & Recycling",
            "topics": [
              "Electronic waste classification, generation rates, and obsolescence cycles.",
              "Toxic materials in electronics: Lead, mercury, cadmium, and brominated flame retardants.",
              "E-waste management rules, safe dismantling, recycling workflows, and material recovery.",
              "Extended Producer Responsibility (EPR) and circular economy principles."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Green Computing & Energy Efficiency",
            "topics": [
              "Green computing definitions, objectives, and Power Usage Effectiveness (PUE) metrics.",
              "Energy-efficient data center architectures, server virtualization, and cooling techniques.",
              "Hardware power management modes (Sleep, Hibernate, Dynamic Frequency Scaling).",
              "Sustainable cloud computing and corporate ESG compliance in the technology sector."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Data for Nature & Sustainable Tech",
            "topics": [
              "IoT sensors and satellite telemetry for automated air and water quality monitoring.",
              "Machine learning applications in wildlife poaching prevention and forest fire detection.",
              "Smart power grids, renewable clean energy integration, and smart city infrastructure.",
              "Sustainable software engineering: Carbon-aware computing and algorithm efficiency."
            ]
          }
        ]
      },
      {
        "id": "sem1-6",
        "code": "0610316011",
        "name": "New Age Life Skills 1",
        "nature": "SEC",
        "credits": 3,
        "description": "Vocabulary, reading, grammar, communication, goal setting, cybersecurity, group discussions, and office tools.",
        "units": [
          {
            "unit": "Unit I",
            "title": "English Grammar, Vocabulary & Comprehension",
            "topics": [
              "Grammar essentials: Subject-verb agreement, tenses, prepositions, and syntax clarity.",
              "Technical vocabulary expansion, prefix/suffix usage, and context decoding.",
              "Reading comprehension strategies: Skimming, scanning, and analytical interpretation.",
              "Professional written correspondence: Formatting formal emails and technical requests."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Self-Management, Goal Setting & Time",
            "topics": [
              "SMART framework for academic and career goal setting.",
              "Time management matrix (Eisenhower quadrant): Urgent vs. Important prioritization.",
              "Techniques to overcome procrastination (Pomodoro method, habit stacking).",
              "Emotional intelligence, self-awareness, and personal stress resilience."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Office Productivity Tools & Cloud Docs",
            "topics": [
              "Advanced word processing: Table of contents, referencing, styles, and document templates.",
              "Spreadsheet foundations: Formulas (SUM, AVERAGE, IF), relative/absolute references.",
              "Data analysis in spreadsheets: VLOOKUP, XLOOKUP, conditional formatting, and charts.",
              "Slide presentation design: Visual storytelling, typography, and live pitch delivery."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Cyber Hygiene & Group Discussion Skills",
            "topics": [
              "Cyber hygiene basics: Strong password management, multi-factor authentication (MFA).",
              "Recognizing phishing vectors, malware traps, and social engineering attempts.",
              "Digital identity ethics, netiquette, and professional online communication.",
              "Group discussion dynamics: Initiating, summarizing, active listening, and body language."
            ]
          }
        ]
      }
    ]
  },
  {
    "semester": 2,
    "title": "Semester 2 – Data Structures, Agile Engineering & Frontend Foundations",
    "subjects": [
      {
        "id": "sem2-1",
        "code": "0610321041",
        "name": "Problem Solving and Programming Fundamentals 2",
        "nature": "DSC",
        "credits": 5,
        "description": "Dynamic data structures, recursion, backtracking, time and space complexity, stacks, queues, linked lists, trees, heaps, and OOP.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Complexity Analysis, Recursion & Backtracking",
            "topics": [
              "Asymptotic notations: Big-O, Big-Omega, Big-Theta, and Little-o analysis.",
              "Recurrence relations and Master Theorem for divide-and-conquer complexity.",
              "Recursion mechanics: Function call stacks, memory frames, and tail recursion.",
              "Backtracking algorithms: N-Queens problem, subset sum, and maze pathfinding."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Dynamic Linear Data Structures",
            "topics": [
              "Pointers, references, and dynamic memory allocation (malloc, calloc, realloc, free).",
              "Linked lists: Singly linked, doubly linked, and circular linked list implementations.",
              "Stack data structure: Array and pointer implementations, infix-to-postfix conversion.",
              "Queue data structure: Linear queue, circular queue, deque, and priority queue."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Trees, Binary Search Trees & Heaps",
            "topics": [
              "Tree terminology, binary trees, properties, and tree representation.",
              "Tree traversals: In-order, pre-order, post-order, and breadth-first level-order.",
              "Binary Search Tree (BST): Node insertion, search, deletion, and balancing concepts.",
              "Heap data structure: Min-heap, max-heap properties, heapify, and heap sort algorithm."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Object-Oriented Programming (OOP) Paradigms",
            "topics": [
              "Core OOP pillars: Classes, objects, data encapsulation, and abstraction.",
              "Inheritance models: Single, multilevel, multiple, and hierarchical inheritance.",
              "Polymorphism: Function overloading, operator overloading, and runtime virtual methods.",
              "Constructors, destructors, friend functions, and exception handling mechanisms."
            ]
          }
        ]
      },
      {
        "id": "sem2-2",
        "code": "0610321050",
        "name": "Agile Software Development Life Cycle",
        "nature": "DSC",
        "credits": 4,
        "description": "Traditional SDLC, Agile Manifesto, Scrum, Kanban, XP, sprint planning, backlog management, CI/CD, and case studies.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Traditional SDLC vs. Agile Transformation",
            "topics": [
              "Software engineering paradigms: Waterfall, V-Model, and Spiral lifecycles.",
              "Failure modes of plan-driven models: Scope creep, delayed testing, and market mismatch.",
              "Agile Manifesto: 4 foundational values and 12 supporting operational principles.",
              "Mindset shift: Customer collaboration over contract negotiation and responding to change."
            ]
          },
          {
            "unit": "Unit II",
            "title": "The Scrum Framework & Artifacts",
            "topics": [
              "Scrum roles: Product Owner, Scrum Master, and self-organizing Development Team.",
              "Scrum events: Sprint Planning, Daily Scrum Standup, Sprint Review, and Retrospective.",
              "Scrum artifacts: Product Backlog, Sprint Backlog, and Definition of Done (DoD) Increment.",
              "Agile estimation: Story points, Planning Poker, velocity tracking, and burndown charts."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Kanban, XP & User Story Crafting",
            "topics": [
              "Kanban methodology: Visualizing workflows, Work-in-Progress (WIP) limits, and lead time.",
              "Extreme Programming (XP) practices: Pair programming, Test-Driven Development (TDD).",
              "User story formulation: INVEST criteria, user role personas, and acceptance criteria.",
              "Continuous refactoring, simple design, and technical debt management."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Agile Toolchains, DevOps & Real-World Cases",
            "topics": [
              "Agile project management tools: Jira workspace, GitHub Projects, and Trello boards.",
              "Continuous Integration and Continuous Deployment (CI/CD) pipelines in Agile cycles.",
              "Release planning, minimum viable product (MVP) scoping, and feature prioritization.",
              "Case studies of successful Agile transformations in tech startups and software enterprises."
            ]
          }
        ]
      },
      {
        "id": "sem2-3",
        "code": "0610321061",
        "name": "Web Development Frontend 1 - HTML-CSS",
        "nature": "DSC",
        "credits": 5,
        "description": "HTML, CSS, responsive design, Flexbox, animations, Git, and GitHub.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Semantic HTML5 & Web Fundamentals",
            "topics": [
              "Web architecture: Client-server communication, HTTP request-response, and DNS.",
              "Semantic HTML5 elements: header, nav, main, section, article, aside, and footer.",
              "HTML5 forms: Input types, validation attributes, select, textarea, and accessibility.",
              "Document Object Model (DOM) tree structure, meta tags, and web accessibility (WCAG/ARIA)."
            ]
          },
          {
            "unit": "Unit II",
            "title": "CSS3 Styling & The Box Model",
            "topics": [
              "CSS selectors: Type, class, ID, attribute, pseudo-classes, and pseudo-elements.",
              "The Cascade: Specificity calculation, inheritance rules, and rule ordering.",
              "Box Model: Content, padding, border, margin, and box-sizing: border-box.",
              "Typography, web fonts, color systems (HEX, RGB, HSL), backgrounds, and borders."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Modern Layouts: Flexbox & CSS Grid",
            "topics": [
              "CSS Flexbox: Container properties (direction, wrap, justify-content, align-items).",
              "Flex items: flex-grow, flex-shrink, flex-basis, order, and align-self.",
              "CSS Grid: Grid container, grid-template-columns/rows, gap, and grid-template-areas.",
              "Responsive grid layouts: Fractional units (fr), repeat(), minmax(), and auto-fit/fill."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Responsive Design, Animations & Git Versioning",
            "topics": [
              "Responsive design principles: Viewport meta tag, media queries, and mobile-first workflow.",
              "Fluid typography and layout units: rem, em, vh, vw, and clamp() functions.",
              "CSS transitions, transforms (translate, rotate, scale), and @keyframes animations.",
              "Version control with Git: init, clone, add, commit, branch, merge, and GitHub Pages deployment."
            ]
          }
        ]
      },
      {
        "id": "sem2-4",
        "code": "0610326021",
        "name": "New Age Life Skills 2",
        "nature": "SEC",
        "credits": 3,
        "description": "Reading strategies, grammar, critical thinking, design thinking, gender awareness, nutrition, financial literacy, and office tools.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Critical Thinking & Analytical Reasoning",
            "topics": [
              "Foundations of critical inquiry: Differentiating facts, opinions, and assumptions.",
              "Cognitive biases (confirmation bias, anchoring bias, halo effect) and mitigation.",
              "Common logical fallacies in reasoning: Ad hominem, straw man, false dilemma.",
              "Root cause problem analysis: 5-Whys framework and Fishbone (Ishikawa) diagrams."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Design Thinking Methodology & Innovation",
            "topics": [
              "Design thinking philosophy: Human-centered innovation vs. tech-first approaches.",
              "The 5-stage framework: Empathize, Define, Ideate, Prototype, and Test.",
              "Empathy mapping, user persona creation, and problem definition statements.",
              "Brainstorming techniques, rapid paper prototyping, and iterative user testing."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Ergonomics, Nutrition & Social Inclusion",
            "topics": [
              "Workplace ergonomics for software developers: Posture, screen distance, repetitive strain.",
              "Nutritional science for mental endurance, hydration, sleep cycles, and burnout recovery.",
              "Gender sensitivity, equity vs. equality, and fostering respectful diverse workplaces.",
              "POSH guidelines and institutional mechanisms for harassment prevention."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Personal Financial Literacy & Wealth Management",
            "topics": [
              "Budgeting principles: 50/30/20 allocation rule and expense tracking methods.",
              "Banking systems, savings accounts, credit cards, debit cards, and credit scores (CIBIL).",
              "Compound interest dynamics and the power of early systematic investment plans (SIP).",
              "Overview of investment vehicles: Mutual funds, equity stocks, index funds, and debt bonds."
            ]
          }
        ]
      },
      {
        "id": "sem2-5",
        "code": "0610324010",
        "name": "Introduction to Generative AI",
        "nature": "DSE",
        "credits": 5,
        "description": "AI fundamentals, machine learning, AI projects, AI applications, AI teams, and AI ethics.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Foundations of Artificial Intelligence & Machine Learning",
            "topics": [
              "Definitions, historical milestones, and the Turing Test in artificial intelligence.",
              "Symbolic AI vs. Statistical Machine Learning approaches.",
              "Core ML paradigms: Supervised learning, unsupervised learning, and reinforcement learning.",
              "Deep learning overview: Perceptrons, multi-layer neural networks, and representation learning."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Generative AI Architecture & Large Language Models",
            "topics": [
              "Discriminative vs. Generative models: Probabilistic foundations of generation.",
              "Generative Adversarial Networks (GANs), Variational Autoencoders (VAEs), and Diffusion models.",
              "The Transformer revolution: Attention is All You Need, self-attention, and encoder-decoder.",
              "Pre-training vs. Fine-tuning paradigms: Masked language modeling and autoregressive generation."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Generative Applications & Cloud AI APIs",
            "topics": [
              "Text generation, code synthesis, documentation authoring, and automated summarization.",
              "Image synthesis (Stable Diffusion, Midjourney) and voice/audio generative pipelines.",
              "Integrating frontier generative AI APIs (OpenAI API, Hugging Face Hub, Google Gemini API).",
              "Engineering generative AI applications: Managing prompts, temperature, and tokens."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "AI Team Roles, Governance & Ethical Considerations",
            "topics": [
              "Composition of modern AI teams: Data scientists, ML engineers, and prompt engineers.",
              "Ethical challenges: Training data bias, hallucination, intellectual property, and copyright.",
              "Deepfakes, misinformation, security vectors (jailbreaking, prompt injection), and safety rails.",
              "Global regulatory frameworks and responsible AI deployment principles."
            ]
          }
        ]
      }
    ]
  },
  {
    "semester": 3,
    "title": "Semester 3 – Advanced Frontend, Systems Architecture & Core Algorithms",
    "subjects": [
      {
        "id": "sem3-1",
        "code": "0610332021",
        "name": "Web Development Frontend 2 - JS React",
        "nature": "DSC",
        "credits": 5,
        "description": "JavaScript, ES6+, DOM, asynchronous JavaScript, React, Hooks, React Router, API integration, and deployment.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Advanced ECMAScript (ES6+) & Modern JavaScript",
            "topics": [
              "Block scoping with let/const, arrow functions, template literals, and enhanced object literals.",
              "Destructuring assignment (arrays and objects), spread operator, and rest parameters.",
              "Functional array methods: map, filter, reduce, find, some, and every.",
              "Lexical scope, closures, module bundling (import/export), and memory management."
            ]
          },
          {
            "unit": "Unit II",
            "title": "DOM APIs & Asynchronous Programming",
            "topics": [
              "DOM manipulation, query selectors, dynamic element creation, and event delegation.",
              "Asynchronous runtime: The JavaScript event loop, microtask queue, and macrotask queue.",
              "Promises: Creation, chaining, error handling with .catch(), and Promise.all().",
              "Async/Await syntax, Fetch API, HTTP headers, JSON parsing, and LocalStorage caching."
            ]
          },
          {
            "unit": "Unit III",
            "title": "React Fundamentals & Component Architecture",
            "topics": [
              "Single Page Application (SPA) architecture vs. multi-page web applications.",
              "Virtual DOM reconciliation, JSX syntax rules, and functional components.",
              "Component state management with the useState hook and immutable state updates.",
              "Side effects and lifecycle handling with useEffect, cleanup functions, and dependency arrays."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Hooks, Routing, Context & Production Deployment",
            "topics": [
              "Advanced Hooks: useRef for DOM references, useMemo, and useCallback for performance.",
              "Global state management with React Context API and Redux Toolkit fundamentals.",
              "Single-page routing with React Router v6: Route definitions, Links, NavLinks, and useParams.",
              "Connecting to backend REST APIs with Axios, environment variables, and Vercel/Netlify hosting."
            ]
          }
        ]
      },
      {
        "id": "sem3-2",
        "code": "0610331071",
        "name": "Operating System Fundamentals",
        "nature": "DSC",
        "credits": 5,
        "description": "Operating systems, Linux, shell scripting, file management, permissions, processes, memory management, and Linux file systems.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Kernel Architecture & Process Scheduling",
            "topics": [
              "Operating system roles, kernel vs. user space, dual-mode execution, and system calls.",
              "Process concept: Process Control Block (PCB), process states, and context switching.",
              "CPU Scheduling: FCFS, Shortest Job First (SJF), Round Robin, and Multi-level feedback queues.",
              "Inter-process communication (IPC): Shared memory, message passing, pipes, and sockets."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Synchronization, Deadlocks & Memory Management",
            "topics": [
              "Concurrency challenges: Race conditions, critical section problem, Peterson's algorithm.",
              "Synchronization primitives: Mutex locks, binary and counting semaphores, monitors.",
              "Deadlocks: Necessary conditions, resource allocation graphs, deadlock avoidance (Banker's).",
              "Memory management: Contiguous allocation, fragmentation, paging, and segmentation."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Virtual Memory & Linux Administration",
            "topics": [
              "Virtual memory: Demand paging, page fault handling, and effective access time.",
              "Page replacement algorithms: FIFO, Least Recently Used (LRU), and Optimal replacement.",
              "Linux filesystem hierarchy (/bin, /etc, /home, /var, /proc, /dev) and inode concepts.",
              "System administration: User/group management, chmod/chown permissions, and package managers."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Shell Scripting, Storage & File Systems",
            "topics": [
              "Linux Bash shell programming: Shell variables, conditional execution (if-elif-else), and loops.",
              "Command-line text filters: grep, sed, awk, cut, and standard stream piping (|, >, >>).",
              "File system implementation: Directory structures, allocation methods, and free space management.",
              "Process monitoring (ps, top, kill, systemctl) and automated cron jobs."
            ]
          }
        ]
      },
      {
        "id": "sem3-3",
        "code": "0610331080",
        "name": "Computer Network",
        "nature": "DSC",
        "credits": 4,
        "description": "Network architecture, OSI and TCP/IP, data link layer, IP addressing, routing, TCP/UDP, HTTP/HTTPS, DNS, and network security.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Network Architectures & Physical Layer",
            "topics": [
              "Network classifications (LAN, MAN, WAN, PAN) and transmission metrics (bandwidth, latency).",
              "Layered communication architectures: OSI 7-layer reference model vs. TCP/IP suite.",
              "Physical transmission media: Twisted pair, coaxial cable, optical fiber, and wireless spectrum.",
              "Data encoding, modulation, multiplexing (TDM, FDM), and packet vs. circuit switching."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Data Link Layer & Local Network Access",
            "topics": [
              "Data link responsibilities: Framing methods, bit/byte stuffing, and error detection (CRC, parity).",
              "Flow control protocols: Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ.",
              "Medium Access Control: ALOHA, CSMA/CD (Ethernet), CSMA/CA (Wi-Fi), and collision domains.",
              "Ethernet frame structure, MAC addressing, Address Resolution Protocol (ARP), and switches."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Network Layer & IPv4/IPv6 Routing",
            "topics": [
              "Network layer design issues: Virtual circuit vs. datagram networks, routing principles.",
              "IPv4 addressing: Classful addressing, subnet masks, CIDR notation, and Variable Length Subnet Masking (VLSM).",
              "Routing algorithms: Distance Vector (RIP), Link State (OSPF), and Path Vector (BGP).",
              "Supporting protocols: Internet Control Message Protocol (ICMP), NAT, and IPv6 migration."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Transport Protocols, Applications & Security",
            "topics": [
              "Transport layer services: Port multiplexing, socket programming interface.",
              "Transmission Control Protocol (TCP): 3-way handshake, reliable delivery, sliding window flow control, congestion control.",
              "User Datagram Protocol (UDP): Packet headers, checksums, and real-time streaming use cases.",
              "Application protocols: Domain Name System (DNS), DHCP, HTTP/1.1 vs HTTP/2/3, TLS/SSL, firewalls."
            ]
          }
        ]
      },
      {
        "id": "sem3-4",
        "code": "0610332031",
        "name": "Data Structures and Algorithms (Problem Solving 3)",
        "nature": "DSC",
        "credits": 5,
        "description": "Strings, searching, sorting, hashing, trees, graphs, BFS, DFS, Dijkstra, greedy algorithms, dynamic programming, and backtracking.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Advanced Sorting, Searching & Hash Maps",
            "topics": [
              "Divide-and-conquer sorting: MergeSort and QuickSort with worst-case mitigation.",
              "Linear time sorting: Counting Sort, Radix Sort, and Bucket Sort.",
              "Binary search on answer spaces and monotonic predicate functions.",
              "Hash tables: Hash functions, collision resolution via separate chaining and open addressing."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Graph Representations & Traversal Algorithms",
            "topics": [
              "Graph terminology, adjacency matrix and adjacency list storage representations.",
              "Breadth-First Search (BFS): Shortest path in unweighted graphs and multi-source BFS.",
              "Depth-First Search (DFS): Cycle detection in directed and undirected graphs, connected components.",
              "Directed Acyclic Graphs (DAGs): Topological sorting via Kahn's algorithm and DFS."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Shortest Paths, Minimum Spanning Trees & Greedy Algorithms",
            "topics": [
              "Dijkstra's shortest path algorithm using priority queues / min-heaps.",
              "Bellman-Ford algorithm for negative edge weights and negative cycle detection.",
              "Minimum Spanning Trees: Kruskal's algorithm with Disjoint Set Union (DSU) and Prim's algorithm.",
              "Greedy algorithmic paradigm: Activity selection, fractional knapsack, and Huffman coding."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Dynamic Programming (DP) & Backtracking",
            "topics": [
              "Dynamic programming principles: Overlapping subproblems and optimal substructure.",
              "Top-down memoization vs. bottom-up tabulation implementations.",
              "Classic 1D DP: Climbing stairs, house robber, and coin change problems.",
              "Classic 2D DP: 0/1 Knapsack, Longest Common Subsequence (LCS), and Matrix Chain Multiplication."
            ]
          }
        ]
      },
      {
        "id": "sem3-5",
        "code": "0610335021",
        "name": "New Age Life Skills 3",
        "nature": "SEC",
        "credits": 3,
        "description": "Advanced communication, writing, debates, sexual health awareness, first aid, emergency care, personal branding, CV, and cover letters.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Advanced Communication & Parliamentary Debates",
            "topics": [
              "Persuasive public speaking: Ethos, pathos, and logos rhetorical structures.",
              "Structured parliamentary debating formats: Constructive speeches, cross-examinations, rebuttals.",
              "Negotiation techniques, active de-escalation, and collaborative consensus building.",
              "Professional meeting facilitation, agenda setting, and minute taking."
            ]
          },
          {
            "unit": "Unit II",
            "title": "First Aid, CPR & Emergency Response",
            "topics": [
              "Basic Life Support (BLS) algorithms and Cardiopulmonary Resuscitation (CPR) delivery.",
              "Handling medical emergencies: Choking (Heimlich maneuver), burns, fractures, and severe bleeding.",
              "Sexual health education, consent, reproductive health awareness, and gender inclusivity.",
              "Mental health first aid: Recognizing panic attacks, anxiety, and campus support helplines."
            ]
          },
          {
            "unit": "Unit III",
            "title": "ATS Resume Engineering & Cover Letters",
            "topics": [
              "Applicant Tracking System (ATS) mechanics: Keyword parsing, formatting traps, and readability.",
              "Structuring a high-impact technical resume: Action verbs, quantifiable metrics (X-Y-Z formula).",
              "Crafting customized professional cover letters demonstrating domain alignment.",
              "GitHub portfolio curation: Readme engineering, documentation standards, and open-source contributions."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Professional Networking & Personal Branding",
            "topics": [
              "LinkedIn profile optimization: Headline crafting, summary engineering, and skill endorsements.",
              "Elevator pitch creation: Crafting and delivering 30-second and 2-minute personal pitches.",
              "Informational interviews, technical conference networking, and building industry relationships.",
              "Workplace ethics, professional confidentiality, and digital footprint management."
            ]
          }
        ]
      },
      {
        "id": "sem3-6",
        "code": "0610334020",
        "name": "Introduction to ChatGPT",
        "nature": "DSE",
        "credits": 2,
        "description": "LLMs, prompt engineering, prompt patterns, few-shot prompting, advanced prompting, prompt refinement, and AI-assisted software development.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Conversational LLM Architecture & Generation",
            "topics": [
              "Evolution of GPT architectures: From GPT-1 to GPT-4 and ChatGPT conversational tuning.",
              "Tokenization, byte-pair encoding (BPE), vocabulary size, and context window limits.",
              "Hyperparameters: Temperature, Top-p, presence penalty, and frequency penalty effects.",
              "Reinforcement Learning from Human Feedback (RLHF) and conversational instruction alignment."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Prompt Engineering Patterns & Methodologies",
            "topics": [
              "Prompt taxonomy: Zero-shot prompting, one-shot prompting, and few-shot in-context learning.",
              "Role-based and persona prompting: Setting tone, technical depth, and strict system rules.",
              "Output constraint engineering: Forcing structured JSON, Markdown tables, and schema compliance.",
              "Template-based prompting and dynamic variable injection for automated workflows."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Advanced Reasoning & Prompt Refinement",
            "topics": [
              "Chain-of-Thought (CoT) prompting: Eliciting step-by-step reasoning in complex problems.",
              "Self-consistency decoding, Least-to-Most prompting, and Directional Stimulus prompting.",
              "Systematic prompt refinement: Identifying ambiguities, testing edge cases, and mitigating hallucination.",
              "Prompt chaining: Decomposing massive multi-step workflows into linked prompts."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "AI-Assisted Software Engineering",
            "topics": [
              "Code generation workflows: Translating user requirements and pseudocode into working programs.",
              "Automated debugging: Using ChatGPT to identify logical bugs, syntax errors, and edge case failures.",
              "Test suite creation: Generating unit tests, mocks, and boundary case fixtures.",
              "Code refactoring, performance optimization, and generating technical documentation from code."
            ]
          }
        ]
      }
    ]
  },
  {
    "semester": 4,
    "title": "Semester 4 – Full-Stack Backend, System Design & Cloud Architecture",
    "subjects": [
      {
        "id": "sem4-1",
        "code": "0610341091",
        "name": "Web Development Backend 1",
        "nature": "DSC",
        "credits": 4,
        "description": "MERN stack, Node.js, Express.js, MongoDB, Mongoose, REST APIs, CRUD, JWT, authentication, authorization, and Swagger.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Node.js Runtime & Asynchronous Architecture",
            "topics": [
              "Node.js runtime environment, V8 JavaScript engine, and the libuv event loop architecture.",
              "Asynchronous non-blocking I/O vs. multi-threaded thread-per-request models.",
              "Node.js core modules: fs (file system), path, http, events, and stream buffers.",
              "NPM ecosystem: package.json management, semantic versioning, and environment variables."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Express.js Framework & RESTful API Design",
            "topics": [
              "Express application setup, routing architecture, and route parameters/query strings.",
              "Middleware anatomy: Application-level, router-level, error-handling, and third-party middleware.",
              "REST architectural principles: Statelessness, uniform interface, resource URI naming conventions.",
              "HTTP methods (GET, POST, PUT, PATCH, DELETE) and standard HTTP response status codes."
            ]
          },
          {
            "unit": "Unit III",
            "title": "MongoDB & Mongoose Object Data Modeling",
            "topics": [
              "NoSQL document databases: Comparison with relational RDBMS and flexible JSON/BSON schemas.",
              "Mongoose setup: Schemas, models, data types, required constraints, and default values.",
              "CRUD operations in Mongoose: find, findOne, create, findByIdAndUpdate, and deleteOne.",
              "Mongoose middleware (pre/post hooks), virtual properties, population, and schema validation."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Authentication, Authorization & Swagger Documentation",
            "topics": [
              "Security best practices: Password hashing using bcrypt with salt rounds.",
              "Stateless authentication: JSON Web Token (JWT) structure, signing, and verification.",
              "Role-Based Access Control (RBAC): Protecting endpoints with custom authorization middleware.",
              "Input validation using schema libraries (Zod / Joi) and API documentation with Swagger/OpenAPI."
            ]
          }
        ]
      },
      {
        "id": "sem4-2",
        "code": "0610341101",
        "name": "Web Development Backend (Deployment, Security, and Scalability of Web Apps)",
        "nature": "DSC",
        "credits": 5,
        "description": "Middleware, validation, testing, logging, caching, Redis, MongoDB optimization, cloud deployment, Docker, and CI/CD.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Production Middleware, Security & Logging",
            "topics": [
              "Production security headers using Helmet.js and Cross-Origin Resource Sharing (CORS) rules.",
              "Rate limiting and DDoS mitigation using express-rate-limit to protect backend resources.",
              "Data sanitization: Preventing NoSQL injection, cross-site scripting (XSS), and parameter pollution.",
              "Production logging: Centralized logging with Winston, request logging with Morgan, and log levels."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Automated Testing for Web Applications",
            "topics": [
              "Testing pyramid: Unit testing, integration testing, and end-to-end (E2E) testing.",
              "Test runner setup: Jest framework, test suites, assertions, and test lifecycle hooks.",
              "Integration testing HTTP endpoints with Supertest without starting external servers.",
              "Mocking database connections, third-party APIs, and measuring test coverage benchmarks."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Caching & Database Query Optimization",
            "topics": [
              "In-memory caching architectures: Introduction to Redis key-value store.",
              "Cache-aside pattern: Reading through cache, cache invalidation, and Time-To-Live (TTL) strategies.",
              "MongoDB performance tuning: Single-field, compound, text, and multikey indexes.",
              "Explain plans: Analyzing query execution statistics (executionStats), avoiding collection scans."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Containerization, CI/CD & Cloud Deployment",
            "topics": [
              "Docker fundamentals: Virtual machines vs. lightweight containers, Docker engine architecture.",
              "Dockerfile creation: Base images, layer caching, multi-stage builds, and .dockerignore.",
              "Multi-container orchestration with Docker Compose (App, MongoDB, Redis services).",
              "Continuous Integration and Continuous Deployment (CI/CD) with GitHub Actions and cloud deployment."
            ]
          }
        ]
      },
      {
        "id": "sem4-3",
        "code": "0610342040",
        "name": "System Design (Low Level)",
        "nature": "DSC",
        "credits": 4,
        "description": "HLD, LLD, functional and non-functional requirements, CRC cards, UML diagrams, architecture styles, database design, RBAC, security, scalability, and observability.",
        "units": [
          {
            "unit": "Unit I",
            "title": "System Design Fundamentals & Requirements",
            "topics": [
              "High Level Design (HLD) vs. Low Level Design (LLD) boundaries and engineering scopes.",
              "Analyzing requirements: Functional specifications vs. Non-Functional requirements (latency, throughput).",
              "Scalability attributes: Horizontal vs. vertical scaling, statelessness, and fault tolerance.",
              "CRC (Class-Responsibility-Collaboration) cards for initial object-oriented modeling."
            ]
          },
          {
            "unit": "Unit II",
            "title": "SOLID Principles & Creational Design Patterns",
            "topics": [
              "SOLID principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
              "Creational patterns: Singleton pattern (thread safety, double-checked locking).",
              "Factory Method and Abstract Factory patterns for decoupled object creation.",
              "Builder pattern for complex object construction and Prototype pattern for object cloning."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Structural & Behavioral Design Patterns",
            "topics": [
              "Structural patterns: Adapter pattern, Decorator pattern, Facade pattern, and Proxy pattern.",
              "Behavioral patterns: Strategy pattern, Observer pattern (pub-sub), and Command pattern.",
              "Unified Modeling Language (UML): Class diagrams, relationships (association, aggregation, composition).",
              "UML Sequence diagrams: Lifelines, messages, synchronous/asynchronous calls, and return flows."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "LLD Case Studies & Practical System Modeling",
            "topics": [
              "Low Level Design of a Multi-Floor Parking Lot System (vehicles, slots, pricing strategies).",
              "Low Level Design of a Snake and Ladders / Tic-Tac-Toe Game Engine.",
              "Low Level Design of a Token Bucket / Leaky Bucket Rate Limiter.",
              "Designing decoupled Role-Based Access Control (RBAC) and observability mechanisms."
            ]
          }
        ]
      },
      {
        "id": "sem4-4",
        "code": "0610345031",
        "name": "New Age Life Skills 4",
        "nature": "SEC",
        "credits": 3,
        "description": "Job preparation, resume, cover letters, interview preparation, onboarding, workplace culture, career development, and professional networking.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Technical Interview Preparation & Problem Solving",
            "topics": [
              "Anatomy of modern software engineering hiring: Online assessments, technical phone screens, on-sites.",
              "Communicating thought processes during live coding rounds and clarifying problem ambiguities.",
              "Explaining time/space algorithmic trade-offs and handling edge case validations.",
              "Practicing problem dissection strategies when encountering unfamiliar technical questions."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Behavioral Interviews & The STAR Methodology",
            "topics": [
              "The STAR methodology: Situation, Task, Action, and Result framing.",
              "Formulating compelling responses for conflict resolution, failure, and leadership questions.",
              "Assessing company culture, engineering values, and preparing insightful candidate questions.",
              "Job offer evaluation, total compensation components, and professional salary negotiation."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Workplace Onboarding & Engineering Culture",
            "topics": [
              "First 90 days in a technology company: Navigating codebases, documentation, and tooling.",
              "Code review etiquette: Writing clear pull requests, giving constructive feedback, accepting critique.",
              "Cross-functional collaboration with product managers, QA engineers, and UX designers.",
              "Handling ambiguity, remote working best practices, and avoiding engineering burnout."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Career Development & Professional Pathways",
            "topics": [
              "Engineering career ladders: Individual Contributor (IC) track vs. Engineering Management track.",
              "Contributing to open-source software communities and building public code credibility.",
              "Authoring engineering blog posts, case studies, and participating in tech meetups.",
              "Professional ethics, intellectual property protection, and continuous lifelong skill acquisition."
            ]
          }
        ]
      },
      {
        "id": "sem4-5",
        "code": "0610344041",
        "name": "Introduction to Cloud Computing",
        "nature": "DSE",
        "credits": 6,
        "description": "AWS, EC2, S3, IAM, cloud models, networking, Docker, Kubernetes, serverless computing, Terraform, and CI/CD.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Cloud Computing Foundations & AWS Global Infrastructure",
            "topics": [
              "Cloud computing essentials: Five essential characteristics, operational advantages.",
              "Service delivery models: Infrastructure as a Service (IaaS), PaaS, and SaaS.",
              "Deployment models: Public cloud, private cloud, hybrid cloud, and multi-cloud strategies.",
              "AWS Global Infrastructure: Regions, Availability Zones (AZs), edge locations, and data sovereignty."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Identity, Compute & Cloud Storage Services",
            "topics": [
              "AWS Identity and Access Management (IAM): Users, groups, roles, policies, and MFA security.",
              "Elastic Compute Cloud (EC2): Instance families, AMIs, key pairs, and security groups.",
              "Simple Storage Service (S3): Buckets, objects, storage classes, versioning, and lifecycle rules.",
              "Block and file storage: Elastic Block Store (EBS) volumes, snapshots, and Elastic File System (EFS)."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Cloud Networking, Relational Databases & Serverless",
            "topics": [
              "Virtual Private Cloud (VPC): Subnets, route tables, internet gateways, and NAT gateways.",
              "Managed databases: AWS Relational Database Service (RDS) multi-AZ and DynamoDB NoSQL.",
              "Serverless computing: AWS Lambda event-driven functions, execution triggers, and pricing.",
              "API Gateway: Building, publishing, and securing serverless RESTful API endpoints."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Infrastructure as Code (IaC), Containers & Monitoring",
            "topics": [
              "Infrastructure as Code (IaC) principles: Declarative configuration and version-controlled environments.",
              "Terraform fundamentals: HCL syntax, providers, state management, resources, and variables.",
              "Container orchestration on cloud: AWS Elastic Container Service (ECS) and Elastic Kubernetes (EKS).",
              "Cloud monitoring, centralized auditing, and metrics tracking using AWS CloudWatch and CloudTrail."
            ]
          }
        ]
      }
    ]
  },
  {
    "semester": 5,
    "title": "Semester 5 – Artificial Intelligence, Competitive Coding & Major Project",
    "subjects": [
      {
        "id": "sem5-1",
        "code": "BCA 301",
        "name": "Artificial Intelligence Fundamentals",
        "nature": "DSC",
        "credits": 4,
        "description": "AI applications, machine learning concepts, datasets, AI workflows, model evaluation, and AI ethics.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Data Preparation & Exploratory Data Analysis (EDA)",
            "topics": [
              "Data preprocessing workflows: Imputation of missing values, outlier detection with IQR.",
              "Feature scaling: Min-Max normalization vs. Z-score standardization.",
              "Categorical encoding: One-hot encoding, label encoding, and target encoding.",
              "Exploratory visualization with Matplotlib and Seaborn: Correlation heatmaps and distributions."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Supervised Learning Algorithms",
            "topics": [
              "Linear Regression and Logistic Regression: Loss functions and gradient descent optimization.",
              "Decision Tree classifiers: Information gain, Gini impurity, and tree pruning.",
              "Ensemble algorithms: Random Forest bagging and bootstrap aggregation.",
              "Support Vector Machines (SVM): Hyperplanes, margins, and kernel tricks (RBF, Polynomial)."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Unsupervised Learning & Dimensionality Reduction",
            "topics": [
              "K-Means clustering: Centroid initialization, Elbow method, and silhouette analysis.",
              "Hierarchical clustering: Dendrograms, agglomerative vs. divisive approaches.",
              "Principal Component Analysis (PCA): Eigenvalues, eigenvectors, and variance retention.",
              "Distance metrics in multi-dimensional space: Euclidean, Manhattan, and Cosine similarity."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Model Validation, Metrics & Ethical AI",
            "topics": [
              "Validation strategies: K-Fold cross-validation, stratified splits, and data leakage prevention.",
              "Classification evaluation metrics: Confusion matrix, precision, recall, F1-score, and ROC-AUC.",
              "Hyperparameter tuning using GridSearchCV and RandomizedSearchCV.",
              "Algorithmic fairness, model explainability (SHAP/LIME), and bias mitigation in AI systems."
            ]
          }
        ]
      },
      {
        "id": "sem5-2",
        "code": "BCA 302",
        "name": "Introduction to Competitive Programming",
        "nature": "DSC",
        "credits": 6,
        "description": "Include all the LeetCode problems, CodeChef practice requirements, weekly contests, and problem-solving exercises listed in the supplied syllabus.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Contest Setup, Two-Pointers & Bit Manipulation",
            "topics": [
              "Competitive programming setup: Fast I/O, custom comparator sorting, and debugging templates.",
              "Bitwise operations: AND, OR, XOR tricks, counting set bits, and subset generation with bitmasks.",
              "Two-Pointers technique: Pair sum in sorted arrays, 3Sum, container with most water.",
              "Sliding Window algorithms: Fixed-size maximums, longest substring without repeating characters."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Number Theory, Modular Arithmetic & Binary Search",
            "topics": [
              "Prime number algorithms: Sieve of Eratosthenes, prime factorization in O(sqrt(N)).",
              "Greatest Common Divisor (GCD) using Euclidean algorithm and Extended Euclidean algorithm.",
              "Modular arithmetic: Modular addition, multiplication, and modular inverse via Fermat's Little Theorem.",
              "Binary search on answers: Minimum capacity allocation, painter's partition, aggressive cows."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Advanced Graphs, Disjoint Sets & Tries",
            "topics": [
              "Disjoint Set Union (DSU) with union by rank and path compression optimizations.",
              "Kruskal's algorithm and Prim's algorithm for Minimum Spanning Trees in contest setups.",
              "Dijkstra's shortest path algorithm with priority queues and Bellman-Ford algorithm.",
              "Trie data structure: Prefix insertion, word search, and maximum XOR pair lookups."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Dynamic Programming, Combinatorics & Contest Strategy",
            "topics": [
              "Dynamic programming on strings: Longest Common Subsequence (LCS) and Edit Distance.",
              "DP on grids: Unique paths, minimum path sum, and 0/1 knapsack contest variations.",
              "Combinatorics: Precomputing factorials and nCr modulo 10^9+7.",
              "Contest strategies: Problem triage, stress testing with randomized input generators, avoiding WA/TLE."
            ]
          }
        ]
      },
      {
        "id": "sem5-3",
        "code": "BCA 303",
        "name": "Introduction to Prompt Engineering",
        "nature": "DSC",
        "credits": 4,
        "description": "ChatGPT, Llama, Gemini, multimodal prompting, prompt optimization, prompt compression, and AI-powered application development.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Multi-Model Prompt Engineering & Frontier LLMs",
            "topics": [
              "Comparative architecture: OpenAI GPT-4, Meta Llama 3, Google Gemini, Anthropic Claude.",
              "System instruction engineering: Setting strict behavioral constraints, personas, and styles.",
              "Formatting constraints: Forcing deterministic JSON, Pydantic schemas, and structured tables.",
              "Managing context window budgets, token overheads, and response truncation."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Multimodal Prompting & Advanced Reasoning",
            "topics": [
              "Multimodal prompt architecture: Processing images, document scans, and diagrams with vision LLMs.",
              "Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), and Self-Consistency prompting techniques.",
              "ReAct (Reasoning + Acting) pattern: Equipping LLMs with external calculator and search tools.",
              "Role-playing, step-by-step verification, and few-shot calibration for ambiguous tasks."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Retrieval-Augmented Generation (RAG) Architectures",
            "topics": [
              "RAG framework: Mitigating LLM knowledge cutoffs and private domain hallucinations.",
              "Document ingestion: Chunking strategies (fixed-size, semantic), overlaps, and metadata tags.",
              "Vector embeddings and similarity search: Cosine similarity, ChromaDB, and Pinecone.",
              "Context assembly: Re-ranking retrieved chunks and synthesizing grounded prompt inputs."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Prompt Optimization, Compression & Security",
            "topics": [
              "Prompt compression: Minimizing prompt tokens while preserving semantic intent.",
              "Security vulnerabilities: Direct/indirect prompt injection, jailbreaking, and system prompt leakage.",
              "Defensive engineering: Input validation guardrails, output content filters, and prompt shields.",
              "Automated prompt evaluation and regression testing using tools like Promptfoo."
            ]
          }
        ]
      },
      {
        "id": "sem5-4",
        "code": "PROJ 301",
        "name": "Major Project / Internship",
        "nature": "PROJ",
        "credits": 8,
        "description": "Apply technical knowledge through a practical major project or industry internship.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Problem Identification & Feasibility Analysis",
            "topics": [
              "Domain selection: HealthTech, EdTech, FinTech, E-Commerce, or Enterprise Automation.",
              "Literature survey and market competitor analysis to define problem statements.",
              "Authoring formal Software Requirements Specifications (SRS) and user personas.",
              "Technology stack evaluation (frontend, backend, database, deployment) and approval."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Architectural & Database System Design",
            "topics": [
              "System architecture modeling: Client-server, microservices, or serverless models.",
              "Database design: Entity-relationship schemas, normalization, or NoSQL document schemas.",
              "API contract specification using OpenAPI/Swagger standards.",
              "Establishing GitHub team repositories with branch protection and issue tracking."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Iterative Sprint Development & CI Integration",
            "topics": [
              "Sprint planning and milestone-based feature implementation.",
              "Writing clean, modular code with automated unit and integration tests.",
              "Containerizing development environments using Docker and Docker Compose.",
              "Setting up automated Continuous Integration (CI) test workflows on GitHub Actions."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Prototype Demonstration & Interim Defense",
            "topics": [
              "Deploying functioning MVP prototypes to staging cloud environments.",
              "Drafting interim project documentation adhering to academic guidelines.",
              "Preparing slide decks highlighting problem, architecture, stack, and progress.",
              "Delivering an oral presentation and live system demonstration before the faculty committee."
            ]
          }
        ]
      }
    ]
  },
  {
    "semester": 6,
    "title": "Semester 6 – Data Science Pipelines, Civic Leadership & Capstone Defense",
    "subjects": [
      {
        "id": "sem6-1",
        "code": "BCA 304",
        "name": "Python for Data Science & AI",
        "nature": "DSC",
        "credits": 5,
        "description": "Python, data preprocessing, feature engineering, machine learning, predictive modeling, NLP, computer vision, and model evaluation.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Scientific Computing & Advanced Data Wrangling",
            "topics": [
              "NumPy arrays: N-dimensional arrays, vectorization, broadcasting, and linear algebra operations.",
              "Pandas DataFrames: Multi-indexing, grouping, aggregation, pivoting, and melting.",
              "Time series analysis: Resampling, rolling windows, date-time parsing, and trend decomposition.",
              "Handling missing values and high-cardinality feature engineering in large datasets."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Advanced Machine Learning Pipelines & Ensembles",
            "topics": [
              "Scikit-Learn Pipeline architecture: Combining transformers, encoders, and estimators.",
              "Advanced ensemble methods: Gradient Boosting, XGBoost, and LightGBM implementations.",
              "Model evaluation across imbalanced datasets: Precision-Recall curves and SMOTE sampling.",
              "Hyperparameter optimization: Bayesian optimization and Optuna framework integration."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Natural Language Processing & Computer Vision Foundations",
            "topics": [
              "Text preprocessing: Tokenization, stemming, lemmatization, and TF-IDF representations.",
              "Word embeddings: Word2Vec, GloVe, and pre-trained Transformer embeddings.",
              "Computer Vision with OpenCV: Image transformations, filtering, thresholding, and contour detection.",
              "Convolutional Neural Networks (CNNs): Convolutions, pooling layers, and image classification."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Model Serialization, Deployment & API Microservices",
            "topics": [
              "Model serialization formats: Pickle, Joblib, ONNX runtime standards.",
              "FastAPI framework: Asynchronous route endpoints, request validation with Pydantic.",
              "Serving machine learning predictions via REST endpoints with low latency.",
              "Dockerizing Python data science microservices and cloud deployment to Render/AWS."
            ]
          }
        ]
      },
      {
        "id": "sem6-2",
        "code": "GP 301",
        "name": "NCC/NSS and Evaluation of Overall Extracurricular Activities",
        "nature": "GP",
        "credits": 2,
        "description": "NCC/NSS and Evaluation of Overall Extracurricular Activities – official course title and GP classification.",
        "units": [
          {
            "unit": "Unit I",
            "title": "NCC/NSS Orientation & Civic Responsibility",
            "topics": [
              "Historical context, motto, and organizational structure of NCC and NSS in India.",
              "Constitutional values, fundamental duties of citizens, and ethical social responsibility.",
              "Community engagement principles: Empathy, participatory rural appraisal, and needs analysis.",
              "National integration, cultural harmony, and youth leadership in nation building."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Community Outreach & Digital Inclusion",
            "topics": [
              "Conducting digital literacy awareness drives for rural and underprivileged populations.",
              "Organizing campus environmental sustainability and cleanliness campaigns (Swachh Bharat).",
              "Participating in blood donation drives, health screening camps, and tree plantation initiatives.",
              "Promoting cyber awareness and safe online banking among village communities."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Disaster Preparedness & Team Dynamics",
            "topics": [
              "Disaster management protocols: Earthquake, flash flood, and fire emergency protocols.",
              "Field drill discipline, physical fitness routines, and outdoor survival skills.",
              "Team building, group dynamics, and conflict resolution under field conditions.",
              "First response communication during civic emergencies and relief coordination."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Holistic Extracurricular Contribution & Evaluation",
            "topics": [
              "Participation in university technical hackathons, cultural festivals, and sports tournaments.",
              "Serving in student clubs, peer academic tutoring, and campus organizing committees.",
              "Documentation of social service hours, community impact metrics, and reflections.",
              "Comprehensive evaluation of personal conduct, integrity, and university engagement."
            ]
          }
        ]
      },
      {
        "id": "sem6-3",
        "code": "PROJ 302",
        "name": "Major Project / Internship",
        "nature": "PROJ",
        "credits": 15,
        "description": "Full-scale final degree capstone project or industry corporate internship.",
        "units": [
          {
            "unit": "Unit I",
            "title": "Production Architecture & Project Planning",
            "topics": [
              "Refining system scope, software requirements specifications (SRS), and compliance targets.",
              "Architecting scalable multi-tier infrastructure (client, API microservices, distributed database).",
              "Establishing enterprise DevOps pipelines: Automated testing, linting, and build steps.",
              "Defining security boundaries: SSL/TLS encryption, JWT/OAuth2 flows, and data protection."
            ]
          },
          {
            "unit": "Unit II",
            "title": "Full-Stack Implementation & System Integration",
            "topics": [
              "End-to-end full-stack coding across all planned functional user stories.",
              "Integrating third-party APIs (payment gateways, cloud messaging, AI models).",
              "Implementing performance optimizations: Database query caching, index tuning, lazy loading.",
              "Conducting rigorous unit, integration, and security penetration testing."
            ]
          },
          {
            "unit": "Unit III",
            "title": "Production Cloud Deployment & Observability",
            "topics": [
              "Deploying containerized multi-service architectures to production cloud platforms (AWS/GCP).",
              "Configuring continuous deployment (CD) triggers and zero-downtime rolling updates.",
              "Setting up real-time observability: Centralized logging, metrics dashboards, and uptime alerts.",
              "Conducting user acceptance testing (UAT) and gathering empirical performance feedback."
            ]
          },
          {
            "unit": "Unit IV",
            "title": "Dissertation Authoring & Final Degree Defense",
            "topics": [
              "Authoring a formal academic dissertation following university and IEEE formatting standards.",
              "Documenting system architecture, database schemas, test cases, and empirical results.",
              "Preparing professional technical presentations and live demonstration workflows.",
              "Final viva voce defense before faculty examiners and external industry adjudicators."
            ]
          }
        ]
      }
    ]
  }
];

export const allSyllabusSubjects = officialSyllabus.flatMap(sem => sem.subjects);

export function getSubjectByCode(codeOrId) {
  if (!codeOrId) return null;
  const key = String(codeOrId).trim().toLowerCase().replace(/[\s-_]/g, "");
  return allSyllabusSubjects.find(s => {
    const sCode = String(s.code || "").trim().toLowerCase().replace(/[\s-_]/g, "");
    const sId = String(s.id || "").trim().toLowerCase().replace(/[\s-_]/g, "");
    const sName = String(s.name || "").trim().toLowerCase().replace(/[\s-_]/g, "");
    return sCode === key || sId === key || sName === key || sName.includes(key);
  }) || null;
}
