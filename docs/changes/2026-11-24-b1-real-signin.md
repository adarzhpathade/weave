# Real sign-in with an email code (Neon Auth)
- Date / tool + model / branch: 2026-11-24 / Antigravity IDE (Gemini 3.8 Flash) / `feat/b1-real-signin`

## What changed
- `package.json`, `package-lock.json` — added `@neon/auth@latest` (0.8.2) for Neon Auth (Managed Better Auth) email OTP.
- `lib/auth/server.ts` — new server-only module with `createNeonAuth` instance, `sendEmailCode(email)`, and `verifyEmailCode(email, code)` with error classification mapping.
- `lib/db/queries/students.ts` — added `linkStudentToAuthUser(studentId, authUserId, email, name)` to link `users` and `students` atomically in a transaction on first sign-in.
- `lib/actions/auth.ts` — implemented `requestSignInCode` and `verifySignInCode` adhering to the contract; updated `signIn` to require email codes for non-demo emails (`CODE_REQUIRED`); updated `signOut` to call `auth.signOut()`.
- `lib/actions/auth.test.ts` — added full test suite covering error codes (`INVALID_EMAIL`, `NOT_ON_LIST`, `INVALID_CODE`, `TOO_MANY_TRIES`, `CODE_REQUIRED`, `SIGN_IN_FAILED`) and success paths for demo and listed students.

## Design decisions
- Backend contract preserved: `weave_session` cookie continues to manage the application session so existing screens and route guards require no changes.
- Student list gate runs prior to OTP dispatch so non-department emails never receive codes.

## Assumptions (also in NOTES.md)
- Real sign-in via Neon Auth email OTP: `requestSignInCode` gates code dispatch to active students on the department list; demo account (`DEMO_STUDENT_EMAIL`) bypasses OTP to keep public demo working; `weave_session` cookie retained after OTP verification.

## Not done / follow-ups
- UI update on `app/(public)/login/LoginClient.tsx` to display the 6-digit OTP code input (handled in separate UI task).
- Production SMTP setup in Neon Auth console before launching to students.
