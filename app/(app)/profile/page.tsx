import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { signOut } from "@/lib/actions/auth";
import { updateNotify } from "@/lib/actions/profile";
import { getSessionStudent } from "@/lib/auth/session";
import { getProfile } from "@/lib/db/queries/profile";

export const metadata = { title: "Profile" };

async function ProfileContent() {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const profile = await getProfile(student.studentId);
  if (!profile) {
    redirect("/login");
  }

  return <ProfileScreen data={profile} actions={{ updateNotify, signOut }} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
