# Physic Learn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved private Thai physics learning website with all 70 source-question mappings, 20 stages, visual lessons, matching games, generated exams and durable cross-device progress.

**Architecture:** Sites Vinext/React application uses D1 and trusted platform identity. The server generates and stores immutable question snapshots, grades submissions and applies optimistic concurrency. Shared typed curriculum drives learning, games, navigation and source references.

**Tech Stack:** TypeScript, React, Vinext, Cloudflare D1, Lucide, KaTeX, Node test runner and Playwright.

**Spec:** `docs/superpowers/specs/2026-11-02-physic-learn-design.md` (approved 2026-11-02)

## Global Constraints

- 20 stages and 70 original-question mappings across waves (20), wave optics (10), ray optics (20), sound (20).
- Private Sites audience, ChatGPT identity, server persistence; no production localStorage-only progress.
- Stage test defaults 5 questions, combined test 20, untimed by default, stage pass 80%.
- Persist answers and exact generated snapshots, expose solutions only after submission.
- Thai copy, source page references (waves questions 19–20 are PDF page 58), accessible interactions, 390px and desktop support.
- No AI runtime dependency, no leaked secrets, no unrelated changes to the previous project.

## Review Focus

- Out-of-range physical parameters or duplicate rounded choices must never produce invalid exams (Task 1 tests).
- Stale writes from a second device preserve the server revision and surface a recoverable conflict (Task 2 tests).
- A retry after a lost response cannot double-submit or award progress twice (Task 2 tests).
- Network interruption preserves a local draft and never falsely claims saved/submitted state (Task 3 Playwright).
- Browser refresh, focus and expired deadlines preserve attempt identity and timing (Tasks 2 and 3 tests).

## Task 1: Curriculum and deterministic question engine

**Files:** `lib/curriculum.ts`, `lib/questions.ts`, `lib/question-types.ts`, `tests/questions.test.ts`, `docs/content-inventory.md`.
**Interfaces:** `stages: Stage[]`; `sourceQuestions: SourceQuestion[]`; `generateQuestion(sourceId: string, seed: number): QuestionSnapshot`; `publicQuestion(snapshot): PublicQuestion`; `grade(snapshot, answer): boolean`.

- [ ] Write tests asserting all 70 source IDs appear once and all 20 stages have lesson steps, matching pairs and source references.
- [ ] Run the test and observe missing modules before implementing.
- [ ] Implement typed curriculum, source inventory, validated parameter generation, unique choices and worked explanations. Numeric/diagram variants come from the same parameters; conceptual questions vary scenarios/choices.
- [ ] Verify each template against a separately calculated fixture and many seeds; assert finite results, sensible ranges, stable seed reproduction and no answer/solution fields in public questions.
- [ ] Commit curriculum, tests and inventory.

## Task 2: Authenticated D1 persistence and exam API

**Files:** `db/schema.ts`, generated migrations, `lib/server/store.ts`, `app/api/state/route.ts`, `app/api/progress/route.ts`, `app/api/attempts/route.ts`, `app/api/attempts/[id]/route.ts`, `tests/store.test.ts`.
**Interfaces:** `readState(userId)`, `saveLesson(userId, progress)`, `createAttempt(userId, options)`, `updateAttempt(userId, id, revision, answers)`, `submitAttempt(userId, id, revision)`; API returns sanitized active attempts and complete submitted attempts.

- [ ] Write tests for trusted identity requirement, ownership isolation, stale revisions, malformed input, immutable submission, duplicate events, deadline expiry and server-calculated score.
- [ ] Run tests and observe missing store implementation.
- [ ] Provision the approved Sites project, install the supported Vinext starter and declare D1 binding. Implement schema migrations and server functions using single-statement prepare calls and atomic conditional writes.
- [ ] Implement request validation, same-origin write checks, bounded request sizes, secure API responses and auth from the platform helper.
- [ ] Run store tests against local D1 and generate/apply migrations. Commit.

## Task 3: Learning UI, games, exams and sync

**Files:** `app/page.tsx`, `app/globals.css`, `components/learning-app.tsx`, `components/lesson-view.tsx`, `components/physics-diagram.tsx`, `components/matching-game.tsx`, `components/exam-view.tsx`, `components/history-view.tsx`, `lib/client/sync.ts`, `PRODUCT.md`, `DESIGN.md`.
**Interfaces:** consumes Task 1 types and Task 2 JSON API; `PhysicsDiagram({ kind, values })` renders one source of numeric truth; `useLearningState()` exposes data, save status, error and retry.

- [ ] Establish Taste app-screen direction and Impeccable context; implement responsive app shell with a source-linked curriculum map and resume action.
- [ ] Implement complete lesson steps, accessible parameter diagrams, click/keyboard matching games, exam setup, persisted answer selection, submission and historical solutions.
- [ ] Implement server-state refresh on focus/online/poll while an attempt is active, draft recovery and explicit conflict resolution; never silently overwrite a newer revision.
- [ ] Add Playwright coverage for lesson resume, matching completion, exam reload, final grading/history, failed save/retry, two contexts against the same server state and stale-write conflict.
- [ ] Inspect screenshots at 390px, tablet and desktop; check keyboard, reduced motion, source links, overflow and browser console. Fix observed failures and commit.

## Task 4: Final verification, repository sync and private publication

**Files:** `README.md`, `docs/verification.md`, `.openai/hosting.json`, source/build artifact.
**Interfaces:** final tests/build and exact source commit are inputs to the Sites source helper and private deploy tool.

- [ ] Run TypeScript, meaningful unit/integration/browser checks and production build; review whole change for auth, answer leakage, conflict behavior and all 70 source mappings.
- [ ] Fix material findings, record actual verification with limitations and write run/deploy instructions.
- [ ] Sync all source to the user's GitHub repository (connected API fallback if shell push remains denied), ensuring no credential files or build caches enter Git.
- [ ] Package exact source using the Sites helper, publish private and wait for terminal success. Return the actual deployed URL and repository link.

## Execution decision

The user explicitly approved the design and starting development. Proceed natively in this session without asking for the same authorization again. Bounded curriculum/research and final review delegation may be used when required by the invoked skills; the primary agent owns integration and Sites publication.
