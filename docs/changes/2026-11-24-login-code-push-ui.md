# Login code step, push UI, local-server fixes and cleanup
- Date / tool + model / branch: 2026-11-24 / Claude Code, Opus (orchestrator) + 2 Sonnet workers / feat/login-code-push
## What changed
- app/(public)/login/{EmailStep,CodeStep,LoginClient,page}.tsx: two-step sign-in (email → 6-digit code; demo email skips the code). Auto-submit at 6 digits, resend with 30 s cooldown, change email, pending states, errors announced.
- components/pwa/usePush.ts, PushToggle.tsx: push on/off hook + Profile row. Permission asked only after a tap; iOS "Add to Home Screen" hint; blocked/unsupported help lines.
- components/profile/ProfileScreen.tsx: "Phone notifications" row at the top of Notifications.
- components/assignments/AssignmentSheet.tsx: "Remind me" button (or help line) on the sheet.
- usePush.ts: reads `serviceWorker.getRegistration()` instead of waiting on `.ready` (the worker is production-only, so `.ready` hung in dev).
- lib/push/config.ts, lib/push/send.ts, lib/actions/push.test.ts: named imports from web-push (it has no default export; Turbopack build error).
- proxy.ts: `/.well-known/*` probes answer 404 instead of falling into the catch-all route.
- .gitignore: ignore `.vercel` and `.env*` (keeps `.env.example`).
- tasks/: removed finished task files.
## Design decisions
- No new tokens. Code field reuses the night-tone Input with `tracking-label`; resend/change-email are ghost buttons.
## Assumptions
- VAPID_SUBJECT = the production app URL. VAPID + CRON_SECRET added to Vercel production + preview (sensitive) and to .env.local.
## Not done / follow-ups
- Real email code not tested end to end with a real inbox (needs a real student email on the list).
- Push delivery to a real phone not tested yet (needs the production deploy + an installed PWA).
