import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { SubjectDetailScreen } from "@/components/subjects/SubjectDetailScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getSubjectDetail } from "@/lib/db/queries/subjects";

export const metadata = { title: "Subject" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SubjectDetailPageProps = {
  params: Promise<{ subjectId: string }>;
};

async function SubjectDetailContent({ params }: SubjectDetailPageProps) {
  const [{ subjectId }, student] = await Promise.all([params, getSessionStudent()]);
  if (!student) {
    redirect("/login");
  }

  if (!UUID_PATTERN.test(subjectId)) {
    notFound();
  }

  const subject = await getSubjectDetail(student.studentId, subjectId);
  if (!subject) {
    notFound();
  }

  return <SubjectDetailScreen subject={subject} />;
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  return (
    <Suspense fallback={null}>
      <SubjectDetailContent params={params} />
    </Suspense>
  );
}
