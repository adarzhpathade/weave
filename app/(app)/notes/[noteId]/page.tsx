import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { NoteEditorScreen } from "@/components/notes/NoteEditorScreen";
import { addLink, deleteNote, removeLink, save } from "@/lib/actions/notes";
import { getSessionStudent } from "@/lib/auth/session";
import { getNoteEditor, isValidUuid } from "@/lib/db/queries/notes";

export const metadata = { title: "Note" };

type NoteDetailPageProps = {
  params: Promise<{ noteId: string }>;
};

async function NoteDetailContent({ params }: NoteDetailPageProps) {
  const [student, { noteId }] = await Promise.all([getSessionStudent(), params]);
  if (!student) {
    redirect("/login");
  }

  if (!isValidUuid(noteId)) {
    notFound();
  }

  const note = await getNoteEditor(student.studentId, student.userId, noteId);
  if (!note) {
    notFound();
  }

  return <NoteEditorScreen note={note} actions={{ save, addLink, removeLink, deleteNote }} />;
}

export default function NoteDetailPage({ params }: NoteDetailPageProps) {
  return (
    <Suspense fallback={null}>
      <NoteDetailContent params={params} />
    </Suspense>
  );
}
