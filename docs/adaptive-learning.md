# Adaptive learning V3.0

## Current architecture and pre-change audit

The latest GitHub main was inspected before changes. Its tree matched the opened private Site. Vinext/React/TypeScript, query routes, shared components and Cloudflare D1 remain in place. V2 already provided independent difficulty/goal preferences, revision conflicts, honest sync states, canonical progress, formative wave practice and submitted-evidence review. The gaps were authored variants beyond s01, guided exploration beyond that wave lab, diagnostic uncertainty and repeatable CI.

V3 extends those boundaries rather than replacing the application. `lib/curriculum.ts` still owns the same 20 stages, canonical teaching, games and 70 source mappings. Question generation, authentication, API validation, scoring, original tables and submitted snapshots are unchanged.

## Completed phases

| Phase | Implementation | Verification |
| --- | --- | --- |
| A — Curriculum | `teaching-content.ts` adds Foundation/Standard/Advanced layers for s02–s20 through the existing optional variant API. s01 remains intact. | All 60 variants cover canonical steps; 57 new numerical examples recalculated independently; all equations parse strictly. |
| B — Physics interaction | Pure constrained models, corrected principal rays/virtual extensions, grating directions, double-slit envelopes and 18 new guided labs. | Boundary/domain, ray intersection, intensity zero/limit and integer-mode tests; browser control checks. |
| C — Review and feedback | Source concept taxonomy, five review-focus categories, conservative unclassified evidence, voluntary self-reflection, lesson/practice/retry/history actions, hint and retry feedback. | Real SQLite latest-evidence recovery and isolation tests; browser feedback/navigation flows. |
| D — UX/reliability | Existing academic notebook styling, stacked reasoning input, keyboard focus recovery, numeric/range controls and GitHub Actions. | Responsive, keyboard, reduced motion, existing regression flows; fresh local migration application. |
| E — Verification | Numerical report, schema/data compatibility checks, browser inspection and release documentation. | See [verification report](v3-verification.md) and [physics report](physics-verification-v3.md). |

## Meaningful difficulty differences

Foundation explains terms, quantities/units and physical meaning before guided substitution. Standard combines relationships and multi-step worked examples with independent conceptual questions. Advanced examines assumptions, limits, signs, competing models and physical feasibility. It requires a temporary written reason before checking a conceptual choice; that writing is **not** automatically graded.

All levels retain canonical lesson text. Supplementary content follows existing step IDs: concept/glossary/assumptions, worked example, misconception or transfer/checkpoint, then synthesis where the canonical stage has a fourth step. Examples use a disclosure so learners can attempt first. A stable rotation changes checkpoint presentation order while preserving authored answer indices. No runtime AI or probabilistic mastery estimator is used.

Preferences remain independent of progress. Changing level neither creates a new stage record nor clears completed steps, games, examination history or best scores. The stage pass threshold remains 80%. The chosen goal adjusts guidance rather than changing formal scoring.

## Guided labs and physical boundaries

19 stages have predict → experiment → observe → explain → apply: the retained s01 wave lab plus 18 stage-specific configurations in `lib/labs.ts`. s15 retains static ideal RGB/two-lens teaching; no decorative simulation was added.

`lib/physics-models.ts` supplies deterministic relationships used by SVG readouts and tests. Snell rejects nonexistent refracted angles. Optics skips f = 0 and treats u = f as an image at infinity. Integer mode/order controls snap fractional numeric input. Slit width stays below center separation; single/double/combined patterns use the appropriate sinc²/cos² models. Grating directions use actual angular geometry. Doppler remains subsonic; Mach geometry remains strictly supersonic. Captions state when a picture is schematic, rescaled, paraxial, far-field or small-angle.

There is no autoplay. Controls retain native keyboard interaction and labelled values/units. Textual relationships supplement SVGs. Predictions and written reasons are temporary and ungraded; the UI explicitly states that these fields do not sync across devices. Saved canonical progress and preferences continue to sync through D1.

## Smart Review evidence policy

Concept identity is the original source question ID and stage, preserved in `conceptTaxonomy`. Error cause is a separate taxonomy:

- Conceptual understanding
- Formula selection
- Unit conversion
- Calculation
- Physical assumptions
- Unclassified when evidence cannot distinguish a cause

Current formal snapshots contain selected choices, not diagnostic reasoning. Every incorrect choice therefore remains **unclassified**; a blank is **insufficient evidence**. Distractor multipliers, page visits, time, difficulty and games do not diagnose a cause. Optional per-choice formative feedback is only shown if explicitly authored; no wrong formal answer is retroactively assigned a misconception.

The learner may choose a focus to see a specific practice suggestion. This is labelled self-reflection, not an automated diagnosis, and is not persisted. It resets with new evidence. No mastery percentage is invented.

Server review still reads only submitted snapshots, selecting the latest covering attempt per source and grouping repeated occurrences. A later covering submission with all occurrences correct clears the old recommendation. Mixed wrong/blank/correct evidence is shown through actual counts. Buttons open the relevant lesson, matching practice, test setup or exact submitted attempt. Retry never starts or submits an exam silently.

## Data integrity and release boundaries

V3 adds no table or migration. The prior additive preference migration remains compatible with original lesson/exam data. Existing user-scoped same-origin APIs, answer revision/event deduplication, deadlines, server grading, answer protection, offline drafts and conflict recovery are retained. Active formal questions still omit answers, formulas and worked explanations; pedagogical hints remain inside formative components. Historical snapshots are never rewritten.

The Site keeps its existing project ID and owner-private audience. CI uses a fresh local D1 and local verified mock identity, with no production token or private account data. It runs TypeScript, Node tests, production build and Playwright. Hosted Actions results must be distinguished from locally executed commands.

## Educational follow-up

A physics educator can independently review Thai explanations and classroom suitability; this release's source/calculation checks are not an external expert endorsement. Future diagnostic questions should collect explicit reasoning evidence before enabling automatic cause classification. Optional reason storage would need an explicit additive data design. A calibrated two-lens lab or real-spectrum color experiment can be considered if it improves learning beyond the current static s15 material. Outcome studies are needed before any mastery score or automatic level assignment is justified.
