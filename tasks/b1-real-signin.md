---
branch: feat/b1-real-signin
base: origin/main
model: gemini-3.8-flash (teammate, Antigravity IDE)
files_allowed: lib/auth/**, lib/actions/auth.ts, lib/actions/auth.test.ts, lib/db/queries/students.ts, lib/envSchema.ts, lib/envSchema.test.ts, .env.example, package.json, package-lock.json, docs/changes/**, NOTES.md
subagents: not-allowed
shell: yes
---

# b1 — Real sign-in with an email code (Neon Auth)

## Goal
Today anyone who types an email from the student list gets in without any proof. After this task:
a student types their college email → gets a **6-digit code by email** → types the code → gets in.
Only emails on the `students` list (status `active`) can get a code. The demo account
(`DEMO_STUDENT_EMAIL`) still signs in without a code, so the public demo keeps working.

**Backend only.** Do not change `app/(public)/login/LoginClient.tsx` or any screen.
The code-entry box on the login screen is built in a separate UI task using the contract below.

## How it works (keep this design)
- **Neon Auth** (Managed Better Auth, email OTP) only proves the student owns the email.
- After the code is correct, we keep using **our own `weave_session` cookie** exactly as today
  (`createSession` in `lib/auth/session.ts`). So `proxy.ts`, `getSessionStudent()` and every screen
  stay unchanged.
- The student list check happens **before** a code is sent, so strangers never receive codes.

## Contract (exact; the UI task depends on it)
In `lib/actions/auth.ts` (a `"use server"` file), using `ActionResult` from `lib/actions/types.ts`:

```ts
// Step 1: validate email, check the student list, send the code.
// For the demo email: do NOT send a code; sign in straight away and return { demo: true }.
export async function requestSignInCode(email: string): Promise<ActionResult<{ demo: boolean }>>;

// Step 2: check the code with Neon Auth, then create the weave_session cookie.
export async function verifySignInCode(email: string, code: string): Promise<ActionResult<{ studentId: string }>>;

// Keep these as they are:
export async function signIn(email: string): ...   // keep working ONLY for the demo email; for any other email return error code "CODE_REQUIRED"
export async function signOut(): Promise<void>;
```

Error codes (the `message` must be friendly, in simple English):
| code | when | message |
|---|---|---|
| `INVALID_EMAIL` | not an email | "Enter your college email." |
| `NOT_ON_LIST` | not on the list, inactive, or wrong domain | "This email isn't on the CSIT student list." |
| `INVALID_CODE` | code is not 6 digits, wrong or expired | "That code is wrong or has expired. Try again." |
| `TOO_MANY_TRIES` | Neon Auth rate limit (HTTP 429) | "Too many tries. Wait a minute and try again." |
| `CODE_REQUIRED` | `signIn` used with a non-demo email | "We've moved to email codes. Request a code to sign in." |
| `SIGN_IN_FAILED` | anything else | "Couldn't sign you in right now. Please try again." |

Log the real error on the server with `console.error` (never the code or secrets). Never hide a failure
(no `catch` that returns `ok: true`).

## References
- `AGENTS.md` §2 (Auth row), §3, §10 (server action result shape)
- `lib/actions/auth.ts` — current demo sign-in (copy its Zod email check and domain check)
- `lib/auth/session.ts` — `createSession`, `getSessionStudent` (do not change their signatures)
- `lib/db/queries/students.ts` — `getStudentByEmail`, `ensureStudentUser`
- `lib/db/schema/people.ts` — `users.id` has no default: it is meant to hold the Neon Auth user id
- Neon Auth docs: https://neon.com/docs/auth/overview and the email OTP page in the same docs.
  Better Auth email OTP plugin: https://www.better-auth.com/docs/plugins/email-otp

## Steps
1. Read the references. In Neon Auth docs find how to **send an email OTP** and **sign in with an
   email OTP from the server** (Node). Use the official Neon Auth package if it supports server-side
   calls (install it with `npm install <package>`; it is already part of our planned stack). If the
   package has no server API, call the Better Auth HTTP endpoints under `NEON_AUTH_BASE_URL` with `fetch`
   (`/email-otp/send-verification-otp` with `type: "sign-in"`, then `/sign-in/email-otp`). Write which
   one you used and why in the PR.
2. Create `lib/auth/neonAuth.ts` (starts with `import "server-only";`) with two functions:
   `sendEmailCode(email)` and `verifyEmailCode(email, code)`. `verifyEmailCode` returns the Neon Auth
   user `{ id, email, name }` on success, or a typed error (`"invalid_code" | "rate_limited" | "failed"`).
   Use a 10-second timeout on each request. Read `NEON_AUTH_BASE_URL` from `lib/env.ts`.
3. In `lib/db/queries/students.ts`, add `linkStudentToAuthUser(studentId, authUserId, email, name)`:
   - if the student already has a `userId`, return it (do not change it);
   - otherwise, in **one transaction**: insert the `users` row with `id = authUserId`
     (`onConflictDoNothing` on email), then set `students.user_id`. Return the user id.
4. In `lib/actions/auth.ts`, write `requestSignInCode` and `verifySignInCode` following the contract.
   Use Zod: email as in the current `signIn`, code = exactly 6 digits (`/^\d{6}$/`).
   `verifySignInCode` must check the student list **again** (student may have been removed),
   then link the user (step 3), then call `createSession(student.id, userId)`.
5. Change `signIn` so it only works for the demo email (see contract).
6. Tests: create `lib/actions/auth.test.ts` with Vitest. Mock `lib/auth/neonAuth.ts`,
   `lib/db/queries` and `lib/auth/session.ts` with `vi.mock`. Cover: invalid email, not on list,
   demo email skips the code, code sent for a listed student, wrong code, rate limited, correct code
   creates a session. Look at `lib/auth/cookie.test.ts` for the test style.
7. If you added any env var, add it to `lib/envSchema.ts` and `.env.example` (placeholder value only)
   and ASK Adarsh to add the real value on Vercel (write it under "Requests" in the PR).
8. Manual test: run `npm run dev`, open http://localhost:3000/login, sign in with
   `demo.student@weave.test` and confirm Home opens (the demo path must still work).
   The code flow can't be clicked through yet (no code box on the screen), so it is covered by the
   unit tests. Write that in the PR.
9. Do STEP 7–9 of the start-here prompt (checks, change file, PR).

## Done when
- [ ] `requestSignInCode`, `verifySignInCode` exist with the exact signatures and error codes above
- [ ] No code is ever sent to an email that is not on the active student list
- [ ] Demo email still signs in with no code; the live demo is not broken
- [ ] `lib/auth/session.ts` public functions unchanged; `proxy.ts` untouched
- [ ] Tests for every row of the error table pass; typecheck, lint, test, build pass
- [ ] No secrets, no `any`, only `files_allowed` touched, PR opened (not merged)

## Admin step (Adarsh, not the teammate)
Email OTP must be turned on for the Neon Auth project (Neon console → Auth → Email OTP), and the
email sender configured. Check this before testing the UI end to end.
