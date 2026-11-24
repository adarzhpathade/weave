---
branch: feat/p5-notes-data
base: origin/feat/p2-home
model: gemini-4-neon-medium
files_allowed: lib/db/queries/notes.ts, lib/actions/notes.ts, app/(app)/notes/**
subagents: not-allowed
shell: no
---

# p5-notes-data — notes queries, server actions, routes (backend only)

## Goal
Students create, edit, link and delete their own private notes. A Sonnet worker writes the components in parallel (may be missing in your worktree) — code against this contract exactly, no markup beyond rendering:
```ts
import type { NotesPageData, NoteEditorData, NoteEditorActions, NoteLinkChip, LinkTarget, ActionResult } from "@/components/notes/types";
// NoteLinkChip = { kind:"topic"; topicId; label /* "OS · Unit 2 · Process concept" = subject short · Unit n · topic title */; colorIndex } | { kind:"note"; noteId; label /* title */ }
// LinkTarget = { kind:"topic"; topicId } | { kind:"note"; noteId }
// ActionResult<T> = { ok:true; data:T } | { ok:false; error:{ code; message } }
// NoteListItem = { id; title; excerpt; updatedAt: ISO; links: NoteLinkChip[] }
// NotesPageData = { now: ISO; items: NoteListItem[]; filterTopic: { id; label } | null }
// NoteEditorData = { id: string|null; title; contentMd; updatedAt: ISO|null; links; backlinks: {noteId; title}[]; linkOptions: NoteLinkChip[] }
// NoteEditorActions = { save({ id|null, title, contentMd, pendingLinks: LinkTarget[] }) -> ActionResult<{ id; updatedAt: ISO }>; addLink({ noteId, target }) -> ActionResult<null>; removeLink({ noteId, target }) -> ActionResult<null>; deleteNote({ id }) -> ActionResult<null> }
import { NotesScreen } from "@/components/notes/NotesScreen";           // <NotesScreen data={...} />
import { NoteEditorScreen } from "@/components/notes/NoteEditorScreen";  // <NoteEditorScreen note={...} actions={{ save, addLink, removeLink, deleteNote }} />
```

## Rules
AGENTS.md §3, §4, §10. Notes are private: every read and write is scoped to `notes.owner_id = session userId` (the session from `getSessionStudent()` in `@/lib/auth/session`). Topics may only be linked if visible to the student (reuse `lib/db/queries/visibleSubjects.ts`); notes may only link the owner's own notes and never themselves. Do NOT edit `queries/index.ts`. `colorIndex` for a topic chip = 1-based position of its subject in the student's plan order (same as `lib/db/queries/subjects.ts` if it exists in your worktree; otherwise compute the same way).

## Steps
1. `lib/db/queries/notes.ts` (server-only): `getNotesPage(studentId, userId, topicId?)` (newest first, excerpt = first ~140 chars of content without Markdown symbols, links per note in one grouped query — no N+1), `getNoteEditor(studentId, userId, noteId | null, presetTopicId?)` (null id = new note; preset topic chip if visible), and `getLinkOptions(...)` used by it (topics of the student's semesters ≤ current, plus own notes).
2. `lib/actions/notes.ts` ("use server"): `save`, `addLink`, `removeLink`, `deleteNote` matching the contract. Zod-validate every input (title ≤ 200 chars, content ≤ 100k). `save` with id null inserts the note + `pendingLinks`; otherwise updates title/content/word_count/updated_at (owner check). Link unique violations → treat as ok. Deleting a note cascades its links. Return friendly messages, log details. `revalidatePath` for `/notes`, `/home`, `/subjects` after writes.
3. Routes: `app/(app)/notes/page.tsx` (searchParams `topic`), `app/(app)/notes/new/page.tsx` (searchParams `topic`), `app/(app)/notes/[noteId]/page.tsx` (`notFound()` if not the owner's; validate UUID). Follow `app/(app)/home/page.tsx` for the session + Suspense pattern; Next 16 `params`/`searchParams` are Promises.
4. REPORT.md, print TASK COMPLETE.
