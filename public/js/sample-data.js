/**
 * FocusTube - Sample Educational Videos & Playlists Repository
 * Curated for Indian Engineering Students across disciplines:
 * CSE, IT, AI/ML, Data Science, ECE, Electrical (EEE), Mechanical, Civil, Chemical,
 * Engineering Mathematics, Engineering Physics, and GATE Preparation.
 * 
 * Note for Viva:
 * This sample data provides a guaranteed, high-quality offline fallback.
 * When the official YouTube Data API v3 key is supplied, FocusTube queries
 * live YouTube and displays real-time search results with real thumbnails and counts.
 */

const SAMPLE_ENGINEERING_VIDEOS = [
  // --- COMPUTER SCIENCE & IT ---
  {
    id: "sample-cse-1",
    youtubeId: "8hly31xKli0",
    title: "Algorithms and Data Structures Tutorial - Full Course for Beginners",
    channel: "freeCodeCamp.org",
    branch: "CSE",
    subject: "Data Structures",
    duration: "5:22:15",
    views: "2.4M views",
    thumbnailUrl: "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg",
    description: "Learn algorithms and data structures: Big-O notation, arrays, linked lists, stacks, queues, recursion, and binary trees.",
    isSample: true
  },
  {
    id: "sample-cse-2",
    youtubeId: "2IsF7DEtVjg",
    title: "Binary Search Tree Construction and Traversal (Inorder, Preorder, Postorder)",
    channel: "Abdul Bari",
    branch: "CSE",
    subject: "Data Structures",
    duration: "24:18",
    views: "1.8M views",
    thumbnailUrl: "https://img.youtube.com/vi/2IsF7DEtVjg/hqdefault.jpg",
    description: "Step-by-step mathematical explanation of binary search trees, insertion, deletion, and tree traversals with board diagrams.",
    isSample: true
  },
  {
    id: "sample-cse-3",
    youtubeId: "T_m27bhVQQQ",
    title: "CPU Scheduling Algorithms: FCFS, SJF, Round Robin & Priority Scheduling",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "Operating Systems",
    duration: "21:30",
    views: "820K views",
    thumbnailUrl: "https://img.youtube.com/vi/T_m27bhVQQQ/hqdefault.jpg",
    description: "How the Operating System schedules processes on the CPU using Gantt charts, turnaround time, and waiting time formulas.",
    isSample: true
  },
  {
    id: "sample-cse-4",
    youtubeId: "HXV3zeQKqGY",
    title: "SQL Tutorial - Full Database Course for Beginners (Queries, Joins, Keys)",
    channel: "freeCodeCamp.org",
    branch: "CSE",
    subject: "DBMS",
    duration: "4:20:38",
    views: "5.1M views",
    thumbnailUrl: "https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg",
    description: "Complete relational database course: SQL queries, primary/foreign keys, joins, normalization, and ACID properties.",
    isSample: true
  },
  {
    id: "sample-cse-5",
    youtubeId: "qiQR5rTSshw",
    title: "OSI Model Explained | 7 Layers of Computer Networks with Real Examples",
    channel: "PowerCert Animated Videos",
    branch: "CSE",
    subject: "Computer Networks",
    duration: "19:25",
    views: "3.7M views",
    thumbnailUrl: "https://img.youtube.com/vi/qiQR5rTSshw/hqdefault.jpg",
    description: "Animated breakdown of Physical, Data Link, Network, Transport, Session, Presentation, and Application layers.",
    isSample: true
  },

  // --- AI / ML & DATA SCIENCE ---
  {
    id: "sample-ai-1",
    youtubeId: "jGwO_UgTS7I",
    title: "Machine Learning Stanford CS229: Lecture 1 - Supervised Learning & Linear Regression",
    channel: "Stanford Online",
    branch: "AI/ML",
    subject: "Machine Learning",
    duration: "1:18:24",
    views: "1.2M views",
    thumbnailUrl: "https://img.youtube.com/vi/jGwO_UgTS7I/hqdefault.jpg",
    description: "Foundational Stanford lecture by Prof. Andrew Ng introducing linear regression, gradient descent, and cost function.",
    isSample: true
  },
  {
    id: "sample-ai-2",
    youtubeId: "LHBE6Q9XlzI",
    title: "Python for Data Science - Complete Course for Beginners (Pandas, NumPy, Matplotlib)",
    channel: "freeCodeCamp.org",
    branch: "AI/ML",
    subject: "Data Science",
    duration: "12:00:28",
    views: "2.1M views",
    thumbnailUrl: "https://img.youtube.com/vi/LHBE6Q9XlzI/hqdefault.jpg",
    description: "Master essential Python libraries for data processing, Exploratory Data Analysis (EDA), and data visualizations.",
    isSample: true
  },

  // --- ELECTRONICS & COMMUNICATION (ECE) ---
  {
    id: "sample-ece-1",
    youtubeId: "up55tuwestg",
    title: "Signals & Systems - Introduction to Continuous & Discrete Time Signals",
    channel: "TutorialsPoint",
    branch: "ECE",
    subject: "Signals and Systems",
    duration: "10:45",
    views: "520K views",
    thumbnailUrl: "https://i.ytimg.com/vi/up55tuwestg/hqdefault.jpg",
    description: "Comprehensive lecture on classification of signals: periodic, aperiodic, energy, and power signals with unit step functions.",
    isSample: true
  },
  {
    id: "sample-ece-2",
    youtubeId: "y-aYzGdlM-8",
    title: "Lec 11: K-Map Minimization Explained | Introduction to Karnaugh Map | Digital Electronics",
    channel: "Gate Smashers",
    branch: "ECE",
    subject: "Digital Electronics",
    duration: "26:40",
    views: "1.2M views",
    thumbnailUrl: "https://i.ytimg.com/vi/y-aYzGdlM-8/hqdefault.jpg",
    description: "Karnaugh Map (K-Map) 2-variable, 3-variable, and 4-variable minimization techniques for semester exams.",
    isSample: true
  },

  // --- ELECTRICAL & ELECTRONICS (EEE) ---
  {
    id: "sample-eee-1",
    youtubeId: "uZADT4tuwQw",
    title: "Kirchhoff's Laws (KVL & KCL) - Basic Electrical Engineering",
    channel: "NCERT Wallah",
    branch: "Electrical",
    subject: "Circuit Theory",
    duration: "22:15",
    views: "850K views",
    thumbnailUrl: "https://i.ytimg.com/vi/uZADT4tuwQw/hqdefault.jpg",
    description: "Mesh analysis, nodal analysis, and Kirchhoff's voltage and current laws solved step-by-step for engineering students.",
    isSample: true
  },
  {
    id: "sample-eee-2",
    youtubeId: "UchitHGF4n8",
    title: "How does a Transformer work - Working Principle Electrical Engineering",
    channel: "The Engineering Mindset",
    branch: "Electrical",
    subject: "Electrical Machines",
    duration: "12:35",
    views: "4.3M views",
    thumbnailUrl: "https://i.ytimg.com/vi/UchitHGF4n8/hqdefault.jpg",
    description: "Detailed 3D animations demonstrating mutual electromagnetic induction, step-up/step-down transformers, and core losses.",
    isSample: true
  },

  // --- MECHANICAL ENGINEERING ---
  {
    id: "sample-mech-1",
    youtubeId: "fSEFfWf2au0",
    title: "The First & Zeroth Laws of Thermodynamics: Crash Course Engineering #9",
    channel: "CrashCourse",
    branch: "Mechanical",
    subject: "Thermodynamics",
    duration: "10:14",
    views: "980K views",
    thumbnailUrl: "https://i.ytimg.com/vi/fSEFfWf2au0/hqdefault.jpg",
    description: "Thermodynamic state variables, work done in isobaric/isothermal/adiabatic processes, entropy, and heat engine efficiency.",
    isSample: true
  },
  {
    id: "sample-mech-2",
    youtubeId: "1TUZbZXgYtM",
    title: "Bernoulli’s Equation - Fundamentals of Mechanical Engineering and Fluid Mechanics",
    channel: "GateWay Classes",
    branch: "Mechanical",
    subject: "Fluid Mechanics",
    duration: "34:20",
    views: "410K views",
    thumbnailUrl: "https://i.ytimg.com/vi/1TUZbZXgYtM/hqdefault.jpg",
    description: "Conservation of mass and energy in fluid dynamics, fluid pressure heads, and flow measurement through pipes.",
    isSample: true
  },

  // --- CIVIL ENGINEERING ---
  {
    id: "sample-civil-1",
    youtubeId: "C-FEVzI8oe8",
    title: "Understanding Shear Force and Bending Moment Diagrams (SFD & BMD)",
    channel: "The Efficient Engineer",
    branch: "Civil",
    subject: "Structural Analysis",
    duration: "13:45",
    views: "1.9M views",
    thumbnailUrl: "https://i.ytimg.com/vi/C-FEVzI8oe8/hqdefault.jpg",
    description: "Drawing SFD and BMD for simply supported beams and cantilever beams with point loads and uniformly distributed loads (UDL).",
    isSample: true
  },
  {
    id: "sample-civil-2",
    youtubeId: "U1oAqwKn8xI",
    title: "Surveying Marathon | Civil Engineering Comprehensive Lecture",
    channel: "Unacademy Civil 101",
    branch: "Civil",
    subject: "Surveying",
    duration: "42:10",
    views: "290K views",
    thumbnailUrl: "https://i.ytimg.com/vi/U1oAqwKn8xI/hqdefault.jpg",
    description: "Fundamental surveying principles: bearing calculations, magnetic declination, and leveling techniques.",
    isSample: true
  },

  // --- ENGINEERING MATHEMATICS & BASIC SCIENCES ---
  {
    id: "sample-math-1",
    youtubeId: "fNk_zzaMoSs",
    title: "Linear Algebra - Eigenvalues and Eigenvectors with Step-by-Step Matrix Diagonalization",
    channel: "3Blue1Brown",
    branch: "Mathematics",
    subject: "Engineering Maths",
    duration: "17:16",
    views: "3.9M views",
    thumbnailUrl: "https://i.ytimg.com/vi/fNk_zzaMoSs/hqdefault.jpg",
    description: "Visual geometric understanding of eigenvectors and eigenvalues, characteristic equation det(A - lambda*I) = 0.",
    isSample: true
  },
  {
    id: "sample-math-2",
    youtubeId: "WUvTyaaNkzM",
    title: "Calculus: Limits, Derivatives, and Partial Differentiation for Engineering Students",
    channel: "3Blue1Brown",
    branch: "Mathematics",
    subject: "Engineering Maths",
    duration: "21:05",
    views: "4.5M views",
    thumbnailUrl: "https://i.ytimg.com/vi/WUvTyaaNkzM/hqdefault.jpg",
    description: "The essence of calculus: gradient vectors, multivariable chain rule, and engineering approximations.",
    isSample: true
  },

  // --- GATE PREPARATION ---
  {
    id: "sample-gate-1",
    youtubeId: "ktN_Y5KIBSI",
    title: "GATE Preparation Strategy: Last 100 Days Roadmap to Score 100 Marks in GATE",
    channel: "GATE Wallah",
    branch: "GATE",
    subject: "GATE Preparation",
    duration: "18:40",
    views: "610K views",
    thumbnailUrl: "https://i.ytimg.com/vi/ktN_Y5KIBSI/hqdefault.jpg",
    description: "Subject-wise mark weightage, standard textbooks, previous year questions (PYQ) strategy, and test series revision schedule.",
    isSample: true
  },

  // --- MIT & HARVARD FOUNDATIONS ---
  {
    id: "sample-mit-1",
    youtubeId: "J7DzL2_Na80",
    title: "MIT 18.06 Linear Algebra: Lecture 1 - The Geometry of Linear Equations",
    channel: "MIT OpenCourseWare",
    branch: "Mathematics",
    subject: "Engineering Maths",
    duration: "39:49",
    views: "5.8M views",
    thumbnailUrl: "https://i.ytimg.com/vi/J7DzL2_Na80/hqdefault.jpg",
    description: "Legendary lecture by Prof. Gilbert Strang introducing row and column pictures of matrix equations Ax = b.",
    isSample: true
  },
  {
    id: "sample-cs50-1",
    youtubeId: "8mAITcNt710",
    title: "Harvard CS50: Introduction to Computer Science - C Programming & Memory",
    channel: "CS50",
    branch: "CSE",
    subject: "C++ / Programming",
    duration: "2:27:14",
    views: "3.4M views",
    thumbnailUrl: "https://img.youtube.com/vi/8mAITcNt710/hqdefault.jpg",
    description: "Harvard university introductory computer science course covering source code, machine code, variables, and pointers.",
    isSample: true
  }
];

// Sample Curated YouTube Playlists for Offline Playlist Explorer & Fast Channel Browsing
const SAMPLE_ENGINEERING_PLAYLISTS = [
  // --- GATE SMASHERS (Varun Singla) ---
  {
    id: "pl-gs-dbms",
    playlistId: "PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y",
    title: "DBMS (Database Management System) Complete Playlist",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "DBMS",
    itemCount: 140,
    thumbnailUrl: "https://i.ytimg.com/vi/kBdlM6hNDAE/hqdefault.jpg",
    description: "Complete university syllabus and GATE playlist covering ER models, SQL, Relational Algebra, Normalization, Transactions & Concurrency control.",
    isSample: true
  },
  {
    id: "pl-gs-os",
    playlistId: "PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p",
    title: "Operating System (Complete Playlist)",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "Operating Systems",
    itemCount: 92,
    thumbnailUrl: "https://i.ytimg.com/vi/bkSWJJZNgf8/hqdefault.jpg",
    description: "Full playlist covering process management, CPU scheduling, semaphores, classic synchronization problems, deadlock, paging & virtual memory.",
    isSample: true
  },
  {
    id: "pl-gs-cn",
    playlistId: "PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_",
    title: "Computer Networks (Complete Playlist)",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "Computer Networks",
    itemCount: 106,
    thumbnailUrl: "https://i.ytimg.com/vi/JFF2vJaN0Cw/hqdefault.jpg",
    description: "Comprehensive lecture series covering OSI model layers, TCP/IP, IP addressing, subnetting, routing protocols (DVR, LSR), and socket flow.",
    isSample: true
  },
  {
    id: "pl-gs-toc",
    playlistId: "PLxCzCOWd7aiFM9Lj5G9G_76adtyb4ef7i",
    title: "TOC (Theory of Computation) & Automata",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "Theory of Computation",
    itemCount: 69,
    thumbnailUrl: "https://i.ytimg.com/vi/XslI8h7cGDs/hqdefault.jpg",
    description: "Finite Automata (DFA, NFA), Regular Expressions, Context-Free Grammars (CFG), Pushdown Automata (PDA), and Turing Machines explained step-by-step.",
    isSample: true
  },
  {
    id: "pl-gs-coa",
    playlistId: "PLxCzCOWd7aiHMonh3G6QNKq53C6oNXGrX",
    title: "Computer Organization and Architecture (COA)",
    channel: "Gate Smashers",
    branch: "CSE",
    subject: "Computer Organization",
    itemCount: 66,
    thumbnailUrl: "https://i.ytimg.com/vi/L9X7XXfHYdU/hqdefault.jpg",
    description: "Addressing modes, instruction cycle, pipelining, hazards, cache memory mapping techniques, and secondary storage organization.",
    isSample: true
  },
  {
    id: "pl-gs-dl",
    playlistId: "PLxCzCOWd7aiGmXg4NoX6R31AsC5LeCPHe",
    title: "Digital Logic (Complete Playlist)",
    channel: "Gate Smashers",
    branch: "ECE",
    subject: "Digital Electronics",
    itemCount: 60,
    thumbnailUrl: "https://i.ytimg.com/vi/O0gtKDu_cJc/hqdefault.jpg",
    description: "Boolean algebra, K-Map simplification, multiplexers, decoders, encoders, latches, flip-flops, counters, and registers.",
    isSample: true
  },

  // --- NESO ACADEMY ---
  {
    id: "pl-neso-de",
    playlistId: "PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm",
    title: "Digital Electronics Complete Course",
    channel: "Neso Academy",
    branch: "ECE",
    subject: "Digital Electronics",
    itemCount: 202,
    thumbnailUrl: "https://i.ytimg.com/vi/M0mx8S05v60/hqdefault.jpg",
    description: "India's highest rated Digital Electronics series: Number systems, logic gates, combinational & sequential circuits, state reduction & memory units.",
    isSample: true
  },
  {
    id: "pl-neso-toc",
    playlistId: "PLBlnK6fEyqRgp46KUv4ZY69yXmpwKOIev",
    title: "Theory of Computation & Automata Theory",
    channel: "Neso Academy",
    branch: "CSE",
    subject: "Theory of Computation",
    itemCount: 114,
    thumbnailUrl: "https://i.ytimg.com/vi/58N2N7zJGrQ/hqdefault.jpg",
    description: "Clear animated lectures on formal languages, DFA/NFA conversions, Mealy/Moore machines, Chomsky Normal Form, and undecidability.",
    isSample: true
  },
  {
    id: "pl-neso-nt",
    playlistId: "PLBlnK6fEyqRgLR-hMp7wem-bdVN1iEhsh",
    title: "Network Theory (Circuit Analysis)",
    channel: "Neso Academy",
    branch: "Electrical",
    subject: "Circuit Theory",
    itemCount: 208,
    thumbnailUrl: "https://i.ytimg.com/vi/NEhH6C7Fzw4/hqdefault.jpg",
    description: "Mesh and nodal analysis, network theorems (Thevenin, Norton, Superposition, Maximum Power Transfer), two-port networks, and transient response.",
    isSample: true
  },
  {
    id: "pl-neso-os",
    playlistId: "PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
    title: "Operating System Complete Series",
    channel: "Neso Academy",
    branch: "CSE",
    subject: "Operating Systems",
    itemCount: 77,
    thumbnailUrl: "https://i.ytimg.com/vi/vBURTt97EkA/hqdefault.jpg",
    description: "Structure of operating systems, process state diagrams, threads, CPU scheduling algorithms with Gantt charts, memory management & disk management.",
    isSample: true
  },
  {
    id: "pl-neso-c",
    playlistId: "PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR",
    title: "C Programming Complete Course",
    channel: "Neso Academy",
    branch: "CSE",
    subject: "C++ / Programming",
    itemCount: 169,
    thumbnailUrl: "https://i.ytimg.com/vi/rLf3jnHxSmU/hqdefault.jpg",
    description: "Comprehensive C programming lectures covering variables, operators, loops, functions, recursion, pointers, arrays, strings, and structures.",
    isSample: true
  },
  {
    id: "pl-neso-coa",
    playlistId: "PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q",
    title: "Computer Organization & Architecture (COA)",
    channel: "Neso Academy",
    branch: "CSE",
    subject: "Computer Organization",
    itemCount: 100,
    thumbnailUrl: "https://i.ytimg.com/vi/Ol8D69VKX2k/hqdefault.jpg",
    description: "Micro-operations, bus transfer, ALU design, control unit design, memory hierarchy, cache coherence, and I/O interface.",
    isSample: true
  },
  {
    id: "pl-neso-python",
    playlistId: "PLBlnK6fEyqRiueC_HzwFallNO76hfXBB7",
    title: "Python Programming Full Course",
    channel: "Neso Academy",
    branch: "AI/ML",
    subject: "Python Programming",
    itemCount: 119,
    thumbnailUrl: "https://i.ytimg.com/vi/4EaYeZyzIB0/hqdefault.jpg",
    description: "Python basics, control structures, data structures (lists, tuples, dicts, sets), OOP concepts, and file handling.",
    isSample: true
  },

  // --- ABDUL BARI & JENNY'S LECTURES & KNOWLEDGE GATE ---
  {
    id: "pl-abdul-algo",
    playlistId: "PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
    title: "Algorithms Complete Lecture Series by Abdul Bari",
    channel: "Abdul Bari",
    branch: "CSE",
    subject: "Data Structures",
    itemCount: 84,
    thumbnailUrl: "https://i.ytimg.com/vi/0IAPZzGSbME/hqdefault.jpg",
    description: "World renowned whiteboard lectures explaining Asymptotic notations, Divide & Conquer, Greedy Method, Dynamic Programming, and Graph Traversals.",
    isSample: true
  },
  {
    id: "pl-jenny-dsa",
    playlistId: "PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
    title: "Data Structures and Algorithms in C & C++",
    channel: "Jenny's Lectures CS IT",
    branch: "CSE",
    subject: "Data Structures",
    itemCount: 122,
    thumbnailUrl: "https://i.ytimg.com/vi/AT14lCXuMKI/hqdefault.jpg",
    description: "Popular Indian lecture series covering Arrays, Linked Lists, Stacks, Queues, Trees, Binary Search Trees, AVL Trees, Graphs, and Sorting algorithms.",
    isSample: true
  },
  {
    id: "pl-kg-dbms",
    playlistId: "PLmXKhU9FNesR1rSES7oLdJaNFgmuj0SYV",
    title: "1.1 DBMS In Hindi (Complete Playlist)",
    channel: "KnowledgeGATE by Sanchit Sir",
    branch: "CSE",
    subject: "DBMS",
    itemCount: 113,
    thumbnailUrl: "https://i.ytimg.com/vi/YRnjGeQbsHQ/hqdefault.jpg",
    description: "Clear Hindi lectures by Sanchit Sir covering ER diagrams, relational model, Functional Dependencies, BCNF, and Transaction Processing for semester exams.",
    isSample: true
  }
];

// Helper to look up video by ID
function getSampleVideoById(videoId) {
  if (!videoId) return null;
  return SAMPLE_ENGINEERING_VIDEOS.find(
    v => v.id === videoId || v.youtubeId === videoId
  ) || null;
}

// Helper to look up playlist by ID
function getSamplePlaylistById(playlistId) {
  if (!playlistId) return null;
  return SAMPLE_ENGINEERING_PLAYLISTS.find(
    p => p.id === playlistId || p.playlistId === playlistId
  ) || null;
}

// Make accessible in both window and node environments
if (typeof window !== "undefined") {
  window.SAMPLE_ENGINEERING_VIDEOS = SAMPLE_ENGINEERING_VIDEOS;
  window.SAMPLE_ENGINEERING_PLAYLISTS = SAMPLE_ENGINEERING_PLAYLISTS;
  window.getSampleVideoById = getSampleVideoById;
  window.getSamplePlaylistById = getSamplePlaylistById;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SAMPLE_ENGINEERING_VIDEOS,
    SAMPLE_ENGINEERING_PLAYLISTS,
    getSampleVideoById,
    getSamplePlaylistById
  };
}
