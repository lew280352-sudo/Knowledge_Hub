# Formula formatting and phone verification

The reported `quad` text came from 11 incorrectly escaped LaTeX spacing commands in canonical formula strings. The same audit found 15 incorrectly escaped thin-space commands in generated solution formulas. Fix both sources; do not change physical equations, source mappings, numerical generation, scoring or saved learner records.

`lib/math-format.ts` repairs only recognized legacy spacing artifacts at display time, so historical solution snapshots can remain immutable. `components/math.tsx` uses the corrected display string for KaTeX and its accessible label. Valid formula strings remain unchanged; normalization is idempotent. No schema or persistence changes are required.

Regression coverage now parses all canonical and variant formulas and all 70 generated solution templates with strict KaTeX error handling. It also checks for bare spacing commands because a string such as `quad` can be valid mathematical letters and produce no parse error. An independent comparison of 210 old/new generated snapshots (70 mappings × 3 seeds) confirms every non-formula field is identical, including prompts, answers, choices, explanations, diagrams, IDs and template version.

Phone checks use Chromium touch emulation at 320, 360, 390 and 430px, plus 844px landscape. The test opens the mobile navigation by touch, reads all 20 formula cards, checks the page for horizontal overflow, and verifies keyboard scrolling for formulas that exceed their own frame. It also exercises a lesson formula and an old submitted-solution fixture, then confirms the stored attempt is unchanged. This is mobile browser emulation, not a physical-device Safari test.

Focused screenshots of Doppler, Mach and interference formulas were inspected at 390/1440px. axe-core reports zero automated WCAG A/AA violations across formula-book and lesson pages at 320/390/430/820/1440px (10 cases). Existing responsive navigation and formula scroll containers remain in use.

Modified files: `lib/curriculum.ts`, `lib/questions.ts`, `lib/math-format.ts`, `components/math.tsx`, `tests/math.test.ts`, `tests/e2e/math-mobile.spec.ts`, and this report.

Validation executed: `npm test` — 25 passed; `npx tsc --noEmit` — passed; `npx playwright test` — 14 passed. Phone and legacy-snapshot coverage runs alongside all existing learning, games, formal assessment, answer-protection, history and sync flows. Local QA artifacts are excluded from publication.
