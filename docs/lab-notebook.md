# Synced lab notebook

Follow-up to Adaptive Learning V3, 2 November 2026 (Asia/Bangkok).

The learner can explicitly save lab predictions and step-4 reasoning, then open the same stage from another device with the same account. This covers s01's fixed-speed wave lab and the 18 guided labs. s15 remains static. Notes are personal reflection, not graded, an inferred misconception or evidence for Smart Review.

## Storage and identity

`lab_notebooks` is appended by `0002_flaky_micromacro.sql`. Its composite key is `(user_id, stage_id)`; prediction, reason, revision and update timestamp are independent of formal examinations, stage progress and preferences. All difficulties share one note for the same experiment. No existing migration, table, canonical ID, question mapping, answer snapshot or 80% threshold is changed.

`GET /api/notebook?stageId=…` and `POST /api/notebook` use the existing authenticated same-origin API wrapper and no-store responses. The server derives account identity; the browser cannot select a different user's records. Only the 19 real lab stages are accepted. Text limits are 2,000 code units for predictions and 4,000 for step-4 reasoning. s01 accepts only its authored radio choices or an empty prediction. SQL uses bound parameters. React renders comparison text as text, never HTML.

Saving uses compare-and-swap revision checks. A stale write returns 409; it cannot overwrite newer notes. If a previous successful response was lost and the submitted text already exactly equals the stored record, retry returns that record without another write or revision increase. Clearing the visible fields and saving clears their stored text.

The same Site/project ID, D1 binding, owner-private audience and authentication remain. Local/CI use only verified mock identity and ephemeral/local database state; no learner record or credential is committed.

## Draft recovery and conflicts

- Initial loading verifies the account before selecting a local draft. The server supplies an opaque per-account/per-stage storage key (SHA-256 namespace; not an authentication token). Another account does not automatically receive or restore the previous account's draft.
- Edits remain local until **บันทึกห้องทดลอง** succeeds. The UI distinguishes local drafts, account timestamps, pending saves and failures. Device storage failure is reported; it does not claim the text is safe on disk.
- On a failed save the text stays editable and is retained in a scoped local draft where storage is available. Reloading after account loading restores it. Initial loading still needs a network connection; this is not a fully offline app.
- A newer server revision shows an inline comparison, while preserving the learner's draft in the original fields. The learner can merge text manually and keep the draft for a subsequent explicit save, or choose the account copy to replace that visible draft. The app never silently resolves conflicting text.
- **โหลดบันทึกล่าสุด** refreshes clean notes. For an edited note it retains the draft and detects newer evidence. Changes from another device appear when opening or explicitly refreshing the lab, not through live collaboration.
- A browser leave warning is registered while there are unsaved note edits. Internal navigation can recover the device draft on returning. If device storage is unavailable, learners must save or copy text before leaving.

Advanced *checkpoint* reason fields and self-selected Smart Review focus remain temporary and are labelled separately. Notebook notes are not included in the dashboard's mastery/statistics or formal answers.

## Verification

See the release check record below. Browser and database tests use local-only fabricated QA text, never production account notes.

Executed validation:

- `npm test`: **40 passed**, including account/stage isolation, stale revision rejection, idempotent response-loss retry, text bounds, permitted stages and a migration test that preserves all existing rows and exact submitted snapshots.
- `npx tsc --noEmit`: passed.
- Production build: passed with the retained large-client-chunk warning. The new API is included in the built route table.
- Existing **18 Playwright flows passed** during the full regression run. The first new conflict flow found a clean-refresh bug: unchanged local text was incorrectly treated as a draft when another device had saved a newer note. It was corrected to retain only genuinely edited drafts.
- All **6 notebook Playwright flows passed after the correction**, including both conflict choices, clean refresh, offline reload recovery, lost-success retry, difficulty preservation, auth/origin/limit errors, stale-draft merging, namespace separation and unavailable device storage. The hosted CI workflow runs all 24 together on a fresh database.
- axe-core 4.10.3: **30 loaded-content checks**, zero WCAG A/AA automated violations, zero viewport overflow and zero browser exceptions. Covers wave and guided labs, local draft, conflict, save failure and saved states at 320×844, 390×844, 820×1000, 1440×1000 and 844×390; phone contexts include touch emulation.
- Screenshot inspection confirmed the inline mobile comparison, wrapped actions and readable recovery text. Existing keyboard controls remain; resolving a conflict restores focus to the reload control. The Impeccable detector reported no findings on changed learning surfaces.
- New migration applied successfully to local D1. Existing SQL migrations and snapshots remain unchanged. Sites applies the additive migration to the hosted D1 before publication; CI initializes all three migrations on a fresh local database.

No physical iPhone/Android hardware or manual screen-reader user study was available. Automated accessibility checks are not a certification. The current large bundle remains a separate performance follow-up. Notebook reasons are stored only after an explicit save; checkpoint writing and review focus are still temporary. Notes refresh on opening or via the reload button, not live editing.

Changed files:
- `.github/workflows/quality.yml`
- `DESIGN.md`
- `PRODUCT.md`
- `README.md`
- `app/adaptive.css`
- `app/api/notebook/route.ts`
- `components/guided-lab.tsx`
- `components/lab-notebook-status.tsx`
- `components/wave-lab.tsx`
- `db/schema.ts`
- `docs/adaptive-learning.md`
- `docs/lab-notebook.md`
- `drizzle/0002_flaky_micromacro.sql`
- `drizzle/meta/0002_snapshot.json`
- `drizzle/meta/_journal.json`
- `lib/client/notebook.ts`
- `lib/notebook.ts`
- `lib/server/store.ts`
- `tests/e2e/notebook.spec.ts`
- `tests/notebook.test.ts`
- `tests/store.test.ts`
