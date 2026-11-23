# Test plan

## Levels
| Level | Tool | What |
|---|---|---|
| Unit | Vitest | `lib/progress` formula, Zod schemas, link parsing, countdown formatting, quota logic |
| Integration | Vitest + Neon test branch | Server actions with guards (student can't read others' notes, future semester locked) |
| E2E | Playwright | Main flows on mobile (390×844) and desktop (1440×900) |
| Visual | Playwright screenshots | Each screen vs. approved reference / baseline |
| Accessibility | axe (Playwright) | No serious violations per screen |
| Performance | Lighthouse (mobile) | Budgets from `AGENTS.md` §7 |
| PWA | Lighthouse + real devices | Install, offline, push on Android + iOS |
| Load | k6 | See `scalability.md` |

## Test cases (to be expanded per feature)
| ID | Req | Case | Expected |
|---|---|---|---|
| TC-1 | FR-1.1 | Sign in with an email that is not on the student list | Signed out with "Ask your department to add you" |
| TC-2 | FR-1.2 | First sign-in of a listed student | Onboarding shows their list details; after it, Home |
| TC-3 | FR-3.1 | Select a future semester | Disabled with lock icon |
| TC-4 | FR-5.2 | Type in a note, wait 2 s | "Saved" shown; reload keeps text |
| TC-5 | NFR-5 | Student A requests student B's note ID | Not found / forbidden |
| TC-6 | FR-4.1 | CY student opens Subjects | Sees CY's plan (extra subjects, shifted semesters), not CSIT's |
| TC-7 | FR-4.2 | Write the first note on a topic | Topic becomes covered; unit, subject and semester % rise |
| TC-8 | FR-6.3 | Assignment due in 2 days | One push notification received (installed app), not repeated |
| TC-9 | FR-6.1 | CSIT-1 student opens Assignments | Sees only assignments for CSIT-1 |
| TC-10 | FR-8.2 | Go offline, open Home | Last data or branded offline page |
| TC-11 | NFR-2 | k6 200 VUs | p95 < 800 ms, errors < 1% |

## Results
_(filled as features are finished)_
