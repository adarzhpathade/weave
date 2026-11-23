import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HomeScreen } from "@/components/home/HomeScreen";
import { getSessionStudent } from "@/lib/auth/session";
import { getHomeData } from "@/lib/db/queries";

export const metadata = { title: "Home" };

async function HomeContent() {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const home = await getHomeData(student.studentId);
  if (!home) {
    redirect("/login");
  }

  return <HomeScreen home={home} now={new Date().toISOString()} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
