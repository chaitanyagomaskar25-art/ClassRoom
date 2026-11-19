/**
 * Career Guidance, Interview Preparation & Placement Service
 * Provides career suitability algorithms, mock interview evaluation,
 * and company placement tracks aligned with BCA curriculum.
 */

export const CAREER_PATHS = [
  {
    id: 'full_stack',
    title: 'Full-Stack Software Engineer',
    category: 'Software Development',
    description: 'Design and build end-to-end scalable web applications, responsive user interfaces, and robust backend REST/GraphQL microservices.',
    averageSalary: '₹6.5 - 12.0 LPA (Fresher)',
    targetRoles: ['Full-Stack Developer', 'Software Engineer', 'React & Node Developer'],
    coreSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git', 'REST APIs', 'Tailwind CSS'],
    recommendedSubjects: [
      { code: '0610311013', name: 'Relational Database Management Systems' },
      { code: '0610311022', name: 'Object-Oriented Programming with Java' },
      { code: '0610311031', name: 'Web Technologies & Frameworks' }
    ],
    interviewFocus: ['Frontend state management', 'Backend API architecture', 'Database indexing & transactions', 'Full-stack authentication']
  },
  {
    id: 'backend_cloud',
    title: 'Backend & Cloud Systems Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Architect distributed systems, high-performance database engines, serverless microservices, and containerized cloud workloads.',
    averageSalary: '₹7.0 - 13.5 LPA (Fresher)',
    targetRoles: ['Backend Developer', 'Cloud Engineer', 'DevOps Associate', 'API Platform Engineer'],
    coreSkills: ['Node.js', 'Java', 'Python', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'AWS/GCP', 'Linux', 'Microservices'],
    recommendedSubjects: [
      { code: '0610311021', name: 'Operating Systems' },
      { code: '0610311012', name: 'Data Structures & Algorithms' },
      { code: '0610311023', name: 'Computer Networks' }
    ],
    interviewFocus: ['System design & scalability', 'Concurrency & threading', 'Caching strategies', 'CAP theorem & database partitioning']
  },
  {
    id: 'data_analyst',
    title: 'Data Analyst & Business Intelligence Specialist',
    category: 'Data Science',
    description: 'Extract statistical insights from massive datasets, build automated analytics pipelines, and design executive KPI dashboards.',
    averageSalary: '₹5.5 - 10.5 LPA (Fresher)',
    targetRoles: ['Data Analyst', 'BI Developer', 'Analytics Consultant', 'Junior Data Scientist'],
    coreSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'Data Visualization', 'ETL'],
    recommendedSubjects: [
      { code: '0610311013', name: 'Relational Database Management Systems' },
      { code: '0610311014', name: 'Discrete Mathematics' },
      { code: '0610311032', name: 'Applied Statistics & Data Science Foundations' }
    ],
    interviewFocus: ['Complex SQL joins & window functions', 'Data cleaning pipelines', 'Hypothesis testing', 'Business metrics interpretation']
  },
  {
    id: 'ai_ml',
    title: 'Artificial Intelligence & ML Engineer',
    category: 'Artificial Intelligence',
    description: 'Develop intelligent algorithms, train neural network models, and deploy GenAI / LLM-powered applications into production environments.',
    averageSalary: '₹8.0 - 15.0 LPA (Fresher)',
    targetRoles: ['AI Engineer', 'Machine Learning Associate', 'Prompt Engineer', 'Applied AI Developer'],
    coreSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Linear Algebra', 'Transformers', 'LangChain', 'NLP', 'Computer Vision'],
    recommendedSubjects: [
      { code: '0610311012', name: 'Data Structures & Algorithms' },
      { code: '0610311033', name: 'Machine Learning Foundations' },
      { code: '0610311034', name: 'Generative AI & Natural Language Processing' }
    ],
    interviewFocus: ['Model evaluation metrics', 'Overfitting prevention', 'Vector embeddings & RAG architecture', 'Optimization algorithms']
  },
  {
    id: 'frontend_ui',
    title: 'Frontend & UI/UX Engineer',
    category: 'Frontend Engineering',
    description: 'Create pixel-perfect, accessible, and blazing-fast user experiences with modern reactive frameworks, animations, and responsive layouts.',
    averageSalary: '₹5.5 - 10.0 LPA (Fresher)',
    targetRoles: ['Frontend Developer', 'UI Engineer', 'React Developer', 'Web Performance Engineer'],
    coreSkills: ['HTML5', 'CSS3/SCSS', 'JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'Redux', 'Tailwind CSS', 'Web Vitals'],
    recommendedSubjects: [
      { code: '0610311011', name: 'Foundations of IT' },
      { code: '0610311031', name: 'Web Technologies & Frameworks' }
    ],
    interviewFocus: ['Virtual DOM & rendering cycle', 'CSS Grid & Flexbox mastery', 'Web performance optimization', 'Accessibility (WCAG)']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Information Security Analyst',
    category: 'Security',
    description: 'Protect organizational digital assets, conduct vulnerability assessments, harden computer networks, and ensure cryptographic compliance.',
    averageSalary: '₹6.0 - 11.5 LPA (Fresher)',
    targetRoles: ['Security Analyst', 'SOC Analyst', 'Penetration Tester', 'Network Security Associate'],
    coreSkills: ['Network Protocols (TCP/IP)', 'Linux Security', 'Cryptography', 'Wireshark', 'Metasploit', 'OWASP Top 10', 'Firewalls', 'SIEM'],
    recommendedSubjects: [
      { code: '0610311023', name: 'Computer Networks' },
      { code: '0610311021', name: 'Operating Systems' }
    ],
    interviewFocus: ['OWASP Top 10 vulnerabilities', 'Public Key Infrastructure (PKI)', 'Network packet analysis', 'Incident response protocols']
  }
];

/**
 * Technical & HR Interview Question Bank
 */
export const INTERVIEW_QUESTIONS = [
  {
    id: 'int-1',
    category: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    question: 'How do you detect and remove a cycle in a singly linked list? Explain Floyd’s Cycle-Finding Algorithm.',
    keyPoints: [
      'Initialize two pointers: slow pointer (advances 1 step) and fast pointer (advances 2 steps).',
      'If fast pointer reaches null, there is no loop.',
      'If slow and fast pointers meet at node k, a loop exists.',
      'To find loop start: reset slow to head, advance both 1 step at a time until they meet.',
      'Time complexity is O(N) and auxiliary space complexity is O(1).'
    ],
    sampleAnswer: 'Floyd\'s Cycle-Finding algorithm (the Tortoise and the Hare algorithm) uses two pointers moving at different speeds. The slow pointer moves one step at a time, while the fast pointer moves two steps. If the linked list contains a cycle, the fast pointer will eventually catch up to and meet the slow pointer within the loop. Once a cycle is detected, we can find the start of the loop by resetting the slow pointer to the head and advancing both pointers one step at a time until they meet again at the loop origin.',
    commonMistakes: 'Forgetting to check for fast.next before accessing fast.next.next, which causes NullPointerExceptions.'
  },
  {
    id: 'int-2',
    category: 'DBMS & SQL',
    difficulty: 'Medium',
    question: 'Explain ACID properties in relational databases and describe how isolation levels prevent concurrency anomalies.',
    keyPoints: [
      'Atomicity: All operations in a transaction succeed, or none take effect.',
      'Consistency: Transactions transition the database from one valid state to another.',
      'Isolation: Concurrent execution yields results equivalent to serial execution.',
      'Durability: Committed data persists even across system failures.',
      'Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.'
    ],
    sampleAnswer: 'ACID guarantees database reliability. Atomicity ensures all-or-nothing execution via rollback logs. Consistency enforces schema constraints, foreign keys, and business rules. Isolation keeps concurrent transactions from interfering using row-level locks or Multi-Version Concurrency Control (MVCC) to prevent dirty reads, non-repeatable reads, and phantom reads. Durability writes committed transactions to write-ahead logs (WAL) so committed updates survive hardware crashes.',
    commonMistakes: 'Confusing Consistency (database constraints) with CAP theorem consistency (all replicas return the latest data).'
  },
  {
    id: 'int-3',
    category: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the fundamental difference between a Process and a Thread? How do they share system resources?',
    keyPoints: [
      'A process is an executing program instance with independent address space, file descriptors, and memory.',
      'A thread is a lightweight execution unit within a process, sharing code, data, and heap.',
      'Threads have their own registers, program counter (PC), and stack.',
      'Context switching between threads is faster than process context switching.',
      'Inter-thread communication is faster than IPC because threads share the same virtual memory.'
    ],
    sampleAnswer: 'A process represents an independent executing program allocated its own isolated address space, PCB (Process Control Block), file handles, and memory map. A thread is an execution unit inside a process; multiple threads of the same process share code, global variables, heap, and open files, but maintain private stacks, registers, and program counters. Thread context switching is significantly faster because the OS does not need to invalidate CPU cache tables or switch virtual address spaces.',
    commonMistakes: 'Assuming threads have independent heaps, or failing to mention thread safety issues like race conditions.'
  },
  {
    id: 'int-4',
    category: 'Web Technologies',
    difficulty: 'Medium',
    question: 'Explain how Node.js achieves high concurrency despite being single-threaded. What is the Event Loop?',
    keyPoints: [
      'Node.js runs JavaScript on a single main thread using the V8 engine.',
      'I/O operations (file system, network sockets, DNS) are delegated to libuv worker thread pool.',
      'Event loop phases: Timers (setTimeout), Pending Callbacks, Poll (I/O), Check (setImmediate), Close Callbacks.',
      'Microtasks (process.nextTick and Promise callbacks) execute immediately after each phase.'
    ],
    sampleAnswer: 'Node.js utilizes an event-driven, non-blocking I/O model implemented by libuv. The JavaScript code executes on a single main thread, avoiding thread creation overhead and race conditions. When an asynchronous operation (like a database query or network request) is initiated, it is delegated to the operating system kernel or libuv\'s background worker pool. When the operation finishes, its callback is queued in the event loop and processed when the call stack clears.',
    commonMistakes: 'Claiming Node.js has no threads at all (libuv maintains an internal thread pool for expensive I/O and crypto).'
  },
  {
    id: 'int-5',
    category: 'HR & Behavioral',
    difficulty: 'Easy',
    question: 'Tell me about a challenging project or technical obstacle you encountered and how you resolved it using the STAR technique.',
    keyPoints: [
      'Situation: Set the context, project goal, and constraints.',
      'Task: Clearly identify your specific responsibility or problem.',
      'Action: Detail the proactive, technical, or collaborative steps you took.',
      'Result: Share the quantifiable, positive outcome and what you learned.'
    ],
    sampleAnswer: 'Situation: During our semester database lab project, our team built an e-learning analytics portal, but query response times exceeded 4 seconds when querying large attendance tables. Task: As backend lead, my responsibility was resolving this performance bottleneck before the evaluation deadline. Action: I used EXPLAIN ANALYZE in PostgreSQL to inspect query execution plans, identified full table scans, added composite B-Tree indexes on studentId and createdAt, and cached repeated lookups in Redis. Result: Query latency dropped by 92% to under 300ms, and our project earned an A+ grade from our faculty evaluator.',
    commonMistakes: 'Focusing on "we" instead of "I", omitting specific technical steps, or not sharing measurable results.'
  }
];

/**
 * Company Placement Packs
 */
export const COMPANY_PACKS = [
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    tag: 'TCS NQT / Digital / Prime',
    rounds: ['NQT Cognitive Aptitude (Numerical, Reasoning, Verbal)', 'Advanced Coding (1 Easy + 1 Medium)', 'Technical & Managerial Interview', 'HR Interview'],
    topics: ['Numbers & Divisibility', 'Permutations & Probability', 'Arrays & Strings Manipulations', 'OOP Concepts in Java/C++', 'SQL Joins & Group By'],
    typicalQuestions: [
      'Find the second largest element in an array without sorting.',
      'Explain the difference between final, finally, and finalize in Java.',
      'Write a query to find the second highest salary from an Employee table.'
    ],
    preparationTip: 'Focus heavily on TCS NQT aptitude speed and write clean syntax-error-free code in the hands-on compiler.'
  },
  {
    id: 'infosys',
    name: 'Infosys',
    tag: 'Specialist Programmer (SP) / DSE',
    rounds: ['Reasoning & Mathematical Ability', 'Technical Pseudocode & Data Structures', 'Hands-on Coding (DSA)', 'Technical + HR Interview'],
    topics: ['Bit Manipulation & Recursion', 'Dynamic Programming Basics', 'Graph Traversals (BFS/DFS)', 'Database Normalization', 'Software Engineering Lifecycles'],
    typicalQuestions: [
      'Given an array of integers, find the maximum sum contiguous subarray (Kadane\'s Algorithm).',
      'What are the advantages of B+ Trees over Binary Search Trees in database storage engines?',
      'Explain the Singleton design pattern and implement it thread-safely.'
    ],
    preparationTip: 'Infosys heavily tests pseudocode output tracing and algorithmic efficiency. Practice debugging nested loops.'
  },
  {
    id: 'wipro',
    name: 'Wipro',
    tag: 'Elite National Talent Hunt (NTH)',
    rounds: ['Aptitude & Logical Reasoning', 'Written Communication (Business Essay)', 'Online Programming Test', 'Combined Technical & HR Round'],
    topics: ['Time, Speed & Distance', 'Syllogisms & Analytical Puzzles', 'String Reversal & Anagrams', 'Pointer Arithmetic in C/C++', 'Web & OS Fundamentals'],
    typicalQuestions: [
      'Check if a string is a valid palindrome ignoring punctuation and case.',
      'Explain paging and segmentation in virtual memory management.',
      'What are primary keys, candidate keys, and foreign keys in relational modeling?'
    ],
    preparationTip: 'Do not neglect the written essay round: grammatical correctness, structured paragraphs, and concise logic matter.'
  },
  {
    id: 'tier1_tech',
    name: 'Tier-1 Tech & Product Companies',
    tag: 'Product Engineering / FAANG',
    rounds: ['Online Coding Screening (LeetCode Medium/Hard)', 'Core DSA Round 1 (Trees/Graphs/DP)', 'Core DSA Round 2 (System Design / Concurrency)', 'Hiring Manager & Culture Fit'],
    topics: ['Binary Trees & AVL / Red-Black Trees', 'Dijkstra & Minimum Spanning Tree', 'Dynamic Programming (Knapsack, LCS)', 'Microservices Architecture', 'High-Level & Low-Level Design (LLD)'],
    typicalQuestions: [
      'Design a scalable URL shortener like Bitly handling 100M daily active requests.',
      'Serialize and deserialize a Binary Tree into a string representation.',
      'Implement an LRU Cache with O(1) get and put time complexity.'
    ],
    preparationTip: 'Master time and space complexity tradeoffs, write production-quality modular code, and articulate your reasoning out loud.'
  }
];

/**
 * Placement Preparation Roadmaps
 */
export const PLACEMENT_ROADMAPS = [
  {
    id: 'roadmap_30',
    title: '30-Day Sprint Placement Roadmap',
    duration: '30 Days',
    idealFor: 'Immediate placement drives & upcoming campus pooled interviews',
    weeks: [
      { week: 1, focus: 'Aptitude & Quantitative Foundations', goals: ['Master Percentages, Ratio, Work & Time, Number Systems', 'Solve 150 aptitude problems', 'Take 2 timed aptitude mock tests'] },
      { week: 2, focus: 'Core Data Structures in Java/C++', goals: ['Arrays, Strings, Two Pointers, Sliding Window', 'Linked Lists, Stacks, Queues', 'Solve 30 LeetCode Easy/Medium problems'] },
      { week: 3, focus: 'CS Core: DBMS & Operating Systems', goals: ['SQL Queries, Normalization, Joins, Indexing', 'Processes, Threads, CPU Scheduling, Deadlocks', 'Review top 50 technical interview questions'] },
      { week: 4, focus: 'Project Revision & HR Preparation', goals: ['Prepare STAR technique stories for your capstone project', 'Practice mock technical interviews with peers/mentors', 'Company-specific NQT/Aptitude papers review'] }
    ]
  },
  {
    id: 'roadmap_60',
    title: '60-Day Comprehensive Industry Roadmap',
    duration: '60 Days',
    idealFor: 'Service & Product engineering campus recruitment campaigns',
    weeks: [
      { week: 1, focus: 'Mathematical & Logical Reasoning Foundations', goals: ['Complete Quantitative Aptitude bank', 'Puzzles, Seating Arrangements, Syllogisms', 'Logical deduction drills'] },
      { week: 2, focus: 'Linear Data Structures Mastery', goals: ['Advanced Array manipulation & matrix traversal', 'Doubly Linked Lists & Circular Queues', 'Stack applications (Monotonic Stack)'] },
      { week: 3, focus: 'Non-Linear Data Structures: Trees & Heaps', goals: ['Binary Search Trees, Tree traversals (Inorder, Preorder, Postorder)', 'Heap Sort & Priority Queues', 'Binary Tree LCA & Diameter'] },
      { week: 4, focus: 'Graphs & Recursion Backtracking', goals: ['Graph representation: Adjacency List & Matrix', 'BFS and DFS implementations', 'Cycle detection in directed & undirected graphs'] },
      { week: 5, focus: 'Database Architecture & Web Services', goals: ['Relational DBMS deep dive with PostgreSQL', 'RESTful API creation with Express & Node', 'JWT Auth & Middleware security'] },
      { week: 6, focus: 'Computer Networks & Operating Systems', goals: ['TCP/IP vs OSI model, DNS, HTTP/HTTPS, WebSockets', 'Virtual memory, Paging, Page replacement algorithms (LRU)', 'Linux CLI & Bash scripting'] },
      { week: 7, focus: 'Portfolio & Project Polish', goals: ['Deploy full-stack project live on web', 'Add clean README.md, architecture diagram, and GitHub commits', 'Record a 2-minute demo video'] },
      { week: 8, focus: 'Mock Interviews & Company Packs', goals: ['Take 3 comprehensive technical mock sessions', 'Review TCS, Infosys, and Wipro question packs', 'Final resume audit & behavioral questions preparation'] }
    ]
  }
];

/**
 * Career Suitability Algorithm
 * Evaluates student profile, skills, quiz scores and projects to compute career alignment
 */
export function evaluateCareerSuitability({
  skills = [],
  interests = [],
  careerGoals = '',
  completedLessons = [],
  quizAttempts = [],
  projects = []
}) {
  const skillsSet = new Set(skills.map((s) => s.toLowerCase().trim()));
  const interestsText = `${interests.join(' ')} ${careerGoals}`.toLowerCase();

  return CAREER_PATHS.map((path) => {
    let score = 40; // baseline foundation

    // 1. Skill overlap check
    const matchedSkills = [];
    const missingSkills = [];

    path.coreSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      if (skillsSet.has(sLower) || skills.some((userSkill) => userSkill.toLowerCase().includes(sLower))) {
        matchedSkills.push(skill);
        score += 5;
      } else {
        missingSkills.push(skill);
      }
    });

    // 2. Interests & goals alignment
    if (interestsText.includes(path.id) || interestsText.includes(path.title.toLowerCase()) || interestsText.includes(path.category.toLowerCase())) {
      score += 12;
    }

    // 3. Subject & Quiz Performance Alignment
    const relatedCodes = path.recommendedSubjects.map((s) => s.code);
    const relatedAttempts = quizAttempts.filter((a) => relatedCodes.includes(a.subjectCode));

    if (relatedAttempts.length > 0) {
      const avg = Math.round(relatedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / relatedAttempts.length);
      if (avg >= 80) score += 10;
      else if (avg >= 70) score += 6;
      else if (avg < 50) score -= 5;
    }

    // 4. Project Alignment
    const matchingProjects = projects.filter((p) => {
      return (
        p.category?.toLowerCase().includes(path.category.toLowerCase()) ||
        (p.techStack || []).some((tech) => path.coreSkills.map((c) => c.toLowerCase()).includes(tech.toLowerCase()))
      );
    });

    if (matchingProjects.length > 0) {
      score += Math.min(15, matchingProjects.length * 8);
    }

    const matchPercent = Math.min(98, Math.max(35, score));

    return {
      ...path,
      matchPercent,
      suitabilityLevel: matchPercent >= 80 ? 'High Match' : matchPercent >= 65 ? 'Moderate Match' : 'Developing Match',
      matchedSkills,
      missingSkills,
      matchingProjectsCount: matchingProjects.length
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);
}
