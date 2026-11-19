/**
 * Department of Computer Science and Engineering
 * 4-Year UG Programme: B.C.A. (Hons. with Research)
 * Complete Official Curriculum & Syllabus Source of Truth
 */

export const universityInfo = {
  institution: "Department of Computer Science & Engineering",
  campus: "",
  department: "Department of Computer Science and Engineering",
  program: "Bachelor of Computer Applications – B.C.A. (Hons. with Research)",
  degreeType: "4-Year Undergraduate Degree (NEP 2020 Aligned)",
  academicBatch: "",
  implementationSession: "NEP 2020 Aligned",
  totalSemesters: 6,
  totalSubjects: 29,
  totalCredits: 132,
  summary: "Comprehensive 4-year undergraduate curriculum in computing foundations, modern web technologies, systems design, artificial intelligence, competitive programming, and capstone research."
};

export const programmeOutcomes = [
  {
    code: "PO1",
    title: "Computing Knowledge",
    description: "Apply foundational knowledge of computer science, discrete mathematics, digital logic, data structures, algorithms, and system architectures to solve structured and complex computational problems."
  },
  {
    code: "PO2",
    title: "Problem Analysis",
    description: "Identify, formulate, and analyze algorithmic and computing requirements to design resilient, efficient, and scalable software solutions adhering to modern engineering standards."
  },
  {
    code: "PO3",
    title: "Design / Development of Solutions",
    description: "Employ modern full-stack development frameworks, database engines, DevOps toolchains, containerization, and cloud environments to engineer production-ready, industry-grade software applications."
  },
  {
    code: "PO4",
    title: "Conduct Investigations of Complex Computing Problems",
    description: "Conduct investigative inquiry, explore emerging technologies such as Artificial Intelligence, Generative AI, and Machine Learning, and apply research methodologies to advance computer applications."
  },
  {
    code: "PO5",
    title: "Modern Tool Usage",
    description: "Create, select, adapt and apply appropriate techniques, resources, and modern computing tools and IT solutions to complex engineering and software activities."
  },
  {
    code: "PO6",
    title: "Professional Ethics",
    description: "Apply ethical principles and commit to professional ethics, cyber security norms, privacy obligations, responsibilities, and practices of computing professions."
  },
  {
    code: "PO7",
    title: "Life-long Learning",
    description: "Recognize the dynamic evolution of digital technologies and independently cultivate new skills, tools, and paradigms through lifelong self-directed learning and professional development."
  },
  {
    code: "PO8",
    title: "Project Management and Finance",
    description: "Demonstrate knowledge and understanding of software engineering and management principles to manage software projects in multidisciplinary environments."
  }
];

export const semesterCreditSummary = [
  { semester: 1, l: 15, t: 3, p: 8, credits: 22, coursesCount: 6 },
  { semester: 2, l: 13, t: 5, p: 8, credits: 22, coursesCount: 5 },
  { semester: 3, l: 11, t: 5, p: 12, credits: 22, coursesCount: 6 },
  { semester: 4, l: 13, t: 3, p: 12, credits: 22, coursesCount: 5 },
  { semester: 5, l: 0, t: 0, p: 44, credits: 22, coursesCount: 4 },
  { semester: 6, l: 0, t: 0, p: 38, credits: 22, coursesCount: 3 }
];

export const semesterColors = {
  1: {
    name: "indigo",
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    light: "#eef2ff",
    border: "#c7d2fe",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    pillBg: "rgba(99, 102, 241, 0.1)"
  },
  2: {
    name: "sky",
    primary: "#0284c7",
    primaryDark: "#0369a1",
    light: "#f0f9ff",
    border: "#bae6fd",
    gradient: "linear-gradient(135deg, #0284c7 0%, #075985 100%)",
    pillBg: "rgba(2, 132, 199, 0.1)"
  },
  3: {
    name: "emerald",
    primary: "#059669",
    primaryDark: "#047857",
    light: "#ecfdf5",
    border: "#a7f3d0",
    gradient: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
    pillBg: "rgba(5, 150, 105, 0.1)"
  },
  4: {
    name: "amber",
    primary: "#d97706",
    primaryDark: "#b45309",
    light: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
    pillBg: "rgba(217, 119, 6, 0.1)"
  },
  5: {
    name: "purple",
    primary: "#8b5cf6",
    primaryDark: "#7c3aed",
    light: "#f5f3ff",
    border: "#ddd6fe",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    pillBg: "rgba(139, 92, 246, 0.1)"
  },
  6: {
    name: "rose",
    primary: "#e11d48",
    primaryDark: "#be123c",
    light: "#fff1f2",
    border: "#fecdd3",
    gradient: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
    pillBg: "rgba(225, 29, 72, 0.1)"
  }
};

export const semestersList = [
  {
    semester: 1,
    title: "Semester 1 – Computing Foundations & Core Principles",
    shortTitle: "Semester 1",
    subtitle: "Establish solid groundings in computing hardware, discrete mathematics, relational databases, procedural problem-solving, environmental technology, and essential life skills.",
    categoryBadge: "Year 1 · Core Foundations",
    l: 15,
    t: 3,
    p: 8,
    credits: 22,
    subjects: [
      {
        id: "sem1-1",
        name: "Foundations of IT",
        code: "0610311011",
        nature: "DSC",
        l: 3,
        t: 0,
        p: 2,
        credits: 4,
        category: "Hardware & Networking",
        iconName: "Cpu",
        description: "Learn computer fundamentals, hardware and software, number systems, binary arithmetic, logic gates, computer networks, and practical labs.",
        objectives: [
          "Understand the physical architecture and Von Neumann functional units of modern digital computers.",
          "Perform number system conversions and construct basic logic circuits using Boolean algebra.",
          "Examine operating system roles, file systems, and system utilities.",
          "Identify computer network topologies, communication models, and fundamental Internet protocols."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Computer Fundamentals & Architecture",
            topics: [
              "Historical evolution of computing devices and generational classifications.",
              "Von Neumann architecture: Central Processing Unit (CPU), ALU, registers, control unit.",
              "Memory hierarchy: Primary cache (L1/L2/L3), RAM, ROM, and secondary storage media.",
              "Input/Output peripheral devices, device controllers, and bus architectures."
            ]
          },
          {
            unit: "Unit II",
            title: "Number Systems & Digital Logic Gates",
            topics: [
              "Positional number systems: Binary, octal, decimal, and hexadecimal representations.",
              "Number base conversions and signed binary arithmetic (1's and 2's complement).",
              "Fundamental logic gates: AND, OR, NOT, NAND, NOR, XOR, and XNOR.",
              "Truth tables, Boolean algebra laws, De Morgan's theorems, and basic combinational circuits."
            ]
          },
          {
            unit: "Unit III",
            title: "Software Systems & OS Concepts",
            topics: [
              "Software taxonomy: System software vs. Application software.",
              "Language processors: Compilers, interpreters, assemblers, linkers, and loaders.",
              "Operating system roles: Process scheduling, memory allocation, and file systems.",
              "Introduction to multi-user environments: Linux kernel architecture and Windows OS overview."
            ]
          },
          {
            unit: "Unit IV",
            title: "Networking Foundations & Internet Protocols",
            topics: [
              "Data communication concepts, transmission modes, and physical media (guided vs. unguided).",
              "Network topologies: Star, Mesh, Bus, Ring, and Hybrid architectures.",
              "Layered communications: OSI 7-layer reference model vs. TCP/IP suite.",
              "Internet fundamentals: IPv4 addressing, DNS resolution, HTTP/HTTPS, and network security basics."
            ]
          }
        ],
        labWork: [
          "Identification and hands-on assembly of internal computer hardware components.",
          "BIOS/UEFI configuration, boot sequence setup, and dual-boot OS installation.",
          "Practical Linux terminal commands: navigation, file manipulation, grep, and chmod.",
          "Ethernet cable crimping (T568A/T568B) and local area network packet testing with Ping and Traceroute."
        ],
        resources: [
          { title: "Computer Fundamentals (6th Edition)", author: "P.K. Sinha & Priti Sinha", type: "Book" },
          { title: "Digital Logic and Computer Design", author: "M. Morris Mano", type: "Book" },
          { title: "Ubuntu Linux CLI Guide for Beginners", url: "https://ubuntu.com/tutorials/command-line-for-beginners", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Analyze and explain the physical components, buses, and memory hierarchies of computing machines.",
          "CO2: Perform binary arithmetic operations and formulate Boolean equations for digital logic gates.",
          "CO3: Execute system commands in Linux environments for file and permission management.",
          "CO4: Distinguish network topologies and trace data packet transfer across the TCP/IP protocol stack."
        ],
        topics: [
          "Computer Architecture & Hardware",
          "Binary, Hex & Number Systems",
          "Logic Gates & Boolean Algebra",
          "Operating System Foundations",
          "Networking Essentials & Topologies"
        ]
      },
      {
        id: "sem1-2",
        name: "Mathematics for Computer Science",
        code: "0610311020",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 0,
        credits: 4,
        category: "Mathematics",
        iconName: "Calculator",
        description: "Arithmetic, algebra, matrices, exponents, and logarithms tailored for computing and algorithm analysis.",
        objectives: [
          "Develop quantitative reasoning through modular arithmetic, exponents, and logarithms.",
          "Solve linear systems using matrix algebra, determinants, and transformations.",
          "Master set theory, relations, and functional mappings as applied in computing.",
          "Apply propositional logic and combinatorial counting techniques in algorithm design."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Arithmetic, Relations & Set Theory",
            topics: [
              "Divisibility theory, greatest common divisor (GCD), and modular arithmetic.",
              "Set operations, power sets, Venn diagrams, and Cartesian products.",
              "Relations: Reflexive, symmetric, transitive, and equivalence relations.",
              "Functions: Injective, surjective, bijective mappings, and composition of functions."
            ]
          },
          {
            unit: "Unit II",
            title: "Algebra, Exponents & Logarithms",
            topics: [
              "Polynomial operations, roots of quadratic equations, and algebraic identities.",
              "Laws of exponents, scientific notation, and radix arithmetic.",
              "Logarithmic functions, base changes, natural logarithms, and computational scaling.",
              "Mathematical growth rates and foundations of Big-O asymptotic notation."
            ]
          },
          {
            unit: "Unit III",
            title: "Matrix Algebra & Linear Systems",
            topics: [
              "Matrix classifications, matrix addition, scalar multiplication, and matrix products.",
              "Determinants of square matrices, properties of determinants, and minors/cofactors.",
              "Matrix inversion via adjugate matrix and Gauss-Jordan elimination.",
              "Solving systems of linear equations using Cramer's rule and matrix methods."
            ]
          },
          {
            unit: "Unit IV",
            title: "Propositional Logic & Combinatorics",
            topics: [
              "Propositions, truth tables, logical connectives (conjunction, disjunction, implication).",
              "Tautologies, logical equivalence laws, and rules of deductive inference.",
              "Permutations and combinations: Factorial notation and selection formulas.",
              "Pigeonhole principle and the principle of mathematical induction."
            ]
          }
        ],
        labWork: [
          "Mathematical problem solving and proof construction tutorials.",
          "Solving recurrence relations and modeling algorithm execution steps.",
          "Matrix inversion and determinant verification workshops."
        ],
        resources: [
          { title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen", type: "Book" },
          { title: "Higher Engineering Mathematics", author: "B.S. Grewal", type: "Book" },
          { title: "MIT Mathematics for Computer Science", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/", type: "Course" }
        ],
        outcomes: [
          "CO1: Formulate formal mathematical proofs using the principle of mathematical induction.",
          "CO2: Solve systems of linear equations using matrix algebra and determinants.",
          "CO3: Analyze logarithmic and exponential growth rates in the context of algorithm complexity.",
          "CO4: Apply combinatorial counting and propositional logic to algorithmic decision trees."
        ],
        topics: [
          "Modular Arithmetic & Sets",
          "Exponents, Logarithms & Big-O",
          "Matrix Inversion & Cramer's Rule",
          "Propositional Logic & Truth Tables",
          "Combinatorics & Induction"
        ]
      },
      {
        id: "sem1-3",
        name: "Database Management System",
        code: "0610311031",
        nature: "DSC",
        l: 3,
        t: 0,
        p: 2,
        credits: 4,
        category: "Databases",
        iconName: "Database",
        description: "DBMS concepts, SQL Part 1, SQL Part 2, relational algebra, transactions, ACID properties, and normalization.",
        objectives: [
          "Model relational data structures using Entity-Relationship (ER) paradigms.",
          "Write structured query language (SQL) scripts for schema definition and data manipulation.",
          "Apply normal forms to eliminate data redundancy and prevent update anomalies.",
          "Examine transaction states, concurrency locking, and ACID compliance guarantees."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Database Architecture & ER Modeling",
            topics: [
              "Limitations of file-processing systems vs. database management approach.",
              "Three-schema architecture, data abstraction, and logical/physical data independence.",
              "Entity-Relationship (ER) modeling: Entities, attributes, relationship sets, and cardinalities.",
              "Keys: Super keys, candidate keys, primary keys, and foreign key integrity constraints."
            ]
          },
          {
            unit: "Unit II",
            title: "Relational Algebra & SQL Foundations (Part 1)",
            topics: [
              "Relational algebra operations: Selection, projection, Cartesian product, union, and difference.",
              "Join operations: Theta join, natural join, equi join, and outer joins.",
              "SQL Data Definition Language (DDL): CREATE, ALTER, DROP, and TRUNCATE.",
              "SQL Data Manipulation Language (DML): INSERT, UPDATE, DELETE, and basic SELECT queries."
            ]
          },
          {
            unit: "Unit III",
            title: "Advanced SQL Queries & Constraints (Part 2)",
            topics: [
              "Aggregate functions: COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING clauses.",
              "Nested subqueries, correlated subqueries, and EXISTS / NOT EXISTS operators.",
              "Multi-table joins: INNER, LEFT OUTER, RIGHT OUTER, and FULL OUTER joins.",
              "Views, database indexes, and constraint declarations (CHECK, UNIQUE, NOT NULL)."
            ]
          },
          {
            unit: "Unit IV",
            title: "Schema Normalization & Transaction Management",
            topics: [
              "Functional dependencies, Armstrong's axioms, and schema anomalies.",
              "Normalization stages: First Normal Form (1NF), 2NF, 3NF, and Boyce-Codd (BCNF).",
              "Transaction concept and ACID properties (Atomicity, Consistency, Isolation, Durability).",
              "Transaction states, serializability, and concurrency control using lock protocols."
            ]
          }
        ],
        labWork: [
          "PostgreSQL/MySQL database schema creation with primary and foreign key constraints.",
          "Executing multi-table relational queries with inner and outer joins.",
          "Writing aggregate data analysis queries using GROUP BY and HAVING.",
          "Designing normalized 3NF schemas for university management and banking applications."
        ],
        resources: [
          { title: "Database System Concepts (7th Edition)", author: "Silberschatz, Korth, Sudarshan", type: "Book" },
          { title: "Fundamentals of Database Systems", author: "Elmasri & Navathe", type: "Book" },
          { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Translate business domain requirements into formal Entity-Relationship models.",
          "CO2: Write complex SQL scripts for multi-table data querying and constraint enforcement.",
          "CO3: Decompose denormalized database tables into 3NF/BCNF compliant relational schemas.",
          "CO4: Explain ACID properties, transaction lifecycle, and lock-based concurrency."
        ],
        topics: [
          "ER Modeling & Relational Schemas",
          "SQL DDL & DML Commands",
          "Multi-Table Joins & Subqueries",
          "Database Normalization (1NF to BCNF)",
          "ACID Properties & Transactions"
        ]
      },
      {
        id: "sem1-4",
        name: "Problem Solving and Programming Fundamentals 1",
        code: "0610312011",
        nature: "DSC",
        l: 3,
        t: 0,
        p: 2,
        credits: 4,
        category: "Programming",
        iconName: "Code2",
        description: "Programming fundamentals, block coding, algorithms, pseudocode, arrays, strings, and programming projects.",
        objectives: [
          "Develop algorithmic problem-solving thinking using flowcharts and pseudocode.",
          "Implement decision-making and iterative control structures in high-level programming languages.",
          "Construct modular software programs using reusable functions and parameter passing.",
          "Manipulate linear memory buffers through single-dimensional and two-dimensional arrays."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Problem Solving & Algorithmic Design",
            topics: [
              "Problem-solving methodology: Understanding requirements, planning, and testing.",
              "Visual algorithm design: Flowchart symbols, guidelines, and control flow trace.",
              "Pseudocode conventions and structured representation of algorithmic logic.",
              "Introduction to block-based visual programming constructs (Scratch/Blockly principles)."
            ]
          },
          {
            unit: "Unit II",
            title: "Control Flow & Iteration Structures",
            topics: [
              "Primitive data types, variables, constants, and arithmetic/logical operators.",
              "Conditional branching: if, if-else, nested if, and switch-case selection statements.",
              "Iterative loops: Entry-controlled (for, while) vs. Exit-controlled (do-while) constructs.",
              "Loop control statements (break, continue) and nested loops for matrix and pattern rendering."
            ]
          },
          {
            unit: "Unit III",
            title: "Modular Programming & Functions",
            topics: [
              "Concept of modular software development, function declaration, and prototype definition.",
              "Parameter passing mechanisms: Call by value vs. Call by reference/pointer.",
              "Variable lifetime and visibility: Scope rules (local, global, static storage classes).",
              "Recursive functions: Base conditions, recursive step, and call stack visualization."
            ]
          },
          {
            unit: "Unit IV",
            title: "Arrays, Strings & Programming Projects",
            topics: [
              "One-dimensional arrays: Declaration, contiguous allocation, traversal, and linear search.",
              "Array manipulation: Binary search, bubble sort, selection sort algorithms.",
              "Two-dimensional arrays: Matrix representation, matrix addition, and multiplication.",
              "Character arrays, null-terminated strings, string manipulation library functions, and project work."
            ]
          }
        ],
        labWork: [
          "Designing flowcharts and implementing console programs for prime check and Fibonacci series.",
          "Implementing nested loop pattern generation and menu-driven arithmetic calculators.",
          "Writing modular functions for matrix addition, transpose, and matrix multiplication.",
          "Developing a student record console project utilizing arrays and string handling."
        ],
        resources: [
          { title: "Programming in ANSI C (8th Edition)", author: "E. Balagurusamy", type: "Book" },
          { title: "How to Solve It by Computer", author: "R.G. Dromey", type: "Book" },
          { title: "CS50 Introduction to Computer Science", url: "https://cs50.harvard.edu/x/", type: "Course" }
        ],
        outcomes: [
          "CO1: Formulate step-by-step algorithms and flowcharts for computational problems.",
          "CO2: Write programs utilizing structured conditional branching and iterative loops.",
          "CO3: Create modular applications leveraging reusable functions and recursion.",
          "CO4: Implement array searching, sorting, and string manipulation algorithms."
        ],
        topics: [
          "Algorithms & Flowcharts",
          "Control Structures & Nested Loops",
          "Modular Functions & Recursion",
          "1D & 2D Array Manipulations",
          "String Processing Algorithms"
        ]
      },
      {
        id: "sem1-5",
        name: "Environmental Studies for Technology",
        code: "0610315010",
        nature: "VAC",
        l: 2,
        t: 1,
        p: 0,
        credits: 3,
        category: "Environment & Tech",
        iconName: "Leaf",
        description: "Green computing, data for nature, clean energy, recycling, and sustainable technology.",
        objectives: [
          "Understand environmental systems, natural resources, and biodiversity conservation.",
          "Examine the ecological footprint of computing hardware and electronic waste generation.",
          "Apply green computing principles, server energy optimization, and sustainable IT practices.",
          "Explore data-driven environmental monitoring and clean technology integration."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Ecosystems, Resources & Climate Change",
            topics: [
              "Ecosystem structures, energy flow, food webs, and ecological balance.",
              "Renewable and non-renewable natural resources: Water, mineral, forest, and energy.",
              "Global climate change, greenhouse gas emissions, and computing carbon footprints.",
              "International treaties and national environmental legislative frameworks."
            ]
          },
          {
            unit: "Unit II",
            title: "E-Waste Lifecycle, Hazards & Recycling",
            topics: [
              "Electronic waste classification, generation rates, and obsolescence cycles.",
              "Toxic materials in electronics: Lead, mercury, cadmium, and brominated flame retardants.",
              "E-waste management rules, safe dismantling, recycling workflows, and material recovery.",
              "Extended Producer Responsibility (EPR) and circular economy principles."
            ]
          },
          {
            unit: "Unit III",
            title: "Green Computing & Energy Efficiency",
            topics: [
              "Green computing definitions, objectives, and Power Usage Effectiveness (PUE) metrics.",
              "Energy-efficient data center architectures, server virtualization, and cooling techniques.",
              "Hardware power management modes (Sleep, Hibernate, Dynamic Frequency Scaling).",
              "Sustainable cloud computing and corporate ESG compliance in the technology sector."
            ]
          },
          {
            unit: "Unit IV",
            title: "Data for Nature & Sustainable Tech",
            topics: [
              "IoT sensors and satellite telemetry for automated air and water quality monitoring.",
              "Machine learning applications in wildlife poaching prevention and forest fire detection.",
              "Smart power grids, renewable clean energy integration, and smart city infrastructure.",
              "Sustainable software engineering: Carbon-aware computing and algorithm efficiency."
            ]
          }
        ],
        labWork: [
          "Conducting an on-campus electronic waste and power audit of computing labs.",
          "Calculating individual and laboratory computing carbon footprints.",
          "Case study analysis on data center power optimization and green hosting."
        ],
        resources: [
          { title: "Textbook of Environmental Studies", author: "Erach Bharucha", type: "Book" },
          { title: "Green Computing: Tools and Techniques for Saving Energy", author: "Bud E. Smith", type: "Book" },
          { title: "UN Sustainable Development Goals", url: "https://sdgs.un.org/goals", type: "Resource" }
        ],
        outcomes: [
          "CO1: Evaluate environmental footprints associated with computing hardware lifecycles.",
          "CO2: Formulate safe electronic waste collection and recycling strategies.",
          "CO3: Apply green computing metrics and power management configurations in data centers.",
          "CO4: Assess AI and IoT technologies for ecological monitoring and conservation."
        ],
        topics: [
          "Ecosystems & Carbon Footprints",
          "E-Waste Management & Recycling",
          "Green Computing & Energy Efficiency",
          "IoT & AI for Environmental Monitoring",
          "Clean Energy & Sustainable IT"
        ]
      },
      {
        id: "sem1-6",
        name: "New Age Life Skills 1",
        code: "0610316011",
        nature: "SEC",
        l: 1,
        t: 1,
        p: 2,
        credits: 3,
        category: "Life Skills",
        iconName: "Compass",
        description: "Vocabulary, reading, grammar, communication, goal setting, cybersecurity, group discussions, and office tools.",
        objectives: [
          "Build English language fluency, technical vocabulary, and business communication skills.",
          "Master personal goal setting frameworks, time management, and stress resilience.",
          "Gain proficiency in document formatting, spreadsheet modeling, and presentation delivery.",
          "Practice digital hygiene, online safety, and collaborative group discussions."
        ],
        units: [
          {
            unit: "Unit I",
            title: "English Grammar, Vocabulary & Comprehension",
            topics: [
              "Grammar essentials: Subject-verb agreement, tenses, prepositions, and syntax clarity.",
              "Technical vocabulary expansion, prefix/suffix usage, and context decoding.",
              "Reading comprehension strategies: Skimming, scanning, and analytical interpretation.",
              "Professional written correspondence: Formatting formal emails and technical requests."
            ]
          },
          {
            unit: "Unit II",
            title: "Self-Management, Goal Setting & Time",
            topics: [
              "SMART framework for academic and career goal setting.",
              "Time management matrix (Eisenhower quadrant): Urgent vs. Important prioritization.",
              "Techniques to overcome procrastination (Pomodoro method, habit stacking).",
              "Emotional intelligence, self-awareness, and personal stress resilience."
            ]
          },
          {
            unit: "Unit III",
            title: "Office Productivity Tools & Cloud Docs",
            topics: [
              "Advanced word processing: Table of contents, referencing, styles, and document templates.",
              "Spreadsheet foundations: Formulas (SUM, AVERAGE, IF), relative/absolute references.",
              "Data analysis in spreadsheets: VLOOKUP, XLOOKUP, conditional formatting, and charts.",
              "Slide presentation design: Visual storytelling, typography, and live pitch delivery."
            ]
          },
          {
            unit: "Unit IV",
            title: "Cyber Hygiene & Group Discussion Skills",
            topics: [
              "Cyber hygiene basics: Strong password management, multi-factor authentication (MFA).",
              "Recognizing phishing vectors, malware traps, and social engineering attempts.",
              "Digital identity ethics, netiquette, and professional online communication.",
              "Group discussion dynamics: Initiating, summarizing, active listening, and body language."
            ]
          }
        ],
        labWork: [
          "Drafting professional formal emails, technical reports, and meeting minutes.",
          "Designing automated financial budget models using spreadsheet formulas and charts.",
          "Delivering a 5-minute technical presentation using modern slide decks.",
          "Participating in recorded mock group discussions with peer feedback."
        ],
        resources: [
          { title: "High School English Grammar and Composition", author: "Wren & Martin", type: "Book" },
          { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", type: "Book" },
          { title: "Google Workspace Productivity Tutorials", url: "https://support.google.com/a/users/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Draft precise, grammatically sound professional correspondence and documentation.",
          "CO2: Plan academic deliverables using SMART goal setting and time management techniques.",
          "CO3: Build dynamic spreadsheets with advanced formulas, lookup functions, and charts.",
          "CO4: Practice cyber hygiene safeguards and participate actively in group discussions."
        ],
        topics: [
          "Technical Vocabulary & Grammar",
          "SMART Goals & Time Management",
          "Spreadsheets & Data Visualizations",
          "Cyber Hygiene & Online Safety",
          "Group Discussions & Public Speaking"
        ]
      }
    ]
  },
  {
    semester: 2,
    title: "Semester 2 – Data Structures, Agile Engineering & Frontend Foundations",
    shortTitle: "Semester 2",
    subtitle: "Advance to dynamic data structures, agile software lifecycles, semantic frontend web design, design thinking, and generative AI fundamentals.",
    categoryBadge: "Year 1 · Core Engineering",
    l: 13,
    t: 5,
    p: 8,
    credits: 22,
    subjects: [
      {
        id: "sem2-1",
        name: "Problem Solving and Programming Fundamentals 2",
        code: "0610321041",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 2,
        credits: 5,
        category: "Data Structures",
        iconName: "Layers",
        description: "Dynamic data structures, recursion, backtracking, time and space complexity, stacks, queues, linked lists, trees, heaps, and OOP.",
        objectives: [
          "Calculate asymptotic time and space complexity using Big-O, Omega, and Theta notations.",
          "Implement dynamic linear structures (singly, doubly linked lists, stacks, and queues).",
          "Construct hierarchical tree structures, binary search trees (BST), and heap priority queues.",
          "Apply Object-Oriented Programming (OOP) paradigms to build modular systems."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Complexity Analysis, Recursion & Backtracking",
            topics: [
              "Asymptotic notations: Big-O, Big-Omega, Big-Theta, and Little-o analysis.",
              "Recurrence relations and Master Theorem for divide-and-conquer complexity.",
              "Recursion mechanics: Function call stacks, memory frames, and tail recursion.",
              "Backtracking algorithms: N-Queens problem, subset sum, and maze pathfinding."
            ]
          },
          {
            unit: "Unit II",
            title: "Dynamic Linear Data Structures",
            topics: [
              "Pointers, references, and dynamic memory allocation (malloc, calloc, realloc, free).",
              "Linked lists: Singly linked, doubly linked, and circular linked list implementations.",
              "Stack data structure: Array and pointer implementations, infix-to-postfix conversion.",
              "Queue data structure: Linear queue, circular queue, deque, and priority queue."
            ]
          },
          {
            unit: "Unit III",
            title: "Trees, Binary Search Trees & Heaps",
            topics: [
              "Tree terminology, binary trees, properties, and tree representation.",
              "Tree traversals: In-order, pre-order, post-order, and breadth-first level-order.",
              "Binary Search Tree (BST): Node insertion, search, deletion, and balancing concepts.",
              "Heap data structure: Min-heap, max-heap properties, heapify, and heap sort algorithm."
            ]
          },
          {
            unit: "Unit IV",
            title: "Object-Oriented Programming (OOP) Paradigms",
            topics: [
              "Core OOP pillars: Classes, objects, data encapsulation, and abstraction.",
              "Inheritance models: Single, multilevel, multiple, and hierarchical inheritance.",
              "Polymorphism: Function overloading, operator overloading, and runtime virtual methods.",
              "Constructors, destructors, friend functions, and exception handling mechanisms."
            ]
          }
        ],
        labWork: [
          "Implementing singly and doubly linked lists with insertion, deletion, and reversal operations.",
          "Implementing stack applications: Expression evaluation and balanced parentheses check.",
          "Constructing a Binary Search Tree with search, insertion, and traversal algorithms.",
          "Developing an object-oriented banking or inventory system utilizing inheritance and polymorphism."
        ],
        resources: [
          { title: "Data Structures and Algorithm Analysis in C++", author: "Mark Allen Weiss", type: "Book" },
          { title: "Object-Oriented Programming with C++", author: "E. Balagurusamy", type: "Book" },
          { title: "GeeksforGeeks Data Structures Guide", url: "https://www.geeksforgeeks.org/data-structures/", type: "Tutorial" }
        ],
        outcomes: [
          "CO1: Derive asymptotic time and space bounds for iterative and recursive algorithms.",
          "CO2: Implement dynamic linked lists, stacks, and queues without high-level library shortcuts.",
          "CO3: Construct Binary Search Trees and perform sorting using binary heap structures.",
          "CO4: Architect software systems using object-oriented principles of inheritance and polymorphism."
        ],
        topics: [
          "Asymptotic Complexity & Backtracking",
          "Dynamic Linked Lists & Deques",
          "Stacks, Queues & Expressions",
          "Binary Search Trees & Heaps",
          "OOP Encapsulation & Polymorphism"
        ]
      },
      {
        id: "sem2-2",
        name: "Agile Software Development Life Cycle",
        code: "0610321050",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 0,
        credits: 4,
        category: "Software Engineering",
        iconName: "FileCheck2",
        description: "Traditional SDLC, Agile Manifesto, Scrum, Kanban, XP, sprint planning, backlog management, CI/CD, and case studies.",
        objectives: [
          "Examine traditional software development models and their limitations in volatile markets.",
          "Master the 4 values and 12 principles of the official Agile Manifesto.",
          "Execute Scrum ceremonies, roles, and artifact creation in sprint-based environments.",
          "Apply Kanban flow optimization, user story writing, and continuous integration workflows."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Traditional SDLC vs. Agile Transformation",
            topics: [
              "Software engineering paradigms: Waterfall, V-Model, and Spiral lifecycles.",
              "Failure modes of plan-driven models: Scope creep, delayed testing, and market mismatch.",
              "Agile Manifesto: 4 foundational values and 12 supporting operational principles.",
              "Mindset shift: Customer collaboration over contract negotiation and responding to change."
            ]
          },
          {
            unit: "Unit II",
            title: "The Scrum Framework & Artifacts",
            topics: [
              "Scrum roles: Product Owner, Scrum Master, and self-organizing Development Team.",
              "Scrum events: Sprint Planning, Daily Scrum Standup, Sprint Review, and Retrospective.",
              "Scrum artifacts: Product Backlog, Sprint Backlog, and Definition of Done (DoD) Increment.",
              "Agile estimation: Story points, Planning Poker, velocity tracking, and burndown charts."
            ]
          },
          {
            unit: "Unit III",
            title: "Kanban, XP & User Story Crafting",
            topics: [
              "Kanban methodology: Visualizing workflows, Work-in-Progress (WIP) limits, and lead time.",
              "Extreme Programming (XP) practices: Pair programming, Test-Driven Development (TDD).",
              "User story formulation: INVEST criteria, user role personas, and acceptance criteria.",
              "Continuous refactoring, simple design, and technical debt management."
            ]
          },
          {
            unit: "Unit IV",
            title: "Agile Toolchains, DevOps & Real-World Cases",
            topics: [
              "Agile project management tools: Jira workspace, GitHub Projects, and Trello boards.",
              "Continuous Integration and Continuous Deployment (CI/CD) pipelines in Agile cycles.",
              "Release planning, minimum viable product (MVP) scoping, and feature prioritization.",
              "Case studies of successful Agile transformations in tech startups and software enterprises."
            ]
          }
        ],
        labWork: [
          "Configuring a Jira/GitHub Projects workspace with Product and Sprint backlogs.",
          "Deconstructing product requirements into INVEST-compliant user stories with acceptance criteria.",
          "Simulating sprint planning poker sessions and calculating team velocity charts.",
          "Conducting a mock sprint review and retrospective session."
        ],
        resources: [
          { title: "Scrum: The Art of Doing Twice the Work in Half the Time", author: "Jeff Sutherland", type: "Book" },
          { title: "User Stories Applied: For Agile Software Development", author: "Mike Cohn", type: "Book" },
          { title: "Atlassian Agile Coach Documentation", url: "https://www.atlassian.com/agile", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Contrast traditional waterfall lifecycles with iterative, feedback-driven Agile frameworks.",
          "CO2: Facilitate Scrum ceremonies and manage backlogs, sprints, and release increments.",
          "CO3: Author INVEST-compliant user stories with testable acceptance criteria.",
          "CO4: Configure industry Agile collaboration tools (Jira, GitHub Projects) for sprint workflows."
        ],
        topics: [
          "Waterfall vs Agile Manifesto",
          "Scrum Roles, Events & Artifacts",
          "Kanban WIP Limits & Flow",
          "User Story Engineering & Estimation",
          "DevOps, CI/CD & Agile Toolchains"
        ]
      },
      {
        id: "sem2-3",
        name: "Web Development Frontend 1 - HTML-CSS",
        code: "0610321061",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 2,
        credits: 5,
        category: "Web Development",
        iconName: "Code2",
        description: "HTML, CSS, responsive design, Flexbox, animations, Git, and GitHub.",
        objectives: [
          "Build semantic, accessible web pages using HTML5 markup standards.",
          "Master modern CSS3 styling, cascade inheritance, and the box model.",
          "Create complex responsive layouts using CSS Flexbox and CSS Grid.",
          "Implement CSS transitions, keyframe animations, and deploy web projects using Git/GitHub."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Semantic HTML5 & Web Fundamentals",
            topics: [
              "Web architecture: Client-server communication, HTTP request-response, and DNS.",
              "Semantic HTML5 elements: header, nav, main, section, article, aside, and footer.",
              "HTML5 forms: Input types, validation attributes, select, textarea, and accessibility.",
              "Document Object Model (DOM) tree structure, meta tags, and web accessibility (WCAG/ARIA)."
            ]
          },
          {
            unit: "Unit II",
            title: "CSS3 Styling & The Box Model",
            topics: [
              "CSS selectors: Type, class, ID, attribute, pseudo-classes, and pseudo-elements.",
              "The Cascade: Specificity calculation, inheritance rules, and rule ordering.",
              "Box Model: Content, padding, border, margin, and box-sizing: border-box.",
              "Typography, web fonts, color systems (HEX, RGB, HSL), backgrounds, and borders."
            ]
          },
          {
            unit: "Unit III",
            title: "Modern Layouts: Flexbox & CSS Grid",
            topics: [
              "CSS Flexbox: Container properties (direction, wrap, justify-content, align-items).",
              "Flex items: flex-grow, flex-shrink, flex-basis, order, and align-self.",
              "CSS Grid: Grid container, grid-template-columns/rows, gap, and grid-template-areas.",
              "Responsive grid layouts: Fractional units (fr), repeat(), minmax(), and auto-fit/fill."
            ]
          },
          {
            unit: "Unit IV",
            title: "Responsive Design, Animations & Git Versioning",
            topics: [
              "Responsive design principles: Viewport meta tag, media queries, and mobile-first workflow.",
              "Fluid typography and layout units: rem, em, vh, vw, and clamp() functions.",
              "CSS transitions, transforms (translate, rotate, scale), and @keyframes animations.",
              "Version control with Git: init, clone, add, commit, branch, merge, and GitHub Pages deployment."
            ]
          }
        ],
        labWork: [
          "Building a fully responsive, semantic multi-page academic departmental website.",
          "Designing a modern SaaS landing page using Flexbox navigation and CSS Grid features.",
          "Implementing CSS hover micro-interactions, smooth scrolling, and dark/light styling.",
          "Managing source code repositories on GitHub and deploying live websites via GitHub Pages."
        ],
        resources: [
          { title: "HTML and CSS: Design and Build Websites", author: "Jon Duckett", type: "Book" },
          { title: "MDN Web Docs HTML & CSS Comprehensive Guide", url: "https://developer.mozilla.org/en-US/", type: "Documentation" },
          { title: "A Complete Guide to Flexbox & CSS Grid", author: "CSS-Tricks", url: "https://css-tricks.com/", type: "Tutorial" }
        ],
        outcomes: [
          "CO1: Author valid, accessible, and semantic HTML5 documents.",
          "CO2: Apply the CSS box model and specificity rules to style complex user interfaces.",
          "CO3: Construct fully responsive web layouts using modern CSS Flexbox and Grid systems.",
          "CO4: Track project histories with Git and deploy live web interfaces to GitHub Pages."
        ],
        topics: [
          "Semantic HTML5 & Accessibility",
          "CSS Box Model & Specificity",
          "CSS Flexbox Layout Architecture",
          "CSS Grid Multi-Column Systems",
          "Mobile-First Responsive Design & Git"
        ]
      },
      {
        id: "sem2-4",
        name: "New Age Life Skills 2",
        code: "0610326021",
        nature: "SEC",
        l: 1,
        t: 1,
        p: 2,
        credits: 3,
        category: "Life Skills",
        iconName: "Target",
        description: "Reading strategies, grammar, critical thinking, design thinking, gender awareness, nutrition, financial literacy, and office tools.",
        objectives: [
          "Apply critical thinking techniques to detect cognitive biases and logical fallacies.",
          "Master the 5-stage Design Thinking framework to prototype human-centered solutions.",
          "Promote physical health, ergonomic wellness, and inclusive gender awareness.",
          "Build personal budgeting models and understand financial asset classes."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Critical Thinking & Analytical Reasoning",
            topics: [
              "Foundations of critical inquiry: Differentiating facts, opinions, and assumptions.",
              "Cognitive biases (confirmation bias, anchoring bias, halo effect) and mitigation.",
              "Common logical fallacies in reasoning: Ad hominem, straw man, false dilemma.",
              "Root cause problem analysis: 5-Whys framework and Fishbone (Ishikawa) diagrams."
            ]
          },
          {
            unit: "Unit II",
            title: "Design Thinking Methodology & Innovation",
            topics: [
              "Design thinking philosophy: Human-centered innovation vs. tech-first approaches.",
              "The 5-stage framework: Empathize, Define, Ideate, Prototype, and Test.",
              "Empathy mapping, user persona creation, and problem definition statements.",
              "Brainstorming techniques, rapid paper prototyping, and iterative user testing."
            ]
          },
          {
            unit: "Unit III",
            title: "Ergonomics, Nutrition & Social Inclusion",
            topics: [
              "Workplace ergonomics for software developers: Posture, screen distance, repetitive strain.",
              "Nutritional science for mental endurance, hydration, sleep cycles, and burnout recovery.",
              "Gender sensitivity, equity vs. equality, and fostering respectful diverse workplaces.",
              "POSH guidelines and institutional mechanisms for harassment prevention."
            ]
          },
          {
            unit: "Unit IV",
            title: "Personal Financial Literacy & Wealth Management",
            topics: [
              "Budgeting principles: 50/30/20 allocation rule and expense tracking methods.",
              "Banking systems, savings accounts, credit cards, debit cards, and credit scores (CIBIL).",
              "Compound interest dynamics and the power of early systematic investment plans (SIP).",
              "Overview of investment vehicles: Mutual funds, equity stocks, index funds, and debt bonds."
            ]
          }
        ],
        labWork: [
          "Conducting an empathy study and building a low-fidelity prototype for a campus challenge.",
          "Designing a personal monthly financial budget and investment tracking spreadsheet.",
          "Participating in structured debates dissecting logical fallacies in real-world arguments.",
          "Performing desk-based ergonomic assessments and posture correction routines."
        ],
        resources: [
          { title: "Design Thinking: Understanding How Designers Think", author: "Nigel Cross", type: "Book" },
          { title: "The Psychology of Money", author: "Morgan Housel", type: "Book" },
          { title: "Stanford d.school Design Thinking Bootleg", url: "https://dschool.stanford.edu/resources/design-thinking-bootleg", type: "Guide" }
        ],
        outcomes: [
          "CO1: Detect logical fallacies and apply systematic root cause analysis to complex dilemmas.",
          "CO2: Execute the 5 stages of Design Thinking to conceptualize human-centered innovations.",
          "CO3: Implement ergonomic and nutritional habits for sustainable software engineering careers.",
          "CO4: Formulate a disciplined personal financial plan leveraging budgeting and compound interest."
        ],
        topics: [
          "Critical Thinking & Logical Fallacies",
          "5-Stage Design Thinking Framework",
          "Developer Ergonomics & Nutrition",
          "Gender Sensitivity & Inclusion",
          "Financial Budgeting & Investment Basics"
        ]
      },
      {
        id: "sem2-5",
        name: "Introduction to Generative AI",
        code: "0610324010",
        nature: "DSE",
        l: 3,
        t: 1,
        p: 2,
        credits: 5,
        category: "Artificial Intelligence",
        iconName: "BrainCircuit",
        description: "AI fundamentals, machine learning, AI projects, AI applications, AI teams, and AI ethics.",
        objectives: [
          "Distinguish traditional predictive AI systems from modern generative AI architectures.",
          "Examine transformer models, self-attention mechanisms, and large language models (LLMs).",
          "Implement multimodal text and image generation workflows using cloud AI APIs.",
          "Evaluate ethical risks, hallucination, copyright, and responsible AI governance."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Foundations of Artificial Intelligence & Machine Learning",
            topics: [
              "Definitions, historical milestones, and the Turing Test in artificial intelligence.",
              "Symbolic AI vs. Statistical Machine Learning approaches.",
              "Core ML paradigms: Supervised learning, unsupervised learning, and reinforcement learning.",
              "Deep learning overview: Perceptrons, multi-layer neural networks, and representation learning."
            ]
          },
          {
            unit: "Unit II",
            title: "Generative AI Architecture & Large Language Models",
            topics: [
              "Discriminative vs. Generative models: Probabilistic foundations of generation.",
              "Generative Adversarial Networks (GANs), Variational Autoencoders (VAEs), and Diffusion models.",
              "The Transformer revolution: Attention is All You Need, self-attention, and encoder-decoder.",
              "Pre-training vs. Fine-tuning paradigms: Masked language modeling and autoregressive generation."
            ]
          },
          {
            unit: "Unit III",
            title: "Generative Applications & Cloud AI APIs",
            topics: [
              "Text generation, code synthesis, documentation authoring, and automated summarization.",
              "Image synthesis (Stable Diffusion, Midjourney) and voice/audio generative pipelines.",
              "Integrating frontier generative AI APIs (OpenAI API, Hugging Face Hub, Google Gemini API).",
              "Engineering generative AI applications: Managing prompts, temperature, and tokens."
            ]
          },
          {
            unit: "Unit IV",
            title: "AI Team Roles, Governance & Ethical Considerations",
            topics: [
              "Composition of modern AI teams: Data scientists, ML engineers, and prompt engineers.",
              "Ethical challenges: Training data bias, hallucination, intellectual property, and copyright.",
              "Deepfakes, misinformation, security vectors (jailbreaking, prompt injection), and safety rails.",
              "Global regulatory frameworks and responsible AI deployment principles."
            ]
          }
        ],
        labWork: [
          "Building programmatic Python scripts connecting to OpenAI and Hugging Face inference APIs.",
          "Comparing generative outputs across varied temperature and top-p sampling parameters.",
          "Testing diffusion image generation models using Stable Diffusion web interfaces.",
          "Auditing generated text for factual hallucination and demographic bias."
        ],
        resources: [
          { title: "Generative Deep Learning (2nd Edition)", author: "David Foster", type: "Book" },
          { title: "DeepLearning.AI Generative AI for Everyone", author: "Andrew Ng", url: "https://www.deeplearning.ai/", type: "Course" },
          { title: "Hugging Face NLP & Generative AI Course", url: "https://huggingface.co/learn/nlp-course/", type: "Tutorial" }
        ],
        outcomes: [
          "CO1: Compare predictive machine learning algorithms with modern generative architectures.",
          "CO2: Explain the role of self-attention mechanisms in transformer-based large language models.",
          "CO3: Develop software integrations leveraging cloud generative AI APIs for text and code generation.",
          "CO4: Audit AI-generated outputs for safety, bias, hallucination, and regulatory compliance."
        ],
        topics: [
          "AI Foundations & Machine Learning",
          "Transformer Architecture & Attention",
          "Diffusion Models & Image Generation",
          "Generative Cloud API Integration",
          "AI Safety, Ethics & Governance"
        ]
      }
    ]
  },
  {
    semester: 3,
    title: "Semester 3 – Advanced Frontend, Systems Architecture & Core Algorithms",
    shortTitle: "Semester 3",
    subtitle: "Master React component state, operating system kernels, computer networking stacks, algorithmic problem-solving, and conversational LLM integration.",
    categoryBadge: "Year 2 · Intermediate Engineering",
    l: 11,
    t: 5,
    p: 12,
    credits: 22,
    subjects: [
      {
        id: "sem3-1",
        name: "Web Development Frontend 2 - JS React",
        code: "0610332021",
        nature: "DSC",
        l: 2,
        t: 1,
        p: 2,
        credits: 5,
        category: "Frontend Frameworks",
        iconName: "Code2",
        description: "JavaScript, ES6+, DOM, asynchronous JavaScript, React, Hooks, React Router, API integration, and deployment.",
        objectives: [
          "Master modern ECMAScript features (ES6+) and asynchronous JavaScript programming.",
          "Build single-page web applications using React component hierarchies and JSX.",
          "Manage state and side-effects using React Hooks (useState, useEffect, useContext).",
          "Integrate external REST APIs, handle client-side routing, and deploy production builds."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Advanced ECMAScript (ES6+) & Modern JavaScript",
            topics: [
              "Block scoping with let/const, arrow functions, template literals, and enhanced object literals.",
              "Destructuring assignment (arrays and objects), spread operator, and rest parameters.",
              "Functional array methods: map, filter, reduce, find, some, and every.",
              "Lexical scope, closures, module bundling (import/export), and memory management."
            ]
          },
          {
            unit: "Unit II",
            title: "DOM APIs & Asynchronous Programming",
            topics: [
              "DOM manipulation, query selectors, dynamic element creation, and event delegation.",
              "Asynchronous runtime: The JavaScript event loop, microtask queue, and macrotask queue.",
              "Promises: Creation, chaining, error handling with .catch(), and Promise.all().",
              "Async/Await syntax, Fetch API, HTTP headers, JSON parsing, and LocalStorage caching."
            ]
          },
          {
            unit: "Unit III",
            title: "React Fundamentals & Component Architecture",
            topics: [
              "Single Page Application (SPA) architecture vs. multi-page web applications.",
              "Virtual DOM reconciliation, JSX syntax rules, and functional components.",
              "Component state management with the useState hook and immutable state updates.",
              "Side effects and lifecycle handling with useEffect, cleanup functions, and dependency arrays."
            ]
          },
          {
            unit: "Unit IV",
            title: "Hooks, Routing, Context & Production Deployment",
            topics: [
              "Advanced Hooks: useRef for DOM references, useMemo, and useCallback for performance.",
              "Global state management with React Context API and Redux Toolkit fundamentals.",
              "Single-page routing with React Router v6: Route definitions, Links, NavLinks, and useParams.",
              "Connecting to backend REST APIs with Axios, environment variables, and Vercel/Netlify hosting."
            ]
          }
        ],
        labWork: [
          "Developing an asynchronous JavaScript application consuming third-party REST endpoints.",
          "Building an interactive, stateful React task and project tracking dashboard.",
          "Implementing dynamic multi-page routing with React Router and URL parameter inspection.",
          "Connecting a React client to an external authentication and data service with Axios."
        ],
        resources: [
          { title: "React Official Documentation & Tutorials", url: "https://react.dev/", type: "Documentation" },
          { title: "Eloquent JavaScript (3rd Edition)", author: "Marijn Haverbeke", type: "Book" },
          { title: "JavaScript.info Modern JavaScript Tutorial", url: "https://javascript.info/", type: "Tutorial" }
        ],
        outcomes: [
          "CO1: Write clean, performant code utilizing modern ECMAScript (ES6+) paradigms.",
          "CO2: Handle asynchronous workflows, network requests, and API promises using async/await.",
          "CO3: Construct reusable, accessible component hierarchies using React functional components.",
          "CO4: Coordinate application routing, global state, and production cloud deployments."
        ],
        topics: [
          "Modern ECMAScript (ES6+) Features",
          "Async JavaScript, Promises & Fetch",
          "React Virtual DOM & State (useState)",
          "Side Effects (useEffect) & Custom Hooks",
          "React Router v6 & Production Deployment"
        ]
      },
      {
        id: "sem3-2",
        name: "Operating System Fundamentals",
        code: "0610331071",
        nature: "DSC",
        l: 2,
        t: 1,
        p: 2,
        credits: 5,
        category: "Systems & Kernels",
        iconName: "Terminal",
        description: "Operating systems, Linux, shell scripting, file management, permissions, processes, memory management, and Linux file systems.",
        objectives: [
          "Analyze process lifecycles, CPU scheduling algorithms, and inter-process communication.",
          "Examine memory virtualization, demand paging, and storage allocation strategies.",
          "Administer Linux systems using command-line tools, permissions, and service management.",
          "Write automated Bash shell scripts for routine administration and data pipelines."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Kernel Architecture & Process Scheduling",
            topics: [
              "Operating system roles, kernel vs. user space, dual-mode execution, and system calls.",
              "Process concept: Process Control Block (PCB), process states, and context switching.",
              "CPU Scheduling: FCFS, Shortest Job First (SJF), Round Robin, and Multi-level feedback queues.",
              "Inter-process communication (IPC): Shared memory, message passing, pipes, and sockets."
            ]
          },
          {
            unit: "Unit II",
            title: "Synchronization, Deadlocks & Memory Management",
            topics: [
              "Concurrency challenges: Race conditions, critical section problem, Peterson's algorithm.",
              "Synchronization primitives: Mutex locks, binary and counting semaphores, monitors.",
              "Deadlocks: Necessary conditions, resource allocation graphs, deadlock avoidance (Banker's).",
              "Memory management: Contiguous allocation, fragmentation, paging, and segmentation."
            ]
          },
          {
            unit: "Unit III",
            title: "Virtual Memory & Linux Administration",
            topics: [
              "Virtual memory: Demand paging, page fault handling, and effective access time.",
              "Page replacement algorithms: FIFO, Least Recently Used (LRU), and Optimal replacement.",
              "Linux filesystem hierarchy (/bin, /etc, /home, /var, /proc, /dev) and inode concepts.",
              "System administration: User/group management, chmod/chown permissions, and package managers."
            ]
          },
          {
            unit: "Unit IV",
            title: "Shell Scripting, Storage & File Systems",
            topics: [
              "Linux Bash shell programming: Shell variables, conditional execution (if-elif-else), and loops.",
              "Command-line text filters: grep, sed, awk, cut, and standard stream piping (|, >, >>).",
              "File system implementation: Directory structures, allocation methods, and free space management.",
              "Process monitoring (ps, top, kill, systemctl) and automated cron jobs."
            ]
          }
        ],
        labWork: [
          "Simulating CPU scheduling algorithms (FCFS, SJF, Round Robin) in C/Python.",
          "Implementing the Banker's algorithm for deadlock avoidance in multi-process systems.",
          "Simulating LRU and FIFO page replacement algorithms to benchmark page fault rates.",
          "Writing Bash scripts for automated log rotation, user onboarding, and scheduled backups."
        ],
        resources: [
          { title: "Operating System Concepts (10th Edition)", author: "Silberschatz, Galvin, Gagne", type: "Book" },
          { title: "The Linux Command Line", author: "William E. Shotts, Jr.", type: "Book" },
          { title: "Linux Foundation System Admin Essentials", url: "https://www.linuxfoundation.org/", type: "Course" }
        ],
        outcomes: [
          "CO1: Evaluate CPU scheduling performance and inter-process communication models.",
          "CO2: Solve synchronization bottlenecks and prevent system deadlocks with formal algorithms.",
          "CO3: Calculate page faults and virtual memory overhead across diverse page replacement schemes.",
          "CO4: Develop production Bash scripts to automate Linux system tasks and monitor daemon services."
        ],
        topics: [
          "Kernel Architecture & System Calls",
          "CPU Scheduling & IPC",
          "Process Synchronization & Semaphores",
          "Virtual Memory & Page Replacement",
          "Linux Shell Scripting & Administration"
        ]
      },
      {
        id: "sem3-3",
        name: "Computer Network",
        code: "0610331080",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 0,
        credits: 4,
        category: "Networking",
        iconName: "Wifi",
        description: "Network architecture, OSI and TCP/IP, data link layer, IP addressing, routing, TCP/UDP, HTTP/HTTPS, DNS, and network security.",
        objectives: [
          "Trace protocol data units across the 7 layers of OSI and 4 layers of TCP/IP architectures.",
          "Design IPv4 subnet allocations using Classless Inter-Domain Routing (CIDR).",
          "Contrast connection-oriented reliable TCP with connectionless real-time UDP communications.",
          "Analyze modern application layer protocols (HTTP/2, HTTPS, DNS, DHCP) and transport security."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Network Architectures & Physical Layer",
            topics: [
              "Network classifications (LAN, MAN, WAN, PAN) and transmission metrics (bandwidth, latency).",
              "Layered communication architectures: OSI 7-layer reference model vs. TCP/IP suite.",
              "Physical transmission media: Twisted pair, coaxial cable, optical fiber, and wireless spectrum.",
              "Data encoding, modulation, multiplexing (TDM, FDM), and packet vs. circuit switching."
            ]
          },
          {
            unit: "Unit II",
            title: "Data Link Layer & Local Network Access",
            topics: [
              "Data link responsibilities: Framing methods, bit/byte stuffing, and error detection (CRC, parity).",
              "Flow control protocols: Stop-and-Wait, Go-Back-N, and Selective Repeat ARQ.",
              "Medium Access Control: ALOHA, CSMA/CD (Ethernet), CSMA/CA (Wi-Fi), and collision domains.",
              "Ethernet frame structure, MAC addressing, Address Resolution Protocol (ARP), and switches."
            ]
          },
          {
            unit: "Unit III",
            title: "Network Layer & IPv4/IPv6 Routing",
            topics: [
              "Network layer design issues: Virtual circuit vs. datagram networks, routing principles.",
              "IPv4 addressing: Classful addressing, subnet masks, CIDR notation, and Variable Length Subnet Masking (VLSM).",
              "Routing algorithms: Distance Vector (RIP), Link State (OSPF), and Path Vector (BGP).",
              "Supporting protocols: Internet Control Message Protocol (ICMP), NAT, and IPv6 migration."
            ]
          },
          {
            unit: "Unit IV",
            title: "Transport Protocols, Applications & Security",
            topics: [
              "Transport layer services: Port multiplexing, socket programming interface.",
              "Transmission Control Protocol (TCP): 3-way handshake, reliable delivery, sliding window flow control, congestion control.",
              "User Datagram Protocol (UDP): Packet headers, checksums, and real-time streaming use cases.",
              "Application protocols: Domain Name System (DNS), DHCP, HTTP/1.1 vs HTTP/2/3, TLS/SSL, firewalls."
            ]
          }
        ],
        labWork: [
          "Designing IPv4 subnets and calculating host/broadcast address ranges using CIDR.",
          "Capturing and analyzing HTTP, DNS, TCP handshakes, and ARP packets with Wireshark.",
          "Simulating routed enterprise networks with switches and routers in Cisco Packet Tracer.",
          "Socket programming exercises implementing client-server TCP chat in Python/C."
        ],
        resources: [
          { title: "Computer Networking: A Top-Down Approach (8th Edition)", author: "Kurose & Ross", type: "Book" },
          { title: "Computer Networks (5th Edition)", author: "Andrew S. Tanenbaum", type: "Book" },
          { title: "Wireshark Packet Analysis Official Tutorials", url: "https://www.wireshark.org/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Map networking operations to the appropriate layer of the OSI and TCP/IP protocol stacks.",
          "CO2: Calculate efficient IPv4 subnets and configure routing between heterogeneous networks.",
          "CO3: Contrast reliability, latency, and throughput characteristics of TCP versus UDP protocols.",
          "CO4: Diagnose network protocol anomalies using packet analyzer tools such as Wireshark."
        ],
        topics: [
          "OSI & TCP/IP Layered Models",
          "Data Link Layer & MAC Protocols",
          "IPv4 Subnetting & CIDR Calculation",
          "Distance Vector & Link State Routing",
          "TCP Handshake, UDP & TLS/HTTPS"
        ]
      },
      {
        id: "sem3-4",
        name: "Data Structures and Algorithms (Problem Solving 3)",
        code: "0610332031",
        nature: "DSC",
        l: 2,
        t: 1,
        p: 4,
        credits: 5,
        category: "Algorithms",
        iconName: "Binary",
        description: "Strings, searching, sorting, hashing, trees, graphs, BFS, DFS, Dijkstra, greedy algorithms, dynamic programming, and backtracking.",
        objectives: [
          "Master non-linear graph modeling and traversal algorithms (BFS, DFS, topological sort).",
          "Implement greedy optimization routines including Dijkstra's algorithm and Prim's/Kruskal's MST.",
          "Formulate Dynamic Programming (DP) state transitions using memoization and tabulation.",
          "Solve complex algorithmic coding challenges on platforms like LeetCode and CodeChef."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Advanced Sorting, Searching & Hash Maps",
            topics: [
              "Divide-and-conquer sorting: MergeSort and QuickSort with worst-case mitigation.",
              "Linear time sorting: Counting Sort, Radix Sort, and Bucket Sort.",
              "Binary search on answer spaces and monotonic predicate functions.",
              "Hash tables: Hash functions, collision resolution via separate chaining and open addressing."
            ]
          },
          {
            unit: "Unit II",
            title: "Graph Representations & Traversal Algorithms",
            topics: [
              "Graph terminology, adjacency matrix and adjacency list storage representations.",
              "Breadth-First Search (BFS): Shortest path in unweighted graphs and multi-source BFS.",
              "Depth-First Search (DFS): Cycle detection in directed and undirected graphs, connected components.",
              "Directed Acyclic Graphs (DAGs): Topological sorting via Kahn's algorithm and DFS."
            ]
          },
          {
            unit: "Unit III",
            title: "Shortest Paths, Minimum Spanning Trees & Greedy Algorithms",
            topics: [
              "Dijkstra's shortest path algorithm using priority queues / min-heaps.",
              "Bellman-Ford algorithm for negative edge weights and negative cycle detection.",
              "Minimum Spanning Trees: Kruskal's algorithm with Disjoint Set Union (DSU) and Prim's algorithm.",
              "Greedy algorithmic paradigm: Activity selection, fractional knapsack, and Huffman coding."
            ]
          },
          {
            unit: "Unit IV",
            title: "Dynamic Programming (DP) & Backtracking",
            topics: [
              "Dynamic programming principles: Overlapping subproblems and optimal substructure.",
              "Top-down memoization vs. bottom-up tabulation implementations.",
              "Classic 1D DP: Climbing stairs, house robber, and coin change problems.",
              "Classic 2D DP: 0/1 Knapsack, Longest Common Subsequence (LCS), and Matrix Chain Multiplication."
            ]
          }
        ],
        labWork: [
          "Implementing QuickSort and MergeSort with comparative recursive call tracking.",
          "Implementing BFS and DFS graph traversals with bipartite verification.",
          "Implementing Dijkstra's shortest path algorithm using priority queues.",
          "Solving 50+ medium complexity algorithmic coding problems on LeetCode / CodeChef."
        ],
        resources: [
          { title: "Introduction to Algorithms (CLRS 4th Edition)", author: "Cormen, Leiserson, Rivest, Stein", type: "Book" },
          { title: "Algorithm Design Manual", author: "Steven S. Skiena", type: "Book" },
          { title: "LeetCode Practice Arena", url: "https://leetcode.com/", type: "Platform" }
        ],
        outcomes: [
          "CO1: Implement fast divide-and-conquer sorting and binary search over solution spaces.",
          "CO2: Model complex interconnected problems using graphs and perform BFS/DFS traversals.",
          "CO3: Find optimal paths and minimal spanning networks using greedy priority queue algorithms.",
          "CO4: Synthesize dynamic programming state transitions to solve multi-stage optimization problems."
        ],
        topics: [
          "MergeSort, QuickSort & Hash Maps",
          "Graph BFS, DFS & Topological Sort",
          "Dijkstra's Shortest Path & Prim/Kruskal MST",
          "Greedy Paradigms & Disjoint Sets",
          "Dynamic Programming (1D & 2D Tabulation)"
        ]
      },
      {
        id: "sem3-5",
        name: "New Age Life Skills 3",
        code: "0610335021",
        nature: "SEC",
        l: 1,
        t: 1,
        p: 2,
        credits: 3,
        category: "Life Skills",
        iconName: "HeartHandshake",
        description: "Advanced communication, writing, debates, sexual health awareness, first aid, emergency care, personal branding, CV, and cover letters.",
        objectives: [
          "Deliver persuasive oral presentations and participate in structured parliamentary debates.",
          "Master emergency first aid procedures, CPR administration, and basic life support.",
          "Author technical resumes and cover letters complying with modern Applicant Tracking Systems (ATS).",
          "Build a professional digital portfolio across LinkedIn and developer communities."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Advanced Communication & Parliamentary Debates",
            topics: [
              "Persuasive public speaking: Ethos, pathos, and logos rhetorical structures.",
              "Structured parliamentary debating formats: Constructive speeches, cross-examinations, rebuttals.",
              "Negotiation techniques, active de-escalation, and collaborative consensus building.",
              "Professional meeting facilitation, agenda setting, and minute taking."
            ]
          },
          {
            unit: "Unit II",
            title: "First Aid, CPR & Emergency Response",
            topics: [
              "Basic Life Support (BLS) algorithms and Cardiopulmonary Resuscitation (CPR) delivery.",
              "Handling medical emergencies: Choking (Heimlich maneuver), burns, fractures, and severe bleeding.",
              "Sexual health education, consent, reproductive health awareness, and gender inclusivity.",
              "Mental health first aid: Recognizing panic attacks, anxiety, and campus support helplines."
            ]
          },
          {
            unit: "Unit III",
            title: "ATS Resume Engineering & Cover Letters",
            topics: [
              "Applicant Tracking System (ATS) mechanics: Keyword parsing, formatting traps, and readability.",
              "Structuring a high-impact technical resume: Action verbs, quantifiable metrics (X-Y-Z formula).",
              "Crafting customized professional cover letters demonstrating domain alignment.",
              "GitHub portfolio curation: Readme engineering, documentation standards, and open-source contributions."
            ]
          },
          {
            unit: "Unit IV",
            title: "Professional Networking & Personal Branding",
            topics: [
              "LinkedIn profile optimization: Headline crafting, summary engineering, and skill endorsements.",
              "Elevator pitch creation: Crafting and delivering 30-second and 2-minute personal pitches.",
              "Informational interviews, technical conference networking, and building industry relationships.",
              "Workplace ethics, professional confidentiality, and digital footprint management."
            ]
          }
        ],
        labWork: [
          "Hands-on Cardiopulmonary Resuscitation (CPR) and bandage application simulation.",
          "Conducting competitive, timed parliamentary debates on contemporary technology topics.",
          "Drafting and testing an ATS-compliant resume through resume parsing validators.",
          "Delivering a recorded personal elevator pitch followed by peer review."
        ],
        resources: [
          { title: "Crucial Conversations: Tools for Talking When Stakes Are High", author: "Patterson, Grenny, McMillan, Switzler", type: "Book" },
          { title: "American Red Cross First Aid & CPR Handbook", url: "https://www.redcross.org/", type: "Guide" },
          { title: "Harvard University Resume and Cover Letter Guide", url: "https://careerservices.fas.harvard.edu/", type: "Guide" }
        ],
        outcomes: [
          "CO1: Articulate persuasive viewpoints under competitive parliamentary debate formats.",
          "CO2: Administer basic life support (CPR) and emergency first aid safely and methodically.",
          "CO3: Create an ATS-compliant resume highlighting software projects with quantifiable metrics.",
          "CO4: Pitch professional capabilities effectively in corporate networking settings."
        ],
        topics: [
          "Persuasive Rhetoric & Debating",
          "CPR & Emergency Life Support",
          "ATS Resume & Cover Letter Design",
          "LinkedIn Profile Optimization",
          "Personal Branding & Elevator Pitches"
        ]
      },
      {
        id: "sem3-6",
        name: "Introduction to ChatGPT",
        code: "0610334020",
        nature: "DSE",
        l: 1,
        t: 0,
        p: 2,
        credits: 2,
        category: "Artificial Intelligence",
        iconName: "Sparkles",
        description: "LLMs, prompt engineering, prompt patterns, few-shot prompting, advanced prompting, prompt refinement, and AI-assisted software development.",
        objectives: [
          "Understand the mathematical foundations and probabilistic token generation of conversational LLMs.",
          "Apply prompt engineering patterns (few-shot, persona, chain-of-thought) for reliable output formatting.",
          "Iteratively refine and benchmark complex prompts for structured JSON and code generation.",
          "Leverage conversational AI assistants for code generation, debugging, testing, and documentation."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Conversational LLM Architecture & Generation",
            topics: [
              "Evolution of GPT architectures: From GPT-1 to GPT-4 and ChatGPT conversational tuning.",
              "Tokenization, byte-pair encoding (BPE), vocabulary size, and context window limits.",
              "Hyperparameters: Temperature, Top-p, presence penalty, and frequency penalty effects.",
              "Reinforcement Learning from Human Feedback (RLHF) and conversational instruction alignment."
            ]
          },
          {
            unit: "Unit II",
            title: "Prompt Engineering Patterns & Methodologies",
            topics: [
              "Prompt taxonomy: Zero-shot prompting, one-shot prompting, and few-shot in-context learning.",
              "Role-based and persona prompting: Setting tone, technical depth, and strict system rules.",
              "Output constraint engineering: Forcing structured JSON, Markdown tables, and schema compliance.",
              "Template-based prompting and dynamic variable injection for automated workflows."
            ]
          },
          {
            unit: "Unit III",
            title: "Advanced Reasoning & Prompt Refinement",
            topics: [
              "Chain-of-Thought (CoT) prompting: Eliciting step-by-step reasoning in complex problems.",
              "Self-consistency decoding, Least-to-Most prompting, and Directional Stimulus prompting.",
              "Systematic prompt refinement: Identifying ambiguities, testing edge cases, and mitigating hallucination.",
              "Prompt chaining: Decomposing massive multi-step workflows into linked prompts."
            ]
          },
          {
            unit: "Unit IV",
            title: "AI-Assisted Software Engineering",
            topics: [
              "Code generation workflows: Translating user requirements and pseudocode into working programs.",
              "Automated debugging: Using ChatGPT to identify logical bugs, syntax errors, and edge case failures.",
              "Test suite creation: Generating unit tests, mocks, and boundary case fixtures.",
              "Code refactoring, performance optimization, and generating technical documentation from code."
            ]
          }
        ],
        labWork: [
          "Designing prompt templates that enforce validated JSON output across multiple LLM runs.",
          "Building multi-step prompt chains that automate requirement analysis into testable code.",
          "Pair programming with ChatGPT to refactor an unoptimized algorithm into a high-performance solution.",
          "Generating unit test suites using ChatGPT and benchmarking test coverage in Python/JavaScript."
        ],
        resources: [
          { title: "OpenAI Prompt Engineering Official Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", type: "Documentation" },
          { title: "Learn Prompting Comprehensive Open Curriculum", url: "https://learnprompting.org/", type: "Course" },
          { title: "Prompt Engineering for Generative AI", author: "James Phoenix & Mike Taylor", type: "Book" }
        ],
        outcomes: [
          "CO1: Explain how tokenization, temperature, and context windows govern LLM behavior.",
          "CO2: Formulate zero-shot, few-shot, and chain-of-thought prompts for deterministic results.",
          "CO3: Structure complex multi-step prompt chains producing valid JSON data schemas.",
          "CO4: Accelerate software engineering workflows through AI-assisted code writing, debugging, and testing."
        ],
        topics: [
          "Conversational LLM Tokens & Sampling",
          "Zero-Shot & Few-Shot Prompt Patterns",
          "Chain-of-Thought & Reasoning Prompts",
          "Structured JSON & Output Constraints",
          "AI-Assisted Code Refactoring & Testing"
        ]
      }
    ]
  },
  {
    semester: 4,
    title: "Semester 4 – Full-Stack Backend, System Design & Cloud Architecture",
    shortTitle: "Semester 4",
    subtitle: "Develop production-grade Node.js/Express APIs, containerized scalable architectures, low-level object-oriented system designs, career readiness, and AWS cloud solutions.",
    categoryBadge: "Year 2 · Backend & Systems",
    l: 13,
    t: 3,
    p: 12,
    credits: 22,
    subjects: [
      {
        id: "sem4-1",
        name: "Web Development Backend 1",
        code: "0610341091",
        nature: "DSC",
        l: 3,
        t: 0,
        p: 2,
        credits: 4,
        category: "Backend Engineering",
        iconName: "Server",
        description: "MERN stack, Node.js, Express.js, MongoDB, Mongoose, REST APIs, CRUD, JWT, authentication, authorization, and Swagger.",
        objectives: [
          "Understand the asynchronous, single-threaded event loop architecture of Node.js.",
          "Build modular RESTful API web services using the Express.js framework.",
          "Design document database models and validation rules using MongoDB and Mongoose ODM.",
          "Implement stateless authentication using JSON Web Tokens (JWT) and document APIs with Swagger."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Node.js Runtime & Asynchronous Architecture",
            topics: [
              "Node.js runtime environment, V8 JavaScript engine, and the libuv event loop architecture.",
              "Asynchronous non-blocking I/O vs. multi-threaded thread-per-request models.",
              "Node.js core modules: fs (file system), path, http, events, and stream buffers.",
              "NPM ecosystem: package.json management, semantic versioning, and environment variables."
            ]
          },
          {
            unit: "Unit II",
            title: "Express.js Framework & RESTful API Design",
            topics: [
              "Express application setup, routing architecture, and route parameters/query strings.",
              "Middleware anatomy: Application-level, router-level, error-handling, and third-party middleware.",
              "REST architectural principles: Statelessness, uniform interface, resource URI naming conventions.",
              "HTTP methods (GET, POST, PUT, PATCH, DELETE) and standard HTTP response status codes."
            ]
          },
          {
            unit: "Unit III",
            title: "MongoDB & Mongoose Object Data Modeling",
            topics: [
              "NoSQL document databases: Comparison with relational RDBMS and flexible JSON/BSON schemas.",
              "Mongoose setup: Schemas, models, data types, required constraints, and default values.",
              "CRUD operations in Mongoose: find, findOne, create, findByIdAndUpdate, and deleteOne.",
              "Mongoose middleware (pre/post hooks), virtual properties, population, and schema validation."
            ]
          },
          {
            unit: "Unit IV",
            title: "Authentication, Authorization & Swagger Documentation",
            topics: [
              "Security best practices: Password hashing using bcrypt with salt rounds.",
              "Stateless authentication: JSON Web Token (JWT) structure, signing, and verification.",
              "Role-Based Access Control (RBAC): Protecting endpoints with custom authorization middleware.",
              "Input validation using schema libraries (Zod / Joi) and API documentation with Swagger/OpenAPI."
            ]
          }
        ],
        labWork: [
          "Building an Express.js server with modular routing and centralized error handling middleware.",
          "Implementing MongoDB Atlas schemas with Mongoose validation rules.",
          "Developing a complete user registration and login system with bcrypt hashing and JWT tokens.",
          "Writing OpenAPI/Swagger documentation specifications for an e-commerce backend API."
        ],
        resources: [
          { title: "Node.js Design Patterns (3rd Edition)", author: "Mario Casciaro & Luciano Mammino", type: "Book" },
          { title: "Express.js Official Documentation & API Reference", url: "https://expressjs.com/", type: "Documentation" },
          { title: "Mongoose ODM Guide", url: "https://mongoosejs.com/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Create high-concurrency server applications leveraging Node.js non-blocking asynchronous I/O.",
          "CO2: Architect modular RESTful APIs using Express.js routing and custom middleware pipelines.",
          "CO3: Design schema-validated document datastores using MongoDB and Mongoose models.",
          "CO4: Implement secure JWT authentication, RBAC authorization, and interactive Swagger API docs."
        ],
        topics: [
          "Node.js Event Loop & Asynchronous I/O",
          "Express.js Routing & Middleware Pipelines",
          "MongoDB Document Schemas & Mongoose",
          "JWT Authentication & Password Hashing",
          "RESTful CRUD & Swagger Documentation"
        ]
      },
      {
        id: "sem4-2",
        name: "Web Development Backend (Deployment, Security, and Scalability of Web Apps)",
        code: "0610341101",
        nature: "DSC",
        l: 3,
        t: 0,
        p: 4,
        credits: 5,
        category: "Cloud & Scalability",
        iconName: "ShieldCheck",
        description: "Middleware, validation, testing, logging, caching, Redis, MongoDB optimization, cloud deployment, Docker, and CI/CD.",
        objectives: [
          "Harden web application security using HTTP headers, rate limiting, and input sanitization.",
          "Write comprehensive automated unit and integration tests using Jest and Supertest.",
          "Accelerate application throughput using Redis in-memory caching and database query indexing.",
          "Containerize full-stack applications with Docker and automate deployment via CI/CD pipelines."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Production Middleware, Security & Logging",
            topics: [
              "Production security headers using Helmet.js and Cross-Origin Resource Sharing (CORS) rules.",
              "Rate limiting and DDoS mitigation using express-rate-limit to protect backend resources.",
              "Data sanitization: Preventing NoSQL injection, cross-site scripting (XSS), and parameter pollution.",
              "Production logging: Centralized logging with Winston, request logging with Morgan, and log levels."
            ]
          },
          {
            unit: "Unit II",
            title: "Automated Testing for Web Applications",
            topics: [
              "Testing pyramid: Unit testing, integration testing, and end-to-end (E2E) testing.",
              "Test runner setup: Jest framework, test suites, assertions, and test lifecycle hooks.",
              "Integration testing HTTP endpoints with Supertest without starting external servers.",
              "Mocking database connections, third-party APIs, and measuring test coverage benchmarks."
            ]
          },
          {
            unit: "Unit III",
            title: "Caching & Database Query Optimization",
            topics: [
              "In-memory caching architectures: Introduction to Redis key-value store.",
              "Cache-aside pattern: Reading through cache, cache invalidation, and Time-To-Live (TTL) strategies.",
              "MongoDB performance tuning: Single-field, compound, text, and multikey indexes.",
              "Explain plans: Analyzing query execution statistics (executionStats), avoiding collection scans."
            ]
          },
          {
            unit: "Unit IV",
            title: "Containerization, CI/CD & Cloud Deployment",
            topics: [
              "Docker fundamentals: Virtual machines vs. lightweight containers, Docker engine architecture.",
              "Dockerfile creation: Base images, layer caching, multi-stage builds, and .dockerignore.",
              "Multi-container orchestration with Docker Compose (App, MongoDB, Redis services).",
              "Continuous Integration and Continuous Deployment (CI/CD) with GitHub Actions and cloud deployment."
            ]
          }
        ],
        labWork: [
          "Securing an Express API with Helmet, rate limiting, and Winston logging rotation.",
          "Writing automated unit and integration tests achieving >80% code coverage with Jest and Supertest.",
          "Integrating Redis to cache high-frequency database query endpoints with TTL invalidation.",
          "Writing a Dockerfile and docker-compose.yml file to containerize and deploy an application."
        ],
        resources: [
          { title: "Docker Deep Dive", author: "Nigel Poulton", type: "Book" },
          { title: "Redis University: In-Memory Data Structures & Caching", url: "https://university.redis.com/", type: "Course" },
          { title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Enforce enterprise security standards, rate-limiting, and centralized logging in web services.",
          "CO2: Write robust unit and integration test suites validating HTTP endpoints with Jest.",
          "CO3: Reduce database response latency by implementing Redis in-memory caching and index optimization.",
          "CO4: Package applications into Docker container images and deploy them using GitHub Actions CI/CD."
        ],
        topics: [
          "Security Hardening & Centralized Logging",
          "Automated API Testing (Jest & Supertest)",
          "Redis Caching & Invalidation Strategies",
          "MongoDB Index Optimization & Explain Plans",
          "Docker Containerization & GitHub Actions CI/CD"
        ]
      },
      {
        id: "sem4-3",
        name: "System Design (Low Level)",
        code: "0610342040",
        nature: "DSC",
        l: 3,
        t: 1,
        p: 0,
        credits: 4,
        category: "Software Architecture",
        iconName: "Boxes",
        description: "HLD, LLD, functional and non-functional requirements, CRC cards, UML diagrams, architecture styles, database design, RBAC, security, scalability, and observability.",
        objectives: [
          "Differentiate high-level architectural design from low-level object-oriented design.",
          "Master the SOLID principles and Gang of Four (GoF) software design patterns.",
          "Construct formal Unified Modeling Language (UML) class, sequence, and activity diagrams.",
          "Design end-to-end low-level systems for parking lots, rate limiters, and game engines."
        ],
        units: [
          {
            unit: "Unit I",
            title: "System Design Fundamentals & Requirements",
            topics: [
              "High Level Design (HLD) vs. Low Level Design (LLD) boundaries and engineering scopes.",
              "Analyzing requirements: Functional specifications vs. Non-Functional requirements (latency, throughput).",
              "Scalability attributes: Horizontal vs. vertical scaling, statelessness, and fault tolerance.",
              "CRC (Class-Responsibility-Collaboration) cards for initial object-oriented modeling."
            ]
          },
          {
            unit: "Unit II",
            title: "SOLID Principles & Creational Design Patterns",
            topics: [
              "SOLID principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
              "Creational patterns: Singleton pattern (thread safety, double-checked locking).",
              "Factory Method and Abstract Factory patterns for decoupled object creation.",
              "Builder pattern for complex object construction and Prototype pattern for object cloning."
            ]
          },
          {
            unit: "Unit III",
            title: "Structural & Behavioral Design Patterns",
            topics: [
              "Structural patterns: Adapter pattern, Decorator pattern, Facade pattern, and Proxy pattern.",
              "Behavioral patterns: Strategy pattern, Observer pattern (pub-sub), and Command pattern.",
              "Unified Modeling Language (UML): Class diagrams, relationships (association, aggregation, composition).",
              "UML Sequence diagrams: Lifelines, messages, synchronous/asynchronous calls, and return flows."
            ]
          },
          {
            unit: "Unit IV",
            title: "LLD Case Studies & Practical System Modeling",
            topics: [
              "Low Level Design of a Multi-Floor Parking Lot System (vehicles, slots, pricing strategies).",
              "Low Level Design of a Snake and Ladders / Tic-Tac-Toe Game Engine.",
              "Low Level Design of a Token Bucket / Leaky Bucket Rate Limiter.",
              "Designing decoupled Role-Based Access Control (RBAC) and observability mechanisms."
            ]
          }
        ],
        labWork: [
          "Drafting CRC cards and UML class diagrams for real-world domain problems.",
          "Implementing the Strategy and Observer design patterns in clean, modular code.",
          "Developing the complete object-oriented code for an automated Parking Lot system.",
          "Creating sequence diagrams modeling checkout and payment gateway interactions."
        ],
        resources: [
          { title: "Head First Design Patterns (2nd Edition)", author: "Eric Freeman & Elisabeth Robson", type: "Book" },
          { title: "Clean Code: A Handbook of Agile Software Craftsmanship", author: "Robert C. Martin", type: "Book" },
          { title: "Refactoring.Guru Design Patterns Reference", url: "https://refactoring.guru/design-patterns", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Formulate functional and non-functional software specifications for system modules.",
          "CO2: Apply SOLID design principles to construct extensible, decoupled codebases.",
          "CO3: Select and implement appropriate GoF creational, structural, and behavioral design patterns.",
          "CO4: Produce complete UML class and sequence diagrams for complex software systems."
        ],
        topics: [
          "HLD vs LLD & Functional Requirements",
          "SOLID Object-Oriented Principles",
          "Creational & Structural Design Patterns",
          "UML Class & Sequence Diagrams",
          "Real-World System Design Case Studies"
        ]
      },
      {
        id: "sem4-4",
        name: "New Age Life Skills 4",
        code: "0610345031",
        nature: "SEC",
        l: 1,
        t: 1,
        p: 2,
        credits: 3,
        category: "Career Readiness",
        iconName: "Target",
        description: "Job preparation, resume, cover letters, interview preparation, onboarding, workplace culture, career development, and professional networking.",
        objectives: [
          "Prepare for technical coding interviews, systems screening, and algorithmic whiteboard rounds.",
          "Master behavioral and leadership interview responses using the STAR method.",
          "Navigate corporate onboarding, professional code reviews, and cross-functional team dynamics.",
          "Build a long-term career growth roadmap and establish professional networking channels."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Technical Interview Preparation & Problem Solving",
            topics: [
              "Anatomy of modern software engineering hiring: Online assessments, technical phone screens, on-sites.",
              "Communicating thought processes during live coding rounds and clarifying problem ambiguities.",
              "Explaining time/space algorithmic trade-offs and handling edge case validations.",
              "Practicing problem dissection strategies when encountering unfamiliar technical questions."
            ]
          },
          {
            unit: "Unit II",
            title: "Behavioral Interviews & The STAR Methodology",
            topics: [
              "The STAR methodology: Situation, Task, Action, and Result framing.",
              "Formulating compelling responses for conflict resolution, failure, and leadership questions.",
              "Assessing company culture, engineering values, and preparing insightful candidate questions.",
              "Job offer evaluation, total compensation components, and professional salary negotiation."
            ]
          },
          {
            unit: "Unit III",
            title: "Workplace Onboarding & Engineering Culture",
            topics: [
              "First 90 days in a technology company: Navigating codebases, documentation, and tooling.",
              "Code review etiquette: Writing clear pull requests, giving constructive feedback, accepting critique.",
              "Cross-functional collaboration with product managers, QA engineers, and UX designers.",
              "Handling ambiguity, remote working best practices, and avoiding engineering burnout."
            ]
          },
          {
            unit: "Unit IV",
            title: "Career Development & Professional Pathways",
            topics: [
              "Engineering career ladders: Individual Contributor (IC) track vs. Engineering Management track.",
              "Contributing to open-source software communities and building public code credibility.",
              "Authoring engineering blog posts, case studies, and participating in tech meetups.",
              "Professional ethics, intellectual property protection, and continuous lifelong skill acquisition."
            ]
          }
        ],
        labWork: [
          "Conducting simulated peer mock technical coding interviews under timed conditions.",
          "Recording behavioral STAR interview answers and participating in evaluation workshops.",
          "Reviewing open-source pull requests on GitHub and writing professional code review feedback.",
          "Drafting an individual 90-day onboarding strategy for a software engineering internship."
        ],
        resources: [
          { title: "Cracking the Coding Interview (6th Edition)", author: "Gayle Laakmann McDowell", type: "Book" },
          { title: "The Effective Engineer", author: "Edmond Lau", type: "Book" },
          { title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/", type: "Guide" }
        ],
        outcomes: [
          "CO1: Articulate technical problem-solving steps clearly during live coding interviews.",
          "CO2: Deliver structured behavioral interview responses utilizing the STAR framework.",
          "CO3: Execute professional code reviews and navigate corporate software engineering onboarding.",
          "CO4: Construct an actionable career development plan spanning both IC and management tracks."
        ],
        topics: [
          "Technical Coding Round Strategies",
          "Behavioral Interviews & STAR Framework",
          "Corporate Onboarding & Code Reviews",
          "Cross-Functional Team Collaboration",
          "Career Ladders & Open-Source Growth"
        ]
      },
      {
        id: "sem4-5",
        name: "Introduction to Cloud Computing",
        code: "0610344041",
        nature: "DSE",
        l: 3,
        t: 1,
        p: 4,
        credits: 6,
        category: "Cloud Infrastructure",
        iconName: "Cloud",
        description: "AWS, EC2, S3, IAM, cloud models, networking, Docker, Kubernetes, serverless computing, Terraform, and CI/CD.",
        objectives: [
          "Understand cloud computing models (IaaS, PaaS, SaaS) and global cloud infrastructure.",
          "Deploy and configure core AWS cloud services (EC2, S3, IAM, VPC, RDS).",
          "Build serverless applications using AWS Lambda functions and API Gateway.",
          "Automate infrastructure provisioning using Terraform and manage container orchestration."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Cloud Computing Foundations & AWS Global Infrastructure",
            topics: [
              "Cloud computing essentials: Five essential characteristics, operational advantages.",
              "Service delivery models: Infrastructure as a Service (IaaS), PaaS, and SaaS.",
              "Deployment models: Public cloud, private cloud, hybrid cloud, and multi-cloud strategies.",
              "AWS Global Infrastructure: Regions, Availability Zones (AZs), edge locations, and data sovereignty."
            ]
          },
          {
            unit: "Unit II",
            title: "Identity, Compute & Cloud Storage Services",
            topics: [
              "AWS Identity and Access Management (IAM): Users, groups, roles, policies, and MFA security.",
              "Elastic Compute Cloud (EC2): Instance families, AMIs, key pairs, and security groups.",
              "Simple Storage Service (S3): Buckets, objects, storage classes, versioning, and lifecycle rules.",
              "Block and file storage: Elastic Block Store (EBS) volumes, snapshots, and Elastic File System (EFS)."
            ]
          },
          {
            unit: "Unit III",
            title: "Cloud Networking, Relational Databases & Serverless",
            topics: [
              "Virtual Private Cloud (VPC): Subnets, route tables, internet gateways, and NAT gateways.",
              "Managed databases: AWS Relational Database Service (RDS) multi-AZ and DynamoDB NoSQL.",
              "Serverless computing: AWS Lambda event-driven functions, execution triggers, and pricing.",
              "API Gateway: Building, publishing, and securing serverless RESTful API endpoints."
            ]
          },
          {
            unit: "Unit IV",
            title: "Infrastructure as Code (IaC), Containers & Monitoring",
            topics: [
              "Infrastructure as Code (IaC) principles: Declarative configuration and version-controlled environments.",
              "Terraform fundamentals: HCL syntax, providers, state management, resources, and variables.",
              "Container orchestration on cloud: AWS Elastic Container Service (ECS) and Elastic Kubernetes (EKS).",
              "Cloud monitoring, centralized auditing, and metrics tracking using AWS CloudWatch and CloudTrail."
            ]
          }
        ],
        labWork: [
          "Configuring AWS IAM users with least-privilege security policies and multi-factor authentication.",
          "Launching, configuring, and connecting to an EC2 Linux instance hosting an NGINX web server.",
          "Configuring an S3 bucket for static website hosting with custom domain and access permissions.",
          "Writing Terraform configuration scripts to provision a complete VPC and EC2 instance automatically."
        ],
        resources: [
          { title: "AWS Certified Solutions Architect Study Guide", author: "Ben Piper & David Clinton", type: "Book" },
          { title: "AWS Skill Builder Official Cloud Training", url: "https://explore.skillbuilder.aws/", type: "Course" },
          { title: "Terraform Official Documentation & Tutorials", url: "https://developer.hashicorp.com/terraform", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Compare cloud service models and formulate cloud migration architectures.",
          "CO2: Secure and administer cloud infrastructure using AWS IAM policies and VPC networks.",
          "CO3: Deploy event-driven serverless APIs using AWS Lambda and API Gateway.",
          "CO4: Automate cloud resource provisioning using Terraform Infrastructure as Code."
        ],
        topics: [
          "Cloud Service Models (IaaS, PaaS, SaaS)",
          "AWS IAM, EC2 Instances & S3 Storage",
          "Virtual Private Clouds (VPC) & Subnets",
          "Serverless Computing with AWS Lambda",
          "Terraform Infrastructure as Code (IaC)"
        ]
      }
    ]
  },
  {
    semester: 5,
    title: "Semester 5 – Artificial Intelligence, Competitive Coding & Major Project",
    shortTitle: "Semester 5",
    subtitle: "Hands-on intensive semester focusing on machine learning pipelines, contest-grade competitive programming, multimodal prompt engineering, and capstone project development.",
    categoryBadge: "Year 3 · AI & Specialization",
    l: 0,
    t: 0,
    p: 44,
    credits: 22,
    subjects: [
      {
        id: "sem5-1",
        name: "Artificial Intelligence Fundamentals",
        code: "BCA 301",
        nature: "DSC",
        l: 0,
        t: 0,
        p: 8,
        credits: 4,
        category: "Artificial Intelligence",
        iconName: "BrainCircuit",
        description: "AI applications, machine learning concepts, datasets, AI workflows, model evaluation, and AI ethics.",
        objectives: [
          "Perform exploratory data analysis, data cleansing, and feature engineering for ML.",
          "Implement, train, and validate supervised machine learning regression and classification models.",
          "Apply unsupervised clustering and dimensionality reduction algorithms.",
          "Evaluate models rigorously using precision, recall, F1-scores, and ROC-AUC curves."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Data Preparation & Exploratory Data Analysis (EDA)",
            topics: [
              "Data preprocessing workflows: Imputation of missing values, outlier detection with IQR.",
              "Feature scaling: Min-Max normalization vs. Z-score standardization.",
              "Categorical encoding: One-hot encoding, label encoding, and target encoding.",
              "Exploratory visualization with Matplotlib and Seaborn: Correlation heatmaps and distributions."
            ]
          },
          {
            unit: "Unit II",
            title: "Supervised Learning Algorithms",
            topics: [
              "Linear Regression and Logistic Regression: Loss functions and gradient descent optimization.",
              "Decision Tree classifiers: Information gain, Gini impurity, and tree pruning.",
              "Ensemble algorithms: Random Forest bagging and bootstrap aggregation.",
              "Support Vector Machines (SVM): Hyperplanes, margins, and kernel tricks (RBF, Polynomial)."
            ]
          },
          {
            unit: "Unit III",
            title: "Unsupervised Learning & Dimensionality Reduction",
            topics: [
              "K-Means clustering: Centroid initialization, Elbow method, and silhouette analysis.",
              "Hierarchical clustering: Dendrograms, agglomerative vs. divisive approaches.",
              "Principal Component Analysis (PCA): Eigenvalues, eigenvectors, and variance retention.",
              "Distance metrics in multi-dimensional space: Euclidean, Manhattan, and Cosine similarity."
            ]
          },
          {
            unit: "Unit IV",
            title: "Model Validation, Metrics & Ethical AI",
            topics: [
              "Validation strategies: K-Fold cross-validation, stratified splits, and data leakage prevention.",
              "Classification evaluation metrics: Confusion matrix, precision, recall, F1-score, and ROC-AUC.",
              "Hyperparameter tuning using GridSearchCV and RandomizedSearchCV.",
              "Algorithmic fairness, model explainability (SHAP/LIME), and bias mitigation in AI systems."
            ]
          }
        ],
        labWork: [
          "Conducting exploratory data analysis and cleaning on real-world datasets in Jupyter notebooks.",
          "Building and tuning a Random Forest classifier for customer churn prediction.",
          "Implementing K-Means clustering for customer market segmentation with PCA visualization.",
          "Benchmarking multiple classification models with cross-validation and plotting ROC curves."
        ],
        resources: [
          { title: "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow", author: "Aurélien Géron", type: "Book" },
          { title: "Scikit-Learn Official User Guide & API", url: "https://scikit-learn.org/", type: "Documentation" },
          { title: "Kaggle Learn Machine Learning Courses", url: "https://www.kaggle.com/learn", type: "Platform" }
        ],
        outcomes: [
          "CO1: Prepare, clean, and engineer features from unstructured and missing data.",
          "CO2: Train and evaluate supervised regression and classification models using Scikit-Learn.",
          "CO3: Implement unsupervised clustering and reduce feature dimensionality using PCA.",
          "CO4: Quantify predictive performance and diagnose bias using formal statistical evaluation metrics."
        ],
        topics: [
          "Data Cleansing & Exploratory Analysis",
          "Linear & Logistic Regression Models",
          "Random Forests & Support Vector Machines",
          "K-Means Clustering & PCA Reduction",
          "Model Evaluation Metrics & Cross-Validation"
        ]
      },
      {
        id: "sem5-2",
        name: "Introduction to Competitive Programming",
        code: "BCA 302",
        nature: "DSC",
        l: 0,
        t: 0,
        p: 12,
        credits: 6,
        category: "Competitive Coding",
        iconName: "Trophy",
        description: "Include all the LeetCode problems, CodeChef practice requirements, weekly contests, and problem-solving exercises listed in the supplied syllabus.",
        objectives: [
          "Master competitive algorithmic problem solving under strict execution time limits (1.0 sec).",
          "Apply two-pointers, sliding window, bit manipulation, and number theory tricks in contests.",
          "Implement complex graph algorithms, disjoint set unions, and segment trees with high speed.",
          "Solve 100+ curated Medium/Hard coding challenges and participate in live weekly contests."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Contest Setup, Two-Pointers & Bit Manipulation",
            topics: [
              "Competitive programming setup: Fast I/O, custom comparator sorting, and debugging templates.",
              "Bitwise operations: AND, OR, XOR tricks, counting set bits, and subset generation with bitmasks.",
              "Two-Pointers technique: Pair sum in sorted arrays, 3Sum, container with most water.",
              "Sliding Window algorithms: Fixed-size maximums, longest substring without repeating characters."
            ]
          },
          {
            unit: "Unit II",
            title: "Number Theory, Modular Arithmetic & Binary Search",
            topics: [
              "Prime number algorithms: Sieve of Eratosthenes, prime factorization in O(sqrt(N)).",
              "Greatest Common Divisor (GCD) using Euclidean algorithm and Extended Euclidean algorithm.",
              "Modular arithmetic: Modular addition, multiplication, and modular inverse via Fermat's Little Theorem.",
              "Binary search on answers: Minimum capacity allocation, painter's partition, aggressive cows."
            ]
          },
          {
            unit: "Unit III",
            title: "Advanced Graphs, Disjoint Sets & Tries",
            topics: [
              "Disjoint Set Union (DSU) with union by rank and path compression optimizations.",
              "Kruskal's algorithm and Prim's algorithm for Minimum Spanning Trees in contest setups.",
              "Dijkstra's shortest path algorithm with priority queues and Bellman-Ford algorithm.",
              "Trie data structure: Prefix insertion, word search, and maximum XOR pair lookups."
            ]
          },
          {
            unit: "Unit IV",
            title: "Dynamic Programming, Combinatorics & Contest Strategy",
            topics: [
              "Dynamic programming on strings: Longest Common Subsequence (LCS) and Edit Distance.",
              "DP on grids: Unique paths, minimum path sum, and 0/1 knapsack contest variations.",
              "Combinatorics: Precomputing factorials and nCr modulo 10^9+7.",
              "Contest strategies: Problem triage, stress testing with randomized input generators, avoiding WA/TLE."
            ]
          }
        ],
        labWork: [
          "Solving 50+ curated LeetCode Medium/Hard challenges (Two Pointers, Sliding Window, Graphs).",
          "Solving 50+ curated CodeChef algorithmic problems across division contests.",
          "Participating in weekly live LeetCode/CodeChef online programming contests.",
          "Building automated test case generators and verifying solutions against brute-force scripts."
        ],
        resources: [
          { title: "Competitive Programmer's Handbook", author: "Antti Laaksonen", type: "Book" },
          { title: "LeetCode Top Interview 150 Problem Set", url: "https://leetcode.com/studyplan/top-interview-150/", type: "Platform" },
          { title: "CodeChef Practice & Live Contest Arena", url: "https://www.codechef.com/", type: "Platform" }
        ],
        outcomes: [
          "CO1: Optimize algorithms to execute within standard 1.0 second contest runtime bounds.",
          "CO2: Formulate bitmask and sliding window strategies to solve complex array and string challenges.",
          "CO3: Implement advanced Disjoint Set Union (DSU) and Trie structures without library dependencies.",
          "CO4: Compete effectively in timed competitive programming contests on global platforms."
        ],
        topics: [
          "Bit Manipulation & Fast I/O",
          "Two-Pointers & Sliding Window",
          "Number Theory, Sieves & Modular Inverse",
          "Disjoint Set Union & Trie Structures",
          "LeetCode & CodeChef Weekly Contests"
        ]
      },
      {
        id: "sem5-3",
        name: "Introduction to Prompt Engineering",
        code: "BCA 303",
        nature: "DSC",
        l: 0,
        t: 0,
        p: 8,
        credits: 4,
        category: "Prompt Engineering",
        iconName: "Wand2",
        description: "ChatGPT, Llama, Gemini, multimodal prompting, prompt optimization, prompt compression, and AI-powered application development.",
        objectives: [
          "Architect advanced prompts tailored across multiple frontier models (GPT-4, Llama 3, Gemini).",
          "Implement multimodal prompting across text, image inputs, structured data, and code.",
          "Build Retrieval-Augmented Generation (RAG) pipelines integrating vector databases.",
          "Audit prompts for security vulnerabilities including prompt injection and data exfiltration."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Multi-Model Prompt Engineering & Frontier LLMs",
            topics: [
              "Comparative architecture: OpenAI GPT-4, Meta Llama 3, Google Gemini, Anthropic Claude.",
              "System instruction engineering: Setting strict behavioral constraints, personas, and styles.",
              "Formatting constraints: Forcing deterministic JSON, Pydantic schemas, and structured tables.",
              "Managing context window budgets, token overheads, and response truncation."
            ]
          },
          {
            unit: "Unit II",
            title: "Multimodal Prompting & Advanced Reasoning",
            topics: [
              "Multimodal prompt architecture: Processing images, document scans, and diagrams with vision LLMs.",
              "Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), and Self-Consistency prompting techniques.",
              "ReAct (Reasoning + Acting) pattern: Equipping LLMs with external calculator and search tools.",
              "Role-playing, step-by-step verification, and few-shot calibration for ambiguous tasks."
            ]
          },
          {
            unit: "Unit III",
            title: "Retrieval-Augmented Generation (RAG) Architectures",
            topics: [
              "RAG framework: Mitigating LLM knowledge cutoffs and private domain hallucinations.",
              "Document ingestion: Chunking strategies (fixed-size, semantic), overlaps, and metadata tags.",
              "Vector embeddings and similarity search: Cosine similarity, ChromaDB, and Pinecone.",
              "Context assembly: Re-ranking retrieved chunks and synthesizing grounded prompt inputs."
            ]
          },
          {
            unit: "Unit IV",
            title: "Prompt Optimization, Compression & Security",
            topics: [
              "Prompt compression: Minimizing prompt tokens while preserving semantic intent.",
              "Security vulnerabilities: Direct/indirect prompt injection, jailbreaking, and system prompt leakage.",
              "Defensive engineering: Input validation guardrails, output content filters, and prompt shields.",
              "Automated prompt evaluation and regression testing using tools like Promptfoo."
            ]
          }
        ],
        labWork: [
          "Building a production document Q&A assistant using LangChain, ChromaDB, and OpenAI API.",
          "Implementing vision prompting scripts that extract structured JSON data from invoice images.",
          "Testing adversarial prompt injection attacks and building defensive input guardrails.",
          "Benchmarking prompt variants systematically using the Promptfoo automated evaluation suite."
        ],
        resources: [
          { title: "LangChain Framework Documentation", url: "https://python.langchain.com/", type: "Documentation" },
          { title: "LlamaIndex Data Framework for LLMs", url: "https://docs.llamaindex.ai/", type: "Documentation" },
          { title: "Promptfoo Automated LLM Evaluation Tool", url: "https://www.promptfoo.dev/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Design production-ready prompt pipelines tailored across GPT-4, Llama, and Gemini models.",
          "CO2: Construct multimodal applications combining text, vision, and tool execution.",
          "CO3: Implement end-to-end Retrieval-Augmented Generation (RAG) systems with vector databases.",
          "CO4: Secure prompt interfaces against adversarial injection and automate prompt benchmarking."
        ],
        topics: [
          "Multi-Model Prompt Engineering",
          "Multimodal Vision & Audio Prompts",
          "ReAct Agent Framework & Tool Calling",
          "Retrieval-Augmented Generation (RAG)",
          "Prompt Security & Automated Evals"
        ]
      },
      {
        id: "sem5-4",
        name: "Major Project / Internship",
        code: "PROJ 301",
        nature: "PROJ",
        l: 0,
        t: 0,
        p: 16,
        credits: 8,
        category: "Industry Project",
        iconName: "Rocket",
        description: "Apply technical knowledge through a practical major project or industry internship.",
        objectives: [
          "Synthesize academic computing skills to build a functional software prototype or complete an internship.",
          "Formulate Software Requirement Specifications (SRS) and architecture blueprints.",
          "Execute iterative sprint cycles utilizing modern full-stack frameworks and version control.",
          "Present interim prototypes and technical architecture before an evaluation panel."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Problem Identification & Feasibility Analysis",
            topics: [
              "Domain selection: HealthTech, EdTech, FinTech, E-Commerce, or Enterprise Automation.",
              "Literature survey and market competitor analysis to define problem statements.",
              "Authoring formal Software Requirements Specifications (SRS) and user personas.",
              "Technology stack evaluation (frontend, backend, database, deployment) and approval."
            ]
          },
          {
            unit: "Unit II",
            title: "Architectural & Database System Design",
            topics: [
              "System architecture modeling: Client-server, microservices, or serverless models.",
              "Database design: Entity-relationship schemas, normalization, or NoSQL document schemas.",
              "API contract specification using OpenAPI/Swagger standards.",
              "Establishing GitHub team repositories with branch protection and issue tracking."
            ]
          },
          {
            unit: "Unit III",
            title: "Iterative Sprint Development & CI Integration",
            topics: [
              "Sprint planning and milestone-based feature implementation.",
              "Writing clean, modular code with automated unit and integration tests.",
              "Containerizing development environments using Docker and Docker Compose.",
              "Setting up automated Continuous Integration (CI) test workflows on GitHub Actions."
            ]
          },
          {
            unit: "Unit IV",
            title: "Prototype Demonstration & Interim Defense",
            topics: [
              "Deploying functioning MVP prototypes to staging cloud environments.",
              "Drafting interim project documentation adhering to academic guidelines.",
              "Preparing slide decks highlighting problem, architecture, stack, and progress.",
              "Delivering an oral presentation and live system demonstration before the faculty committee."
            ]
          }
        ],
        labWork: [
          "16 hours per week of dedicated laboratory development under faculty/industry mentorship.",
          "Regular Git commit reviews, sprint standups, and codebase hygiene audits.",
          "Submitting interim project report, system architecture diagrams, and live demo."
        ],
        resources: [
          { title: "IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830)", type: "Standard" },
          { title: "GitHub Best Practices for Collaborative Software Teams", url: "https://docs.github.com/en/get-started", type: "Guide" }
        ],
        outcomes: [
          "CO1: Formulate comprehensive engineering specifications for complex real-world challenges.",
          "CO2: Architect modular full-stack software systems utilizing modern development toolchains.",
          "CO3: Collaborate effectively in teams using version control, issue tracking, and testing.",
          "CO4: Demonstrate working prototypes and defend architectural decisions before an evaluation panel."
        ],
        topics: [
          "Domain Problem Formulation & SRS",
          "Full-Stack Architecture & Schemas",
          "Sprint-Based Prototype Development",
          "Docker & CI/CD Pipeline Setup",
          "Interim Project Defense & Live Demo"
        ]
      }
    ]
  },
  {
    semester: 6,
    title: "Semester 6 – Data Science Pipelines, Civic Leadership & Capstone Defense",
    shortTitle: "Semester 6",
    subtitle: "Complete advanced Python data science workflows, demonstrate social leadership through NCC/NSS, and defend a comprehensive degree capstone project or industry internship.",
    categoryBadge: "Year 3 · Degree Capstone",
    l: 0,
    t: 0,
    p: 38,
    credits: 22,
    subjects: [
      {
        id: "sem6-1",
        name: "Python for Data Science & AI",
        code: "BCA 304",
        nature: "DSC",
        l: 0,
        t: 0,
        p: 10,
        credits: 5,
        category: "Data Science & AI",
        iconName: "BarChart3",
        description: "Python, data preprocessing, feature engineering, machine learning, predictive modeling, NLP, computer vision, and model evaluation.",
        objectives: [
          "Execute high-performance scientific data manipulation using NumPy and Pandas DataFrames.",
          "Build predictive machine learning pipelines using gradient boosting (XGBoost, LightGBM).",
          "Implement fundamental Natural Language Processing (NLP) and Computer Vision (CNN) networks.",
          "Deploy trained AI models as production-ready microservices using FastAPI."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Scientific Computing & Advanced Data Wrangling",
            topics: [
              "NumPy arrays: N-dimensional arrays, vectorization, broadcasting, and linear algebra operations.",
              "Pandas DataFrames: Multi-indexing, grouping, aggregation, pivoting, and melting.",
              "Time series analysis: Resampling, rolling windows, date-time parsing, and trend decomposition.",
              "Handling missing values and high-cardinality feature engineering in large datasets."
            ]
          },
          {
            unit: "Unit II",
            title: "Advanced Machine Learning Pipelines & Ensembles",
            topics: [
              "Scikit-Learn Pipeline architecture: Combining transformers, encoders, and estimators.",
              "Advanced ensemble methods: Gradient Boosting, XGBoost, and LightGBM implementations.",
              "Model evaluation across imbalanced datasets: Precision-Recall curves and SMOTE sampling.",
              "Hyperparameter optimization: Bayesian optimization and Optuna framework integration."
            ]
          },
          {
            unit: "Unit III",
            title: "Natural Language Processing & Computer Vision Foundations",
            topics: [
              "Text preprocessing: Tokenization, stemming, lemmatization, and TF-IDF representations.",
              "Word embeddings: Word2Vec, GloVe, and pre-trained Transformer embeddings.",
              "Computer Vision with OpenCV: Image transformations, filtering, thresholding, and contour detection.",
              "Convolutional Neural Networks (CNNs): Convolutions, pooling layers, and image classification."
            ]
          },
          {
            unit: "Unit IV",
            title: "Model Serialization, Deployment & API Microservices",
            topics: [
              "Model serialization formats: Pickle, Joblib, ONNX runtime standards.",
              "FastAPI framework: Asynchronous route endpoints, request validation with Pydantic.",
              "Serving machine learning predictions via REST endpoints with low latency.",
              "Dockerizing Python data science microservices and cloud deployment to Render/AWS."
            ]
          }
        ],
        labWork: [
          "Building an end-to-end predictive analytics pipeline on an imbalanced financial dataset with XGBoost.",
          "Developing an NLP text sentiment classification application using TF-IDF and Logistic Regression.",
          "Constructing an image classifier using Convolutional Neural Networks in PyTorch/Keras.",
          "Deploying a trained machine learning model as an interactive FastAPI web service with Swagger docs."
        ],
        resources: [
          { title: "Python for Data Analysis (3rd Edition)", author: "Wes McKinney", type: "Book" },
          { title: "FastAPI Official Documentation & Microservice Guide", url: "https://fastapi.tiangolo.com/", type: "Documentation" },
          { title: "PyTorch Official Tutorials & Deep Learning Guide", url: "https://pytorch.org/tutorials/", type: "Documentation" }
        ],
        outcomes: [
          "CO1: Manipulate and clean complex scientific datasets using NumPy and Pandas.",
          "CO2: Train and fine-tune gradient-boosted ensemble models for predictive intelligence.",
          "CO3: Construct NLP text classifiers and convolutional neural network vision models.",
          "CO4: Package and deploy machine learning models as production REST APIs using FastAPI."
        ],
        topics: [
          "NumPy Vectorization & Pandas Wrangling",
          "XGBoost & LightGBM Ensembles",
          "NLP Tokenization & TF-IDF Modeling",
          "Computer Vision & CNN Architectures",
          "FastAPI Microservice Deployment"
        ]
      },
      {
        id: "sem6-2",
        name: "NCC/NSS and Evaluation of Overall Extracurricular Activities",
        code: "GP 301",
        nature: "GP",
        l: 0,
        t: 0,
        p: 4,
        credits: 2,
        category: "Leadership & Community",
        iconName: "Flag",
        description: "NCC/NSS and Evaluation of Overall Extracurricular Activities – official course title and GP classification.",
        objectives: [
          "Cultivate disciplined personal character, ethical citizenship, and national pride through NCC/NSS.",
          "Participate actively in community outreach, digital empowerment, and social welfare programs.",
          "Develop team leadership, disaster preparedness, and emergency relief capabilities.",
          "Foster holistic personality development through co-curricular and campus leadership initiatives."
        ],
        units: [
          {
            unit: "Unit I",
            title: "NCC/NSS Orientation & Civic Responsibility",
            topics: [
              "Historical context, motto, and organizational structure of NCC and NSS in India.",
              "Constitutional values, fundamental duties of citizens, and ethical social responsibility.",
              "Community engagement principles: Empathy, participatory rural appraisal, and needs analysis.",
              "National integration, cultural harmony, and youth leadership in nation building."
            ]
          },
          {
            unit: "Unit II",
            title: "Community Outreach & Digital Inclusion",
            topics: [
              "Conducting digital literacy awareness drives for rural and underprivileged populations.",
              "Organizing campus environmental sustainability and cleanliness campaigns (Swachh Bharat).",
              "Participating in blood donation drives, health screening camps, and tree plantation initiatives.",
              "Promoting cyber awareness and safe online banking among village communities."
            ]
          },
          {
            unit: "Unit III",
            title: "Disaster Preparedness & Team Dynamics",
            topics: [
              "Disaster management protocols: Earthquake, flash flood, and fire emergency protocols.",
              "Field drill discipline, physical fitness routines, and outdoor survival skills.",
              "Team building, group dynamics, and conflict resolution under field conditions.",
              "First response communication during civic emergencies and relief coordination."
            ]
          },
          {
            unit: "Unit IV",
            title: "Holistic Extracurricular Contribution & Evaluation",
            topics: [
              "Participation in university technical hackathons, cultural festivals, and sports tournaments.",
              "Serving in student clubs, peer academic tutoring, and campus organizing committees.",
              "Documentation of social service hours, community impact metrics, and reflections.",
              "Comprehensive evaluation of personal conduct, integrity, and university engagement."
            ]
          }
        ],
        labWork: [
          "Participating in field camps, drill parades, and social service community drives.",
          "Organizing a rural digital literacy awareness workshop in neighboring communities.",
          "Submitting an official verified community service portfolio and extracurricular record."
        ],
        resources: [
          { title: "National Service Scheme (NSS) Manual", url: "https://nss.gov.in/", type: "Manual" },
          { title: "National Cadet Corps (NCC) Training Directives", url: "https://indiancc.nic.in/", type: "Manual" },
          { title: "Civic Engagement & Student Conduct Handbook", type: "Handbook" }
        ],
        outcomes: [
          "CO1: Exhibit self-discipline, civic duty, and ethical integrity in campus and social environments.",
          "CO2: Organize and execute digital literacy and community welfare initiatives.",
          "CO3: Apply disaster response procedures and demonstrate team collaboration under field conditions.",
          "CO4: Synthesize a verified portfolio demonstrating holistic personal development and extracurricular leadership."
        ],
        topics: [
          "Civic Responsibility & National Ethos",
          "Community Outreach & Digital Inclusion",
          "Disaster Response & Team Field Drills",
          "Extracurricular Leadership & Sports",
          "Social Impact Portfolio & Evaluation"
        ]
      },
      {
        id: "sem6-3",
        name: "Major Project / Internship",
        code: "PROJ 302",
        nature: "PROJ",
        l: 0,
        t: 0,
        p: 24,
        credits: 15,
        category: "Degree Capstone",
        iconName: "GraduationCap",
        description: "Full-scale final degree capstone project or industry corporate internship.",
        objectives: [
          "Engineer a production-grade software application or complete a full-time corporate internship.",
          "Implement end-to-end systems with automated testing, containerization, and cloud deployment.",
          "Author a formal degree dissertation documenting software methodology and research contributions.",
          "Defend the final capstone project before an academic evaluation committee and industry experts."
        ],
        units: [
          {
            unit: "Unit I",
            title: "Production Architecture & Project Planning",
            topics: [
              "Refining system scope, software requirements specifications (SRS), and compliance targets.",
              "Architecting scalable multi-tier infrastructure (client, API microservices, distributed database).",
              "Establishing enterprise DevOps pipelines: Automated testing, linting, and build steps.",
              "Defining security boundaries: SSL/TLS encryption, JWT/OAuth2 flows, and data protection."
            ]
          },
          {
            unit: "Unit II",
            title: "Full-Stack Implementation & System Integration",
            topics: [
              "End-to-end full-stack coding across all planned functional user stories.",
              "Integrating third-party APIs (payment gateways, cloud messaging, AI models).",
              "Implementing performance optimizations: Database query caching, index tuning, lazy loading.",
              "Conducting rigorous unit, integration, and security penetration testing."
            ]
          },
          {
            unit: "Unit III",
            title: "Production Cloud Deployment & Observability",
            topics: [
              "Deploying containerized multi-service architectures to production cloud platforms (AWS/GCP).",
              "Configuring continuous deployment (CD) triggers and zero-downtime rolling updates.",
              "Setting up real-time observability: Centralized logging, metrics dashboards, and uptime alerts.",
              "Conducting user acceptance testing (UAT) and gathering empirical performance feedback."
            ]
          },
          {
            unit: "Unit IV",
            title: "Dissertation Authoring & Final Degree Defense",
            topics: [
              "Authoring a formal academic dissertation following university and IEEE formatting standards.",
              "Documenting system architecture, database schemas, test cases, and empirical results.",
              "Preparing professional technical presentations and live demonstration workflows.",
              "Final viva voce defense before faculty examiners and external industry adjudicators."
            ]
          }
        ],
        labWork: [
          "24 hours per week of dedicated capstone development or full-time corporate internship engagement.",
          "Weekly code reviews, pull request audits, and progress monitoring with academic mentors.",
          "Comprehensive degree capstone dissertation submission and public system defense."
        ],
        resources: [
          { title: "IEEE Standards for Software Engineering & Dissertation Writing", type: "Standard" },
          { title: "Open Source Best Practices for Production Software", url: "https://opensource.guide/", type: "Guide" },
          { title: "BCA Degree Capstone Dissertation Manual", type: "Manual" }
        ],
        outcomes: [
          "CO1: Engineer a scalable, production-grade software application solving significant real-world problems.",
          "CO2: Deploy containerized software to cloud infrastructure with automated CI/CD and observability.",
          "CO3: Author a formal academic thesis documenting system architecture and empirical benchmarks.",
          "CO4: Defend technical architectural decisions and demonstrate working software before an examination panel."
        ],
        topics: [
          "Production Cloud System Architecture",
          "Full-Stack Enterprise Implementation",
          "Automated Testing & Security Auditing",
          "Production Deployment & Observability",
          "Capstone Dissertation & Degree Defense"
        ]
      }
    ]
  }
];

export const allSubjects = semestersList.flatMap((sem) =>
  sem.subjects.map((sub) => ({ ...sub, semester: sem.semester }))
);
