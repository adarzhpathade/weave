"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { signIn } from "@/lib/actions/auth";

export function LoginClient() {
  const router = useRouter();

  async function handleContinue(
    email: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    const result = await signIn(email);
    if (result.ok) {
      router.replace("/home");
      return { ok: true };
    }
    return { ok: false, message: result.error.message };
  }

  return <LoginForm onContinue={handleContinue} />;
}
