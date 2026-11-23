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
| TC-1 | FR-1.1 | Sign up with a non-college email | Rejected with a clear message |
| TC-2 | FR-1.2 | First login | Onboarding shown; after it, dashboard |
| TC-3 | FR-3.1 | Select a future semester | Disabled with lock icon |
| TC-4 | FR-6.2 | Type in a note, wait 2 s | "Saved" shown; reload keeps text |
| TC-5 | NFR-5 | Student A requests student B's note ID | Not found / forbidden |
| TC-6 | FR-8.2 | Ask the tutor something not in the material | "Not covered in your material" |
| TC-7 | FR-8.3 | Score ≥ 50% on a topic quiz with a note | Topic becomes covered; unit % rises |
| TC-8 | FR-9.2 | Assignment due in 2 days | Push notification received (installed app) |
| TC-9 | FR-10.2 | Go offline, open dashboard | Last data or branded offline page |
| TC-10 | NFR-2 | k6 200 VUs | p95 < 800 ms, errors < 1% |

## Results
_(filled as features are finished)_
