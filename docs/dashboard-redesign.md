# Physic Learn dashboard redesign

## Short UI audit

The existing Vinext/React dashboard already contains the six required sections and uses real D1-backed progress. Preserve its routes, request handlers, curriculum and state selectors.

- Lesson metadata and navigation secondary copy shrink to 10–12px, which weakens Thai legibility.
- The featured wave graph is hidden below 960px, losing the scientific explanation on tablet/mobile.
- Neutral active states and small completion marks do not give enough hierarchy to the current location and next action.
- Repeated hardcoded colors, spacing, radii and transition values make consistent refinement harder.
- Progress is primarily numeric; accessible progress semantics and stronger visual grouping would help learners scan their position.

## Implementation plan

1. Add a reusable token layer for academic off-white surfaces, accessible teal, text, borders, spacing, type, radii, subtle elevation and reduced-motion-aware transitions. Preserve existing token aliases used by learning/exam screens.
2. Refine the current sidebar and dashboard markup, preserving all six sections, text, event handlers and data selectors. Add accessible active/filter/progress semantics and progress bars computed from existing values only. Keep the existing PhysicsDiagram component visible at every supported width.
3. Inspect desktop, tablet and mobile renders; verify contrast, focus visibility, target sizes, zero/completed progress and no overflow. Run the existing unit, TypeScript and Playwright suites, plus focused dashboard accessibility/responsiveness checks. Build, synchronize the source to GitHub and publish the same private Site.

## Scope guard

No schema, API, route, curriculum, question-generation, grading, persistence, synchronization or authentication changes. No invented progress, statistics, new product flows, decorative effects or dependencies.

## Validation results

- `npm test`: all 17 existing unit/integration tests pass, including grading, generated questions, exact historical attempts and concurrency.
- `npx tsc --noEmit`: passes.
- `npx playwright test`: all 9 flows pass (the 7 existing learning/exam/sync flows plus 2 focused dashboard checks).
- Desktop 1440px, tablet 820px, mobile 390/360px and 320px reflow inspected; the wave graph remains visible and there is no page overflow. Browser coverage also checks 1920px.
- All category filters have a minimum 44px target height. Keyboard filtering, visible focus, current navigation, accurate zero/completed progress and reduced motion are verified.
- axe-core 4.10.3 reports zero WCAG A/AA violations on desktop, tablet, mobile and 320px reflow. Its 7 unresolved SVG text contrast checks were reviewed manually: graph text is 11.43:1 against white and the curve is 4.75:1.
- Manual token checks: secondary text 5.71:1 on white / 5.35:1 on the canvas; white action text 6.39:1; completion text 6.04:1; focus ring 5.98:1 against the canvas.
- Impeccable detector reports no findings. Rendered screens and interactive states were also inspected; detector output alone was not used as a quality verdict.
- TypeScript AST comparison confirms the existing LearningApp state, routing and action statements are unchanged. APIs, database schema, curriculum and question logic have no diff.

This is scoped UI and accessibility verification, not a claim that automated checks alone certify complete WCAG conformance. Contrast criteria were checked against [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
