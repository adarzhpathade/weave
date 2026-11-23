import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema";
import csitSubjectsRaw from "./data/csit-subjects.json";
import unitsTopicsRaw from "./data/units-topics.json";
import {
  CSIT2_SEM5_ANNOUNCEMENTS,
  CSIT2_SEM5_ASSIGNMENTS,
  DEMO_STUDENT_NOTES,
} from "./demoContent";
import {
  assertSafeToSeed,
  buildSeedStudents,
  chunk,
  countWords,
  createPrng,
  DEMO_DIVISION_KEY,
  DEMO_STUDENT_ENROLLMENT_NO,
  SEED_DIVISIONS,
  seedUuid,
  SUBJECT_COLOR_TOKENS,
} from "./helpers";

loadEnvConfig(process.cwd());

type SyllabusSubjectEntry = {
  code: string;
  name: string;
};

type SyllabusElectiveGroup = {
  code: string;
  kind: "departmental_elective" | "open_elective";
  options: SyllabusSubjectEntry[];
};

type SyllabusSemester = {
  semester: number;
  core: SyllabusSubjectEntry[];
  electiveGroups: SyllabusElectiveGroup[];
};

type CsitSubjectsFile = {
  semesters: SyllabusSemester[];
};

type UnitsTopicsFile = {
  draft: boolean;
  subjects: Record<
    string,
    {
      shortName: string;
      units: Array<{
        title: string;
        topics: string[];
      }>;
    }
  >;
};

const csitSubjects = csitSubjectsRaw as CsitSubjectsFile;
const unitsTopics = unitsTopicsRaw as UnitsTopicsFile;

function offsetDays(base: Date, days: number, hour = 17): Date {
  const date = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function offsetHours(base: Date, hoursBefore: number): Date {
  return new Date(base.getTime() - hoursBefore * 60 * 60 * 1000);
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set.");
  }
  assertSafeToSeed(databaseUrl);

  const db = drizzle({ client: neon(databaseUrl), schema });
  const now = new Date();
  const rand = createPrng(2026112401);

  console.log("Seeding Weave database (idempotent)...");

  // 1. Department: CSIT
  const [department] = await db
    .insert(schema.departments)
    .values({
      id: seedUuid("dept:CSIT"),
      code: "CSIT",
      name: "Computer Science and Information Technology",
    })
    .onConflictDoUpdate({
      target: schema.departments.code,
      set: {
        name: "Computer Science and Information Technology",
        updatedAt: now,
      },
    })
    .returning({ id: schema.departments.id, code: schema.departments.code });

  if (!department) {
    throw new Error("Failed to upsert CSIT department.");
  }

  // 2. Programs: CSIT and CY
  const programRows = await db
    .insert(schema.programs)
    .values([
      {
        id: seedUuid("program:CSIT"),
        departmentId: department.id,
        code: "CSIT",
        name: "B.Tech Computer Science & Information Technology",
      },
      {
        id: seedUuid("program:CY"),
        departmentId: department.id,
        code: "CY",
        name: "B.Tech Cyber Security",
      },
    ])
    .onConflictDoUpdate({
      target: schema.programs.code,
      set: {
        departmentId: sql`excluded.department_id`,
        name: sql`excluded.name`,
        updatedAt: now,
      },
    })
    .returning({ id: schema.programs.id, code: schema.programs.code });

  const programIdByCode = new Map<string, string>(programRows.map((p) => [p.code, p.id]));
  const csitProgramId = programIdByCode.get("CSIT");
  const cyProgramId = programIdByCode.get("CY");
  if (!csitProgramId || !cyProgramId) {
    throw new Error("Failed to resolve CSIT and CY program IDs.");
  }

  // 3. Divisions: CSIT-1, CSIT-2, CY for 2nd (sem 3), 3rd (sem 5), and 4th (sem 7) year
  const divisionValues = SEED_DIVISIONS.map((div) => ({
    id: seedUuid(`division:${div.key}`),
    programId: div.programCode === "CSIT" ? csitProgramId : cyProgramId,
    name: div.name,
    admissionYear: div.admissionYear,
    currentSemester: div.currentSemester,
  }));

  const divisionRows = await db
    .insert(schema.divisions)
    .values(divisionValues)
    .onConflictDoUpdate({
      target: [schema.divisions.programId, schema.divisions.name, schema.divisions.admissionYear],
      set: {
        currentSemester: sql`excluded.current_semester`,
        updatedAt: now,
      },
    })
    .returning({
      id: schema.divisions.id,
      name: schema.divisions.name,
      admissionYear: schema.divisions.admissionYear,
      currentSemester: schema.divisions.currentSemester,
      programId: schema.divisions.programId,
    });

  const divisionByKey = new Map<string, (typeof divisionRows)[number]>(
    divisionRows.map((d) => [`${d.name}:${d.admissionYear}`, d]),
  );

  // 4. Subjects + program_subjects (CY seeded as a copy of the CSIT plan)
  const subjectEntries: Array<{
    code: string;
    name: string;
    shortName: string;
    colorToken: string;
  }> = [];
  const programSubjectPlan: Array<{
    subjectCode: string;
    semester: number;
    order: number;
    kind: "core" | "departmental_elective" | "open_elective";
    electiveGroup: string | null;
  }> = [];

  let colorIdx = 0;
  for (const sem of csitSubjects.semesters) {
    let order = 1;
    for (const core of sem.core) {
      const draft = unitsTopics.subjects[core.code];
      if (!draft) {
        throw new Error(`Missing units/topics draft for subject ${core.code}`);
      }
      subjectEntries.push({
        code: core.code,
        name: core.name,
        shortName: draft.shortName,
        colorToken: SUBJECT_COLOR_TOKENS[colorIdx % SUBJECT_COLOR_TOKENS.length]!,
      });
      colorIdx += 1;

      programSubjectPlan.push({
        subjectCode: core.code,
        semester: sem.semester,
        order,
        kind: "core",
        electiveGroup: null,
      });
      order += 1;
    }

    for (const group of sem.electiveGroups) {
      for (const option of group.options) {
        const draft = unitsTopics.subjects[option.code];
        if (!draft) {
          throw new Error(`Missing units/topics draft for elective ${option.code}`);
        }
        subjectEntries.push({
          code: option.code,
          name: option.name,
          shortName: draft.shortName,
          colorToken: SUBJECT_COLOR_TOKENS[colorIdx % SUBJECT_COLOR_TOKENS.length]!,
        });
        colorIdx += 1;

        programSubjectPlan.push({
          subjectCode: option.code,
          semester: sem.semester,
          order,
          kind: group.kind,
          electiveGroup: group.code,
        });
        order += 1;
      }
    }
  }

  const subjectRows = await db
    .insert(schema.subjects)
    .values(
      subjectEntries.map((s) => ({
        id: seedUuid(`subject:${s.code}`),
        departmentId: department.id,
        code: s.code,
        name: s.name,
        shortName: s.shortName,
        colorToken: s.colorToken,
      })),
    )
    .onConflictDoUpdate({
      target: [schema.subjects.departmentId, schema.subjects.code],
      set: {
        name: sql`excluded.name`,
        shortName: sql`excluded.short_name`,
        colorToken: sql`excluded.color_token`,
        updatedAt: now,
      },
    })
    .returning({ id: schema.subjects.id, code: schema.subjects.code });

  const subjectIdByCode = new Map<string, string>(subjectRows.map((s) => [s.code, s.id]));

  const programSubjectValues = [csitProgramId, cyProgramId].flatMap((programId) => {
    const programLabel = programId === csitProgramId ? "CSIT" : "CY";
    return programSubjectPlan.map((item) => {
      const subjectId = subjectIdByCode.get(item.subjectCode);
      if (!subjectId) {
        throw new Error(`Subject ID not found for ${item.subjectCode}`);
      }
      return {
        id: seedUuid(`program-subject:${programLabel}:${item.subjectCode}`),
        programId,
        subjectId,
        semester: item.semester,
        order: item.order,
        kind: item.kind,
        electiveGroup: item.electiveGroup,
      };
    });
  });

  for (const batch of chunk(programSubjectValues, 50)) {
    await db
      .insert(schema.programSubjects)
      .values(batch)
      .onConflictDoUpdate({
        target: [schema.programSubjects.programId, schema.programSubjects.subjectId],
        set: {
          semester: sql`excluded.semester`,
          order: sql`excluded."order"`,
          kind: sql`excluded.kind`,
          electiveGroup: sql`excluded.elective_group`,
          updatedAt: now,
        },
      });
  }

  // 5. Units and Topics (drafted RGPV 5 units x 5 topics per subject)
  const unitValues: Array<{
    id: string;
    subjectId: string;
    subjectCode: string;
    title: string;
    order: number;
  }> = [];

  for (const entry of subjectEntries) {
    const subjectId = subjectIdByCode.get(entry.code);
    const draft = unitsTopics.subjects[entry.code];
    if (!subjectId || !draft) {
      throw new Error(`Missing subject or draft for ${entry.code}`);
    }
    draft.units.forEach((unit, unitIndex) => {
      const order = unitIndex + 1;
      unitValues.push({
        id: seedUuid(`unit:${entry.code}:${order}`),
        subjectId,
        subjectCode: entry.code,
        title: unit.title,
        order,
      });
    });
  }

  const unitIdByKey = new Map<string, string>();
  const subjectCodeById = new Map<string, string>(subjectRows.map((s) => [s.id, s.code]));
  for (const batch of chunk(unitValues, 50)) {
    const inserted = await db
      .insert(schema.units)
      .values(
        batch.map(({ id, subjectId, title, order }) => ({
          id,
          subjectId,
          title,
          order,
        })),
      )
      .onConflictDoUpdate({
        target: [schema.units.subjectId, schema.units.order],
        set: {
          title: sql`excluded.title`,
          updatedAt: now,
        },
      })
      .returning({
        id: schema.units.id,
        subjectId: schema.units.subjectId,
        order: schema.units.order,
      });

    for (const row of inserted) {
      const code = subjectCodeById.get(row.subjectId);
      if (code) {
        unitIdByKey.set(`${code}:${row.order}`, row.id);
      }
    }
  }

  const topicValues: Array<{
    id: string;
    unitId: string;
    subjectCode: string;
    unitOrder: number;
    title: string;
    order: number;
  }> = [];

  for (const entry of subjectEntries) {
    const draft = unitsTopics.subjects[entry.code]!;
    draft.units.forEach((unit, unitIndex) => {
      const unitOrder = unitIndex + 1;
      const unitId = unitIdByKey.get(`${entry.code}:${unitOrder}`);
      if (!unitId) {
        throw new Error(`Missing unit ID for ${entry.code} unit ${unitOrder}`);
      }
      unit.topics.forEach((topicTitle, topicIndex) => {
        const topicOrder = topicIndex + 1;
        topicValues.push({
          id: seedUuid(`topic:${entry.code}:${unitOrder}:${topicOrder}`),
          unitId,
          subjectCode: entry.code,
          unitOrder,
          title: topicTitle,
          order: topicOrder,
        });
      });
    });
  }

  const topicIdByKey = new Map<string, string>();
  const unitKeyById = new Map<string, string>(
    Array.from(unitIdByKey.entries()).map(([key, id]) => [id, key]),
  );

  for (const batch of chunk(topicValues, 100)) {
    const inserted = await db
      .insert(schema.topics)
      .values(
        batch.map(({ id, unitId, title, order }) => ({
          id,
          unitId,
          title,
          order,
        })),
      )
      .onConflictDoUpdate({
        target: [schema.topics.unitId, schema.topics.order],
        set: {
          title: sql`excluded.title`,
          updatedAt: now,
        },
      })
      .returning({
        id: schema.topics.id,
        unitId: schema.topics.unitId,
        order: schema.topics.order,
      });

    for (const row of inserted) {
      const unitKey = unitKeyById.get(row.unitId);
      if (unitKey) {
        topicIdByKey.set(`${unitKey}:${row.order}`, row.id);
      }
    }
  }

  // 6. Faculty user (used as author/marker for seeded assignments & announcements)
  const [facultyUser] = await db
    .insert(schema.users)
    .values({
      id: seedUuid("user:faculty:dr.rajesh.verma"),
      email: "dr.rajesh.verma@college.ac.in",
      name: "Dr. Rajesh Verma",
      role: "faculty",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: "Dr. Rajesh Verma",
        role: "faculty",
        updatedAt: now,
      },
    })
    .returning({ id: schema.users.id });

  if (!facultyUser) {
    throw new Error("Failed to upsert seeded faculty user.");
  }

  // 7. Students (30 per division across 9 divisions = 270 students) + demo users
  const seedStudentInputs = buildSeedStudents(process.env.DEMO_STUDENT_EMAIL);

  // Preserve an already-linked Neon Auth user_id on the primary demo student if present.
  const existingDemoStudent = await db
    .select({
      id: schema.students.id,
      userId: schema.students.userId,
      email: schema.students.email,
    })
    .from(schema.students)
    .where(eq(schema.students.enrollmentNo, DEMO_STUDENT_ENROLLMENT_NO))
    .limit(1);

  const primaryDemoInput = seedStudentInputs.find((s) => s.isDemoPrimary)!;
  let primaryDemoUserId = existingDemoStudent[0]?.userId ?? null;

  if (!primaryDemoUserId) {
    const [demoUser] = await db
      .insert(schema.users)
      .values({
        id: seedUuid("user:student:demo-primary"),
        email: primaryDemoInput.email,
        name: primaryDemoInput.fullName,
        role: "student",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: primaryDemoInput.fullName,
          updatedAt: now,
        },
      })
      .returning({ id: schema.users.id });

    if (!demoUser) {
      throw new Error("Failed to upsert primary demo user.");
    }
    primaryDemoUserId = demoUser.id;
  }

  const secondaryDemoUserIds = new Map<string, string>();
  for (const secondary of seedStudentInputs.filter((s) => s.isDemoSecondary)) {
    const [u] = await db
      .insert(schema.users)
      .values({
        id: seedUuid(`user:student:${secondary.enrollmentNo}`),
        email: secondary.email,
        name: secondary.fullName,
        role: "student",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: secondary.fullName,
          updatedAt: now,
        },
      })
      .returning({ id: schema.users.id });

    if (u) {
      secondaryDemoUserIds.set(secondary.enrollmentNo, u.id);
    }
  }

  const studentIdByEnrollment = new Map<string, string>();

  const studentInsertRows = seedStudentInputs.map((s) => {
    const division = divisionByKey.get(s.divisionKey);
    if (!division) {
      throw new Error(`Missing division ${s.divisionKey}`);
    }
    const linkedUserId = s.isDemoPrimary
      ? primaryDemoUserId
      : (secondaryDemoUserIds.get(s.enrollmentNo) ?? null);

    return {
      id: seedUuid(`student:${s.enrollmentNo}`),
      userId: linkedUserId,
      email: s.email,
      fullName: s.fullName,
      enrollmentNo: s.enrollmentNo,
      divisionId: division.id,
      status: "active" as const,
      notifyDeadline: true,
      notifyNewAssignment: true,
      notifyStatus: true,
    };
  });

  for (const batch of chunk(studentInsertRows, 60)) {
    const inserted = await db
      .insert(schema.students)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.students.enrollmentNo,
        set: {
          email: sql`excluded.email`,
          fullName: sql`excluded.full_name`,
          divisionId: sql`excluded.division_id`,
          status: sql`excluded.status`,
          updatedAt: now,
        },
      })
      .returning({
        id: schema.students.id,
        enrollmentNo: schema.students.enrollmentNo,
      });

    for (const row of inserted) {
      studentIdByEnrollment.set(row.enrollmentNo, row.id);
    }
  }

  // Ensure the primary demo student is linked to primaryDemoUserId.
  const primaryDemoStudentId = studentIdByEnrollment.get(DEMO_STUDENT_ENROLLMENT_NO);
  if (!primaryDemoStudentId) {
    throw new Error("Primary demo student ID missing after upsert.");
  }
  await db
    .update(schema.students)
    .set({ userId: primaryDemoUserId, updatedAt: now })
    .where(eq(schema.students.id, primaryDemoStudentId));

  // 8. Student electives (spread across options for all semesters <= division.currentSemester)
  const electiveGroupsBySemester = new Map<number, SyllabusElectiveGroup[]>();
  for (const sem of csitSubjects.semesters) {
    if (sem.electiveGroups.length > 0) {
      electiveGroupsBySemester.set(sem.semester, sem.electiveGroups);
    }
  }

  const electiveRows: Array<{
    id: string;
    studentId: string;
    programId: string;
    electiveGroup: string;
    subjectId: string;
  }> = [];

  seedStudentInputs.forEach((studentInput, studentIndex) => {
    const studentId = studentIdByEnrollment.get(studentInput.enrollmentNo);
    const division = divisionByKey.get(studentInput.divisionKey);
    if (!studentId || !division) {
      return;
    }

    for (let sem = 3; sem <= division.currentSemester; sem += 1) {
      const groups = electiveGroupsBySemester.get(sem) ?? [];
      groups.forEach((group, groupIdx) => {
        let chosenCode: string;
        if (studentInput.isDemoPrimary && group.code === "CSIT-503") {
          chosenCode = "CSIT-503A"; // Theory of Computation
        } else if (studentInput.isDemoPrimary && group.code === "CSIT-504") {
          chosenCode = "CSIT-504B"; // Artificial Intelligence
        } else {
          const optIdx = (studentIndex + groupIdx) % group.options.length;
          chosenCode = group.options[optIdx]!.code;
        }

        const subjectId = subjectIdByCode.get(chosenCode);
        if (!subjectId) {
          throw new Error(`Missing subject ID for elective ${chosenCode}`);
        }

        electiveRows.push({
          id: seedUuid(`student-elective:${studentInput.enrollmentNo}:${group.code}`),
          studentId,
          programId: division.programId,
          electiveGroup: group.code,
          subjectId,
        });
      });
    }
  });

  for (const batch of chunk(electiveRows, 100)) {
    await db
      .insert(schema.studentElectives)
      .values(batch)
      .onConflictDoUpdate({
        target: [schema.studentElectives.studentId, schema.studentElectives.electiveGroup],
        set: {
          programId: sql`excluded.program_id`,
          subjectId: sql`excluded.subject_id`,
          updatedAt: now,
        },
      });
  }

  // 9. CSIT-2 Sem 5 Assignments (6 total: 3 upcoming in next 7 days, 3 past with mixed marks)
  const demoDivision = divisionByKey.get(DEMO_DIVISION_KEY);
  if (!demoDivision) {
    throw new Error(`Missing demo division ${DEMO_DIVISION_KEY}`);
  }

  const assignmentIdByKey = new Map<string, string>();
  const assignmentInsertRows = CSIT2_SEM5_ASSIGNMENTS.map((spec) => {
    const subjectId = subjectIdByCode.get(spec.subjectCode);
    const unitId = unitIdByKey.get(`${spec.subjectCode}:${spec.unitOrder}`) ?? null;
    if (!subjectId) {
      throw new Error(`Missing subject ${spec.subjectCode} for assignment ${spec.key}`);
    }
    const id = seedUuid(`assignment:${spec.key}`);
    assignmentIdByKey.set(spec.key, id);
    return {
      id,
      subjectId,
      unitId,
      title: spec.title,
      description: spec.description,
      dueAt: offsetDays(now, spec.dueOffsetDays),
      maxMarks: spec.maxMarks,
      createdBy: facultyUser.id,
    };
  });

  await db
    .insert(schema.assignments)
    .values(assignmentInsertRows)
    .onConflictDoUpdate({
      target: schema.assignments.id,
      set: {
        subjectId: sql`excluded.subject_id`,
        unitId: sql`excluded.unit_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        dueAt: sql`excluded.due_at`,
        maxMarks: sql`excluded.max_marks`,
        createdBy: sql`excluded.created_by`,
        updatedAt: now,
      },
    });

  await db
    .insert(schema.assignmentDivisions)
    .values(
      CSIT2_SEM5_ASSIGNMENTS.map((spec) => ({
        id: seedUuid(`assignment-division:${spec.key}:${DEMO_DIVISION_KEY}`),
        assignmentId: assignmentIdByKey.get(spec.key)!,
        divisionId: demoDivision.id,
      })),
    )
    .onConflictDoNothing();

  // Marks on past assignments for CSIT-2 Sem 5 students (deterministic realistic spread)
  const csit2Sem5Students = seedStudentInputs.filter((s) => s.divisionKey === DEMO_DIVISION_KEY);
  const markRows: Array<{
    id: string;
    assignmentId: string;
    studentId: string;
    status: "submitted" | "late" | "not_submitted";
    marks: number | null;
    remark: string | null;
    markedBy: string;
    markedAt: Date;
  }> = [];

  for (const spec of CSIT2_SEM5_ASSIGNMENTS) {
    if (!spec.demoMark) {
      continue;
    }
    const assignmentId = assignmentIdByKey.get(spec.key)!;

    for (const student of csit2Sem5Students) {
      const studentId = studentIdByEnrollment.get(student.enrollmentNo);
      if (!studentId) {
        continue;
      }

      if (student.isDemoPrimary) {
        markRows.push({
          id: seedUuid(`assignment-mark:${spec.key}:${student.enrollmentNo}`),
          assignmentId,
          studentId,
          status: spec.demoMark.status,
          marks: spec.demoMark.marks,
          remark: spec.demoMark.remark,
          markedBy: facultyUser.id,
          markedAt: offsetDays(now, spec.demoMark.markedOffsetDays, 14),
        });
        continue;
      }

      const roll = rand();
      let status: "submitted" | "late" | "not_submitted";
      let marks: number;
      let remark: string | null = null;

      if (roll < 0.72) {
        status = "submitted";
        marks = Math.max(
          Math.round(spec.maxMarks * 0.65),
          Math.min(spec.maxMarks, Math.round(spec.maxMarks * (0.7 + rand() * 0.3))),
        );
      } else if (roll < 0.88) {
        status = "late";
        marks = Math.round(spec.maxMarks * (0.5 + rand() * 0.25));
        remark = "Submitted after deadline.";
      } else {
        status = "not_submitted";
        marks = 0;
        remark = "Pending offline submission.";
      }

      markRows.push({
        id: seedUuid(`assignment-mark:${spec.key}:${student.enrollmentNo}`),
        assignmentId,
        studentId,
        status,
        marks,
        remark,
        markedBy: facultyUser.id,
        markedAt: offsetDays(now, spec.demoMark.markedOffsetDays, 15),
      });
    }
  }

  for (const batch of chunk(markRows, 60)) {
    await db
      .insert(schema.assignmentMarks)
      .values(batch)
      .onConflictDoUpdate({
        target: [schema.assignmentMarks.assignmentId, schema.assignmentMarks.studentId],
        set: {
          status: sql`excluded.status`,
          marks: sql`excluded.marks`,
          remark: sql`excluded.remark`,
          markedBy: sql`excluded.marked_by`,
          markedAt: sql`excluded.marked_at`,
          updatedAt: now,
        },
      });
  }

  // 10. CSIT-2 Sem 5 Announcements (4 kit examples) + read state for demo student
  const announcementValues = CSIT2_SEM5_ANNOUNCEMENTS.map((ann) => ({
    id: seedUuid(`announcement:${ann.key}`),
    authorUserId: facultyUser.id,
    divisionId: demoDivision.id,
    subjectId: ann.subjectCode ? (subjectIdByCode.get(ann.subjectCode) ?? null) : null,
    kind: ann.kind,
    title: ann.title,
    body: ann.body,
    fileKey: ann.fileKey,
    createdAt: offsetHours(now, ann.createdOffsetHours),
    updatedAt: offsetHours(now, ann.createdOffsetHours),
  }));

  await db
    .insert(schema.announcements)
    .values(announcementValues)
    .onConflictDoUpdate({
      target: schema.announcements.id,
      set: {
        authorUserId: sql`excluded.author_user_id`,
        divisionId: sql`excluded.division_id`,
        subjectId: sql`excluded.subject_id`,
        kind: sql`excluded.kind`,
        title: sql`excluded.title`,
        body: sql`excluded.body`,
        fileKey: sql`excluded.file_key`,
        createdAt: sql`excluded.created_at`,
        updatedAt: now,
      },
    });

  const readValues = CSIT2_SEM5_ANNOUNCEMENTS.filter((ann) => ann.readByDemoStudent).map((ann) => ({
    id: seedUuid(`announcement-read:${ann.key}:demo-primary`),
    userId: primaryDemoUserId,
    announcementId: seedUuid(`announcement:${ann.key}`),
    readAt: offsetHours(now, Math.max(1, ann.createdOffsetHours - 2)),
  }));

  if (readValues.length > 0) {
    await db.insert(schema.announcementReads).values(readValues).onConflictDoNothing();
  }

  // 11. Demo student notes (5 notes) + note_links (topic links + note-to-note link)
  const noteIdByKey = new Map<string, string>();
  const noteInsertRows = DEMO_STUDENT_NOTES.map((note) => {
    const id = seedUuid(`note:${note.key}`);
    noteIdByKey.set(note.key, id);
    const ts = offsetHours(now, note.updatedOffsetHours);
    return {
      id,
      ownerId: primaryDemoUserId,
      title: note.title,
      contentMd: note.contentMd,
      wordCount: countWords(note.contentMd),
      createdAt: offsetHours(now, note.updatedOffsetHours + 6),
      updatedAt: ts,
    };
  });

  await db
    .insert(schema.notes)
    .values(noteInsertRows)
    .onConflictDoUpdate({
      target: schema.notes.id,
      set: {
        ownerId: sql`excluded.owner_id`,
        title: sql`excluded.title`,
        contentMd: sql`excluded.content_md`,
        wordCount: sql`excluded.word_count`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  const noteLinkRows: Array<{
    id: string;
    noteId: string;
    topicId: string | null;
    targetNoteId: string | null;
  }> = [];

  for (const note of DEMO_STUDENT_NOTES) {
    const noteId = noteIdByKey.get(note.key)!;
    for (const link of note.topicLinks) {
      const topicId = topicIdByKey.get(`${link.subjectCode}:${link.unitOrder}:${link.topicOrder}`);
      if (!topicId) {
        throw new Error(
          `Missing topic for note link ${link.subjectCode} U${link.unitOrder} T${link.topicOrder}`,
        );
      }
      noteLinkRows.push({
        id: seedUuid(`note-link:${note.key}:topic:${link.subjectCode}:${link.unitOrder}:${link.topicOrder}`),
        noteId,
        topicId,
        targetNoteId: null,
      });
    }

    for (const targetKey of note.noteLinks) {
      const targetNoteId = noteIdByKey.get(targetKey);
      if (!targetNoteId) {
        throw new Error(`Missing target note ${targetKey} for note link from ${note.key}`);
      }
      noteLinkRows.push({
        id: seedUuid(`note-link:${note.key}:note:${targetKey}`),
        noteId,
        topicId: null,
        targetNoteId,
      });
    }
  }

  if (noteLinkRows.length > 0) {
    await db.insert(schema.noteLinks).values(noteLinkRows).onConflictDoNothing();
  }

  console.log(
    `Seed complete: 1 dept, 2 programs, ${SEED_DIVISIONS.length} divisions, ` +
      `${subjectEntries.length} subjects, ${unitValues.length} units, ${topicValues.length} topics, ` +
      `${studentInsertRows.length} students (demo: ${primaryDemoInput.email}), ` +
      `${CSIT2_SEM5_ASSIGNMENTS.length} assignments, ${CSIT2_SEM5_ANNOUNCEMENTS.length} announcements, ` +
      `${DEMO_STUDENT_NOTES.length} demo notes (${noteLinkRows.length} links).`,
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
