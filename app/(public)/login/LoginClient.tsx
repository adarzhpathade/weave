"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

// Server pages cannot pass functions to client components, so this thin wrapper owns the handler.
// Real sign-in replaces `onContinue` in the backend task; the form itself stays untouched.
export function LoginClient() {
  const router = useRouter();
  return <LoginForm onContinue={() => router.push("/")} />;
}
