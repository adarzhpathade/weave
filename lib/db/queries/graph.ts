import "server-only";
import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import type { GraphData } from "@/components/graph/types";
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
import { isTopicCovered } from "@/lib/progress";
import { getVisibleSubjectIds } from "./visibleSubjects";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type GraphUnit = GraphData["units"][number];
type GraphNote = GraphData["notes"][number];
type GraphSubjectOption = GraphData["subjects"][number];

/**
 * Loads the syllabus tree and the student's own linked notes (plus note-to-note
 * links among them) for one subject visible to the student. Defaults to the
 * first visible subject of the current semester in plan order.
 */
export async function getGraphData(
  studentId: string,
  userId: string,
  subjectId?: string,
): Promise<GraphData | null> {
  if (subjectId !== undefined && !UUID_PATTERN.test(subjectId)) {
    return null;
  }

  const [studentRow] = await db
    .select({
      id: students.id,
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(and(eq(students.id, studentId), eq(students.status, "active")))
    .limit(1);

  if (!studentRow) {
    return null;
  }

  const [visibleSubjectIds, currentSemesterPlanRows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: subjects.id,
        name: subjects.name,
        shortName: subjects.shortName,
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

  const visibleCurrentRows = currentSemesterPlanRows.filter((row) =>
    visibleSubjectIds.has(row.id),
  );
  const subjectOptions: GraphSubjectOption[] = visibleCurrentRows.map((row) => ({
    id: row.id,
    shortName: row.shortName,
    name: row.name,
  }));

  let targetSubject: {
    id: string;
    shortName: string;
    name: string;
    colorIndex: number;
  } | null = null;
  let targetSemester = studentRow.currentSemester;

  if (!subjectId) {
    const firstSubject = visibleCurrentRows[0];
    if (!firstSubject) {
      return null;
    }
    targetSubject = {
      id: firstSubject.id,
      shortName: firstSubject.shortName,
      name: firstSubject.name,
      colorIndex: 1,
    };
  } else {
    if (!visibleSubjectIds.has(subjectId)) {
      return null;
    }

    const currentIndex = visibleCurrentRows.findIndex((row) => row.id === subjectId);
    if (currentIndex >= 0) {
      const matched = visibleCurrentRows[currentIndex];
      targetSubject = {
        id: matched.id,
        shortName: matched.shortName,
        name: matched.name,
        colorIndex: currentIndex + 1,
      };
    } else {
      const [pastRow] = await db
        .select({
          id: subjects.id,
          name: subjects.name,
          shortName: subjects.shortName,
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
        .limit(1);

      if (!pastRow) {
        return null;
      }

      const pastSemesterPlanRows = await db
        .select({ subjectId: programSubjects.subjectId })
        .from(programSubjects)
        .innerJoin(subjects, eq(programSubjects.subjectId, subjects.id))
        .where(
          and(
            eq(programSubjects.programId, studentRow.programId),
            eq(programSubjects.semester, pastRow.semester),
          ),
        )
        .orderBy(asc(programSubjects.order), asc(subjects.code));

      const visiblePastSubjectIds = pastSemesterPlanRows
        .filter((row) => visibleSubjectIds.has(row.subjectId))
        .map((row) => row.subjectId);
      const planPosition = visiblePastSubjectIds.indexOf(subjectId);

      targetSemester = pastRow.semester;
      targetSubject = {
        id: pastRow.id,
        shortName: pastRow.shortName,
        name: pastRow.name,
        colorIndex: planPosition >= 0 ? planPosition + 1 : 1,
      };
    }
  }

  const [unitTopicRows, noteTopicRows] = await Promise.all([
    db
      .select({
        unitId: units.id,
        unitOrder: units.order,
        unitTitle: units.title,
        topicId: topics.id,
        topicTitle: topics.title,
      })
      .from(units)
      .leftJoin(topics, eq(topics.unitId, units.id))
      .where(eq(units.subjectId, targetSubject.id))
      .orderBy(asc(units.order), asc(topics.order)),
    db
      .select({
        noteId: notes.id,
        noteTitle: notes.title,
        topicId: noteLinks.topicId,
      })
      .from(noteLinks)
      .innerJoin(notes, eq(noteLinks.noteId, notes.id))
      .innerJoin(topics, eq(noteLinks.topicId, topics.id))
      .innerJoin(units, eq(topics.unitId, units.id))
      .where(
        and(
          eq(notes.ownerId, userId),
          isNotNull(noteLinks.topicId),
          eq(units.subjectId, targetSubject.id),
        ),
      )
      .orderBy(asc(notes.title), asc(notes.id)),
  ]);

  const noteCountByTopic = new Map<string, number>();
  const notesMap = new Map<string, GraphNote>();

  for (const row of noteTopicRows) {
    if (!row.topicId) {
      continue;
    }

    noteCountByTopic.set(row.topicId, (noteCountByTopic.get(row.topicId) ?? 0) + 1);

    let noteEntry = notesMap.get(row.noteId);
    if (!noteEntry) {
      noteEntry = {
        id: row.noteId,
        title: row.noteTitle,
        topicIds: [],
        noteIds: [],
      };
      notesMap.set(row.noteId, noteEntry);
    }
    noteEntry.topicIds.push(row.topicId);
  }

  const subjectNoteIds = Array.from(notesMap.keys());
  if (subjectNoteIds.length > 0) {
    const noteToNoteRows = await db
      .select({
        noteId: noteLinks.noteId,
        targetNoteId: noteLinks.targetNoteId,
      })
      .from(noteLinks)
      .where(
        and(
          inArray(noteLinks.noteId, subjectNoteIds),
          inArray(noteLinks.targetNoteId, subjectNoteIds),
        ),
      );

    for (const row of noteToNoteRows) {
      if (!row.targetNoteId) {
        continue;
      }
      notesMap.get(row.noteId)?.noteIds.push(row.targetNoteId);
    }
  }

  const groupedUnits = new Map<string, GraphUnit>();
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

    if (row.topicId !== null && row.topicTitle !== null) {
      unitGroup.topics.push({
        id: row.topicId,
        title: row.topicTitle,
        covered: isTopicCovered(noteCountByTopic.get(row.topicId) ?? 0),
      });
    }
  }

  return {
    subject: targetSubject,
    semester: targetSemester,
    units: Array.from(groupedUnits.values()),
    notes: Array.from(notesMap.values()),
    subjects: subjectOptions,
  };
}
