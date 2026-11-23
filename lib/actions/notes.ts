"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult, LinkTarget } from "@/components/notes/types";
import { getSessionStudent } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getVisibleSubjectIds } from "@/lib/db/queries/visibleSubjects";
import { divisions, noteLinks, notes, students, topics, units } from "@/lib/db/schema";

const uuidSchema = z.string().uuid("Invalid identifier.");

const linkTargetSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("topic"),
    topicId: uuidSchema,
  }),
  z.object({
    kind: z.literal("note"),
    noteId: uuidSchema,
  }),
]);

const saveNoteSchema = z.object({
  id: uuidSchema.nullable(),
  title: z.string().trim().max(200, "Title must be 200 characters or fewer."),
  contentMd: z.string().max(100_000, "Note content must be 100,000 characters or fewer."),
  pendingLinks: z.array(linkTargetSchema).max(50, "Too many links.").default([]),
});

const noteLinkMutationSchema = z.object({
  noteId: uuidSchema,
  target: linkTargetSchema,
});

const deleteNoteSchema = z.object({
  id: uuidSchema,
});

function countWords(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_~`[\]()|-]/g, " ")
    .trim();
  if (!plain) {
    return 0;
  }
  return plain.split(/\s+/).filter(Boolean).length;
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const pgError = error as { code?: unknown; cause?: { code?: unknown } };
  return pgError.code === "23505" || pgError.cause?.code === "23505";
}

async function getStudentVisibleSubjects(studentId: string): Promise<Set<string>> {
  const [row] = await db
    .select({
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(eq(students.id, studentId))
    .limit(1);

  if (!row) {
    return new Set();
  }

  return getVisibleSubjectIds(studentId, row.programId, row.currentSemester);
}

function dedupeTargets(targets: LinkTarget[]): LinkTarget[] {
  const seen = new Set<string>();
  const unique: LinkTarget[] = [];

  for (const target of targets) {
    const key = target.kind === "topic" ? `topic:${target.topicId}` : `note:${target.noteId}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(target);
    }
  }

  return unique;
}

async function validateTargets(
  studentId: string,
  userId: string,
  sourceNoteId: string | null,
  targets: LinkTarget[],
): Promise<ActionResult<null>> {
  const topicIds: string[] = [];
  const targetNoteIds: string[] = [];

  for (const target of targets) {
    if (target.kind === "topic") {
      topicIds.push(target.topicId);
    } else {
      if (sourceNoteId && target.noteId === sourceNoteId) {
        return {
          ok: false,
          error: {
            code: "SELF_LINK",
            message: "A note can't link to itself.",
          },
        };
      }
      targetNoteIds.push(target.noteId);
    }
  }

  if (topicIds.length > 0) {
    const [visibleSubjectIds, topicRows] = await Promise.all([
      getStudentVisibleSubjects(studentId),
      db
        .select({
          id: topics.id,
          subjectId: units.subjectId,
        })
        .from(topics)
        .innerJoin(units, eq(topics.unitId, units.id))
        .where(inArray(topics.id, topicIds)),
    ]);

    if (topicRows.length !== topicIds.length) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "That topic couldn't be found.",
        },
      };
    }

    for (const row of topicRows) {
      if (!visibleSubjectIds.has(row.subjectId)) {
        return {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only link topics from your syllabus.",
          },
        };
      }
    }
  }

  if (targetNoteIds.length > 0) {
    const ownedRows = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(inArray(notes.id, targetNoteIds), eq(notes.ownerId, userId)));

    if (ownedRows.length !== targetNoteIds.length) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "You can only link your own notes.",
        },
      };
    }
  }

  return { ok: true, data: null };
}

function revalidateNoteViews(noteIds: string[] = []): void {
  revalidatePath("/notes");
  revalidatePath("/home");
  revalidatePath("/subjects");
  for (const id of noteIds) {
    revalidatePath(`/notes/${id}`);
  }
}

export async function save(input: {
  id: string | null;
  title: string;
  contentMd: string;
  pendingLinks: LinkTarget[];
}): Promise<ActionResult<{ id: string; updatedAt: string }>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Please sign in to save your note.",
      },
    };
  }

  const parsed = saveNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "Please check your note and try again.",
      },
    };
  }

  const { id, contentMd } = parsed.data;
  const title = parsed.data.title || "Untitled";
  const wordCount = countWords(contentMd);
  const now = new Date();

  try {
    if (id === null) {
      const pendingLinks = dedupeTargets(parsed.data.pendingLinks);
      if (pendingLinks.length > 0) {
        const validation = await validateTargets(
          student.studentId,
          student.userId,
          null,
          pendingLinks,
        );
        if (!validation.ok) {
          return validation;
        }
      }

      const [inserted] = await db
        .insert(notes)
        .values({
          ownerId: student.userId,
          title,
          contentMd,
          wordCount,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: notes.id, updatedAt: notes.updatedAt });

      if (!inserted) {
        return {
          ok: false,
          error: {
            code: "SAVE_FAILED",
            message: "Couldn't create your note. Please try again.",
          },
        };
      }

      const linkedNoteIds: string[] = [];
      if (pendingLinks.length > 0) {
        await db
          .insert(noteLinks)
          .values(
            pendingLinks.map((target) => {
              if (target.kind === "note") {
                linkedNoteIds.push(target.noteId);
                return {
                  noteId: inserted.id,
                  topicId: null,
                  targetNoteId: target.noteId,
                };
              }
              return {
                noteId: inserted.id,
                topicId: target.topicId,
                targetNoteId: null,
              };
            }),
          )
          .onConflictDoNothing();
      }

      revalidateNoteViews([inserted.id, ...linkedNoteIds]);
      return {
        ok: true,
        data: {
          id: inserted.id,
          updatedAt: inserted.updatedAt.toISOString(),
        },
      };
    }

    const [updated] = await db
      .update(notes)
      .set({
        title,
        contentMd,
        wordCount,
        updatedAt: now,
      })
      .where(and(eq(notes.id, id), eq(notes.ownerId, student.userId)))
      .returning({ id: notes.id, updatedAt: notes.updatedAt });

    if (!updated) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Note not found.",
        },
      };
    }

    revalidateNoteViews([updated.id]);
    return {
      ok: true,
      data: {
        id: updated.id,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("notes.save failed:", error);
    return {
      ok: false,
      error: {
        code: "SAVE_FAILED",
        message: "Couldn't save your note right now. Please try again.",
      },
    };
  }
}

export async function addLink(input: {
  noteId: string;
  target: LinkTarget;
}): Promise<ActionResult<null>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Please sign in to link this note.",
      },
    };
  }

  const parsed = noteLinkMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "Invalid link.",
      },
    };
  }

  const { noteId, target } = parsed.data;

  try {
    const [ownedNote] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.ownerId, student.userId)))
      .limit(1);

    if (!ownedNote) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Note not found.",
        },
      };
    }

    const validation = await validateTargets(student.studentId, student.userId, noteId, [target]);
    if (!validation.ok) {
      return validation;
    }

    try {
      await db
        .insert(noteLinks)
        .values(
          target.kind === "topic"
            ? { noteId, topicId: target.topicId, targetNoteId: null }
            : { noteId, topicId: null, targetNoteId: target.noteId },
        )
        .onConflictDoNothing();
    } catch (insertError) {
      if (!isUniqueViolation(insertError)) {
        throw insertError;
      }
    }

    revalidateNoteViews(target.kind === "note" ? [noteId, target.noteId] : [noteId]);
    return { ok: true, data: null };
  } catch (error) {
    console.error("notes.addLink failed:", error);
    return {
      ok: false,
      error: {
        code: "ADD_LINK_FAILED",
        message: "Couldn't add that link right now. Please try again.",
      },
    };
  }
}

export async function removeLink(input: {
  noteId: string;
  target: LinkTarget;
}): Promise<ActionResult<null>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Please sign in to update links.",
      },
    };
  }

  const parsed = noteLinkMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "Invalid link.",
      },
    };
  }

  const { noteId, target } = parsed.data;

  try {
    const [ownedNote] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.ownerId, student.userId)))
      .limit(1);

    if (!ownedNote) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Note not found.",
        },
      };
    }

    await db
      .delete(noteLinks)
      .where(
        target.kind === "topic"
          ? and(eq(noteLinks.noteId, noteId), eq(noteLinks.topicId, target.topicId))
          : and(eq(noteLinks.noteId, noteId), eq(noteLinks.targetNoteId, target.noteId)),
      );

    revalidateNoteViews(target.kind === "note" ? [noteId, target.noteId] : [noteId]);
    return { ok: true, data: null };
  } catch (error) {
    console.error("notes.removeLink failed:", error);
    return {
      ok: false,
      error: {
        code: "REMOVE_LINK_FAILED",
        message: "Couldn't remove that link right now. Please try again.",
      },
    };
  }
}

export async function deleteNote(input: { id: string }): Promise<ActionResult<null>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Please sign in to delete this note.",
      },
    };
  }

  const parsed = deleteNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "Invalid note.",
      },
    };
  }

  try {
    const [deleted] = await db
      .delete(notes)
      .where(and(eq(notes.id, parsed.data.id), eq(notes.ownerId, student.userId)))
      .returning({ id: notes.id });

    if (!deleted) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Note not found.",
        },
      };
    }

    revalidateNoteViews();
    return { ok: true, data: null };
  } catch (error) {
    console.error("notes.deleteNote failed:", error);
    return {
      ok: false,
      error: {
        code: "DELETE_FAILED",
        message: "Couldn't delete your note right now. Please try again.",
      },
    };
  }
}
