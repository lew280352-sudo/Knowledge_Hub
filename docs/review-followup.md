# Follow-up to the main / PR #1 review — 3 November 2026

The supplied review references main `31d5435` and PR #1 `5f102927`. PR #2 builds on that work; do not assume those three source states or production are interchangeable.

| Review point | Resolution in the current branch |
| --- | --- |
| Old GitHub source link | `components/learning-app.tsx` now links directly to `lew280352-sudo/Knowledge_Hub`. |
| AI repeated questions | `lib/subjects.ts` provides subject/pool-specific sizes. The full AI course offers 5, 10 or 15 questions; its current individual stages offer 3. Counts adapt to the selected chapter or stage. `lib/server/store.ts` rejects AI requests larger than the selected source pool, including requests sent directly to the API. Each new AI set uses distinct source IDs. Physics retains variable-number practice and its existing sizes. |
| Existing oversized AI attempts | Limits apply only when creating a new set. Previously saved sets can still be opened, answered and submitted; no stored snapshots or grades are changed. A regression inserts a legacy 20-question snapshot and verifies this behavior. |
| Malformed formulas | Strict parsing, a readable Thai fallback and blocked HTML/link commands were already included in PR #2. Development builds now also log the error type; production keeps the learner-facing fallback. |
| Screen-reader support | PR #2 uses MathML and a containing group with a plain-language label instead of overriding the equation with raw LaTeX. Existing browser/accessibility checks do not replace testing with actual NVDA/VoiceOver users; that remains unverified. |
| Independent answer validation | PR #2 already includes 15,163 independent numeric cases, 63 worked examples, separate SymPy identities and a conceptual review checklist. See `learning-quality-audit.md` and `physics-audit-inventory.md` for exact scope and source-PDF uncertainties. This is not an official answer key for every original PDF diagram. |

Validation for this follow-up: the complete 53-test unit/store suite and TypeScript pass. All **9 targeted browser checks passed**, covering the current source link, 15-question AI course limit, 3-question stage limit, API rejection, the AI learning/game/exam flow and original physics exam/save behavior. Production build is also run before publication. The earlier audit's existing lint debt is unchanged by this work; this follow-up does not claim a clean full lint run or newly verified GitHub Actions results.
