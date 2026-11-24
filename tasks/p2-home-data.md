---
branch: feat/p2-home-data
base: origin/feat/p2-home
model: gemini-4-neon-medium
files_allowed: lib/auth/**, lib/actions/**, lib/db/queries/**, proxy.ts, app/page.tsx, app/(app)/layout.tsx, app/(app)/home/**, app/(public)/login/LoginClient.tsx
subagents: not-allowed
shell: no
---

# p2-home-data — demo sign-in, session, and data wiring for Home (backend, nothing styled)

## Goal
A student whose email is on the `students` list signs in on `/login` and lands on `/home` with their real data; everyone else is kept out.
A parallel Sonnet worker builds all visible components. You write NO markup/styling beyond rendering their components. Their contract (code against it exactly; the files may not exist in your worktree yet):
```ts
import { AppShell } from "@/components/nav/AppShell";
// <AppShell student={ShellStudent} notifications={NotificationItem[]} markAllReadAction={fn} signOutAction={fn}>{children}</AppShell>
// ShellStudent = { firstName: string; fullName: string; divisionCode: string; programCode: string; semester: number }
import { HomeScreen } from "@/components/home/HomeScreen";
// <HomeScreen home={HomeData} now={new Date().toISOString()} />
// LoginForm prop: onContinue: (email: string) => Promise<{ ok: true } | { ok: false; message: string }>
```

## Read first
AGENTS.md §3, §4, §10. Next.js 16: read `node_modules/next/dist/docs/` for `proxy.ts`, `cookies()`, server actions, `redirect`, and cacheComponents (`next.config.ts` has it on — dynamic data needs `await connection()` or reading cookies inside a `<Suspense>` boundary; check the docs). `lib/db/queries/*`, `lib/db/schema/people.ts`.

## Decision (logged by orchestrator): demo sign-in for Phase 2
Neon Auth (email OTP) comes later. For now: email-only sign-in against the students list, session = httpOnly, secure-in-prod, sameSite=lax cookie `weave_session` holding `studentId.userId.expiry` signed with HMAC-SHA256 using env `SESSION_SECRET` (node `crypto`, constant-time compare), 30 days.

## Steps
1. `lib/auth/session.ts` (server-only): `createSession(studentId, userId)`, `readSession()`, `destroySession()`, and `getSessionStudent(): Promise<{ studentId; userId; email; firstName; fullName; divisionCode; programCode; semester } | null>` (one query).
2. `lib/actions/auth.ts`: `signIn(email)` → Zod email, lowercase/trim; look up with `getStudentByEmail`; reject if not found or status not active (message "This email isn't on the CSIT student list."); `ALLOWED_EMAIL_DOMAINS` check except for `DEMO_STUDENT_EMAIL`; on first sign-in create a `users` row (role student, email, name) and link `students.user_id`; create session; return `{ ok: true }` (client navigates). `signOut()` → destroy + redirect `/login`.
3. `lib/actions/notifications.ts`: `markAllRead()` → session check, insert `announcement_reads` for all unread announcements visible to the student (on conflict do nothing), `revalidatePath("/home")` / tag.
4. `proxy.ts`: unauthenticated requests to app routes (`/home`, `/subjects`, `/notes`, `/assignments`, `/profile`, `/graph`, `/materials`, any other non-public path) → `/login`; signed-in user visiting `/login` → `/home`. Public: `/login`, `/offline`, `/manifest.webmanifest`, `/sw.js`, icons, `/_next`, static files. Cookie signature verified in `readSession` (proxy may only check presence + expiry format).
5. `app/page.tsx` → redirect `/home` if session else `/login`. `app/(app)/layout.tsx` → `getSessionStudent()` (redirect `/login` if null), `getNotifications(userId, studentId)`, render `<AppShell …>`. `app/(app)/home/page.tsx` → `getHomeData(studentId)` → `<HomeScreen …/>`. Add `app/(app)/home/loading.tsx` returning `null` placeholder is NOT needed — Sonnet handles visuals; just keep the data fetch inside Suspense as Next 16 requires.
6. `app/(public)/login/LoginClient.tsx`: `onContinue` calls `signIn` and `router.replace("/home")` on success, returns the result.
7. Queries: fix anything needed for the above (e.g. `getNotifications` must work after first sign-in; Dates must serialize to client components). Keep every query scoped to the session student.
8. REPORT.md, print TASK COMPLETE.

## Done when
- [ ] Demo email signs in → `/home`; unknown email gets the friendly error; `/home` without cookie → `/login`
- [ ] Sign out works; mark-all-read persists
- [ ] Zod on inputs, typed `{ ok, data | error }` results, no `any`, no secrets in code, only files_allowed touched
