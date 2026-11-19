/**
 * BCA (Hons. with Research)
 * Curated Recommended Learning Resources & Academic Reference Links
 * Covers all subjects across Semesters 1 to 6.
 */

export const subjectResourcesMap = {
  // Semester 1
  '0610311011': {
    subjectName: 'Foundations of IT',
    textbooks: [
      { title: 'Computer System Architecture', author: 'M. Morris Mano', publisher: 'Pearson', edition: '3rd Edition' },
      { title: 'Foundations of Information Technology', author: 'D.S. Yadav', publisher: 'New Age International', edition: '2nd Edition' }
    ],
    documentation: [
      { name: 'Computer Architecture - MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/', type: 'Courseware' },
      { name: 'IEEE Computer Society Learning Center', url: 'https://www.computer.org/', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'NPTEL: Computer Organization and Architecture (Prof. I. Sengupta, IIT KGP)', url: 'https://nptel.ac.in', platform: 'NPTEL' },
      { name: 'Crash Course Computer Science (PBS Digital Studios)', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610311020': {
    subjectName: 'Mathematics for Computer Science',
    textbooks: [
      { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', publisher: 'McGraw-Hill', edition: '8th Edition' },
      { title: 'Mathematics for Computer Science', author: 'Eric Lehman, F. Thomson Leighton, Albert R. Meyer', publisher: 'MIT Open Learning', edition: 'Revised' }
    ],
    documentation: [
      { name: 'MIT 6.042J: Mathematics for Computer Science', url: 'https://ocw.mit.edu', type: 'Courseware' },
      { name: 'Wolfram MathWorld - Discrete Mathematics Reference', url: 'https://mathworld.wolfram.com/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'NPTEL: Discrete Mathematics (Prof. S. Chakraborty, IIT Madras)', url: 'https://nptel.ac.in', platform: 'NPTEL' },
      { name: 'Essence of Linear Algebra & Discrete Math (3Blue1Brown)', url: 'https://3blue1brown.com', platform: 'Video' }
    ]
  },
  '0610311031': {
    subjectName: 'Database Management System',
    textbooks: [
      { title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', publisher: 'McGraw-Hill', edition: '7th Edition' },
      { title: 'Fundamentals of Database Systems', author: 'Ramez Elmasri, Shamkant B. Navathe', publisher: 'Pearson', edition: '7th Edition' }
    ],
    documentation: [
      { name: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/', type: 'Documentation' },
      { name: 'SQLite Query & Architecture Manual', url: 'https://www.sqlite.org/docs.html', type: 'Reference' }
    ],
    videoLectures: [
      { name: 'Carnegie Mellon University: Database Systems (Prof. Andy Pavlo)', url: 'https://15445.courses.cs.cmu.edu/', platform: 'CMU' },
      { name: 'NPTEL: Database Management System (Prof. P.P. Das, IIT KGP)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  '0610312011': {
    subjectName: 'Problem Solving and Programming Fundamentals 1',
    textbooks: [
      { title: 'The C Programming Language', author: 'Brian W. Kernighan, Dennis M. Ritchie', publisher: 'Prentice Hall', edition: '2nd Edition' },
      { title: 'Programming in ANSI C', author: 'E. Balagurusamy', publisher: 'McGraw-Hill', edition: '8th Edition' }
    ],
    documentation: [
      { name: 'cppreference.com - C Reference Library', url: 'https://en.cppreference.com/w/c', type: 'Documentation' },
      { name: 'GNU C Programming Tutorial', url: 'https://www.gnu.org/software/gnu-c-manual/', type: 'Manual' }
    ],
    videoLectures: [
      { name: 'CS50x: Introduction to Computer Science (Harvard University)', url: 'https://cs50.harvard.edu/x/', platform: 'Harvard' },
      { name: 'NPTEL: Introduction to Programming in C (Prof. S. Arunkumar, IITM)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  '0610315010': {
    subjectName: 'Environmental Studies for Technology',
    textbooks: [
      { title: 'Environmental Studies: From Crisis to Cure', author: 'R. Rajagopalan', publisher: 'Oxford University Press', edition: '3rd Edition' },
      { title: 'Green Computing and Green IT Best Practices', author: 'Jason Harris', publisher: 'Emereo Publishing', edition: 'Latest' }
    ],
    documentation: [
      { name: 'UNEP Environmental Technology Assessments', url: 'https://www.unep.org/', type: 'Reports' },
      { name: 'IEEE Green Computing Standards & Guidelines', url: 'https://www.ieee.org/', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'NPTEL: Ecology and Environment for Engineers', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  '0610316011': {
    subjectName: 'New Age Life Skills 1',
    textbooks: [
      { title: 'Soft Skills for Everyone', author: 'Jeff Butterfield', publisher: 'Cengage Learning', edition: '2nd Edition' },
      { title: 'Digital Ethics & Modern Communication', author: 'Luciano Floridi', publisher: 'Oxford University Press', edition: '1st Edition' }
    ],
    documentation: [
      { name: 'Harvard Business Review - Effective Workplace Communication', url: 'https://hbr.org', type: 'Articles' }
    ],
    videoLectures: [
      { name: 'Communication and Professional Etiquette Masterclass', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },

  // Semester 2
  '0610321041': {
    subjectName: 'Problem Solving and Programming Fundamentals 2',
    textbooks: [
      { title: 'Object-Oriented Programming in C++', author: 'Robert Lafore', publisher: 'Sams Publishing', edition: '4th Edition' },
      { title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', publisher: 'Addison-Wesley', edition: '4th Edition' }
    ],
    documentation: [
      { name: 'cppreference.com - Standard C++ Reference', url: 'https://en.cppreference.com/w/cpp', type: 'Documentation' },
      { name: 'Standard C++ Foundation Guidelines', url: 'https://isocpp.org/', type: 'Reference' }
    ],
    videoLectures: [
      { name: 'The Cherno: Modern C++ Series', url: 'https://youtube.com', platform: 'YouTube' },
      { name: 'NPTEL: Programming in C++ (Prof. Partha Pratim Das, IIT KGP)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  '0610321050': {
    subjectName: 'Agile Software Development Life Cycle',
    textbooks: [
      { title: 'Agile Software Development: Principles, Patterns, and Practices', author: 'Robert C. Martin', publisher: 'Pearson', edition: '1st Edition' },
      { title: 'Scrum: The Art of Doing Twice the Work in Half the Time', author: 'Jeff Sutherland', publisher: 'Crown Business', edition: 'Latest' }
    ],
    documentation: [
      { name: 'The Official Scrum Guide', url: 'https://scrumguides.org/', type: 'Guide' },
      { name: 'Agile Manifesto & Principles', url: 'https://agilemanifesto.org/', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'Atlassian Agile Coach Series', url: 'https://www.atlassian.com/agile', platform: 'Atlassian' }
    ]
  },
  '0610321061': {
    subjectName: 'Web Development Frontend 1 - HTML-CSS',
    textbooks: [
      { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', publisher: 'John Wiley & Sons', edition: '1st Edition' },
      { title: 'CSS: The Definitive Guide', author: 'Eric A. Meyer, Estelle Weyl', publisher: "O'Reilly Media", edition: '4th Edition' }
    ],
    documentation: [
      { name: 'MDN Web Docs: HTML & CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'Documentation' },
      { name: 'W3C Web Standards Specifications', url: 'https://www.w3.org/standards/', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'freeCodeCamp: Responsive Web Design Certification', url: 'https://www.freecodecamp.org/', platform: 'FreeCodeCamp' },
      { name: 'Kevin Powell: Modern CSS Layouts & Flexbox/Grid', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610326021': {
    subjectName: 'New Age Life Skills 2',
    textbooks: [
      { title: 'The Culture Code: Secrets of Highly Successful Groups', author: 'Daniel Coyle', publisher: 'Bantam', edition: '1st Edition' },
      { title: 'Crucial Conversations: Tools for Talking When Stakes Are High', author: 'Kerry Patterson', publisher: 'McGraw-Hill', edition: '3rd Edition' }
    ],
    documentation: [
      { name: 'MindTools Team Leadership & Problem Solving', url: 'https://www.mindtools.com', type: 'Articles' }
    ],
    videoLectures: [
      { name: 'TED Talks: Leadership, Empathy and High Performance Teams', url: 'https://ted.com', platform: 'TED' }
    ]
  },
  '0610324010': {
    subjectName: 'Introduction to Generative AI',
    textbooks: [
      { title: 'Generative Deep Learning', author: 'David Foster', publisher: "O'Reilly Media", edition: '2nd Edition' },
      { title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', publisher: 'MIT Press', edition: '1st Edition' }
    ],
    documentation: [
      { name: 'Hugging Face Transformers Documentation', url: 'https://huggingface.co/docs', type: 'Documentation' },
      { name: 'OpenAI Developer Documentation & Cookbook', url: 'https://platform.openai.com/docs', type: 'Guides' }
    ],
    videoLectures: [
      { name: 'DeepLearning.AI: Generative AI with Large Language Models', url: 'https://www.deeplearning.ai/', platform: 'Coursera' },
      { name: 'Stanford CS224N: Natural Language Processing with Deep Learning', url: 'https://web.stanford.edu/class/cs224n/', platform: 'Stanford' }
    ]
  },

  // Semester 3
  '0610332021': {
    subjectName: 'Web Development Frontend 2 - JS React',
    textbooks: [
      { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', publisher: 'No Starch Press', edition: '3rd Edition' },
      { title: 'Learning React: Modern Patterns for Developing React Apps', author: 'Alex Banks, Eve Porcello', publisher: "O'Reilly Media", edition: '2nd Edition' }
    ],
    documentation: [
      { name: 'React Official Documentation (react.dev)', url: 'https://react.dev/', type: 'Documentation' },
      { name: 'JavaScript.info - The Modern JavaScript Tutorial', url: 'https://javascript.info/', type: 'Tutorial' }
    ],
    videoLectures: [
      { name: 'Scrimba: The Frontend Developer Career Path', url: 'https://scrimba.com', platform: 'Scrimba' },
      { name: 'React 19 Core Concepts & Hooks (Kent C. Dodds)', url: 'https://epicreact.dev', platform: 'Courseware' }
    ]
  },
  '0610331071': {
    subjectName: 'Operating System Fundamentals',
    textbooks: [
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', publisher: 'Wiley', edition: '10th Edition' },
      { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum, Herbert Bos', publisher: 'Pearson', edition: '4th Edition' }
    ],
    documentation: [
      { name: 'Operating Systems: Three Easy Pieces (OSTEP)', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', type: 'Open Textbook' },
      { name: 'Linux Kernel Documentation', url: 'https://www.kernel.org/doc/html/latest/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'NPTEL: Operating Systems (Prof. Santanu Chattopadhyay, IIT KGP)', url: 'https://nptel.ac.in', platform: 'NPTEL' },
      { name: 'MIT 6.S081: Operating System Engineering', url: 'https://pdos.csail.mit.edu/6.828/', platform: 'MIT' }
    ]
  },
  '0610331080': {
    subjectName: 'Computer Network',
    textbooks: [
      { title: 'Computer Networks', author: 'Andrew S. Tanenbaum, David J. Wetherall', publisher: 'Pearson', edition: '5th Edition' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose, Keith W. Ross', publisher: 'Pearson', edition: '8th Edition' }
    ],
    documentation: [
      { name: 'IETF RFC Index & Internet Protocols', url: 'https://www.rfc-editor.org/', type: 'Standards' },
      { name: 'Wireshark User Guide & Protocol Analyzer', url: 'https://www.wireshark.org/docs/', type: 'Tool Docs' }
    ],
    videoLectures: [
      { name: 'NPTEL: Computer Networks and Internet Protocol (Prof. S. Chakraborty)', url: 'https://nptel.ac.in', platform: 'NPTEL' },
      { name: 'Stanford CS144: Introduction to Computer Networking', url: 'https://cs144.github.io/', platform: 'Stanford' }
    ]
  },
  '0610332031': {
    subjectName: 'Data Structures and Algorithms (Problem Solving 3)',
    textbooks: [
      { title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', publisher: 'MIT Press', edition: '4th Edition' },
      { title: 'Data Structures and Algorithm Analysis in C++', author: 'Mark Allen Weiss', publisher: 'Pearson', edition: '4th Edition' }
    ],
    documentation: [
      { name: 'Visualgo: Visualising Data Structures and Algorithms', url: 'https://visualgo.net/', type: 'Interactive Tool' },
      { name: 'GeeksforGeeks DSA Reference Library', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'Tutorial' }
    ],
    videoLectures: [
      { name: 'MIT 6.006: Introduction to Algorithms (Erik Demaine, Srini Devadas)', url: 'https://ocw.mit.edu', platform: 'MIT' },
      { name: 'Abdul Bari: Algorithms & Complexity Analysis Masterclass', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610335021': {
    subjectName: 'New Age Life Skills 3',
    textbooks: [
      { title: 'Getting to Yes: Negotiating Agreement Without Giving In', author: 'Roger Fisher, William Ury', publisher: 'Penguin Books', edition: '3rd Edition' },
      { title: 'Presentation Zen: Simple Ideas on Presentation Design', author: 'Garr Reynolds', publisher: 'New Riders', edition: '2nd Edition' }
    ],
    documentation: [
      { name: 'Toastmasters International - Communication Techniques', url: 'https://www.toastmasters.org', type: 'Guide' }
    ],
    videoLectures: [
      { name: 'Effective Negotiation and Conflict Resolution (Coursera)', url: 'https://coursera.org', platform: 'Coursera' }
    ]
  },
  '0610334020': {
    subjectName: 'Introduction to ChatGPT',
    textbooks: [
      { title: 'Prompt Engineering for Generative AI', author: 'James Phoenix, Mike Taylor', publisher: "O'Reilly Media", edition: '1st Edition' },
      { title: 'Building Systems with the ChatGPT API', author: 'Andrew Ng, Isa Fulford', publisher: 'DeepLearning.AI', edition: 'Course Notes' }
    ],
    documentation: [
      { name: 'OpenAI API Reference & Guides', url: 'https://platform.openai.com/docs/api-reference', type: 'Documentation' },
      { name: 'Learn Prompting: In-Depth Prompt Guide', url: 'https://learnprompting.org/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'ChatGPT Prompt Engineering for Developers (DeepLearning.AI)', url: 'https://www.deeplearning.ai/', platform: 'DeepLearning.AI' }
    ]
  },

  // Semester 4
  '0610341091': {
    subjectName: 'Web Development Backend 1',
    textbooks: [
      { title: 'Node.js Design Patterns', author: 'Mario Casciaro, Luciano Mammino', publisher: 'Packt Publishing', edition: '3rd Edition' },
      { title: 'RESTful Web APIs', author: 'Leonard Richardson, Mike Amundsen', publisher: "O'Reilly Media", edition: '1st Edition' }
    ],
    documentation: [
      { name: 'Node.js Official Documentation & API Reference', url: 'https://nodejs.org/docs/latest/api/', type: 'Documentation' },
      { name: 'Express.js Routing and Middleware Guide', url: 'https://expressjs.com/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'freeCodeCamp: Node.js and Express Full Course', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610341101': {
    subjectName: 'Web Development Backend (Deployment, Security, and Scalability of Web Apps)',
    textbooks: [
      { title: 'Web Security for Developers', author: 'Malcolm McDonald', publisher: 'No Starch Press', edition: '1st Edition' },
      { title: 'Docker Deep Dive', author: 'Nigel Poulton', publisher: 'Independently Published', edition: 'Latest' }
    ],
    documentation: [
      { name: 'OWASP Top 10 Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/', type: 'Security Standard' },
      { name: 'Docker Engine and Compose Documentation', url: 'https://docs.docker.com/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'Hussein Nasser: Backend Engineering & Performance', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610342040': {
    subjectName: 'System Design (Low Level)',
    textbooks: [
      { title: 'Design Patterns: Elements of Reusable Object-Oriented Software (GoF)', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', publisher: 'Addison-Wesley', edition: '1st Edition' },
      { title: 'Head First Design Patterns', author: 'Eric Freeman, Elisabeth Robson', publisher: "O'Reilly Media", edition: '2nd Edition' }
    ],
    documentation: [
      { name: 'Refactoring Guru - Design Patterns Reference', url: 'https://refactoring.guru/design-patterns', type: 'Interactive Guide' },
      { name: 'SourceMaking - UML and Software Patterns', url: 'https://sourcemaking.com/design_patterns', type: 'Reference' }
    ],
    videoLectures: [
      { name: 'Low Level System Design Playlist (Shrayansh Jain)', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  '0610345031': {
    subjectName: 'New Age Life Skills 4',
    textbooks: [
      { title: 'Cracking the Coding Interview: Career & Communication', author: 'Gayle Laakmann McDowell', publisher: 'CareerCup', edition: '6th Edition' },
      { title: 'Knock Em Dead: The Ultimate Job Search Guide', author: 'Martin Yate', publisher: 'Adams Media', edition: 'Latest' }
    ],
    documentation: [
      { name: 'LinkedIn Learning - Interview Strategies & Technical Resumes', url: 'https://linkedin.com', type: 'Career' }
    ],
    videoLectures: [
      { name: 'Stanford Career Education: Resume & Behavioral Interviewing', url: 'https://career.stanford.edu', platform: 'Stanford' }
    ]
  },
  '0610344041': {
    subjectName: 'Introduction to Cloud Computing',
    textbooks: [
      { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Thomas Erl, Zaigham Mahmood, Ricardo Puttini', publisher: 'Prentice Hall', edition: '1st Edition' },
      { title: 'Architecting for the Cloud (AWS Best Practices)', author: 'J. Varia', publisher: 'Amazon Web Services', edition: 'Whitepaper' }
    ],
    documentation: [
      { name: 'AWS Cloud Architecture Center & Well-Architected Framework', url: 'https://aws.amazon.com/architecture/', type: 'Documentation' },
      { name: 'Google Cloud Architecture Framework', url: 'https://cloud.google.com/architecture/framework', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'NPTEL: Cloud Computing (Prof. Soumya Kanti Ghosh, IIT KGP)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },

  // Semester 5
  'BCA 301': {
    subjectName: 'Artificial Intelligence Fundamentals',
    textbooks: [
      { title: 'Artificial Intelligence: A Modern Approach (AIMA)', author: 'Stuart Russell, Peter Norvig', publisher: 'Pearson', edition: '4th Edition' },
      { title: 'Artificial Intelligence', author: 'Elaine Rich, Kevin Knight, Shivashankar B. Nair', publisher: 'McGraw-Hill', edition: '3rd Edition' }
    ],
    documentation: [
      { name: 'Berkeley AI Materials (CS188 Intro to AI)', url: 'https://inst.eecs.berkeley.edu/~cs188/', type: 'Courseware' },
      { name: 'Association for the Advancement of AI (AAAI)', url: 'https://aaai.org/', type: 'Research' }
    ],
    videoLectures: [
      { name: 'UC Berkeley CS188: Artificial Intelligence (Prof. Pieter Abbeel)', url: 'https://youtube.com', platform: 'Berkeley' },
      { name: 'NPTEL: Artificial Intelligence (Prof. Deepak Khemani, IIT Madras)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  'BCA 302': {
    subjectName: 'Introduction to Competitive Programming',
    textbooks: [
      { title: 'Competitive Programming 4', author: 'Steven Halim, Felix Halim, Suhendry Effendy', publisher: 'Lulu Press', edition: '4th Edition' },
      { title: 'Guide to Competitive Programming', author: 'Antti Laaksonen', publisher: 'Springer', edition: '2nd Edition' }
    ],
    documentation: [
      { name: 'USACO Guide - Competitive Programming Curriculum', url: 'https://usaco.guide/', type: 'Interactive Curriculum' },
      { name: 'Codeforces Catalog & Editorial Archives', url: 'https://codeforces.com/', type: 'Platform' }
    ],
    videoLectures: [
      { name: 'Errichto Competitive Programming Algorithms', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  },
  'BCA 303': {
    subjectName: 'Introduction to Prompt Engineering',
    textbooks: [
      { title: 'Prompt Engineering for Large Language Models', author: 'John Berryman', publisher: "O'Reilly Media", edition: '1st Edition' },
      { title: 'Language Models in Practice', author: 'Sebastian Raschka', publisher: 'Manning', edition: 'Latest' }
    ],
    documentation: [
      { name: 'Anthropic Prompt Engineering Interactive Tutorial', url: 'https://docs.anthropic.com/', type: 'Documentation' },
      { name: 'DAIR.AI: Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'Guide' }
    ],
    videoLectures: [
      { name: 'DeepLearning.AI: Advanced Retrieval Augmented Generation (RAG)', url: 'https://deeplearning.ai', platform: 'DeepLearning.AI' }
    ]
  },
  'PROJ 301': {
    subjectName: 'Major Project / Internship',
    textbooks: [
      { title: 'Software Engineering: A Practitioner’s Approach', author: 'Roger S. Pressman', publisher: 'McGraw-Hill', edition: '8th Edition' },
      { title: 'Writing for Computer Science', author: 'Justin Zobel', publisher: 'Springer', edition: '3rd Edition' }
    ],
    documentation: [
      { name: 'IEEE Standard for Software Project Management Plans (IEEE 1058)', url: 'https://standards.ieee.org/', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'Project Lifecycle, Architecture, and Testing (MIT OCW)', url: 'https://ocw.mit.edu', platform: 'MIT' }
    ]
  },

  // Semester 6
  'BCA 304': {
    subjectName: 'Python for Data Science & AI',
    textbooks: [
      { title: 'Python for Data Analysis', author: 'Wes McKinney', publisher: "O'Reilly Media", edition: '3rd Edition' },
      { title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow', author: 'Aurélien Géron', publisher: "O'Reilly Media", edition: '3rd Edition' }
    ],
    documentation: [
      { name: 'NumPy & Pandas Official Documentation', url: 'https://pandas.pydata.org/docs/', type: 'Documentation' },
      { name: 'Scikit-Learn Machine Learning in Python', url: 'https://scikit-learn.org/stable/', type: 'Documentation' }
    ],
    videoLectures: [
      { name: 'StatQuest with Josh Starmer: Machine Learning Fundamentals', url: 'https://statquest.org', platform: 'YouTube' },
      { name: 'NPTEL: Python for Data Science (Prof. Rengaswamy, IITM)', url: 'https://nptel.ac.in', platform: 'NPTEL' }
    ]
  },
  'GP 301': {
    subjectName: 'NCC/NSS and Evaluation of Overall Extracurricular Activities',
    textbooks: [
      { title: 'NSS Manual', author: 'Government of India, Ministry of Youth Affairs and Sports', publisher: 'Govt Publication', edition: 'Revised' }
    ],
    documentation: [
      { name: 'National Service Scheme Official Guidelines', url: 'https://nss.gov.in', type: 'Guidelines' }
    ],
    videoLectures: [
      { name: 'Community Leadership and Social Innovation', url: 'https://youtube.com', platform: 'Lectures' }
    ]
  },
  'PROJ 302': {
    subjectName: 'Major Project / Internship',
    textbooks: [
      { title: 'Software Engineering: A Practitioner’s Approach', author: 'Roger S. Pressman', publisher: 'McGraw-Hill', edition: '8th Edition' }
    ],
    documentation: [
      { name: 'Agile Project Management Standards', url: 'https://agilealliance.org', type: 'Standards' }
    ],
    videoLectures: [
      { name: 'Full-Stack Software Architecture and Production Deployment', url: 'https://youtube.com', platform: 'YouTube' }
    ]
  }
};

/**
 * Returns curated learning resources by subjectCode
 */
export function getSubjectResources(subjectCode) {
  if (!subjectCode) return null;
  const raw = String(subjectCode).trim();
  if (subjectResourcesMap[raw]) return subjectResourcesMap[raw];
  const norm = raw.toLowerCase().replace(/[\s-_]/g, '');
  const key = Object.keys(subjectResourcesMap).find(
    (k) => k.toLowerCase().replace(/[\s-_]/g, '') === norm
  );
  return key ? subjectResourcesMap[key] : null;
}
