import { Suspense } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";

async function RootRedirect(): Promise<null> {
  const session = await readSession();
  redirect(session ? "/home" : "/login");
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}
