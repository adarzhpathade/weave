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
  // --- Computer Networks (CSIT-501): 11 new notes ---
  {
    key: "demo-note-cn-topologies-osi-tcpip",
    title: "OSI vs TCP/IP & Network Topologies",
    contentMd: [
      "# OSI vs TCP/IP & Network Topologies",
      "",
      "- **Topologies:** Mesh offers `n(n-1)/2` links (highest fault tolerance); Star relies on a central switch; Bus and Ring are mostly legacy.",
      "- **OSI (7 layers):** Physical, Data Link, Network, Transport, Session, Presentation, Application.",
      "- **TCP/IP (4 layers):** Network Access, Internet, Transport, Application (combines Session + Presentation into Application).",
      "- **Exam tip:** Always mention encapsulation units — Frame (L2), Packet (L3), Segment/Datagram (L4).",
    ].join("\n"),
    updatedOffsetHours: 640,
    topicLinks: [
      { subjectCode: "CSIT-501", unitOrder: 1, topicOrder: 1 },
      { subjectCode: "CSIT-501", unitOrder: 1, topicOrder: 2 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-transmission-media-devices",
    title: "Transmission Media & Network Devices",
    contentMd: [
      "# Transmission Media & Network Devices",
      "",
      "- **Guided media:** Twisted pair (UTP Cat6 up to 10 Gbps), Coaxial, Optical fiber (single-mode for long-haul, multi-mode for campus LAN).",
      "- **Unguided:** Radio waves (omnidirectional), Microwaves (line-of-sight), Infrared (short-range).",
      "- **Layer mapping:** Hub/Repeater = L1 (broadcasts everywhere), Switch/Bridge = L2 (uses MAC table), Router = L3 (IP routing), Gateway = L4-L7.",
    ].join("\n"),
    updatedOffsetHours: 590,
    topicLinks: [
      { subjectCode: "CSIT-501", unitOrder: 1, topicOrder: 3 },
      { subjectCode: "CSIT-501", unitOrder: 1, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-crc-hamming-error-control",
    title: "CRC & Hamming Code Error Control",
    contentMd: [
      "# Error Detection & Correction",
      "",
      "- **CRC (Cyclic Redundancy Check):** Append `r` zeros (where `r = degree of generator G(x)`), divide by `G(x)` using XOR (modulo-2), append remainder.",
      "- **Hamming Code:** Parity bits sit at powers of 2 (`1, 2, 4, 8...`). Minimum `r` satisfies `2^r >= m + r + 1`.",
      "- **Exam tip:** Hamming distance `d_min >= 2t + 1` corrects `t` errors; `d_min >= s + 1` detects `s` errors.",
    ].join("\n"),
    updatedOffsetHours: 480,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 2, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-sliding-window-gbn-sr",
    title: "Sliding Window: Go-Back-N vs Selective Repeat",
    contentMd: [
      "# Go-Back-N vs Selective Repeat",
      "",
      "- **Stop-and-Wait:** Efficiency `eta = 1 / (1 + 2a)`, where `a = T_prop / T_trans`.",
      "- **Go-Back-N (GBN):** Sender window `W_s <= 2^k - 1`, receiver window `W_r = 1`. One lost frame triggers retransmission of all subsequent frames.",
      "- **Selective Repeat (SR):** `W_s = W_r <= 2^(k-1)`. Receiver buffers out-of-order frames and sends NAK for only the missing frame.",
    ].join("\n"),
    updatedOffsetHours: 430,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 2, topicOrder: 3 }],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-mac-csma-ethernet-wifi",
    title: "CSMA/CD, CSMA/CA & IEEE 802.3/802.11",
    contentMd: [
      "# MAC Protocols: Ethernet vs Wi-Fi",
      "",
      "- **Pure ALOHA:** `S_max = 1 / (2e) ~ 18.4%`; **Slotted ALOHA:** `S_max = 1 / e ~ 36.8%`.",
      "- **CSMA/CD (802.3 Ethernet):** Detects collisions on wire; minimum frame size requires `T_trans >= 2 * T_prop`.",
      "- **CSMA/CA (802.11 Wi-Fi):** Avoids collisions using DIFS, SIFS, and **RTS/CTS** to solve the hidden terminal problem.",
    ].join("\n"),
    updatedOffsetHours: 375,
    topicLinks: [
      { subjectCode: "CSIT-501", unitOrder: 2, topicOrder: 4 },
      { subjectCode: "CSIT-501", unitOrder: 2, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-ip-nat-arp-dhcp",
    title: "ARP, ICMP, NAT & DHCP Flow",
    contentMd: [
      "# ARP, ICMP, NAT & DHCP",
      "",
      "- **ARP:** Broadcasts IP -> receives unicast MAC reply. **RARP** (legacy) mapped MAC -> IP.",
      "- **DHCP (DORA):** Discover (broadcast) -> Offer -> Request -> Acknowledge. Assigns IP, mask, gateway, and DNS.",
      "- **NAT / PAT:** Translates private RFC 1918 IPs (`10.0.0.0/8`, `192.168.0.0/16`) to public IPs using port mapping.",
    ].join("\n"),
    updatedOffsetHours: 295,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 3, topicOrder: 3 }],
    noteLinks: ["demo-note-ipv4-subnetting-cidr"],
  },
  {
    key: "demo-note-cn-routing-algorithms",
    title: "Distance Vector vs Link State Routing",
    contentMd: [
      "# Distance Vector vs Link State",
      "",
      "- **Distance Vector (Bellman-Ford):** Routers share full routing tables with neighbors; suffers from **count-to-infinity** (mitigated by split horizon + poison reverse).",
      "- **Link State (Dijkstra):** Every router floods LSPs to build a complete topology graph and computes shortest path tree locally.",
      "- **Path Vector:** Used between Autonomous Systems to prevent loops via full AS-path tracking.",
    ].join("\n"),
    updatedOffsetHours: 245,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 3, topicOrder: 4 }],
    noteLinks: ["demo-note-tcp-handshake-congestion"],
  },
  {
    key: "demo-note-cn-rip-ospf-bgp",
    title: "RIP, OSPF & BGP Comparison",
    contentMd: [
      "# Interior vs Exterior Routing Protocols",
      "",
      "- **RIP:** Distance vector, metric = hop count (max 15, 16 = unreachable), updates every 30s over UDP port 520.",
      "- **OSPF:** Link state, metric = cost (inversely proportional to bandwidth), divides AS into areas (Area 0 backbone), runs over IP proto 89.",
      "- **BGP:** Path vector (EGP) over **TCP port 179**; policy-driven routing between ISPs.",
    ].join("\n"),
    updatedOffsetHours: 198,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 3, topicOrder: 5 }],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-udp-header-usecases",
    title: "UDP Header & Real-Time Use Cases",
    contentMd: [
      "# UDP Header & Use Cases",
      "",
      "- **Fixed 8-byte header:** Source Port (16b), Dest Port (16b), Length (16b), Checksum (16b).",
      "- **Connectionless & unreliable:** No handshake, no ACKs, no congestion control — minimal latency overhead.",
      "- **Where it shines:** DNS lookups, DHCP, SNMP, VoIP, and live video streaming where late packets are useless.",
    ].join("\n"),
    updatedOffsetHours: 155,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 4, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-dns-hierarchy-resolution",
    title: "DNS Hierarchy & Iterative vs Recursive",
    contentMd: [
      "# DNS Resolution Notes",
      "",
      "- **Hierarchy:** Root (`.`) -> TLD (`.com`, `.edu`) -> Authoritative name server.",
      "- **Recursive query:** Resolver asks local DNS server to do all the work and return the final IP.",
      "- **Iterative query:** Root/TLD servers return a referral to the next server down the tree. **Exam tip:** UDP port 53 for queries, TCP port 53 for zone transfers.",
    ].join("\n"),
    updatedOffsetHours: 108,
    topicLinks: [{ subjectCode: "CSIT-501", unitOrder: 5, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-cn-http-tls-vpn",
    title: "HTTP/HTTPS, TLS Handshake & VPNs",
    contentMd: [
      "# HTTP, TLS & Network Security",
      "",
      "- **HTTP/1.1 vs HTTP/2:** Persistent connections vs binary framing and stream multiplexing over a single TCP connection.",
      "- **TLS 1.3:** Combines asymmetric key exchange (ECDHE) + X.509 certificate verification in 1-RTT, then switches to symmetric AEAD (AES-GCM).",
      "- **Firewalls & VPN:** Stateful firewalls track connection state; IPSec/WireGuard tunnels encrypt L3 packets across untrusted WANs.",
    ].join("\n"),
    updatedOffsetHours: 66,
    topicLinks: [
      { subjectCode: "CSIT-501", unitOrder: 5, topicOrder: 2 },
      { subjectCode: "CSIT-501", unitOrder: 5, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  // --- Operating Systems (CSIT-502): 8 new notes ---
  {
    key: "demo-note-os-kernels-syscalls",
    title: "Kernel Architectures & Dual-Mode System Calls",
    contentMd: [
      "# Kernels & System Calls",
      "",
      "- **Monolithic (Linux):** All OS services run in kernel space; fast IPC via direct calls, larger fault blast radius.",
      "- **Microkernel (Mach/QNX):** Minimal kernel (IPC, scheduling, basic VM); drivers run in user space for isolation.",
      "- **Dual-mode:** Mode bit `0` = kernel mode, `1` = user mode. A `trap` / software interrupt transitions safely into a system call handler.",
    ].join("\n"),
    updatedOffsetHours: 615,
    topicLinks: [
      { subjectCode: "CSIT-502", unitOrder: 1, topicOrder: 2 },
      { subjectCode: "CSIT-502", unitOrder: 1, topicOrder: 3 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-os-pcb-context-switch",
    title: "Process States, PCB & Context Switching",
    contentMd: [
      "# Process States & PCB",
      "",
      "- **5-state model:** New -> Ready -> Running -> Waiting (Blocked) -> Terminated.",
      "- **PCB stores:** PID, program counter, CPU registers, scheduling priority, memory limits, and open file descriptors.",
      "- **Context switch:** Pure overhead — kernel saves old PCB state and loads next PCB state; time depends on hardware register count and TLB flush.",
    ].join("\n"),
    updatedOffsetHours: 510,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 2, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-os-threads-models",
    title: "User vs Kernel Threads & Mapping Models",
    contentMd: [
      "# Multithreading Models",
      "",
      "- **User threads:** Managed by user-level library; fast creation/switching, but one blocking syscall blocks the whole process.",
      "- **Kernel threads:** Scheduled directly by the OS; true parallelism on multi-core CPUs.",
      "- **Models:** Many-to-One (no parallelism), One-to-One (Linux/Windows, scales to cores), Many-to-Many (flexible pool).",
    ].join("\n"),
    updatedOffsetHours: 390,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 2, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-os-critical-section-semaphores",
    title: "Critical Section, Peterson's & Semaphores",
    contentMd: [
      "# Synchronization Primitives",
      "",
      "- **3 requirements:** Mutual Exclusion, Progress, Bounded Waiting.",
      "- **Peterson's solution:** Uses `flag[2]` and `turn` for 2 processes; assumes atomic loads/stores.",
      "- **Semaphores:** `wait(S)` decrements, `signal(S)` increments. Binary semaphore (`0/1`) acts like a mutex; counting semaphore manages `N` identical resources.",
    ].join("\n"),
    updatedOffsetHours: 270,
    topicLinks: [
      { subjectCode: "CSIT-502", unitOrder: 3, topicOrder: 1 },
      { subjectCode: "CSIT-502", unitOrder: 3, topicOrder: 2 },
    ],
    noteLinks: ["demo-note-deadlock-prevention-avoidance"],
  },
  {
    key: "demo-note-os-paging-tlb",
    title: "Paging, Page Tables & TLB Hit Ratio",
    contentMd: [
      "# Paging & TLB",
      "",
      "- Logical address `(p, d)` splits into page number `p` and offset `d`; frame number `f` replaces `p` to form physical address.",
      "- **Effective Access Time (EAT):** `EAT = h * (T_tlb + T_mem) + (1 - h) * (T_tlb + 2 * T_mem)` for a single-level page table.",
      "- **Exam tip:** Paging eliminates external fragmentation completely; only the last page has internal fragmentation (avg `page_size / 2`).",
    ].join("\n"),
    updatedOffsetHours: 185,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 4, topicOrder: 2 }],
    noteLinks: ["demo-note-os-demand-paging-lru"],
  },
  {
    key: "demo-note-os-demand-paging-lru",
    title: "Demand Paging & Page Fault Handling",
    contentMd: [
      "# Virtual Memory & Demand Paging",
      "",
      "- Pages are loaded into RAM only when referenced; invalid/absent bit triggers a **page fault trap**.",
      "- **Page fault steps:** Trap to OS -> check PCB -> find free frame (or evict) -> disk read -> update page table -> restart instruction.",
      "- **Belady's Anomaly:** More frames can cause *more* page faults in **FIFO**, never in stack algorithms like **LRU** or **Optimal**.",
    ].join("\n"),
    updatedOffsetHours: 140,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 4, topicOrder: 4 }],
    noteLinks: [],
  },
  {
    key: "demo-note-os-page-replacement-thrashing",
    title: "FIFO, Optimal & LRU + Thrashing",
    contentMd: [
      "# Page Replacement & Thrashing",
      "",
      "- **Optimal (OPT):** Evicts page unused longest in the future (theoretical benchmark).",
      "- **LRU:** Evicts least recently used page; approximated in hardware via reference bits / Clock algorithm.",
      "- **Thrashing:** Process spends more time paging than executing when working set exceeds allocated frames; fixed by **Working-Set Model** or PFF.",
    ].join("\n"),
    updatedOffsetHours: 92,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 4, topicOrder: 5 }],
    noteLinks: [],
  },
  {
    key: "demo-note-os-disk-scheduling",
    title: "Disk Scheduling: SSTF, SCAN & C-SCAN",
    contentMd: [
      "# Disk Scheduling Algorithms",
      "",
      "- **FCFS:** Fair, no starvation, but high total head movement.",
      "- **SSTF:** Picks closest cylinder next; reduces seek time but can starve outer tracks.",
      "- **SCAN (Elevator) vs C-SCAN:** SCAN sweeps end-to-end reversing direction; **C-SCAN** jumps back to 0 without servicing on return for uniform wait times.",
    ].join("\n"),
    updatedOffsetHours: 40,
    topicLinks: [{ subjectCode: "CSIT-502", unitOrder: 5, topicOrder: 4 }],
    noteLinks: [],
  },
  // --- Theory of Computation (CSIT-503A): 6 new notes ---
  {
    key: "demo-note-toc-dfa-design-tips",
    title: "DFA Design Patterns & Divisibility Tricks",
    contentMd: [
      "# DFA Design Notes",
      "",
      "- **5-tuple:** `M = (Q, Sigma, delta, q0, F)` where `delta: Q x Sigma -> Q` is total and deterministic.",
      "- **Divisibility by k:** Use `k` states representing remainders `0..k-1`; on reading bit `b`, next state = `(2 * rem + b) mod k`.",
      "- **Exam tip:** Always check dead/trap states when a prefix violates the pattern (e.g., \"does not contain `01`\").",
    ].join("\n"),
    updatedOffsetHours: 675,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 1, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-toc-thompson-regex-nfa",
    title: "Thompson's Construction: Regex to Epsilon-NFA",
    contentMd: [
      "# Thompson's Construction",
      "",
      "- **Base:** Single symbol `a` -> 2 states with `a`-transition.",
      "- **Union (`R1 + R2`):** New start & accept states connected via `epsilon` branches to `N(R1)` and `N(R2)`.",
      "- **Kleene Star (`R*`):** `epsilon` loop from accept back to start of `N(R)` plus `epsilon` bypass from new start to new accept.",
    ].join("\n"),
    updatedOffsetHours: 540,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 2, topicOrder: 3 }],
    noteLinks: ["demo-note-nfa-to-dfa-subset"],
  },
  {
    key: "demo-note-toc-pumping-lemma-regular",
    title: "Pumping Lemma for Regular Languages",
    contentMd: [
      "# Pumping Lemma (Regular Languages)",
      "",
      "- Used **only to prove a language is NOT regular** (proof by contradiction).",
      "- Pick `w in L` with `|w| >= p`. Any split `w = xyz` with `|xy| <= p` and `|y| >= 1` must satisfy `xy^i z in L` for all `i >= 0`.",
      "- **Classic non-regular examples:** `{0^n 1^n}`, `{ww | w in {a,b}*}`, `{a^(n^2)}`. Choose `i = 0` or `i = 2` to break membership.",
    ].join("\n"),
    updatedOffsetHours: 410,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 2, topicOrder: 4 }],
    noteLinks: [],
  },
  {
    key: "demo-note-toc-cfg-simplification-cnf",
    title: "CFG Simplification & Chomsky Normal Form",
    contentMd: [
      "# CFG Simplification & CNF",
      "",
      "- **Simplification order matters:** (1) Remove null (`epsilon`) productions, (2) Remove unit productions (`A -> B`), (3) Remove useless symbols (non-generating first, then unreachable).",
      "- **CNF rules:** Every production must be `A -> BC` (two non-terminals) or `A -> a` (single terminal), plus `S -> epsilon` only if `epsilon in L`.",
      "- **Exam tip:** Replace terminals in mixed RHS with fresh variables `T_a -> a`, then binarize long chains.",
    ].join("\n"),
    updatedOffsetHours: 280,
    topicLinks: [
      { subjectCode: "CSIT-503A", unitOrder: 3, topicOrder: 3 },
      { subjectCode: "CSIT-503A", unitOrder: 3, topicOrder: 4 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-toc-pda-basics",
    title: "Pushdown Automata (PDA) Formal Model",
    contentMd: [
      "# Pushdown Automata (PDA)",
      "",
      "- Adds an unbounded **LIFO stack** to an NFA: `delta: Q x (Sigma U {epsilon}) x Gamma -> P(Q x Gamma*)`.",
      "- **Acceptance modes:** Final State (`F`) and Empty Stack (`N(M)`) are equivalent in power for NPDA.",
      "- **Note:** DPDA is strictly weaker than NPDA (e.g., even-length palindromes `{ww^R}` require NPDA).",
    ].join("\n"),
    updatedOffsetHours: 175,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 4, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-toc-halting-undecidability",
    title: "Halting Problem & Undecidability Notes",
    contentMd: [
      "# Halting Problem & Undecidability",
      "",
      "- **Halting Problem (`HALT_TM`):** Undecidable — proved by **diagonalization** (constructing a paradoxical machine `D` that flips `H(<M, M>)`).",
      "- `HALT_TM` is **Turing-recognizable (RE)** because we can simulate `M(w)`, but **not Turing-decidable (Recursive)**.",
      "- **Post Correspondence Problem (PCP):** Classic undecidable problem over strings, often used in reductions.",
    ].join("\n"),
    updatedOffsetHours: 88,
    topicLinks: [{ subjectCode: "CSIT-503A", unitOrder: 5, topicOrder: 4 }],
    noteLinks: [],
  },
  // --- Artificial Intelligence (CSIT-504B): 15 new notes ---
  {
    key: "demo-note-ai-agents-peas",
    title: "Intelligent Agents, PEAS & Architectures",
    contentMd: [
      "# Agents, PEAS & Architectures",
      "",
      "- **PEAS:** Performance measure, Environment, Actuators, Sensors (always define all 4 in 7-mark questions).",
      "- **Environment axes:** Fully vs Partially observable, Deterministic vs Stochastic, Episodic vs Sequential, Static vs Dynamic.",
      "- **Agent hierarchy:** Simple Reflex -> Model-Based -> Goal-Based -> Utility-Based (handles trade-offs) -> Learning Agent.",
    ].join("\n"),
    updatedOffsetHours: 700,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 1, topicOrder: 2 },
      { subjectCode: "CSIT-504B", unitOrder: 1, topicOrder: 3 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-state-space-production",
    title: "State-Space Formulation & Production Systems",
    contentMd: [
      "# Problem Formulation & Production Systems",
      "",
      "- **5 components of a search problem:** Initial state, Actions, Transition model `RESULT(s, a)`, Goal test, Path cost.",
      "- **Production system:** Set of `condition -> action` rules + Working Memory + Conflict Resolution strategy.",
      "- **Exam tip:** Classic examples to sketch: 8-puzzle (branching factor ~3) and Water Jug problem.",
    ].join("\n"),
    updatedOffsetHours: 655,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 1, topicOrder: 4 },
      { subjectCode: "CSIT-504B", unitOrder: 1, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-uninformed-search",
    title: "Uninformed Search: BFS, DFS, IDS & UCS",
    contentMd: [
      "# Uninformed Search Comparison",
      "",
      "- **BFS:** Complete & optimal (unit step cost), `O(b^d)` time and **space** (memory bottleneck).",
      "- **DFS:** `O(b*m)` space, not complete in infinite/cyclic spaces, not optimal.",
      "- **Iterative Deepening (IDS):** Combines DFS's `O(b*d)` space with BFS's completeness and optimality.",
      "- **Uniform Cost Search (UCS):** Expands lowest `g(n)`; optimal for arbitrary positive step costs.",
    ].join("\n"),
    updatedOffsetHours: 560,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 2, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-a-star-heuristics",
    title: "A* Search & Admissible Heuristics",
    contentMd: [
      "# A* Search & Heuristics",
      "",
      "- Evaluation function: `f(n) = g(n) + h(n)` (actual cost so far + estimated cost to goal).",
      "- **Admissibility:** `0 <= h(n) <= h*(n)` (never overestimates) guarantees A* tree-search optimality.",
      "- **Consistency (monotonicity):** `h(n) <= c(n, a, n') + h(n')` guarantees optimality for graph search. For 8-puzzle, Manhattan distance dominates Misplaced Tiles.",
    ].join("\n"),
    updatedOffsetHours: 495,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 2, topicOrder: 2 }],
    noteLinks: ["demo-note-ai-uninformed-search"],
  },
  {
    key: "demo-note-ai-local-search-csp",
    title: "Local Search & CSP Backtracking",
    contentMd: [
      "# Local Search & CSPs",
      "",
      "- **Hill Climbing:** Gets stuck at local maxima, ridges, and plateaus; **Simulated Annealing** escapes using acceptance probability `exp(-deltaE / T)`.",
      "- **CSPs:** Variables `X`, Domains `D`, Constraints `C`. Use **MRV** (Minimum Remaining Values) + **Degree heuristic** + **Forward Checking**.",
      "- **AC-3 (Arc Consistency):** Prunes domain values that have no supporting value in a neighboring variable.",
    ].join("\n"),
    updatedOffsetHours: 445,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 2, topicOrder: 3 },
      { subjectCode: "CSIT-504B", unitOrder: 2, topicOrder: 4 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-minimax-alpha-beta",
    title: "Minimax & Alpha-Beta Pruning Trace",
    contentMd: [
      "# Adversarial Search: Minimax & Alpha-Beta",
      "",
      "- **Minimax:** `O(b^m)` time; MAX maximizes utility, MIN minimizes it.",
      "- **Alpha-Beta Pruning:** `alpha` = best already-explored option for MAX; `beta` = best for MIN. Prune whenever `alpha >= beta`.",
      "- **Exam tip:** Good move ordering reduces effective complexity from `O(b^m)` down to `O(b^(m/2))` (doubles searchable depth).",
    ].join("\n"),
    updatedOffsetHours: 360,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 2, topicOrder: 5 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-propositional-fol",
    title: "Propositional vs First-Order Logic (FOL)",
    contentMd: [
      "# Propositional Logic & FOL",
      "",
      "- **Propositional:** Atomic facts (`P, Q`) with connectives; cannot express relations over objects concisely.",
      "- **FOL:** Adds Constants, Variables, Predicates (`Likes(x, y)`), Functions, and Quantifiers (`forall`, `exists`).",
      "- **Skolemization:** Eliminates existential quantifiers (`exists x`) by introducing Skolem constants or functions of outer universal variables.",
    ].join("\n"),
    updatedOffsetHours: 315,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 3, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-unification-resolution",
    title: "Unification, Resolution & Chaining",
    contentMd: [
      "# Inference in FOL",
      "",
      "- **Unification:** Finds Most General Unifier (MGU) `theta` such that `Subst(theta, p) = Subst(theta, q)` (check **occurs check**).",
      "- **Resolution Refutation:** Convert KB + `~Goal` to CNF, resolve complementary literals until empty clause `[]` is derived.",
      "- **Forward Chaining:** Data-driven (good for monitoring); **Backward Chaining:** Goal-driven (used in Prolog).",
    ].join("\n"),
    updatedOffsetHours: 260,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 3, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-semantic-nets-strips",
    title: "Semantic Networks, Frames & STRIPS Planning",
    contentMd: [
      "# Structured KR & Classical Planning",
      "",
      "- **Semantic Networks:** Graph of nodes (objects/concepts) and labeled arcs (`is-a`, `has-part`) supporting property inheritance.",
      "- **Frames:** Object-like records with **slots**, **fillers**, and attached procedural daemons (`if-needed`, `if-added`).",
      "- **STRIPS:** Represents actions via `Preconditions`, `Add list`, and `Delete list` (avoids the frame problem).",
    ].join("\n"),
    updatedOffsetHours: 210,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 3, topicOrder: 3 },
      { subjectCode: "CSIT-504B", unitOrder: 3, topicOrder: 5 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-bayes-belief-networks",
    title: "Bayes' Rule & Bayesian Belief Networks",
    contentMd: [
      "# Probabilistic Reasoning & BBNs",
      "",
      "- **Bayes' Rule:** `P(H | E) = P(E | H) * P(H) / P(E)`.",
      "- **Bayesian Network:** DAG where each node stores a Conditional Probability Table (CPT) `P(X_i | Parents(X_i))`.",
      "- **Joint distribution:** `P(x1..xn) = prod_i P(x_i | parents(X_i))` — exploits conditional independence to shrink parameter count exponentially.",
    ].join("\n"),
    updatedOffsetHours: 165,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 4, topicOrder: 1 },
      { subjectCode: "CSIT-504B", unitOrder: 4, topicOrder: 2 },
    ],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-fuzzy-logic",
    title: "Fuzzy Sets & Fuzzy Inference Systems",
    contentMd: [
      "# Fuzzy Logic Basics",
      "",
      "- Unlike crisp sets (`{0, 1}`), fuzzy membership `mu_A(x) in [0, 1]` captures partial truth.",
      "- **Fuzzy operations:** `mu_(A U B) = max(mu_A, mu_B)`, `mu_(A n B) = min(mu_A, mu_B)`, `mu_(~A) = 1 - mu_A`.",
      "- **Mamdani FIS pipeline:** Fuzzification -> Rule Evaluation -> Aggregation -> **Defuzzification** (Centroid / Center of Gravity method).",
    ].join("\n"),
    updatedOffsetHours: 130,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 4, topicOrder: 4 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-mdp-value-iteration",
    title: "Markov Decision Processes & Value Iteration",
    contentMd: [
      "# MDPs & Bellman Equation",
      "",
      "- **MDP tuple:** `(S, A, P(s' | s, a), R(s, a, s'), gamma)` where `gamma in [0, 1)` is the discount factor.",
      "- **Bellman optimality:** `U(s) = R(s) + gamma * max_a sum_{s'} P(s' | s, a) * U(s')`.",
      "- **Value Iteration** updates utilities until convergence; **Policy Iteration** alternates policy evaluation and greedy policy improvement.",
    ].join("\n"),
    updatedOffsetHours: 98,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 4, topicOrder: 5 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-ml-paradigms",
    title: "Supervised, Unsupervised & Reinforcement Learning",
    contentMd: [
      "# Machine Learning Paradigms",
      "",
      "- **Supervised:** Labeled `(x, y)` pairs — Classification (discrete) & Regression (continuous).",
      "- **Unsupervised:** Unlabeled `x` — Clustering (K-Means) & Dimensionality Reduction (PCA).",
      "- **Reinforcement Learning:** Agent learns a policy `pi(s)` from delayed scalar rewards via exploration vs exploitation.",
    ].join("\n"),
    updatedOffsetHours: 60,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 5, topicOrder: 1 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-decision-trees-ann",
    title: "Decision Trees (ID3) & Neural Networks",
    contentMd: [
      "# Decision Trees & ANN Basics",
      "",
      "- **Entropy:** `H(S) = -sum p_i log2(p_i)`. **Information Gain** picks the attribute that maximizes entropy reduction.",
      "- **Perceptron:** `y = activation(w . x + b)`; single-layer perceptron can only solve linearly separable problems (fails XOR).",
      "- **MLP + Backprop:** Hidden layers with non-linear activations (`ReLU`, `sigmoid`) learn non-linear decision boundaries.",
    ].join("\n"),
    updatedOffsetHours: 34,
    topicLinks: [{ subjectCode: "CSIT-504B", unitOrder: 5, topicOrder: 2 }],
    noteLinks: [],
  },
  {
    key: "demo-note-ai-nlp-expert-systems",
    title: "NLP Pipeline & Expert System Architecture",
    contentMd: [
      "# NLP & Expert Systems",
      "",
      "- **NLP Pipeline:** Tokenization -> Lemmatization/Stemming -> POS Tagging -> Syntactic Parsing -> Semantic & Pragmatic Analysis.",
      "- **Expert System components:** Knowledge Base (facts + IF-THEN rules), Inference Engine, Working Memory, Explanation Facility, Knowledge Acquisition module.",
      "- **Classic examples:** MYCIN (medical diagnosis, used certainty factors) and DENDRAL.",
    ].join("\n"),
    updatedOffsetHours: 14,
    topicLinks: [
      { subjectCode: "CSIT-504B", unitOrder: 5, topicOrder: 3 },
      { subjectCode: "CSIT-504B", unitOrder: 5, topicOrder: 4 },
    ],
    noteLinks: [],
  },
];
