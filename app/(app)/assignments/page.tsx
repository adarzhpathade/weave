import { Suspense } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AssignmentsScreen } from "@/components/assignments/AssignmentsScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getAssignmentsPage } from "@/lib/db/queries/assignments";

export const metadata = { title: "Assignments" };

type AssignmentsSearchParams = Record<string, string | string[] | undefined>;

type AssignmentsPageProps = {
  searchParams: Promise<AssignmentsSearchParams>;
};

const openIdSchema = z.string().uuid();

function parseOpenId(params: AssignmentsSearchParams): string | undefined {
  const raw = params.open ?? params.openId ?? params.id;
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (!candidate) {
    return undefined;
  }
  const parsed = openIdSchema.safeParse(candidate);
  return parsed.success ? parsed.data : undefined;
}

async function AssignmentsContent({ searchParams }: AssignmentsPageProps) {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const [data, resolvedParams] = await Promise.all([
    getAssignmentsPage(student.studentId),
    searchParams,
  ]);
  if (!data) {
    redirect("/login");
  }

  const openId = parseOpenId(resolvedParams);

  return <AssignmentsScreen data={data} openId={openId} />;
}

export default function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  return (
    <Suspense fallback={null}>
      <AssignmentsContent searchParams={searchParams} />
    </Suspense>
  );
}
