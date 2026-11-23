"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { BackIcon, LinkIcon, MoreIcon } from "./icons";
import { chipBase, LinkChip, linkKey, toTarget } from "./LinkChip";
import { LinkPicker } from "./LinkPicker";
import { MarkdownPreview } from "./markdown";
import { cx, dangerButtonSm, ghostButtonSm, inkButtonSm } from "./styles";
import type { ActionResult, NoteEditorActions, NoteEditorData, NoteLinkChip } from "./types";

const SAVE_DELAY_MS = 800;

type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };
type Mode = "write" | "preview";

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

/** A thrown server action (offline, server down) becomes a visible error, never a silent success. */
async function run<T>(call: () => Promise<ActionResult<T>>, fallbackMessage: string): Promise<ActionResult<T>> {
  try {
    return await call();
  } catch {
    return { ok: false, error: { code: "network", message: fallbackMessage } };
  }
}

/** Grows a textarea with its content (no inner scrollbar). */
function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string, active: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value, active]);
}

// Kit "NOTE EDITOR" phone: back · save status · more, big title, link chips + "+ Link" picker, Markdown body,
// "Also linked from" card. Auto-saves 800 ms after the last keystroke.
export function NoteEditorScreen({ note, actions }: { note: NoteEditorData; actions: NoteEditorActions }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.contentMd);
  const [links, setLinks] = useState<NoteLinkChip[]>(note.links);
  const [noteId, setNoteId] = useState<string | null>(note.id);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [mode, setMode] = useState<Mode>("write");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [poppedKey, setPoppedKey] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteState, setDeleteState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const pickerId = useId();

  // Save machinery lives in refs so a slow save never races a newer keystroke.
  const actionsRef = useRef(actions);
  const idRef = useRef<string | null>(note.id);
  const draftRef = useRef({ title: note.title, body: note.contentMd });
  const linksRef = useRef<NoteLinkChip[]>(note.links);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);
  const flushRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useAutoGrow(titleRef, title, true);
  useAutoGrow(bodyRef, body, mode === "write");

  const updateLinks = useCallback((next: (current: NoteLinkChip[]) => NoteLinkChip[]) => {
    linksRef.current = next(linksRef.current);
    setLinks(linksRef.current);
  }, []);

  const persistAdd = useCallback(
    async (link: NoteLinkChip) => {
      const id = idRef.current;
      if (!id) return;
      const result = await run(
        () => actionsRef.current.addLink({ noteId: id, target: toTarget(link) }),
        "Couldn't add the link. Check your connection.",
      );
      if (!result.ok) {
        updateLinks((current) => current.filter((l) => linkKey(l) !== linkKey(link)));
        setLinkError(result.error.message);
      }
    },
    [updateLinks],
  );

  const persistRemove = useCallback(
    async (link: NoteLinkChip, index: number) => {
      const id = idRef.current;
      if (!id) return;
      const result = await run(
        () => actionsRef.current.removeLink({ noteId: id, target: toTarget(link) }),
        "Couldn't remove the link. Check your connection.",
      );
      if (!result.ok) {
        updateLinks((current) => {
          if (current.some((l) => linkKey(l) === linkKey(link))) return current;
          const copy = [...current];
          copy.splice(Math.min(index, copy.length), 0, link);
          return copy;
        });
        setLinkError(result.error.message);
      }
    },
    [updateLinks],
  );

  const flush = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (savingRef.current) return; // the running save re-checks dirtyRef when it finishes
    const { title: t, body: b } = draftRef.current;
    const id = idRef.current;
    if (!id && !t.trim() && !b.trim()) {
      dirtyRef.current = false;
      return; // a new note is only created once it has a title or a body
    }

    savingRef.current = true;
    dirtyRef.current = false;
    setSave({ kind: "saving" });
    const sentLinks = id ? [] : linksRef.current;
    const result = await run(
      () => actionsRef.current.save({ id, title: t, contentMd: b, pendingLinks: sentLinks.map(toTarget) }),
      "Couldn't save. Check your connection.",
    );
    savingRef.current = false;

    if (!result.ok) {
      dirtyRef.current = true;
      setSave({ kind: "error", message: result.error.message });
      return;
    }

    idRef.current = result.data.id;
    setNoteId(result.data.id);
    if (!id) {
      // Keep this component (caret, scroll, typing) and only swap the URL; Next.js syncs it with the router.
      if (mountedRef.current) window.history.replaceState(null, "", `/notes/${result.data.id}`);
      // Links changed while the first save was in flight were not part of pendingLinks.
      const sent = new Set(sentLinks.map(linkKey));
      const now = new Set(linksRef.current.map(linkKey));
      linksRef.current.forEach((link) => {
        if (!sent.has(linkKey(link))) void persistAdd(link);
      });
      sentLinks.forEach((link, index) => {
        if (!now.has(linkKey(link))) void persistRemove(link, index);
      });
    }

    if (dirtyRef.current) {
      // Typed during the save: keep "Saving…" and save again (now, if the debounce already fired).
      setSave({ kind: "saving" });
      if (!timerRef.current) void flushRef.current();
    } else {
      setSave({ kind: "saved" });
    }
  }, [persistAdd, persistRemove]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [flush]);

  // Save pending edits when the app is backgrounded or the editor unmounts; warn before closing mid-save.
  useEffect(() => {
    mountedRef.current = true;
    const onHide = () => {
      if (document.visibilityState === "hidden" && timerRef.current) void flush();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current || savingRef.current) e.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (timerRef.current) void flush();
    };
  }, [flush]);

  function changeTitle(value: string) {
    setTitle(value);
    draftRef.current = { ...draftRef.current, title: value };
    scheduleSave();
  }

  function changeBody(value: string) {
    setBody(value);
    draftRef.current = { ...draftRef.current, body: value };
    scheduleSave();
  }

  function closePicker() {
    setPickerOpen(false);
    addRef.current?.focus();
  }

  function pick(link: NoteLinkChip) {
    setLinkError(null);
    updateLinks((current) => [...current, link]);
    setPoppedKey(linkKey(link));
    closePicker();
    // New note: the link travels with the first save as a pending link (or is added right after it).
    if (idRef.current) void persistAdd(link);
  }

  function remove(link: NoteLinkChip) {
    setLinkError(null);
    const index = linksRef.current.findIndex((l) => linkKey(l) === linkKey(link));
    updateLinks((current) => current.filter((l) => linkKey(l) !== linkKey(link)));
    if (idRef.current) void persistRemove(link, index);
  }

  function openDeleteConfirm() {
    setDeleteState({ busy: false, error: null });
    setConfirmDelete(true);
    requestAnimationFrame(() => {
      cancelDeleteRef.current?.scrollIntoView({ block: "center" });
      cancelDeleteRef.current?.focus();
    });
  }

  async function confirmDeleteNote() {
    const id = idRef.current;
    if (!id) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dirtyRef.current = false;
    setDeleteState({ busy: true, error: null });
    const result = await run(() => actionsRef.current.deleteNote({ id }), "Couldn't delete the note. Check your connection.");
    if (!result.ok) {
      setDeleteState({ busy: false, error: result.error.message });
      return;
    }
    router.replace("/notes");
  }

  const linked = useMemo(() => new Set(links.map(linkKey)), [links]);
  const options = useMemo(
    () =>
      note.linkOptions.filter(
        (o) => !linked.has(linkKey(o)) && !(o.kind === "note" && noteId !== null && o.noteId === noteId),
      ),
    [note.linkOptions, linked, noteId],
  );

  // [[Note title]] in the preview links to the note when the title is one of the student's notes.
  const resolveNote = useMemo(() => {
    const byTitle = new Map<string, string>();
    const add = (title: string, id: string) => byTitle.set(title.trim().toLocaleLowerCase(), `/notes/${id}`);
    for (const o of [...note.linkOptions, ...note.links]) {
      if (o.kind === "note") add(o.label, o.noteId);
    }
    for (const b of note.backlinks) add(b.title, b.noteId);
    return (t: string) => byTitle.get(t.trim().toLocaleLowerCase()) ?? null;
  }, [note.linkOptions, note.links, note.backlinks]);

  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen">
      <div style={step(0)} className="stagger flex animate-fade-up items-center justify-between gap-2.5">
        <Link
          href="/notes"
          aria-label="Back to notes"
          className="grid size-10 flex-none place-items-center rounded-full border border-line bg-app text-ink transition-transform duration-fast ease-out active:scale-90"
        >
          <BackIcon className="size-5" />
        </Link>
        <span aria-live="polite" className="truncate font-mono text-label tracking-label text-muted uppercase">
          {statusLabel(save, noteId)}
        </span>
        {noteId ? (
          <button
            type="button"
            onClick={openDeleteConfirm}
            aria-label="More: delete note"
            className="grid size-10 flex-none place-items-center rounded-full border border-line bg-app text-ink transition-transform duration-fast ease-out active:scale-90"
          >
            <MoreIcon className="size-5" />
          </button>
        ) : (
          <span aria-hidden="true" className="size-10 flex-none" />
        )}
      </div>

      {save.kind === "error" ? (
        <div role="alert" className="grid gap-2.5 rounded-md border border-missing bg-app p-4">
          <b className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-missing">Not saved</b>
          <p className="text-small text-muted">{save.message}</p>
          <button type="button" onClick={() => void flush()} className={`${inkButtonSm} justify-self-start`}>
            Retry
          </button>
        </div>
      ) : null}

      <textarea
        ref={titleRef}
        style={step(1)}
        rows={1}
        value={title}
        onChange={(e) => changeTitle(e.target.value.replace(/\n/g, " "))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setMode("write");
            requestAnimationFrame(() => bodyRef.current?.focus());
          }
        }}
        placeholder="Untitled"
        aria-label="Note title"
        className="stagger w-full animate-fade-up resize-none overflow-hidden bg-transparent font-display text-note-title font-black tracking-display text-ink outline-none placeholder:text-muted"
      />

      <div style={step(2)} className="stagger grid animate-fade-up gap-2">
        <ul aria-label="Links" className="flex flex-wrap gap-1.5">
          {links.map((link) => (
            <li key={linkKey(link)} className="max-w-full">
              <LinkChip link={link} pop={linkKey(link) === poppedKey} onRemove={() => remove(link)} />
            </li>
          ))}
          <li>
            <button
              ref={addRef}
              type="button"
              aria-expanded={pickerOpen}
              aria-controls={pickerOpen ? pickerId : undefined}
              onClick={() => (pickerOpen ? closePicker() : setPickerOpen(true))}
              className={cx(
                chipBase,
                "pr-2.5 transition-colors duration-fast",
                pickerOpen ? "border-solid border-ink text-ink" : "border-dashed border-line text-muted",
              )}
            >
              <PlusIcon className="size-3 flex-none" />
              Link
            </button>
          </li>
        </ul>
        {linkError ? (
          <p role="alert" className="flex items-center gap-2 text-hint text-muted before:size-1.5 before:rounded-full before:bg-missing">
            {linkError}
          </p>
        ) : null}
      </div>

      {pickerOpen ? <LinkPicker id={pickerId} options={options} onPick={pick} onClose={closePicker} /> : null}

      <div style={step(3)} className="stagger grid animate-fade-up gap-2.5">
        <div role="group" aria-label="Body view" className="inline-flex justify-self-end rounded-pill border border-line bg-surface p-0.75">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cx(
                "h-7.5 rounded-pill px-3 text-toggle font-bold transition-colors duration-fast",
                mode === m ? "bg-ink text-app" : "bg-transparent text-muted",
              )}
            >
              {m === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>

        {mode === "write" ? (
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => changeBody(e.target.value)}
            placeholder={"Start writing…\n- bullets, **bold**, *italic*, # headings, [[Note title]]"}
            aria-label="Note body (Markdown)"
            className="min-h-40 w-full resize-none overflow-hidden bg-transparent text-note-body text-ink outline-none placeholder:text-muted"
          />
        ) : (
          <div className="grid min-h-40 content-start gap-2.5 text-note-body">
            <MarkdownPreview markdown={body} resolve={resolveNote} />
          </div>
        )}
      </div>

      {note.backlinks.length > 0 ? (
        <section style={step(4)} aria-labelledby={`${pickerId}-back`} className="stagger grid animate-fade-up rounded-md bg-surface p-4">
          <h2 id={`${pickerId}-back`} className="pb-1.5 font-mono text-label tracking-label text-muted uppercase">
            Also linked from
          </h2>
          <ul className="grid">
            {note.backlinks.map((b) => (
              <li key={b.noteId}>
                <Link href={`/notes/${b.noteId}`} className="flex items-center gap-2 border-t border-line py-2.25 text-backlink font-bold">
                  <LinkIcon className="size-3.5 flex-none text-muted" />
                  <span className="min-w-0 truncate">{b.title.trim() || "Untitled"}</span>
                  <span className="ml-auto font-mono text-mono-xs font-medium text-muted">note</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {noteId ? (
        <div style={step(5)} className="stagger mt-2 grid animate-fade-up">
          {confirmDelete ? (
            <div role="alertdialog" aria-labelledby={`${pickerId}-del`} className="grid gap-2.5 rounded-md border border-missing bg-app p-4">
              <b id={`${pickerId}-del`} className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-missing">
                Delete this note?
              </b>
              <p className="text-small text-muted">This can&apos;t be undone. Its links go with it.</p>
              {deleteState.error ? (
                <p role="alert" className="text-small font-semibold text-ink">
                  {deleteState.error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  ref={cancelDeleteRef}
                  type="button"
                  disabled={deleteState.busy}
                  onClick={() => setConfirmDelete(false)}
                  className={ghostButtonSm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteState.busy}
                  onClick={() => void confirmDeleteNote()}
                  className={dangerButtonSm}
                >
                  {deleteState.busy ? "Deleting…" : "Delete note"}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={openDeleteConfirm} className={`${ghostButtonSm} justify-self-center`}>
              Delete note
            </button>
          )}
        </div>
      ) : null}
    </main>
  );
}

function statusLabel(save: SaveState, noteId: string | null): string {
  switch (save.kind) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Not saved";
    case "idle":
      return noteId ? "Saved" : "New note";
  }
}

// Loading state for /notes/[id] (route loading.tsx). Same frame as NoteEditorScreen.
export function NoteEditorSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your note"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen"
    >
      <div className="flex items-center justify-between">
        <span className="skel size-10 rounded-full" />
        <span className="skel h-3 w-20 rounded-sm" />
        <span className="skel size-10 rounded-full" />
      </div>
      <span className="skel h-9 w-4/5 rounded-sm" />
      <div className="flex gap-1.5">
        <span className="skel h-6.5 w-36 rounded-pill" />
        <span className="skel h-6.5 w-28 rounded-pill" />
      </div>
      <div className="grid gap-2.5">
        <span className="skel h-3.5 w-full rounded-sm" />
        <span className="skel h-3.5 w-11/12 rounded-sm" />
        <span className="skel h-3.5 w-3/4 rounded-sm" />
      </div>
    </main>
  );
}
