# V3.0 release verification

Date: 2 November 2026 (Asia/Bangkok). Baseline: GitHub main `e927483611f4f1ebe083f58ed2bc8a531bcb4a0d`, identical tree to opened Site source `ad476e9d847e3f90d77a574e4f7dcfce9268db75`. Implementation is split into curriculum, physics interactions, evidence/feedback, UX/CI and verification commits.

## Implemented result

- All 20 stages provide three distinct authored learning levels, retaining canonical teaching and step identity. s02–s20 add 57 checked numerical examples with units, assumptions, misconceptions and conceptual checks.
- 19 guided-lab stages follow predict, experiment, observe, explain, apply. The retained wave lab is joined by 18 stage configurations; s15 stays static by design.
- SVG physics models distinguish real/virtual rays, valid/invalid refraction, grating orders, interference envelopes, displacement endpoints and sound-speed domains.
- Smart Review maps original concepts separately from five possible error causes. Current answer-only evidence stays unclassified; blanks stay insufficient. A learner-selected focus gives guidance without pretending to diagnose. Latest correct covering evidence clears stale recommendations.
- Formative checks have hint disclosure, explanatory feedback, reason entry at Advanced, focus-restoring retry and a current-lesson link. Formal answer protection is unchanged.
- Existing notebook tokens, Thai font, navigation and flat surfaces remain. GitHub Actions adds repeatable local-data checks without production credentials.

## Commands actually executed

| Check | Observed result |
| --- | --- |
| `npm test` | **36 passed**, zero failed/skipped. Includes 60-variant schema coverage, 57 independently calculated examples, 70 source fixtures, 5,600 seeded variants, model limits, SQL persistence, isolation/conflicts, 80% scoring, immutable snapshots, migration compatibility and review recovery. |
| `npx tsc --noEmit` | Passed, including new browser tests. |
| `npx playwright test` | **18 passed** (14 incumbent flows + 4 V3 flows). The 60-variant rendering loop is included. |
| Targeted Playwright after SVG ARIA correction | **2 passed**: active diagram answer protection and negative-focus lens/mirror shapes. |
| Fresh local Wrangler/D1 migration execution | Both existing SQL files applied successfully to a separate empty local database. Existing preview state was not reset. SQLite upgrade test preserves exact legacy snapshots. |
| Production build | Passed. Existing large-client-chunk warning remains; no build errors. |
| `git diff --check` | Passed. |
| Impeccable manual detector on new feedback/review/lab surfaces | Empty findings. Incumbent design system preserved. |

Browser regression coverage includes lessons, game completion/save retry, exam creation/answering/submission/history, two-device conflicts, offline recovery, preference persistence, optional onboarding, progress preservation, direct sign-in links, touch formula scrolling and active-solution protection. V3 adds all-level rendering, integer controls, TIR, unavailable orders, lens infinity/virtual signs, slit width constraints, subsonic Doppler, feedback/retry and self-review test-setup navigation.

The hosted GitHub Actions workflow has been added. Its hosted run is not claimed as passed here; the validation above was executed locally. CI uses Node 24, lockfile installation, a fresh mock-auth local D1 and Chromium. It never deploys or accesses private production learner records.

## Accessibility and responsive findings

An initial screenshot pass captured loading screens and was discarded. The audit was corrected to wait for each route's actual content. That content audit exposed prohibited ARIA labels on optical SVG paths; explicit graphic roles fixed the issue. Related functional tests were rerun.

Final axe-core 4.10.3 scan: **zero WCAG A/AA automated violations in 74 loaded-content checks**:

- 62 route/viewport combinations: all 20 lesson stages at 320/390px, plus dashboard/review, matching, exam setup, history, formula book and representative labs at 820/1440px.
- 12 focused combinations: Foundation/Advanced checkpoint hint and feedback states for s01/s13/s18 at 320×844 and 844×390.

No page overflow or KaTeX errors were observed in these scans. The 62-route run recorded no browser exceptions. Manual screenshot inspection covered phone lens lab, 320px review/dashboard and feedback, and desktop grating. Range and numeric fields have labels/units; focus returns to the first option after retry and to the lesson explanation via anchor. Existing mobile focus trapping and Escape remain. Reduced-motion transition duration measured 0.00001s; there is no simulation autoplay.

SVG text remains a manual-review surface: equations and results also appear in readable captions and MathML. Fine rays and dense fringes can be hard to distinguish on very small screens, so numeric relationships remain visible. Automated checks are not WCAG certification or a screen-reader user study. Physical iOS/Safari/Android hardware was not tested; browser verification used Chromium with desktop, narrow, landscape and touch contexts.

## Data and compatibility checks

No V3 changes to `lib/curriculum.ts`, `lib/questions.ts`, `lib/server/store.ts`, database schema, API routes, migration SQL, identity code or `.openai/hosting.json`. All 20 IDs, 70 mappings, canonical content and question versions remain intact. No new migration is needed. Existing immutable exam snapshots are only read, never backfilled. A dedicated SQLite test switches all three preferences while preserving all 20 progress records and exact submitted database rows.

The Site retains its original project ID and owner-private audience. Ignored browser outputs, local SQLite/D1, caches and preview identities are not source or deployment assets. No production credential or private learner data is used by the new tests or workflow.

## Physics report and limitations

See [physics verification](physics-verification-v3.md) for equations, dimensional checks, assumptions, boundary cases, primary references and all 57 numerical results.

This release uses authored level selection, not validated automatic placement. Current formal choices cannot diagnose an error cause, so automatic cause classification remains deliberately unclassified. Prediction/reasoning text and self-selected review focus are temporary and unsynced, explicitly labelled. s15 has no new interactive lab. Models omit real-world effects stated in captions: aberration, near-field diffraction, detailed spectral color, absorption, end correction and sonic-boom strength. No runtime AI was introduced.

Future educational work: independent educator review of Thai explanations; explicit diagnostic reasoning questions; optional additive storage for learner notes; a purposeful two-lens lab; learner outcome studies before making mastery or automatic adaptation claims. The retained large client bundle is a measured performance follow-up, not a blocker hidden by raising build thresholds.

## Modified files
- `.github/workflows/quality.yml`
- `DESIGN.md`
- `PRODUCT.md`
- `README.md`
- `app/adaptive.css`
- `components/concept-checkpoint.tsx`
- `components/guided-lab.tsx`
- `components/learning-app.tsx`
- `components/learning-preferences.tsx`
- `components/lesson-view.tsx`
- `components/physics-diagram.tsx`
- `components/review-panel.tsx`
- `docs/adaptive-learning.md`
- `docs/physics-verification-v3.md`
- `docs/v3-verification.md`
- `lib/concepts.ts`
- `lib/labs.ts`
- `lib/lesson-variants.ts`
- `lib/physics-models.ts`
- `lib/question-types.ts`
- `lib/review.ts`
- `lib/teaching-content.ts`
- `tests/concepts.test.ts`
- `tests/curriculum-v3.test.ts`
- `tests/e2e/adaptive.spec.ts`
- `tests/e2e/v3.spec.ts`
- `tests/learning.test.ts`
- `tests/math.test.ts`
- `tests/physics-models.test.ts`
- `tests/store.test.ts`
