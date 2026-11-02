# Adaptive learning UX — architecture, audit and phased plan

## Existing architecture and verified capabilities

Vinext/React/TypeScript renders one LearningApp with URL-query routes for path, stage (learn/game/test), exams, history and formula book. Existing components render paced canonical lessons, parameter-driven SVG physics diagrams, keyboard/touch matching, formal assessments and immutable submitted solutions. `lib/curriculum.ts` owns four chapters, 20 stages and 70 source mappings; `lib/questions.ts` generates numeric variants.

Authenticated same-origin APIs use `lib/server/store.ts` and D1 tables for lesson progress, game runs and examination snapshots. Lesson writes merge completed steps; answer writes use revision/event IDs; server scoring and 80% completion are authoritative. Active questions omit answers/explanations. Submitted snapshots remain unchanged. The client reports pending/offline/error states, keeps lesson/exam drafts locally, and refreshes verified account state across devices. Mobile navigation already supports inert background, focus trapping, Escape and focus restoration. Math uses KaTeX with accessible MathML; SVG diagrams and controls are labelled.

Missing: persistent independent difficulty/goal preferences, a variant content model, representative difficulty-specific teaching, and deterministic concept review. Existing games, solutions, sync, controls and progress must be extended, not rebuilt.

## UX audit

The path is easy to browse, but the dashboard does not explain the chosen learning approach or distinguish started from in-progress stages. Its main action does not recognize an all-completed path. Review requires manually inspecting history. Lessons provide controls without a predict/observe/explain structure. Assessment feedback has exact solutions but lacks a direct lesson return. Current tokens differ from the requested original laboratory palette; restore that palette with accessible action/focus variants and flat surfaces.

## Prioritized implementation and review boundaries

1. **Foundation:** additive preferences table/API, defaults `standard` + `exam-prep` for existing users, optional inline onboarding for new accounts only, explicit revision-conflict handling, verified status and dashboard actions/counts. Retain all existing records. Commit and check this phase separately.
2. **Lesson architecture:** optional typed per-level extensions; canonical stage arrays remain untouched. Only s01 receives authored foundation/standard/advanced material, guided examples, checkpoints and a predict → experiment → observe → explain → apply lab. Switch difficulty without changing step IDs, progress or exams. Check calculations and commit separately.
3. **Learning feedback:** aggregate only submitted snapshot results by source concept. Latest submitted attempt covering a source replaces older evidence; any missed item in that attempt merits review. Blank answers are labelled incomplete evidence. Show transparent reasons, lesson/game/history actions and exploratory fallback. Preserve formal answer protection and all scoring. Commit separately.
4. **Validation:** unit/integration checks for preferences, migration preservation, isolation/conflicts, review determinism, physics relationships and curriculum invariants; existing and new browser flows, responsive/keyboard/reduced-motion/contrast checks; production build and private publication.

## Data migration and failure behavior

Append a schema-only `learner_preferences` table (user ID primary key, difficulty, goal, onboarding flag, revision, update time); no backfill or changes to original tables. A missing row means the defaults above and revision 0. Existing activity suppresses onboarding. All settings writes use the same authenticated API and same-origin protection as progress. A revision mismatch returns 409; keep the visible draft and require an explicit latest-value reload before retrying. A failed/offline request never updates the saved preference summary. Preferences are cross-device records; unsaved form edits are not advertised as synchronized. Learning goals guide next-action copy, independently of difficulty. Learning progress remains global to canonical stages, not reset or duplicated by level.
