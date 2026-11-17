/**
 * BCA Hons. with Research Curriculum
 * Eternal University Syllabus (Semesters 1 - 6)
 */

export const universityInfo = {
  institution: "Eternal University",
  program: "Bachelor of Computer Applications (BCA Hons. with Research)",
  totalSemesters: 6,
  totalSubjects: 29,
};

export const semesterColors = {
  1: {
    name: "indigo",
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    light: "#eef2ff",
    border: "#c7d2fe",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
    pillBg: "rgba(99, 102, 241, 0.1)",
  },
  2: {
    name: "sky",
    primary: "#0284c7",
    primaryDark: "#0369a1",
    light: "#f0f9ff",
    border: "#bae6fd",
    gradient: "linear-gradient(135deg, #0284c7 0%, #075985 100%)",
    pillBg: "rgba(2, 132, 199, 0.1)",
  },
  3: {
    name: "emerald",
    primary: "#059669",
    primaryDark: "#047857",
    light: "#ecfdf5",
    border: "#a7f3d0",
    gradient: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
    pillBg: "rgba(5, 150, 105, 0.1)",
  },
  4: {
    name: "amber",
    primary: "#d97706",
    primaryDark: "#b45309",
    light: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg, #d97706 0%, #92400e 100%)",
    pillBg: "rgba(217, 119, 6, 0.1)",
  },
  5: {
    name: "purple",
    primary: "#8b5cf6",
    primaryDark: "#7c3aed",
    light: "#f5f3ff",
    border: "#ddd6fe",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    pillBg: "rgba(139, 92, 246, 0.1)",
  },
  6: {
    name: "rose",
    primary: "#e11d48",
    primaryDark: "#be123c",
    light: "#fff1f2",
    border: "#fecdd3",
    gradient: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
    pillBg: "rgba(225, 29, 72, 0.1)",
  },
};

export const semestersList = [
  {
    semester: 1,
    title: "Semester 1 – Computing Foundations",
    shortTitle: "Semester 1",
    subtitle: "Develop computer fundamentals, programming logic, foundational mathematics, and essential life skills.",
    categoryBadge: "Year 1 · Core Foundations",
    subjects: [
      {
        id: "sem1-1",
        name: "Foundations of IT",
        code: "0610311011",
        description: "Learn computer fundamentals, hardware, software, number systems, logic gates, and networking basics.",
        category: "Hardware & Networking",
        iconName: "Cpu",
        topics: [
          "Computer Architecture & Hardware",
          "System & Application Software",
          "Binary, Hex & Number Systems",
          "Logic Gates & Boolean Algebra",
          "Networking Essentials & Topologies"
        ]
      },
      {
        id: "sem1-2",
        name: "Mathematics for Computer Science",
        code: "0610311020",
        description: "Understand mathematical concepts and problem-solving techniques used in computer science.",
        category: "Mathematics",
        iconName: "Calculator",
        topics: [
          "Set Theory & Propositional Logic",
          "Matrices, Determinants & Vectors",
          "Relations and Functions",
          "Discrete Probability Basics",
          "Algorithmic Thinking & Proofs"
        ]
      },
      {
        id: "sem1-3",
        name: "Database Management System",
        code: "0610311031",
        description: "Learn database concepts, SQL queries, relational models, joins, and database management.",
        category: "Databases",
        iconName: "Database",
        topics: [
          "Relational Model & Schemas",
          "SQL DDL & DML Commands",
          "Complex Joins & Subqueries",
          "Entity-Relationship (ER) Modeling",
          "Normalization (1NF, 2NF, 3NF)"
        ]
      },
      {
        id: "sem1-4",
        name: "Problem Solving and Programming Fundamentals 1",
        code: "0610312011",
        description: "Develop programming logic using algorithms, flowcharts, pseudocode, loops, functions, and arrays.",
        category: "Core Programming",
        iconName: "Terminal",
        topics: [
          "Algorithms & Flowchart Design",
          "Pseudocode & Logic Building",
          "Control Structures & Loops",
          "Modular Functions & Scope",
          "Array Manipulation & Linear Search"
        ]
      },
      {
        id: "sem1-5",
        name: "Environmental Studies for Technology",
        code: "0610315010",
        description: "Explore environmental awareness, sustainability, and the relationship between technology and the environment.",
        category: "Ecology & Sustainability",
        iconName: "Leaf",
        topics: [
          "Ecosystems & Biodiversity",
          "E-Waste Management & Recycling",
          "Green Computing & Energy Efficiency",
          "Sustainable IT Practices",
          "Environmental Policies & Ethics"
        ]
      },
      {
        id: "sem1-6",
        name: "New Age Life Skills 1",
        code: "0610316011",
        description: "Develop essential communication, personal development, and practical life skills.",
        category: "Life & Soft Skills",
        iconName: "Sparkles",
        topics: [
          "Active Listening & Articulation",
          "Interpersonal Communication",
          "Time Management & Goal Setting",
          "Emotional Intelligence Basics",
          "Professional Etiquette"
        ]
      }
    ]
  },
  {
    semester: 2,
    title: "Semester 2 – Programming and Web Development",
    shortTitle: "Semester 2",
    subtitle: "Explore advanced programming algorithms, Agile development, HTML/CSS web design, and generative AI.",
    categoryBadge: "Year 1 · Web & Algorithms",
    subjects: [
      {
        id: "sem2-1",
        name: "Problem Solving and Programming Fundamentals 2",
        code: "0610321041",
        description: "Explore advanced programming concepts, recursion, data structures, algorithms, and complexity analysis.",
        category: "Advanced Programming",
        iconName: "FileCode",
        topics: [
          "Pointers & Dynamic Memory Allocation",
          "Recursion & Divide and Conquer",
          "Structures and Unions",
          "File Handling and Streams",
          "Time & Space Complexity Basics (Big-O)"
        ]
      },
      {
        id: "sem2-2",
        name: "Agile Software Development Life Cycle",
        code: "0610321050",
        description: "Understand Agile methodologies, software development processes, teamwork, and project management.",
        category: "Software Engineering",
        iconName: "Workflow",
        topics: [
          "Agile vs. Waterfall Methodologies",
          "Scrum Framework & Sprints",
          "User Stories & Backlog Grooming",
          "Daily Standups & Retrospectives",
          "Version Control & Collaborative Git"
        ]
      },
      {
        id: "sem2-3",
        name: "Web Development Frontend 1- HTML-CSS",
        code: "0610321061",
        description: "Learn to create responsive web pages using HTML, CSS, layouts, and frontend design fundamentals.",
        category: "Frontend Web",
        iconName: "Layout",
        topics: [
          "Semantic HTML5 Markup",
          "CSS3 Styling & Box Model",
          "Flexbox & CSS Grid Layouts",
          "Responsive Media Queries",
          "Modern Typography & UI Design"
        ]
      },
      {
        id: "sem2-4",
        name: "New Age Life Skills 2",
        code: "0610326021",
        description: "Improve communication, professional awareness, digital skills, and personal development.",
        category: "Life & Soft Skills",
        iconName: "Award",
        topics: [
          "Public Speaking & Presentation Skills",
          "Digital Collaboration Tools",
          "Constructive Feedback & Team Dynamics",
          "Stress Management & Focus",
          "Professional Resume Building"
        ]
      },
      {
        id: "sem2-5",
        name: "Introduction to Generative AI",
        code: "0610324010",
        description: "Explore generative AI concepts, AI tools, applications, and their use in solving real-world problems.",
        category: "Artificial Intelligence",
        iconName: "Bot",
        topics: [
          "Foundations of Generative Models",
          "Text, Image & Audio AI Generation",
          "AI Productivity & Coding Tools",
          "Prompting Essentials & Iteration",
          "Ethical & Responsible AI Usage"
        ]
      }
    ]
  },
  {
    semester: 3,
    title: "Semester 3 – Advanced Web Development and Core Computing",
    shortTitle: "Semester 3",
    subtitle: "Build modern React interfaces, master Linux operating systems, networks, and advanced data structures.",
    categoryBadge: "Year 2 · React & Core Systems",
    subjects: [
      {
        id: "sem3-1",
        name: "Web Development Frontend 2 -JS React",
        code: "0610332021",
        description: "Learn JavaScript and React to build interactive, dynamic, and component-based web applications.",
        category: "Frontend Web",
        iconName: "Atom",
        topics: [
          "Modern JavaScript (ES6+, Promises, Async/Await)",
          "React Component Lifecycle & JSX",
          "State Management with Hooks (useState, useEffect)",
          "Props, Events & Controlled Forms",
          "Client-Side Routing & SPA Architecture"
        ]
      },
      {
        id: "sem3-2",
        name: "Operating System Fundamentals",
        code: "0610331071",
        description: "Understand operating system concepts, Linux commands, processes, memory management, and file systems.",
        category: "Systems & Linux",
        iconName: "Terminal",
        topics: [
          "Process Scheduling & Multithreading",
          "Concurrency, Mutexes & Deadlocks",
          "Virtual Memory & Paging",
          "File System Implementations",
          "Linux Shell Commands & Bash Scripting"
        ]
      },
      {
        id: "sem3-3",
        name: "Computer Network",
        code: "0610331080",
        description: "Explore networking fundamentals, network layers, IP addressing, protocols, routers, and internet communication.",
        category: "Networking",
        iconName: "Network",
        topics: [
          "OSI 7-Layer & TCP/IP Reference Models",
          "IPv4 & IPv6 Subnetting and Addressing",
          "Routing Protocols & Packet Switching",
          "TCP vs. UDP Transport Protocols",
          "DNS, HTTP/HTTPS, SSL/TLS, and Sockets"
        ]
      },
      {
        id: "sem3-4",
        name: "Data Structures and Algorithms (Problem Solving 3)",
        code: "0610332031",
        description: "Learn advanced data structures, trees, graphs, hashing, searching, sorting, and algorithm optimization.",
        category: "Data Structures & Algos",
        iconName: "GitBranch",
        topics: [
          "Stacks, Queues & Priority Queues",
          "Binary Search Trees & AVL Trees",
          "Graph Traversals (BFS, DFS, Dijkstra)",
          "Hash Tables & Collision Resolution",
          "Dynamic Programming & Greedy Algorithms"
        ]
      },
      {
        id: "sem3-5",
        name: "New Age Life Skills 3",
        code: "0610335021",
        description: "Strengthen advanced communication, listening, presentation, interpersonal, and professional skills.",
        category: "Life & Soft Skills",
        iconName: "MessageSquareQuote",
        topics: [
          "Technical Storytelling & Demos",
          "Conflict Resolution & Negotiation",
          "Cross-Functional Team Collaboration",
          "Effective Technical Documentation",
          "Executive Presence & Body Language"
        ]
      },
      {
        id: "sem3-6",
        name: "Introduction to ChatGPT",
        code: "0610334020",
        description: "Learn prompt engineering, AI-assisted development, prompt patterns, and practical applications of ChatGPT.",
        category: "Applied AI",
        iconName: "Bot",
        topics: [
          "LLM Capabilities and Context Windows",
          "Few-Shot & Zero-Shot Prompt Patterns",
          "AI-Assisted Code Refactoring & Debugging",
          "Data Analysis with ChatGPT",
          "Custom GPTs & Automation Workflows"
        ]
      }
    ]
  },
  {
    semester: 4,
    title: "Semester 4 – Backend Development and System Design",
    shortTitle: "Semester 4",
    subtitle: "Architect full-stack MERN backends, deploy cloud architectures, design scalable systems, and build career readiness.",
    categoryBadge: "Year 2 · Backend & Cloud",
    subjects: [
      {
        id: "sem4-1",
        name: "Web Development Backend 1",
        code: "0610341091",
        description: "Learn backend development using the MERN stack, Node.js, Express.js, MongoDB, REST APIs, and authentication.",
        category: "Backend Development",
        iconName: "Server",
        topics: [
          "Node.js Runtime & Event Loop",
          "Express.js Framework & Middleware",
          "MongoDB & Mongoose Schema Modeling",
          "RESTful API Design & CRUD",
          "JWT Authentication & Password Hashing"
        ]
      },
      {
        id: "sem4-2",
        name: "Web Development Backend (Deployment, Security, and Scalability of Web Apps)",
        code: "0610341101",
        description: "Understand application deployment, web security, scalability, and production-ready backend practices.",
        category: "DevOps & Security",
        iconName: "ShieldCheck",
        topics: [
          "Web Security (OWASP Top 10, CORS, XSS, CSRF)",
          "Rate Limiting & Input Sanitization",
          "Server Deployment (Render, AWS, Vercel)",
          "Caching Strategies with Redis",
          "Load Balancing & Horizontal Scaling"
        ]
      },
      {
        id: "sem4-3",
        name: "System Design (Low level)",
        code: "0610342040",
        description: "Explore system architecture, HLD, LLD, UML diagrams, database design, API design, and scalability.",
        category: "System Design",
        iconName: "Boxes",
        topics: [
          "Object-Oriented Design & SOLID Principles",
          "Design Patterns (Singleton, Factory, Observer)",
          "UML Class & Sequence Diagrams",
          "Schema Normalization & Indexing",
          "Microservices vs. Monolithic Architectures"
        ]
      },
      {
        id: "sem4-4",
        name: "New Age Life Skills 4",
        code: "0610345031",
        description: "Develop career readiness, interview skills, professional communication, and workplace adaptability.",
        category: "Career Readiness",
        iconName: "Target",
        topics: [
          "Technical & HR Mock Interviews",
          "Behavioral STAR Interview Technique",
          "LinkedIn Networking & Personal Branding",
          "Workplace Ethics & Professional Conduct",
          "Handling Workplace Ambiguity"
        ]
      },
      {
        id: "sem4-5",
        name: "Introduction to Cloud Computing",
        code: "0610344041",
        description: "Learn cloud computing concepts, deployment models, AWS services, cloud infrastructure, and practical deployment.",
        category: "Cloud Computing",
        iconName: "Cloud",
        topics: [
          "Cloud Service Models (IaaS, PaaS, SaaS)",
          "AWS Core Services (EC2, S3, RDS, Lambda)",
          "Virtual Private Clouds (VPC) & Security Groups",
          "Serverless Computing Architectures",
          "Cloud Cost Management & Monitoring"
        ]
      }
    ]
  },
  {
    semester: 5,
    title: "Semester 5 – Artificial Intelligence and Practical Projects",
    shortTitle: "Semester 5",
    subtitle: "Specialize in machine learning algorithms, competitive programming, advanced prompt engineering, and major capstones.",
    categoryBadge: "Year 3 · AI & Capstone",
    subjects: [
      {
        id: "sem5-1",
        name: "Artificial Intelligence Fundamentals",
        code: "BCA 301",
        description: "Explore AI and machine learning fundamentals, real-world applications, datasets, and responsible AI practices.",
        category: "Artificial Intelligence",
        iconName: "BrainCircuit",
        topics: [
          "Supervised vs. Unsupervised Learning",
          "Classification, Regression & Clustering",
          "Neural Networks & Deep Learning Basics",
          "Dataset Cleansing, Feature Engineering & Split",
          "AI Bias, Ethics & Responsible Deployment"
        ]
      },
      {
        id: "sem5-2",
        name: "Introduction to Competitive Programming",
        code: "BCA 302",
        description: "Improve logical thinking, algorithmic problem-solving, coding efficiency, and competitive programming skills.",
        category: "Competitive Coding",
        iconName: "Trophy",
        topics: [
          "Advanced Time & Space Complexity Profiling",
          "Number Theory, Modular Arithmetic & Bitmasks",
          "Two-Pointers & Sliding Window Techniques",
          "Segment Trees & Binary Indexed Trees",
          "Online Contest Strategies & Problem Solving"
        ]
      },
      {
        id: "sem5-3",
        name: "Introduction to Prompt Engineering",
        code: "BCA 303",
        description: "Learn to design and optimize prompts for large language models, multimodal AI, automation, and AI applications.",
        category: "Prompt Engineering",
        iconName: "Wand2",
        topics: [
          "Chain-of-Thought (CoT) & ReAct Prompting",
          "System Instructions & Role Prompting",
          "Multimodal Prompts (Vision, Audio & Code)",
          "Retrieval-Augmented Generation (RAG) Concepts",
          "Prompt Evaluation, Benchmarking & Safety"
        ]
      },
      {
        id: "sem5-4",
        name: "Major Project/ Internship",
        code: "PROJ 301",
        description: "Apply technical knowledge through a practical major project or industry internship.",
        category: "Industry Project",
        iconName: "Rocket",
        topics: [
          "Problem Formulation & Industry Requirement Analysis",
          "System Architecture & Technology Stack Selection",
          "Sprint-Based Prototype Development",
          "Unit Testing & Quality Assurance",
          "Interim Project Presentation & Viva"
        ]
      }
    ]
  },
  {
    semester: 6,
    title: "Semester 6 – Data Science and Industry Experience",
    shortTitle: "Semester 6",
    subtitle: "Master data science pipelines in Python, demonstrate social leadership, and deliver an industry-grade major internship.",
    categoryBadge: "Year 3 · Data Science & Degree Capstone",
    subjects: [
      {
        id: "sem6-1",
        name: "Python for Data Science & AI",
        code: "BCA 304",
        description: "Learn Python-based data preprocessing, data analysis, machine learning, predictive modeling, and AI applications.",
        category: "Data Science & AI",
        iconName: "BarChart3",
        topics: [
          "NumPy for High-Performance Scientific Computing",
          "Pandas DataFrames for Data Wrangling",
          "Data Visualization (Matplotlib & Seaborn)",
          "Scikit-Learn Predictive Modeling Pipelines",
          "End-to-End Machine Learning Deployment"
        ]
      },
      {
        id: "sem6-2",
        name: "NCC/NSS and Evaluation of Overall Extracurricular Activities",
        code: "GP 301",
        description: "Participate in extracurricular activities and develop social responsibility, teamwork, and leadership skills.",
        category: "Leadership & Community",
        iconName: "Flag",
        topics: [
          "Community Service & Civic Engagement",
          "National Cadet Corps / Social Service Schemes",
          "Team Building & Youth Leadership Camps",
          "Disaster Preparedness & Social Initiatives",
          "Holistic Personality Evaluation"
        ]
      },
      {
        id: "sem6-3",
        name: "Major Project/internship",
        code: "PROJ 302",
        description: "Gain practical experience by developing a major project or participating in an industry internship.",
        category: "Degree Capstone",
        iconName: "GraduationCap",
        topics: [
          "Full-Scale Software System Implementation",
          "Production Cloud Deployment & Monitoring",
          "Comprehensive Project Documentation & User Guide",
          "Industry Mentor Code Review & Evaluation",
          "Final Degree Capstone Defense & Demonstration"
        ]
      }
    ]
  }
];
