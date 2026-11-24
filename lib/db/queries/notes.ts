import "server-only";
import { and, asc, desc, eq, inArray, lte, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type {
  NoteEditorData,
  NoteLinkChip,
  NotesPageData,
} from "@/components/notes/types";
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
import { getVisibleSubjectIds } from "./visibleSubjects";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUBJECT_COLOR_COUNT = 6;
const EXCERPT_MAX_LENGTH = 140;

type StudentContext = {
  studentId: string;
  programId: string;
  currentSemester: number;
};

type VisiblePlan = {
  visibleSubjectIds: Set<string>;
  colorIndexBySubjectId: Map<string, number>;
};

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function formatTopicChipLabel(subjectShort: string, unitOrder: number, topicTitle: string): string {
  return `${subjectShort} · Unit ${unitOrder} · ${topicTitle}`;
}

function stripMarkdownToExcerpt(markdown: string, maxLength = EXCERPT_MAX_LENGTH): string {
  const plain = markdown
    // A leading "# Title" usually repeats the note title, so drop it from the excerpt.
    .replace(/^\s{0,3}#\s+[^\n]*\n?/, "")
    .replace(/```[^\n]*\n?([\s\S]*?)```/g, " $1 ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
    .replace(/^\s*[-*_]{3,}\s*$/gm, " ")
    .replace(/[*_~]+/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  const sliced = plain.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const cutoff = lastSpace > Math.floor(maxLength * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${cutoff.trimEnd()}…`;
}

async function resolveStudentContext(
  studentId: string,
  userId: string,
): Promise<StudentContext | null> {
  const [row] = await db
    .select({
      studentId: students.id,
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(
      and(
        eq(students.id, studentId),
        eq(students.userId, userId),
        eq(students.status, "active"),
      ),
    )
    .limit(1);

  return row ?? null;
}

/**
 * Resolves the student's visible subjects (semesters 3..currentSemester) and
 * computes each subject's 1-based colorIndex (1..6) in the student's semester
 * plan order, matching the Subjects screen ordering.
 */
async function getVisiblePlan(ctx: StudentContext): Promise<VisiblePlan> {
  const [visibleSubjectIds, planRows] = await Promise.all([
    getVisibleSubjectIds(ctx.studentId, ctx.programId, ctx.currentSemester),
    db
      .select({
        subjectId: programSubjects.subjectId,
        semester: programSubjects.semester,
        order: programSubjects.order,
      })
      .from(programSubjects)
      .where(
        and(
          eq(programSubjects.programId, ctx.programId),
          lte(programSubjects.semester, ctx.currentSemester),
        ),
      )
      .orderBy(asc(programSubjects.semester), asc(programSubjects.order)),
  ]);

  const colorIndexBySubjectId = new Map<string, number>();
  const countBySemester = new Map<number, number>();

  for (const row of planRows) {
    if (!visibleSubjectIds.has(row.subjectId)) {
      continue;
    }
    const posInSemester = countBySemester.get(row.semester) ?? 0;
    countBySemester.set(row.semester, posInSemester + 1);
    colorIndexBySubjectId.set(row.subjectId, (posInSemester % SUBJECT_COLOR_COUNT) + 1);
  }

  return { visibleSubjectIds, colorIndexBySubjectId };
}

async function fetchLinksByNoteIds(
  noteIds: string[],
  userId: string,
  plan: VisiblePlan,
): Promise<Map<string, NoteLinkChip[]>> {
  const grouped = new Map<string, NoteLinkChip[]>();
  if (noteIds.length === 0) {
    return grouped;
  }

  const targetNotes = alias(notes, "target_notes");
  const rows = await db
    .select({
      noteId: noteLinks.noteId,
      topicId: noteLinks.topicId,
      topicTitle: topics.title,
      unitOrder: units.order,
      subjectId: subjects.id,
      subjectShort: subjects.shortName,
      targetNoteId: noteLinks.targetNoteId,
      targetNoteTitle: targetNotes.title,
    })
    .from(noteLinks)
    .leftJoin(topics, eq(noteLinks.topicId, topics.id))
    .leftJoin(units, eq(topics.unitId, units.id))
    .leftJoin(subjects, eq(units.subjectId, subjects.id))
    .leftJoin(
      targetNotes,
      and(eq(noteLinks.targetNoteId, targetNotes.id), eq(targetNotes.ownerId, userId)),
    )
    .where(inArray(noteLinks.noteId, noteIds))
    .orderBy(asc(noteLinks.createdAt));

  for (const row of rows) {
    let chip: NoteLinkChip | null = null;
    if (
      row.topicId &&
      row.topicTitle !== null &&
      row.unitOrder !== null &&
      row.subjectId &&
      row.subjectShort !== null &&
      plan.visibleSubjectIds.has(row.subjectId)
    ) {
      chip = {
        kind: "topic",
        topicId: row.topicId,
        label: formatTopicChipLabel(row.subjectShort, row.unitOrder, row.topicTitle),
        colorIndex: plan.colorIndexBySubjectId.get(row.subjectId) ?? 1,
      };
    } else if (row.targetNoteId && row.targetNoteTitle !== null) {
      chip = {
        kind: "note",
        noteId: row.targetNoteId,
        label: row.targetNoteTitle,
      };
    }

    if (!chip) {
      continue;
    }

    const existing = grouped.get(row.noteId);
    if (existing) {
      existing.push(chip);
    } else {
      grouped.set(row.noteId, [chip]);
    }
  }

  return grouped;
}

async function loadLinkOptions(
  ctx: StudentContext,
  plan: VisiblePlan,
  userId: string,
  excludeNoteId: string | null,
): Promise<NoteLinkChip[]> {
  const [topicRows, ownNotes] = await Promise.all([
    db
      .select({
        topicId: topics.id,
        topicTitle: topics.title,
        unitOrder: units.order,
        subjectId: subjects.id,
        subjectShort: subjects.shortName,
      })
      .from(topics)
      .innerJoin(units, eq(topics.unitId, units.id))
      .innerJoin(subjects, eq(units.subjectId, subjects.id))
      .innerJoin(
        programSubjects,
        and(
          eq(programSubjects.subjectId, subjects.id),
          eq(programSubjects.programId, ctx.programId),
          lte(programSubjects.semester, ctx.currentSemester),
        ),
      )
      .orderBy(
        desc(programSubjects.semester),
        asc(programSubjects.order),
        asc(units.order),
        asc(topics.order),
      ),
    db
      .select({
        id: notes.id,
        title: notes.title,
      })
      .from(notes)
      .where(
        excludeNoteId
          ? and(eq(notes.ownerId, userId), ne(notes.id, excludeNoteId))
          : eq(notes.ownerId, userId),
      )
      .orderBy(desc(notes.updatedAt), desc(notes.createdAt)),
  ]);

  const options: NoteLinkChip[] = [];

  for (const row of topicRows) {
    if (!plan.visibleSubjectIds.has(row.subjectId)) {
      continue;
    }
    options.push({
      kind: "topic",
      topicId: row.topicId,
      label: formatTopicChipLabel(row.subjectShort, row.unitOrder, row.topicTitle),
      colorIndex: plan.colorIndexBySubjectId.get(row.subjectId) ?? 1,
    });
  }

  for (const note of ownNotes) {
    options.push({
      kind: "note",
      noteId: note.id,
      label: note.title,
    });
  }

  return options;
}

/**
 * Returns all linkable targets for the student: syllabus topics from open
 * semesters (<= current) plus the student's own notes (excluding `excludeNoteId`).
 */
export async function getLinkOptions(
  studentId: string,
  userId: string,
  excludeNoteId: string | null = null,
): Promise<NoteLinkChip[]> {
  const ctx = await resolveStudentContext(studentId, userId);
  if (!ctx) {
    return [];
  }

  const plan = await getVisiblePlan(ctx);
  const validExclude = excludeNoteId && isValidUuid(excludeNoteId) ? excludeNoteId : null;
  return loadLinkOptions(ctx, plan, userId, validExclude);
}

/**
 * Loads the student's private notes list (newest first), optionally filtered to
 * notes linked to a specific visible syllabus topic. Fetches all note links in
 * a single grouped query (no N+1).
 */
export async function getNotesPage(
  studentId: string,
  userId: string,
  topicId?: string,
): Promise<NotesPageData> {
  const now = new Date().toISOString();
  const ctx = await resolveStudentContext(studentId, userId);
  if (!ctx) {
    return { now, items: [], filterTopic: null };
  }

  const plan = await getVisiblePlan(ctx);

  let filterTopic: NotesPageData["filterTopic"] = null;
  if (topicId && isValidUuid(topicId)) {
    const [topicRow] = await db
      .select({
        id: topics.id,
        title: topics.title,
        unitOrder: units.order,
        subjectId: subjects.id,
        subjectShort: subjects.shortName,
      })
      .from(topics)
      .innerJoin(units, eq(topics.unitId, units.id))
      .innerJoin(subjects, eq(units.subjectId, subjects.id))
      .where(eq(topics.id, topicId))
      .limit(1);

    if (topicRow && plan.visibleSubjectIds.has(topicRow.subjectId)) {
      filterTopic = {
        id: topicRow.id,
        label: formatTopicChipLabel(topicRow.subjectShort, topicRow.unitOrder, topicRow.title),
      };
    }
  }

  const noteRows = filterTopic
    ? await db
        .select({
          id: notes.id,
          title: notes.title,
          contentMd: notes.contentMd,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .innerJoin(
          noteLinks,
          and(eq(noteLinks.noteId, notes.id), eq(noteLinks.topicId, filterTopic.id)),
        )
        .where(eq(notes.ownerId, userId))
        .orderBy(desc(notes.updatedAt), desc(notes.createdAt))
    : await db
        .select({
          id: notes.id,
          title: notes.title,
          contentMd: notes.contentMd,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(eq(notes.ownerId, userId))
        .orderBy(desc(notes.updatedAt), desc(notes.createdAt));

  const linksByNoteId = await fetchLinksByNoteIds(
    noteRows.map((row) => row.id),
    userId,
    plan,
  );

  const items: NotesPageData["items"] = noteRows.map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: stripMarkdownToExcerpt(row.contentMd),
    updatedAt: row.updatedAt.toISOString(),
    links: linksByNoteId.get(row.id) ?? [],
  }));

  return { now, items, filterTopic };
}

/**
 * Loads data for the note editor. Passing `noteId = null` prepares a new note
 * (pre-populating `presetTopicId` as an initial link chip if visible to the
 * student). Returns `null` if the student is invalid or an existing `noteId`
 * does not exist or does not belong to `userId`.
 */
export async function getNoteEditor(
  studentId: string,
  userId: string,
  noteId: string | null,
  presetTopicId?: string,
): Promise<NoteEditorData | null> {
  const ctx = await resolveStudentContext(studentId, userId);
  if (!ctx) {
    return null;
  }

  const plan = await getVisiblePlan(ctx);

  if (noteId === null) {
    const linkOptions = await loadLinkOptions(ctx, plan, userId, null);
    const links: NoteLinkChip[] = [];

    if (presetTopicId && isValidUuid(presetTopicId)) {
      const preset = linkOptions.find(
        (option) => option.kind === "topic" && option.topicId === presetTopicId,
      );
      if (preset) {
        links.push(preset);
      }
    }

    return {
      id: null,
      title: "",
      contentMd: "",
      updatedAt: null,
      links,
      backlinks: [],
      linkOptions,
    };
  }

  if (!isValidUuid(noteId)) {
    return null;
  }

  const [noteRows, linksByNoteId, backlinkRows, linkOptions] = await Promise.all([
    db
      .select({
        id: notes.id,
        title: notes.title,
        contentMd: notes.contentMd,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.ownerId, userId)))
      .limit(1),
    fetchLinksByNoteIds([noteId], userId, plan),
    db
      .select({
        noteId: notes.id,
        title: notes.title,
      })
      .from(noteLinks)
      .innerJoin(notes, eq(noteLinks.noteId, notes.id))
      .where(and(eq(noteLinks.targetNoteId, noteId), eq(notes.ownerId, userId)))
      .orderBy(desc(notes.updatedAt)),
    loadLinkOptions(ctx, plan, userId, noteId),
  ]);

  const noteRow = noteRows[0];
  if (!noteRow) {
    return null;
  }

  return {
    id: noteRow.id,
    title: noteRow.title,
    contentMd: noteRow.contentMd,
    updatedAt: noteRow.updatedAt.toISOString(),
    links: linksByNoteId.get(noteRow.id) ?? [],
    backlinks: backlinkRows,
    linkOptions,
  };
}
