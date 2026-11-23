import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NotesScreen } from "@/components/notes/NotesScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getNotesPage } from "@/lib/db/queries/notes";

export const metadata = { title: "Notes" };

type NotesPageProps = {
  searchParams: Promise<{ topic?: string | string[] }>;
};

async function NotesContent({ searchParams }: NotesPageProps) {
  const [student, resolvedParams] = await Promise.all([getSessionStudent(), searchParams]);
  if (!student) {
    redirect("/login");
  }

  const topicId = typeof resolvedParams.topic === "string" ? resolvedParams.topic : undefined;
  const data = await getNotesPage(student.studentId, student.userId, topicId);

  return <NotesScreen data={data} />;
}

export default function NotesPage({ searchParams }: NotesPageProps) {
  return (
    <Suspense fallback={null}>
      <NotesContent searchParams={searchParams} />
    </Suspense>
  );
}
