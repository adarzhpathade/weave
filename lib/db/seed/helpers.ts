import { createHash } from "node:crypto";

const SEED_NAMESPACE = "weave-csit-seed-v1";

/**
 * Deterministic RFC 4122-shaped UUID derived from a stable key so seed runs
 * are repeatable and idempotent across environments.
 */
export function seedUuid(key: string): string {
  const hash = createHash("sha256").update(`${SEED_NAMESPACE}:${key}`).digest();
  // Set version 5 (0101) and RFC 4122 variant (10xx).
  hash[6] = (hash[6]! & 0x0f) | 0x50;
  hash[8] = (hash[8]! & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Deterministic PRNG (Mulberry32) for reproducible student/mark distributions. */
export function createPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function countWords(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_~`[\]()|-]/g, " ")
    .trim();
  if (!plain) {
    return 0;
  }
  return plain.split(/\s+/).filter(Boolean).length;
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Guardrail: refuse to seed a production environment or a URL that looks like a
 * production branch/database.
 */
export function assertSafeToSeed(databaseUrl: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run db:seed with NODE_ENV=production.");
  }
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Refusing to run db:seed with VERCEL_ENV=production.");
  }
  if (process.env.NEON_BRANCH?.toLowerCase() === "production") {
    throw new Error("Refusing to run db:seed on NEON_BRANCH=production.");
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("Invalid DATABASE_URL / DATABASE_URL_UNPOOLED for db:seed.");
  }

  const host = parsed.hostname.toLowerCase();
  const dbPath = parsed.pathname.toLowerCase();
  const prodPattern = /(^|[-._/])prod(uction)?([-._/]|$)/i;

  if (prodPattern.test(host) || prodPattern.test(dbPath)) {
    throw new Error(
      `Refusing to run db:seed against a production-looking database (${parsed.hostname}${parsed.pathname}).`,
    );
  }
}

export const SUBJECT_COLOR_TOKENS = [
  "subject-1",
  "subject-2",
  "subject-3",
  "subject-4",
  "subject-5",
  "subject-6",
] as const;

export type SeedDivisionSpec = {
  key: string;
  programCode: "CSIT" | "CY";
  name: "CSIT-1" | "CSIT-2" | "CY";
  admissionYear: number;
  currentSemester: 3 | 5 | 7;
  branchEnrollCode: "CI" | "CY";
  enrollStart: number;
};

export const SEED_DIVISIONS: readonly SeedDivisionSpec[] = [
  // 2nd year (Sem 3)
  {
    key: "CSIT-1:2025",
    programCode: "CSIT",
    name: "CSIT-1",
    admissionYear: 2025,
    currentSemester: 3,
    branchEnrollCode: "CI",
    enrollStart: 1001,
  },
  {
    key: "CSIT-2:2025",
    programCode: "CSIT",
    name: "CSIT-2",
    admissionYear: 2025,
    currentSemester: 3,
    branchEnrollCode: "CI",
    enrollStart: 1031,
  },
  {
    key: "CY:2025",
    programCode: "CY",
    name: "CY",
    admissionYear: 2025,
    currentSemester: 3,
    branchEnrollCode: "CY",
    enrollStart: 1001,
  },
  // 3rd year (Sem 5)
  {
    key: "CSIT-1:2024",
    programCode: "CSIT",
    name: "CSIT-1",
    admissionYear: 2024,
    currentSemester: 5,
    branchEnrollCode: "CI",
    enrollStart: 1001,
  },
  {
    key: "CSIT-2:2024",
    programCode: "CSIT",
    name: "CSIT-2",
    admissionYear: 2024,
    currentSemester: 5,
    branchEnrollCode: "CI",
    enrollStart: 1031,
  },
  {
    key: "CY:2024",
    programCode: "CY",
    name: "CY",
    admissionYear: 2024,
    currentSemester: 5,
    branchEnrollCode: "CY",
    enrollStart: 1001,
  },
  // 4th year (Sem 7)
  {
    key: "CSIT-1:2023",
    programCode: "CSIT",
    name: "CSIT-1",
    admissionYear: 2023,
    currentSemester: 7,
    branchEnrollCode: "CI",
    enrollStart: 1001,
  },
  {
    key: "CSIT-2:2023",
    programCode: "CSIT",
    name: "CSIT-2",
    admissionYear: 2023,
    currentSemester: 7,
    branchEnrollCode: "CI",
    enrollStart: 1031,
  },
  {
    key: "CY:2023",
    programCode: "CY",
    name: "CY",
    admissionYear: 2023,
    currentSemester: 7,
    branchEnrollCode: "CY",
    enrollStart: 1001,
  },
];

// 32 first names x 32 last names = 1,024 unique pairs (well above 270 students).
const FIRST_NAMES = [
  "Aarav",
  "Aditi",
  "Akshay",
  "Ananya",
  "Arjun",
  "Ayush",
  "Bhavna",
  "Devansh",
  "Diya",
  "Gaurav",
  "Harsh",
  "Ishita",
  "Kabir",
  "Kavya",
  "Kunal",
  "Meera",
  "Nikhil",
  "Nisha",
  "Pranav",
  "Priya",
  "Raghav",
  "Riya",
  "Rohan",
  "Sakshi",
  "Siddharth",
  "Sneha",
  "Tanvi",
  "Utkarsh",
  "Varun",
  "Vanshika",
  "Yash",
  "Zoya",
] as const;

const LAST_NAMES = [
  "Agarwal",
  "Bansal",
  "Chauhan",
  "Deshmukh",
  "Dubey",
  "Garg",
  "Gupta",
  "Jain",
  "Joshi",
  "Kapoor",
  "Khandelwal",
  "Kulkarni",
  "Malhotra",
  "Mehta",
  "Mishra",
  "Nair",
  "Pandey",
  "Patel",
  "Pawar",
  "Rathore",
  "Saxena",
  "Sen",
  "Sharma",
  "Shrivastava",
  "Shukla",
  "Singh",
  "Soni",
  "Tiwari",
  "Tripathi",
  "Upadhyay",
  "Verma",
  "Yadav",
] as const;

export const DEMO_DIVISION_KEY = "CSIT-2:2024";
export const DEMO_STUDENT_ENROLLMENT_NO = "0827CI241031";
export const DEMO_STUDENT_FALLBACK_EMAIL = "aarav.sharma@college.ac.in";
export const DEMO_STUDENT_NAME = "Aarav Sharma";

export type SeedStudentInput = {
  divisionKey: string;
  enrollmentNo: string;
  fullName: string;
  email: string;
  isDemoPrimary: boolean;
  isDemoSecondary: boolean;
};

/**
 * Builds 30 deterministic students per division (270 total) with unique Indian
 * names, unique RGPV-format enrollment numbers (e.g. 0827CI231001), and unique
 * college emails. Slot 0 of CSIT-2 (sem 5) is reserved for Aarav Sharma.
 */
export function buildSeedStudents(demoStudentEmail?: string): SeedStudentInput[] {
  const normalizedDemoEmail = demoStudentEmail?.trim().toLowerCase() || DEMO_STUDENT_FALLBACK_EMAIL;

  // Pre-build a deterministic shuffled pool of unique full names excluding Aarav Sharma.
  const namePool: Array<{ first: string; last: string }> = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) {
      if (first === "Aarav" && last === "Sharma") {
        continue;
      }
      namePool.push({ first, last });
    }
  }

  const rand = createPrng(20261124);
  for (let i = namePool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = namePool[i]!;
    namePool[i] = namePool[j]!;
    namePool[j] = tmp;
  }

  let poolCursor = 0;
  const usedEmails = new Set<string>([normalizedDemoEmail]);
  const students: SeedStudentInput[] = [];

  for (const division of SEED_DIVISIONS) {
    const yy = String(division.admissionYear).slice(-2);

    for (let idx = 0; idx < 30; idx += 1) {
      const seq = division.enrollStart + idx;
      const enrollmentNo = `0827${division.branchEnrollCode}${yy}${seq}`;

      if (division.key === DEMO_DIVISION_KEY && idx === 0) {
        students.push({
          divisionKey: division.key,
          enrollmentNo: DEMO_STUDENT_ENROLLMENT_NO,
          fullName: DEMO_STUDENT_NAME,
          email: normalizedDemoEmail,
          isDemoPrimary: true,
          isDemoSecondary: false,
        });
        continue;
      }

      let candidate = namePool[poolCursor]!;
      poolCursor += 1;
      let email = `${candidate.first.toLowerCase()}.${candidate.last.toLowerCase()}@college.ac.in`;
      while (usedEmails.has(email)) {
        candidate = namePool[poolCursor]!;
        poolCursor += 1;
        email = `${candidate.first.toLowerCase()}.${candidate.last.toLowerCase()}@college.ac.in`;
      }
      usedEmails.add(email);

      // Give two extra fake CSIT-2 sem 5 students demo user accounts (average & behind)
      // while the remaining 27 students per division remain department-list-only.
      const isDemoSecondary = division.key === DEMO_DIVISION_KEY && (idx === 1 || idx === 2);

      students.push({
        divisionKey: division.key,
        enrollmentNo,
        fullName: `${candidate.first} ${candidate.last}`,
        email,
        isDemoPrimary: false,
        isDemoSecondary,
      });
    }
  }

  return students;
}
