# Learning quality audit — 3 November 2026

## Scope and implementation plan

Keep the existing React/TypeScript component structure, Vinext/Vite runtime, Cloudflare D1 storage, subject catalog, lesson/game/exam flow and visual design. Reuse the installed KaTeX renderer. Inspect learner text → audit formulas and givens → add independent offline checks → validate the existing features.

Reviewed student-facing strings in `components/`, curriculum, questions, three difficulty layers, lab/checkpoint prompts, learning preferences and AI introductory content. The physics target is the existing secondary-school course; advanced material keeps its mathematical vocabulary, with definitions rather than removing necessary terms. Reviewed all **70 implemented website physics templates**, **63 authored worked examples** (57 in `teaching-content.ts`, six in `lesson-variants.ts`), formula cards, lab checkpoints and answer explanations. The AI course remains available and its math fields are included in rendering checks.

The source PDF is a reference, not an official solution key. Several website tasks intentionally simplify or change the PDF question (for example `ray-optics-5` asks the person–image closing speed, while PDF page 30 asks image speed relative to the ground; these are 14 m/s and 9 m/s respectively for the stated baseline). The inventory below certifies neither a replacement official key nor every original diagram-dependent PDF question. Those distinctions are retained; the PDF is not edited.

## Confirmed findings and evidence

| ID | File / location | Before | Expected result and evidence | Resolution |
| --- | --- | --- | --- | --- |
| P1 | `lib/curriculum.ts`, `lib/subjects.ts`; `public/reference.pdf` | Declared 58 PDF pages; 43 question references pointed at wrong pages, including waves 19–20 at nonexistent page 58. Stage references were also shifted. | `len(PdfReader('public/reference.pdf').pages) = 56`. Waves 19–20 are on 56; wave-optics 7 on 20; ray-optics 1–20 on 28–37; sound 1–20 on 48–55. Checked question headings in the actual PDF. | Corrected the live index, stage links, subject page count and README. Historical question JSON is untouched. Reviewed exams resolve the current page by source ID, with their saved page as a fallback for unknown IDs. |
| P2 | `lib/questions.ts`, `wave-optics-9` | Seed 67108863 displayed 759.4 nm but calculated from hidden 759.36 nm. Stored numeric result was 0.075936 mm. | From displayed givens, a = λL/Δy = (759.4 × 10⁻⁹)(1)/(0.01) m = **0.07594 mm**. Both happen to round to the same four-significant-figure option; this was an internal precision inconsistency, not evidence of a misgraded option. | New questions use the displayed wavelength. This template is version 2; other versions and saved snapshots stay unchanged. |
| P3 | `lib/questions.ts`, `wave-optics-9`; PDF page 21 | “Adjacent dark fringes” could mean across the central maximum. That gap is twice a same-side interval. | PDF explicitly places dark orders 1, 2, 3 at 1, 2, 3 cm from the center. Baseline a = 632.8 nm × 1 m / 0.01 m = **0.06328 mm**. | State orders 1 and 2 on the **same side**. This clarifies the intended task; it does not change its baseline answer. |
| M1 | `components/math.tsx`, `lib/math-format.ts` | `throwOnError:false` could expose invalid TeX in red. Slash divisions were accepted by KaTeX as linear text, not stacked fractions. | KaTeX's API documents the raw-source fallback. Invalid inputs should produce a short Thai message; `v=12/3=4` should contain a fraction and aligned rows, with MathML available. | Strict rendering with a readable fallback, grouped slash-to-fraction presentation, aligned equality chains and multiple equations, scrollable equation containers, readable mobile size. Text/unit groups remain opaque. Historical repairs remain presentation-only. |
| D1 | `lib/physics-models.ts` | Positive infinity passed several positivity guards. E.g. `pointSound(1, Infinity)` returned zero intensity and negative-infinite level; `slitIntensity(NaN, …)` returned NaN. | Nonfinite model inputs are outside these finite-distance/finite-speed models. Reject them with `RangeError`; retain the deliberate **output** infinity at an optical focus. | Added finite-input guards and regression cases for NaN and ±Infinity, without changing valid model outputs. |
| T1 | `tests/physics-models.test.ts` | The open-pipe displacement test checked sine nodes at both ends, although the existing SVG correctly used cosine antinodes. | Open–open pipes have displacement antinodes at both ends; closed–open pipes have a displacement node at the closed end and an antinode at the open end. See OpenStax §17.4. | Corrected the test oracle and added explicit endpoint-amplitude checks. No pipe drawing needed changing. |
| U1 | `components/learning-preferences.tsx` | Text implied every subject had 20 stages and three authored levels. | Physics has that coverage; AI currently shares one introductory lesson set across levels. | State the actual scope, add a small subject glossary, explain significant figures/end correction and keep labels consistent. |

No other arithmetic or sign error was found in the implemented website templates or the 63 worked examples under their stated school-model assumptions. Passing these checks is evidence within that scope, not a proof of conceptual correctness.

## Physics review: assumptions kept separate from algebra

The complete per-template result list is in [physics-audit-inventory.md](physics-audit-inventory.md). All 59 numerical templates are recalculated from **displayed prompt values**, not the generator's PRNG or hidden answers, for 257 distributed seeds each. That is 15,163 numerical cases. The 11 conceptual templates below were reviewed separately:

| Templates | Reviewed concept and limits |
| --- | --- |
| waves-1 | Longitudinal particle displacement is parallel to propagation; particles oscillate near equilibrium. |
| waves-9, waves-10 | Equal-tension string junction toward higher linear density inverts the reflected pulse; a fixed endpoint has zero displacement. A transmitting junction is not a fully reflecting endpoint. |
| waves-11 | Stationary boundary, unchanged source frequency; the school's gravity-water-wave model has reduced speed/wavelength in shallower water. This is not a universal nondispersive-water claim. |
| waves-17, waves-19 | In-phase coherent sources: integer path differences reinforce; half-integers give minima. Exact zero requires equal arriving amplitudes. Line counts exclude the source-line boundary; signed orders are enumerated independently for generated cases. |
| waves-20 | Narrow-aperture diffraction in the idealized Huygens/far-field picture, rather than a claim that frequency changes. |
| ray-optics-19, ray-optics-20 | Ideal RGB illumination, filters and non-emitting objects; real reflectance spectra are outside these tasks. |
| sound-1 | Pitch depends on frequency and timbre on waveform/harmonic composition; sound-intensity level is a different quantity. |
| sound-18 | Classical sound Doppler effect, stationary medium/listener, subsonic motion along the connecting direction. |

The numerical review includes units, nm/μm/mm/cm/ms conversions, degree–radian conversions, thin-lens and spherical-mirror near-axis signs, real/virtual objects, finite-screen grating boundaries, missing orders, same-side diffraction intervals, point-source inverse-square intensity, incoherent source sums, resonant boundary conditions/end correction, temperature in kelvin, subsonic Doppler limits and supersonic Mach geometry. The empirical 331 + 0.6 T_C law and the √T law are treated as the separately stated approximations. The existing problem that explicitly says K = °C + 273 retains that approximation.

Inputs are educational givens rather than a measurement-uncertainty model. Display answers have **at most four significant figures**; trailing zeros are not added to imply measured precision. The independent validator checks both the full numerical result and half-a-last-displayed-digit rounding tolerance.

## Reproducible checks

Node 24, Python 3.12+; Python is an **offline development check**, not a new website service or deployment dependency:

```sh
npm ci
python -m pip install -r scripts/validation/requirements.txt
npm run check:types
npm run validate:physics
npm run validate:math
npm test
npm run lint
npm run build
# Initialize a fresh local D1 using the three migration commands in README.
npx playwright install --with-deps chromium
npm run test:e2e
```

`validate:physics` invokes a Node exporter, then independent Python prompt-parsing/numerical oracles, eight SymPy algebraic/limiting identities and four dimensional reference checks. It also checks PDF page bounds and all 63 worked examples. It does **not** use SymPy to declare a prose assumption physically correct, parse every LaTeX expression into a symbolic proof, or reproduce every original PDF diagram. The reference dimensional checks are not a dimensional proof of arbitrary student text.

Seeds cover the 32-bit range. The previous small consecutive seed sample selected only a narrow region of the PRNG's first output; a new regression verifies all five wavelength/speed scales and the available grating-count branches. Existing seed-0 fixtures and stored-attempt immutability tests remain in place.

`validate:math` uses the **production rendering path**, including all subjects, worked examples, generated formulas, equation fragments, grouped fractions, chained equalities, legacy typos and invalid/untrusted input. Browser checks inspect fractions, aligned tables, MathML, narrow layouts, equation scrolling, historical reference-page correction and the invalid-formula fallback. Ordinary Thai prose is retained; only recognized equation runs or explicit math boundaries are rendered inline.

## Quality results and remaining uncertainty

Initial baseline: 42 unit/store tests passed and TypeScript passed. Lint already failed with **26 errors / 11 warnings**. After the targeted clock/ref and unused-import cleanup, lint has **24 errors / 8 warnings**, all in pre-existing hook synchronization patterns, explicit `any` declarations and hook-dependency/unused-variable warnings. No rules are disabled to produce a clean result. The existing lint debt is not represented as a pass.

Final checks on the completed implementation:

| Check | Result |
| --- | --- |
| `npm run check:types` / TypeScript | Passed |
| `npm run build` | Passed; existing large-chunk advisory remains |
| `npm test` | **51 passed** (includes the six math tests below) |
| `npm run validate:math` | **6 passed** using production rendering |
| `npm run validate:physics` | **15,163 numerical cases; 63 examples; 8 symbolic identities; 4 dimensional reference checks passed** |
| Full Playwright suite | **26 passed**, including all 20 physics stages at all three levels, AI flow, history, offline drafts, cross-device saves and the new math cases |
| `npm run lint` | **Failed: 24 errors, 8 warnings**; baseline was 26 / 11 |
| `git diff --check` | Passed |

The final browser run took about three minutes. A startup race during a repeated preview launch was resolved by waiting for the owned server; it was not a production application error. During incremental development, tests also caught and corrected changed math-button accessible names, a selector that assumed only one equation, and a formatting-only assertion. Final results above are from completed reruns.

Unresolved: the source PDF's magnification-sign legend on page 26 is not the same explanation as the website's explicitly signed-height convention m = −v/u. Original diagram-dependent or materially adapted PDF tasks have not been assigned invented official answers. Exact cancellation also needs equal amplitudes at the observation point, beyond phase alignment alone. The source PDF and archived solution snapshots are unchanged. An independent teacher review remains useful for those original-source conventions and diagrams.

Earlier documents that cite a 58-page source predate this audit; use the corrected live index and this inventory for the current 56-page file.

## Reference evidence

- [KaTeX API](https://katex.org/docs/api) and [options](https://katex.org/docs/options): strict parsing, display mode and error behavior.
- [OpenStax University Physics 1, §17.4](https://openstax.org/books/university-physics-volume-1/pages/17-4-normal-modes-of-a-standing-sound-wave): displacement boundaries for open/closed pipes.
- [OpenStax University Physics 3, §3.1](https://openstax.org/books/university-physics-volume-3/pages/3-1-youngs-double-slit-interference) and [§4.3](https://openstax.org/books/university-physics-volume-3/pages/4-3-double-slit-diffraction): interference, diffraction envelope and missing orders.
- Local source evidence: `public/reference.pdf`, especially pages 21, 26, 28–37, 48–56. Website formulas and independent executable calculations are linked above.

## Modified files

Baseline: `5f102927c1761e7a82ce1e55149be067e6e2e560` on `feat/multi-subject-learning`, preserving the previously deployed multi-subject work. This quality change is proposed on top of that branch.

- `.github/workflows/quality.yml`
- `README.md`
- `app/globals.css`
- `components/concept-checkpoint.tsx`
- `components/exam-view.tsx`
- `components/guided-lab.tsx`
- `components/history-view.tsx`
- `components/learning-app.tsx`
- `components/learning-preferences.tsx`
- `components/lesson-view.tsx`
- `components/matching-game.tsx`
- `components/math.tsx`
- `components/subject-glossary.tsx`
- `docs/learning-quality-audit.md`
- `docs/physics-audit-inventory.md`
- `lib/curriculum.ts`
- `lib/lesson-variants.ts`
- `lib/math-format.ts`
- `lib/math-prose.ts`
- `lib/math-render.ts`
- `lib/physics-models.ts`
- `lib/questions.ts`
- `lib/subjects.ts`
- `package.json`
- `scripts/export-physics-audit.mjs`
- `scripts/validation/requirements.txt`
- `scripts/validation/validate_physics.py`
- `tests/e2e/learning.spec.ts`
- `tests/e2e/math-mobile.spec.ts`
- `tests/e2e/v3.spec.ts`
- `tests/math.test.ts`
- `tests/physics-models.test.ts`
- `tests/questions.test.ts`
