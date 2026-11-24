import { NextResponse } from "next/server";
import { runDeadlineReminders } from "@/lib/push/reminders";

export function checkCronAuth(
  authHeader: string | null,
  cronSecret?: string,
): { ok: true } | { ok: false; status: number; message: string } {
  if (!cronSecret) {
    return {
      ok: false,
      status: 500,
      message: "CRON_SECRET is not configured on the server.",
    };
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized: Invalid or missing authorization header.",
    };
  }

  return { ok: true };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();

  const authCheck = checkCronAuth(authHeader, cronSecret);
  if (!authCheck.ok) {
    return NextResponse.json(
      { error: authCheck.message },
      { status: authCheck.status },
    );
  }

  try {
    const result = await runDeadlineReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron push-reminders run failed:", error);
    return NextResponse.json(
      { error: "Failed to run deadline reminders." },
      { status: 500 },
    );
  }
}
