// Contract between the notes route pages / server actions and the notes UI (tasks/p5-notes-ui.md).

export type NoteLinkChip =
  | { kind: "topic"; topicId: string; label: string /* "OS · Unit 2 · Process concept" */; colorIndex: number }
  | { kind: "note"; noteId: string; label: string /* the note's title */ };

export type LinkTarget = { kind: "topic"; topicId: string } | { kind: "note"; noteId: string };

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export type NoteListItem = {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string /* ISO */;
  links: NoteLinkChip[];
};

export type NotesPageData = {
  now: string;
  items: NoteListItem[];
  filterTopic: { id: string; label: string } | null;
};

export type NoteEditorData = {
  id: string | null; // null = new note, created on first save
  title: string;
  contentMd: string;
  updatedAt: string | null;
  links: NoteLinkChip[]; // for a new note this may be pre-filled with a topic chip
  backlinks: { noteId: string; title: string }[];
  linkOptions: NoteLinkChip[]; // every topic of the student's open semesters + their other notes
};

export type NoteEditorActions = {
  save: (input: {
    id: string | null;
    title: string;
    contentMd: string;
    pendingLinks: LinkTarget[];
  }) => Promise<ActionResult<{ id: string; updatedAt: string }>>;
  addLink: (input: { noteId: string; target: LinkTarget }) => Promise<ActionResult<null>>;
  removeLink: (input: { noteId: string; target: LinkTarget }) => Promise<ActionResult<null>>;
  deleteNote: (input: { id: string }) => Promise<ActionResult<null>>;
};
