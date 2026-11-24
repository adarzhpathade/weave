---
branch: feat/p5-notes-ui
base: origin/feat/p2-home
model: sonnet
files_allowed: components/notes/**, app/globals.css
subagents: not-allowed
shell: no
---

# p5-notes-ui — Notes list + note editor with links (visible UI only)

## Goal
Pixel-match the kit's NOTES and NOTE EDITOR phones (`design/ui-kit/index.html`, `<!-- NOTES -->`, `<!-- NOTE EDITOR -->`; CSS `.ncard`, `.search`, `.fchip`, `.note-title`, `.links`, `.lchip` (`.syl` / note variant), `.picker`, `.prow`, `.note-body`, `.ilink`, `.brow`; plus the kit script for the "+ Link" picker). Phone first, centered column on laptop. Reuse `components/ui/*` + tokens. Don't touch the shell/pill. A backend worker writes the route pages and server actions; write components with this exact contract.

## Contract
```ts
// components/notes/types.ts
export type NoteLinkChip =
  | { kind: "topic"; topicId: string; label: string /* "OS · Unit 2 · Process concept" */; colorIndex: number }
  | { kind: "note"; noteId: string; label: string /* the note's title */ };
export type LinkTarget = { kind: "topic"; topicId: string } | { kind: "note"; noteId: string };
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };
export type NoteListItem = { id: string; title: string; excerpt: string; updatedAt: string /* ISO */; links: NoteLinkChip[] };
export type NotesPageData = { now: string; items: NoteListItem[]; filterTopic: { id: string; label: string } | null };
export type NoteEditorData = {
  id: string | null;              // null = new note, created on first save
  title: string; contentMd: string; updatedAt: string | null;
  links: NoteLinkChip[];           // for a new note this may be pre-filled with a topic chip
  backlinks: { noteId: string; title: string }[];
  linkOptions: NoteLinkChip[];     // every topic of the student's open semesters + their other notes
};
export type NoteEditorActions = {
  save: (input: { id: string | null; title: string; contentMd: string; pendingLinks: LinkTarget[] }) => Promise<ActionResult<{ id: string; updatedAt: string }>>;
  addLink: (input: { noteId: string; target: LinkTarget }) => Promise<ActionResult<null>>;
  removeLink: (input: { noteId: string; target: LinkTarget }) => Promise<ActionResult<null>>;
  deleteNote: (input: { id: string }) => Promise<ActionResult<null>>;
};
// components/notes/NotesScreen.tsx
export function NotesScreen(props: { data: NotesPageData }): JSX.Element
// components/notes/NoteEditorScreen.tsx ("use client")
export function NoteEditorScreen(props: { note: NoteEditorData; actions: NoteEditorActions }): JSX.Element
```

## Details
- List (`/notes`): header "My notes · N" + "New note" ink button (→ `/notes/new`, or `/notes/new?topic={id}` when filtered), title "Your notes", search (client, title + excerpt), chips All / Linked / Free with counts, note cards like the kit (relative edited time from `now`, "N links" or "Free note", title, 2-line excerpt). `filterTopic` set → a removable chip "Topic: {label}" (clear → `/notes`). Card → `/notes/{id}`. Empty: "No notes yet. Write your first one." with the New note button.
- Editor: back button (→ `/notes`), big editable title (placeholder "Untitled"), link chips row + "+ Link" chip that opens the picker (search box filtering `linkOptions` by label, rows labelled Topic / Note, excludes already linked and the note itself; chip × removes). Body: a plain auto-growing Markdown textarea in the kit's body type (no rich-text library) with a small Write / Preview toggle; Preview renders paragraphs, `-` bullets, `**bold**`, `*italic*`, `#`/`##` headings and `[[Note title]]` as `.ilink` — write a tiny safe renderer that builds React elements (never `dangerouslySetInnerHTML`). "Also linked from" card lists `backlinks` (→ `/notes/{id}`); hide when empty.
- Auto-save: debounce 800 ms after typing (title or body) → `actions.save`; status text "Saving…" / "Saved" / error message with Retry. New note: don't save until title or body is non-empty; after the first save `router.replace('/notes/{id}')` and send `pendingLinks` (links chosen before the first save, incl. the pre-filled topic) with that save. Links added on an existing note call addLink/removeLink immediately (optimistic, revert on error).
- Delete: overflow/“Delete note” ghost button at the bottom with a confirm step → `actions.deleteNote` → `/notes`.
- Reduced motion, keyboard (Esc closes picker, picker rows are buttons), no hex/arbitrary values. REPORT.md, print TASK COMPLETE.
