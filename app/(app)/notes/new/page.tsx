import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NoteEditorScreen } from "@/components/notes/NoteEditorScreen";
import { addLink, deleteNote, removeLink, save } from "@/lib/actions/notes";
import { getSessionStudent } from "@/lib/auth/session";
import { getNoteEditor } from "@/lib/db/queries/notes";

export const metadata = { title: "New note" };

type NewNotePageProps = {
  searchParams: Promise<{ topic?: string | string[] }>;
};

async function NewNoteContent({ searchParams }: NewNotePageProps) {
  const [student, resolvedParams] = await Promise.all([getSessionStudent(), searchParams]);
  if (!student) {
    redirect("/login");
  }

  const presetTopicId = typeof resolvedParams.topic === "string" ? resolvedParams.topic : undefined;
  const note = await getNoteEditor(student.studentId, student.userId, null, presetTopicId);
  if (!note) {
    redirect("/login");
  }

  return <NoteEditorScreen note={note} actions={{ save, addLink, removeLink, deleteNote }} />;
}

export default function NewNotePage({ searchParams }: NewNotePageProps) {
  return (
    <Suspense fallback={null}>
      <NewNoteContent searchParams={searchParams} />
    </Suspense>
  );
}
