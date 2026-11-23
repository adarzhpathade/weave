import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SubjectsScreen } from "@/components/subjects/SubjectsScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getSubjectsPage } from "@/lib/db/queries/subjects";

export const metadata = { title: "Subjects" };

async function SubjectsContent() {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const data = await getSubjectsPage(student.studentId);
  if (!data) {
    redirect("/login");
  }

  return <SubjectsScreen data={data} />;
}

export default function SubjectsPage() {
  return (
    <Suspense fallback={null}>
      <SubjectsContent />
    </Suspense>
  );
}
