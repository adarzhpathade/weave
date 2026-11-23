import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { signOut } from "@/lib/actions/auth";
import { markAllRead } from "@/lib/actions/notifications";
import { getSessionStudent } from "@/lib/auth/session";
import { getNotifications } from "@/lib/db/queries";

async function AuthenticatedAppShell({ children }: { children: ReactNode }) {
  const student = await getSessionStudent();
  if (!student) {
    redirect("/login");
  }

  const notifications = await getNotifications(student.userId, student.studentId);

  return (
    <AppShell
      student={{
        firstName: student.firstName,
        fullName: student.fullName,
        divisionCode: student.divisionCode,
        programCode: student.programCode,
        semester: student.semester,
      }}
      notifications={notifications}
      markAllReadAction={markAllRead}
      signOutAction={signOut}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
    </Suspense>
  );
}
