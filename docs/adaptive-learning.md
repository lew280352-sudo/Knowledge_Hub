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

## Implemented boundaries and learning decisions

- Difficulty and goal are independent account settings. Difficulty changes only optional teaching layers; canonical step identity, 80% pass threshold and all exam snapshots remain global and unchanged.
- First-wave extensions are authored for each canonical step at all three levels. Other stages explicitly display the canonical fallback. Guided examples use disclosure controls; conceptual checks and predictions are formative and never submit formal answers.
- The wave lab fixes v = 4 m/s in a nondispersive medium. It derives λ = v/f and T = 1/f and plots y(x,0) = A sin(2πx/λ) on a fixed 0–12 m axis. Frequency and amplitude controls are keyboard accessible; there is no autoplay. Advanced examples distinguish spatial and temporal phase, specify propagation direction and test assumptions.
- Source concepts use the existing 70 mappings. Server review reads submitted snapshots only, ranks attempts per source, and groups all occurrences in the latest covering attempt. A correct later covering attempt clears old recommendations. Blanks are labelled incomplete evidence. Nothing infers mastery from visits, time, game duration or selected difficulty.
- Practice hints and immediate pair feedback are separate from formal tests. Formal tests retain hidden answers until submission; returned solutions now link directly to the related lesson.
- Preference storage is additive, user-scoped and compare-and-swap. Migration SQL/metadata are appended; existing tables and snapshots are preserved. No public registration or authentication changes.

## Physics verification reference

Wave relationships and propagation/phase conventions were checked against [OpenStax University Physics, §16.2 Mathematics of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-2-mathematics-of-waves). Added example values are independently recalculated in `tests/learning.test.ts`; existing question-engine fixtures remain authoritative for all original source mappings.

## Future improvements (not shipped as implied capability)

- Author and independently review difficulty extensions for the remaining 19 stages before exposing them as multi-level content.
- Add explicit, consented cross-device storage if learners want to retain free-text lab reasoning; current prediction/reasoning inputs clearly state they are temporary and ungraded.
- Use a concept taxonomy more detailed than the source-question topic labels only after an editorial physics review. Current review provides transparent evidence, not a mastery score.
- Consider pagination/SQL tuning if the private account accumulates a much larger attempt history; source-ranked review already limits returned evidence to latest covering attempts.


## Final verification

- `npx tsc --noEmit`: passed.
- `npm test`: 23 passed (17 original plus dashboard derivation, preferences, migration preservation, review recovery and wave/variant verification).
- `npx playwright test`: 13 passed (9 incumbent flows plus four adaptive flows covering onboarding, independent settings, cross-device persistence/conflicts, offline/save failure, difficulty switching without progress loss, guided reasoning, fixed-speed controls and review navigation).
- axe-core 4.10.3: zero WCAG A/AA automated violations across 44 route/viewport combinations: dashboard, settings, foundation/advanced wave lesson, canonical fallback, game, exam setup, active exam, submitted review, history and formula book at 320/390/820/1440px.
- No browser exceptions, page overflow or KaTeX errors in that scan. Long formulas are keyboard-focusable so horizontal equation scrolling remains available at 320px. Focus, category targets, reduced motion and the original mobile focus trap are covered by browser checks.
- Pale-surface accent text uses `#066974`, while action/diagram/focus accent retains `#087F8C`. This fixes the measured small-text contrast failures from restoring the requested palette. Large stage numbers now use the secondary text token.
- SVG text contrast remains an axe manual-review item; graph labels use dark ink and mathematical relationships are repeated in readable captions. This is scoped browser/accessibility verification, not a certification of complete WCAG conformance or a manual screen-reader user study.
- Source diff confirms no changes to the 20 canonical stages, 70 source mappings, generated question templates, identity implementation, formal grading or original migration. No sample learner data is included in source or deployment artifacts.

The first three implementation commits isolate foundation, lesson architecture and feedback. The final verification commit contains observed accessibility/state fixes, tests and documentation. Browser screenshots/logs are checkout-local QA outputs and are not bundled with the app.

## Modified files
- `DESIGN.md`
- `PRODUCT.md`
- `app/adaptive.css`
- `app/api/preferences/route.ts`
- `app/dashboard.css`
- `app/globals.css`
- `app/layout.tsx`
- `app/tokens.css`
- `components/concept-checkpoint.tsx`
- `components/exam-view.tsx`
- `components/learning-app.tsx`
- `components/learning-preferences.tsx`
- `components/lesson-view.tsx`
- `components/matching-game.tsx`
- `components/math.tsx`
- `components/physics-diagram.tsx`
- `components/review-panel.tsx`
- `components/wave-lab.tsx`
- `db/schema.ts`
- `docs/adaptive-learning.md`
- `drizzle/0001_curious_trish_tilby.sql`
- `drizzle/meta/0001_snapshot.json`
- `drizzle/meta/_journal.json`
- `lib/client/sync.ts`
- `lib/learning.ts`
- `lib/lesson-variants.ts`
- `lib/question-types.ts`
- `lib/review.ts`
- `lib/server/store.ts`
- `lib/wave-model.ts`
- `tests/e2e/adaptive.spec.ts`
- `tests/learning.test.ts`
- `tests/store.test.ts`

Manual follow-up identified the framework's default 50%-alpha textarea placeholder in an axe incomplete case. A separate small follow-up commit gives placeholders the opaque secondary-text token; this changes presentation only. The production build also passed, and the packaged archive contains the additive migration without preview database files or sample learner data.
