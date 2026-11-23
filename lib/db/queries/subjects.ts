import "server-only";
import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import type { SubjectDetail, SubjectsPageData } from "@/components/subjects/types";
import { db } from "@/lib/db";
import {
  divisions,
  noteLinks,
  notes,
  programSubjects,
  students,
  subjects,
  topics,
  units,
} from "@/lib/db/schema";
import { computeSubjectPercent, computeUnitProgress, type UnitProgressInput } from "@/lib/progress";
import { getVisibleSubjectIds } from "./visibleSubjects";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SubjectCard = SubjectsPageData["subjects"][number];
type UnitBlock = SubjectDetail["units"][number];
type TopicRow = UnitBlock["topics"][number];

function mapSubjectKind(
  kind: "core" | "departmental_elective" | "open_elective",
): SubjectCard["kind"] {
  return kind === "departmental_elective" ? "dept_elective" : kind;
}

async function loadStudentContext(studentId: string) {
  const [studentRow] = await db
    .select({
      id: students.id,
      userId: students.userId,
      divisionName: divisions.name,
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(eq(students.id, studentId))
    .limit(1);

  return studentRow ?? null;
}

/**
 * Loads the student's current-semester subjects (core + picked electives) with
 * unit-averaged coverage percentages. Uses a single grouped query for note
 * counts across all visible subjects (no N+1).
 */
export async function getSubjectsPage(studentId: string): Promise<SubjectsPageData | null> {
  const studentRow = await loadStudentContext(studentId);
  if (!studentRow) {
    return null;
  }

  const [visibleSubjectIds, semesterPlanRows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        shortName: subjects.shortName,
        kind: programSubjects.kind,
      })
      .from(programSubjects)
      .innerJoin(subjects, eq(programSubjects.subjectId, subjects.id))
      .where(
        and(
          eq(programSubjects.programId, studentRow.programId),
          eq(programSubjects.semester, studentRow.currentSemester),
        ),
      )
      .orderBy(asc(programSubjects.order), asc(subjects.code)),
  ]);

  const visiblePlanRows = semesterPlanRows.filter((row) => visibleSubjectIds.has(row.id));
  if (visiblePlanRows.length === 0) {
    return {
      semester: studentRow.currentSemester,
      divisionCode: studentRow.divisionName,
      subjects: [],
    };
  }

  const subjectIds = visiblePlanRows.map((row) => row.id);

  const [unitTopicRows, noteCountRows] = await Promise.all([
    db
      .select({
        subjectId: units.subjectId,
        unitId: units.id,
        topicId: topics.id,
      })
      .from(units)
      .leftJoin(topics, eq(topics.unitId, units.id))
      .where(inArray(units.subjectId, subjectIds))
      .orderBy(asc(units.order), asc(topics.order)),
    studentRow.userId
      ? db
          .select({
            topicId: noteLinks.topicId,
            noteCount: sql<number>`count(*)::int`,
          })
          .from(noteLinks)
          .innerJoin(notes, eq(noteLinks.noteId, notes.id))
          .innerJoin(topics, eq(noteLinks.topicId, topics.id))
          .innerJoin(units, eq(topics.unitId, units.id))
          .where(
            and(
              eq(notes.ownerId, studentRow.userId),
              isNotNull(noteLinks.topicId),
              inArray(units.subjectId, subjectIds),
            ),
          )
          .groupBy(noteLinks.topicId)
      : Promise.resolve([]),
  ]);

  const noteCountByTopic = new Map<string, number>();
  for (const row of noteCountRows) {
    if (row.topicId) {
      noteCountByTopic.set(row.topicId, row.noteCount);
    }
  }

  const unitsBySubject = new Map<string, Map<string, string[]>>();
  for (const row of unitTopicRows) {
    let unitMap = unitsBySubject.get(row.subjectId);
    if (!unitMap) {
      unitMap = new Map<string, string[]>();
      unitsBySubject.set(row.subjectId, unitMap);
    }

    let topicIds = unitMap.get(row.unitId);
    if (!topicIds) {
      topicIds = [];
      unitMap.set(row.unitId, topicIds);
    }

    if (row.topicId) {
      topicIds.push(row.topicId);
    }
  }

  const cards: SubjectCard[] = visiblePlanRows.map((row, index) => {
    const unitMap = unitsBySubject.get(row.id);
    const unitProgressList = unitMap
      ? Array.from(unitMap.values(), (topicIds) =>
          computeUnitProgress(topicIds.map((topicId) => noteCountByTopic.get(topicId) ?? 0)),
        )
      : [];

    let coveredTopics = 0;
    let totalTopics = 0;
    for (const unit of unitProgressList) {
      coveredTopics += unit.coveredTopics;
      totalTopics += unit.totalTopics;
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      shortName: row.shortName,
      kind: mapSubjectKind(row.kind),
      colorIndex: index + 1,
      percent: computeSubjectPercent(unitProgressList),
      coveredTopics,
      totalTopics,
    };
  });

  return {
    semester: studentRow.currentSemester,
    divisionCode: studentRow.divisionName,
    subjects: cards,
  };
}

/**
 * Loads one subject's syllabus (units and ordered topics) and the student's
 * own note counts and coverage. Returns null if the subject does not exist or
 * is not visible to the student.
 */
export async function getSubjectDetail(
  studentId: string,
  subjectId: string,
): Promise<SubjectDetail | null> {
  if (!UUID_PATTERN.test(subjectId)) {
    return null;
  }

  const studentRow = await loadStudentContext(studentId);
  if (!studentRow) {
    return null;
  }

  const [visibleSubjectIds, subjectRows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: subjects.id,
        code: subjects.code,
        name: subjects.name,
        shortName: subjects.shortName,
        kind: programSubjects.kind,
        semester: programSubjects.semester,
      })
      .from(programSubjects)
      .innerJoin(subjects, eq(programSubjects.subjectId, subjects.id))
      .where(
        and(
          eq(programSubjects.programId, studentRow.programId),
          eq(programSubjects.subjectId, subjectId),
        ),
      )
      .limit(1),
  ]);

  const subjectRow = subjectRows[0];
  if (!subjectRow || !visibleSubjectIds.has(subjectId)) {
    return null;
  }

  const [semesterPlanRows, unitTopicRows, noteCountRows] = await Promise.all([
    db
      .select({ subjectId: programSubjects.subjectId })
      .from(programSubjects)
      .innerJoin(subjects, eq(programSubjects.subjectId, subjects.id))
      .where(
        and(
          eq(programSubjects.programId, studentRow.programId),
          eq(programSubjects.semester, subjectRow.semester),
        ),
      )
      .orderBy(asc(programSubjects.order), asc(subjects.code)),
    db
      .select({
        unitId: units.id,
        unitOrder: units.order,
        unitTitle: units.title,
        topicId: topics.id,
        topicOrder: topics.order,
        topicTitle: topics.title,
      })
      .from(units)
      .leftJoin(topics, eq(topics.unitId, units.id))
      .where(eq(units.subjectId, subjectId))
      .orderBy(asc(units.order), asc(topics.order)),
    studentRow.userId
      ? db
          .select({
            topicId: noteLinks.topicId,
            noteCount: sql<number>`count(*)::int`,
          })
          .from(noteLinks)
          .innerJoin(notes, eq(noteLinks.noteId, notes.id))
          .innerJoin(topics, eq(noteLinks.topicId, topics.id))
          .innerJoin(units, eq(topics.unitId, units.id))
          .where(
            and(
              eq(notes.ownerId, studentRow.userId),
              isNotNull(noteLinks.topicId),
              eq(units.subjectId, subjectId),
            ),
          )
          .groupBy(noteLinks.topicId)
      : Promise.resolve([]),
  ]);

  const visibleSemesterSubjectIds = semesterPlanRows
    .filter((row) => visibleSubjectIds.has(row.subjectId))
    .map((row) => row.subjectId);
  const planPosition = visibleSemesterSubjectIds.indexOf(subjectId);
  const colorIndex = planPosition >= 0 ? planPosition + 1 : 1;

  const noteCountByTopic = new Map<string, number>();
  for (const row of noteCountRows) {
    if (row.topicId) {
      noteCountByTopic.set(row.topicId, row.noteCount);
    }
  }

  const groupedUnits = new Map<
    string,
    { id: string; order: number; title: string; topics: TopicRow[] }
  >();
  for (const row of unitTopicRows) {
    let unitGroup = groupedUnits.get(row.unitId);
    if (!unitGroup) {
      unitGroup = {
        id: row.unitId,
        order: row.unitOrder,
        title: row.unitTitle,
        topics: [],
      };
      groupedUnits.set(row.unitId, unitGroup);
    }

    if (row.topicId !== null && row.topicOrder !== null && row.topicTitle !== null) {
      unitGroup.topics.push({
        id: row.topicId,
        order: row.topicOrder,
        title: row.topicTitle,
        noteCount: noteCountByTopic.get(row.topicId) ?? 0,
      });
    }
  }

  const unitBlocks: UnitBlock[] = [];
  const unitProgressInputs: UnitProgressInput[] = [];
  let totalNoteCount = 0;

  for (const group of groupedUnits.values()) {
    const progress = computeUnitProgress(group.topics.map((topic) => topic.noteCount));
    unitProgressInputs.push({
      coveredTopics: progress.coveredTopics,
      totalTopics: progress.totalTopics,
    });

    for (const topic of group.topics) {
      totalNoteCount += topic.noteCount;
    }

    unitBlocks.push({
      id: group.id,
      order: group.order,
      title: group.title,
      covered: progress.coveredTopics,
      total: progress.totalTopics,
      topics: group.topics,
    });
  }

  return {
    id: subjectRow.id,
    code: subjectRow.code,
    name: subjectRow.name,
    shortName: subjectRow.shortName,
    kind: mapSubjectKind(subjectRow.kind),
    colorIndex,
    percent: computeSubjectPercent(unitProgressInputs),
    noteCount: totalNoteCount,
    units: unitBlocks,
  };
}
