export type DemoAssignmentSpec = {
  key: string;
  subjectCode: string;
  unitOrder: number;
  title: string;
  description: string;
  /** Offset in days from seed time (positive = upcoming, negative = past). */
  dueOffsetDays: number;
  maxMarks: number;
  /** Mark for the primary demo student (null = pending). */
  demoMark: {
    status: "submitted" | "late" | "not_submitted";
    marks: number | null;
    remark: string;
    markedOffsetDays: number;
  } | null;
};

export const CSIT2_SEM5_ASSIGNMENTS: readonly DemoAssignmentSpec[] = [
  {
    key: "csit2-sem5-cn-a3",
    subjectCode: "CSIT-501",
    unitOrder: 3,
    title: "Assignment 3: IPv4 Subnetting & CIDR Problem Set",
    description:
      "Solve the 5 VLSM subnetting and CIDR aggregation problems from Unit 3 on A4 sheets and submit in class.",
    dueOffsetDays: 2,
    maxMarks: 20,
    demoMark: null,
  },
  {
    key: "csit2-sem5-os-a4",
    subjectCode: "CSIT-502",
    unitOrder: 2,
    title: "Assignment 4: CPU Scheduling Comparison",
    description:
      "Draw Gantt charts and compute average waiting and turnaround times for FCFS, SJF, Priority, and Round Robin (q = 3).",
    dueOffsetDays: 4,
    maxMarks: 20,
    demoMark: null,
  },
  {
    key: "csit2-sem5-toc-a2",
    subjectCode: "CSIT-503A",
    unitOrder: 3,
    title: "Assignment 2: CFG Simplification & Chomsky Normal Form",
    description:
      "Remove epsilon, unit, and useless productions from the given grammars and convert them to equivalent CNF.",
    dueOffsetDays: 6,
    maxMarks: 15,
    demoMark: null,
  },
  {
    key: "csit2-sem5-ai-a2",
    subjectCode: "CSIT-504B",
    unitOrder: 2,
    title: "Assignment 2: A* Search & Alpha-Beta Pruning Traces",
    description:
      "Trace A* search on the 8-puzzle state graph using Manhattan distance and prune the given game tree with alpha-beta cutoffs.",
    dueOffsetDays: -5,
    maxMarks: 20,
    demoMark: {
      status: "submitted",
      marks: 18,
      remark: "Clean heuristic admissibility proof and clear pruning trace.",
      markedOffsetDays: -3,
    },
  },
  {
    key: "csit2-sem5-os-a3",
    subjectCode: "CSIT-502",
    unitOrder: 3,
    title: "Assignment 3: Banker's Algorithm & Deadlock Avoidance",
    description:
      "Compute the Need matrix, verify system safety, and evaluate two additional resource requests using Banker's algorithm.",
    dueOffsetDays: -14,
    maxMarks: 20,
    demoMark: {
      status: "late",
      marks: 14,
      remark: "Submitted one day after deadline; safe sequence derivation is accurate.",
      markedOffsetDays: -10,
    },
  },
  {
    key: "csit2-sem5-cn-a2",
    subjectCode: "CSIT-501",
    unitOrder: 2,
    title: "Assignment 2: Sliding Window & CRC Error Detection",
    description:
      "Compare Go-Back-N and Selective Repeat efficiency and compute CRC-4 remainders for the listed frames.",
    dueOffsetDays: -25,
    maxMarks: 15,
    demoMark: {
      status: "not_submitted",
      marks: 0,
      remark: "Not submitted on paper; meet faculty during tutorial hours.",
      markedOffsetDays: -21,
    },
  },
];

export type DemoAnnouncementSpec = {
  key: string;
  kind: "exam" | "material" | "class" | "assignment";
  subjectCode: string | null;
  title: string;
  body: string;
  fileKey: string | null;
  /** Offset in hours before seed time (smaller = newer). */
  createdOffsetHours: number;
  readByDemoStudent: boolean;
};

export const CSIT2_SEM5_ANNOUNCEMENTS: readonly DemoAnnouncementSpec[] = [
  {
    key: "csit2-sem5-ann-assignment-3",
    kind: "assignment",
    subjectCode: "CSIT-501",
    title: "Assignment 3 posted",
    body: "Computer Networking Assignment 3 on IPv4 Subnetting & CIDR is now live. Submit handwritten sheets in class before the due date.",
    fileKey: null,
    createdOffsetHours: 3,
    readByDemoStudent: false,
  },
  {
    key: "csit2-sem5-ann-cn-test-friday",
    kind: "exam",
    subjectCode: "CSIT-501",
    title: "CN class test moved to Friday",
    body: "The Computer Networking Unit 1-2 class test originally scheduled for Wednesday has been moved to Friday at 10:30 AM in Room 304.",
    fileKey: null,
    createdOffsetHours: 20,
    readByDemoStudent: false,
  },
  {
    key: "csit2-sem5-ann-unit3-slides",
    kind: "material",
    subjectCode: "CSIT-502",
    title: "Unit 3 slides uploaded",
    body: "Lecture slides covering Synchronization, Deadlock Prevention, and Banker's Algorithm for Operating System Unit 3 are ready for review.",
    fileKey: "materials/csit-502/unit-3-synchronization-deadlocks.pdf",
    createdOffsetHours: 48,
    readByDemoStudent: true,
  },
  {
    key: "csit2-sem5-ann-no-lectures-monday",
    kind: "class",
    subjectCode: null,
    title: "No lectures on Monday",
    body: "CSIT-2 theory lectures are suspended on Monday for the department technical symposium. Regular classes resume Tuesday morning.",
    fileKey: null,
    createdOffsetHours: 96,
    readByDemoStudent: true,
  },
];

export type DemoNoteSpec = {
  key: string;
  title: string;
  contentMd: string;
  /** Offset in hours before seed time (smaller = more recently updated). */
  updatedOffsetHours: number;
  topicLinks: ReadonlyArray<{
    subjectCode: string;
    unitOrder: number;
    topicOrder: number;
  }>;
  noteLinks: readonly string[];
};

export const DEMO_STUDENT_NOTES: readonly DemoNoteSpec[] = [
  {
    key: "demo-note-round-robin-vs-priority",
    title: "Round Robin vs priority",
    contentMd: [
      "# Round Robin vs Priority Scheduling",
      "",
      "## Round Robin (Preemptive)",
      "- Gives every ready process a fixed **time quantum** (`q`), keeping response time predictable for interactive tasks.",
      "- Very small `q` increases context-switch overhead; very large `q` degenerates into FCFS.",
      "- No starvation because the ready queue is circular.",
      "",
      "## Priority Scheduling",
      "- CPU goes to the process with the highest priority (either preemptive or non-preemptive).",
      "- Risk of **starvation (indefinite blocking)** for low-priority processes.",
      "- Fixed in practice using **aging** (gradually raising priority of waiting processes).",
      "",
      "## Exam comparison takeaway",
      "Use Round Robin when fairness and low response time matter; use Priority with aging when deadline-critical or kernel jobs must run ahead of background work.",
    ].join("\n"),
    updatedOffsetHours: 2,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 2, topicOrder: 3 }],
    noteLinks: ["demo-note-deadlock-prevention-avoidance"],
  },
  {
    key: "demo-note-deadlock-prevention-avoidance",
    title: "Deadlock Prevention vs Avoidance",
    contentMd: [
      "# Deadlock Prevention vs Avoidance",
      "",
      "## Four Coffman Conditions",
      "1. Mutual exclusion",
      "2. Hold and wait",
      "3. No preemption",
      "4. Circular wait",
      "",
      "## Prevention",
      "Breaks at least one necessary condition structurally (e.g., enforcing a global lock ordering removes circular wait), at the cost of lower device utilization.",
      "",
      "## Avoidance (Banker's Algorithm)",
      "Requires processes to declare maximum resource needs in advance. Before granting a request, simulate allocation and verify a **safe sequence** still exists.",
    ].join("\n"),
    updatedOffsetHours: 26,
    topicLinks: [
      { subjectCode: "CSIT-502", unitOrder: 3, topicOrder: 4 },
      { subjectCode: "CSIT-502", unitOrder: 3, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-tcp-handshake-congestion",
    title: "TCP 3-Way Handshake & Congestion Control",
    contentMd: [
      "# TCP Connection & Congestion Control",
      "",
      "## 3-Way Handshake",
      "1. Client sends `SYN` with initial sequence number `x`.",
      "2. Server replies `SYN-ACK` with `seq = y`, `ack = x + 1`.",
      "3. Client completes with `ACK` (`ack = y + 1`).",
      "",
      "## Congestion Control Phases",
      "- **Slow Start:** `cwnd` doubles every RTT until `ssthresh`.",
      "- **Congestion Avoidance:** Additive increase (`+1 MSS` per RTT).",
      "- **Fast Retransmit / Recovery:** 3 duplicate ACKs halve `ssthresh` instead of resetting `cwnd` to 1 MSS.",
    ].join("\n"),
    updatedOffsetHours: 52,
    topicLinks: [
      { subjectCode: "CSIT-501", unitOrder: 4, topicOrder: 3 },
      { subjectCode: "CSIT-501", unitOrder: 4, topicOrder: 4 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ipv4-subnetting-cidr",
    title: "IPv4 Subnetting & CIDR Cheat Sheet",
    contentMd: [
      "# IPv4 Subnetting & CIDR",
      "",
      "- Usable hosts in `/n` subnet = `2^(32 - n) - 2` (subtract network ID and broadcast address).",
      "- Block size in the interesting octet = `256 - mask_octet`.",
      "- **VLSM:** Always allocate subnets from largest host requirement down to smallest to avoid address overlap.",
      "- **CIDR supernetting:** Aggregate contiguous blocks whose count is a power of 2 and whose starting address is divisible by the block size.",
    ].join("\n"),
    updatedOffsetHours: 78,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 3, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-nfa-to-dfa-subset",
    title: "NFA to DFA Subset Construction",
    contentMd: [
      "# Subset Construction (NFA to DFA)",
      "",
      "1. Start DFA state is `epsilon-closure(q0)`.",
      "2. For each unmarked DFA state `S` and input symbol `a`, compute `T = epsilon-closure(move(S, a))`.",
      "3. Add `T` as a new DFA state if unseen, and record transition `delta(S, a) = T`.",
      "4. Any DFA state containing at least one NFA final state is an accepting state.",
      "5. Minimize the resulting DFA using partition refinement (Myhill-Nerode equivalence classes).",
    ].join("\n"),
    updatedOffsetHours: 120,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 1, topicOrder: 4 }],
    noteLinks: [],
  },
];
