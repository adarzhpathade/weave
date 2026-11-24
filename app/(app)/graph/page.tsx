import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { GraphScreen } from "@/components/graph/GraphScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getGraphData } from "@/lib/db/queries/graph";

export const metadata = { title: "Graph" };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type GraphSearchParams = Promise<{
  subject?: string | string[];
}>;

async function GraphContent({ searchParams }: { searchParams: GraphSearchParams }) {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const params = await searchParams;
  const rawSubject = Array.isArray(params.subject) ? params.subject[0] : params.subject;
  const subjectParam = rawSubject?.trim() || undefined;

  if (subjectParam !== undefined && !UUID_PATTERN.test(subjectParam)) {
    notFound();
  }

  const data = await getGraphData(student.studentId, student.userId, subjectParam);
  if (!data) {
    notFound();
  }

  return <GraphScreen data={data} />;
}

export default function GraphPage({ searchParams }: { searchParams: GraphSearchParams }) {
  return (
    <Suspense fallback={null}>
      <GraphContent searchParams={searchParams} />
    </Suspense>
  );
}
