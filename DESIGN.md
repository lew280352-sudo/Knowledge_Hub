# Physic Learn visual system

Scientific Minimalism / Academic Laboratory Notebook: flat off-white surfaces, measured teal accents, readable Thai typography and subtle borders. No decorative elevation or animation. The existing six dashboard sections, navigation hierarchy, curriculum, data and learning flows are retained.

## Shared design tokens

`app/tokens.css` is the reusable source of truth. The original aliases (`--ground`, `--surface`, `--ink`, `--muted`, `--accent`, etc.) point to semantic tokens so the existing lesson, game and exam components continue to work.

| Role | Value |
| --- | --- |
| Canvas | `#f5f5f0` |
| Surface | `#fdfdfa` |
| Sidebar | `#fdfdfa` |
| Featured lesson | `#edeee9` |
| Primary text | `#263b3d` |
| Secondary text | `#596764` |
| Teal action / focus | `#087f8c` |
| Teal small text on tonal surfaces | `#066974` |
| Teal hover | `#066974` |
| Teal selection tint | `#e4eff0` |
| Border | `#d9ded7` |
| Completion text | `#27654a` |
| Font | Self-hosted IBM Plex Sans Thai, 400/500/600/700 |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px |
| Type | 13, 14, 16, 18, 22px plus fluid headings |
| Radius | 8px controls; 12–16px panels; 20px available for larger surfaces |
| Elevation | None; flat tonal panels without glow, glass, gradients or decorative animation |
| Transition | 160ms for color, border and subtle elevation; zero with reduced motion |

## Composition

A labelled 252px sidebar and centered content area up to 1120px. The hero heading retains its original copy and next-learning action. The featured lesson and existing PhysicsDiagram remain visible at every supported viewport, stacking on tablet/mobile. Statistics use a semantic description list and retain their actual server values.

The learning path retains the category filters and grouped chapter panels. Lesson titles are 15px; metadata is 12–13px instead of 10px. Teal selected filters, a clear current navigation item, reading states and completion checks support scanning without implying progress that has not been earned.

Below 700px, the existing mobile navigation behavior is retained: closed navigation is inert, open navigation traps keyboard focus, and Escape returns focus to the menu trigger. All filters have at least 44px touch height. The graph stays visible rather than being hidden on tablet/mobile.

## Accessible states

- Navigation exposes `aria-current`; category buttons expose `aria-pressed`.
- The reusable `ProgressIndicator` presents the existing passed-stage counts with labelled progressbar semantics. Empty progress renders as zero width.
- Completion is conveyed by a check and text, in addition to color.
- Focus is a 3px teal outline with 3px offset; hover does not shift layout.
- The mobile sync indicator has an image role and an accessible status label.
- The main region is programmatically focusable for the skip link.
- Reduced-motion preferences disable transitions.

## Adaptive learning additions

Difficulty and goal are independently editable through an inline form with clear draft, saving, failure and conflict feedback. New learners are offered optional onboarding; existing activity suppresses it. Dashboard progress and next actions come from saved stages and attempts. Review cards explain submitted evidence and offer lesson, practice and historical-answer actions.

Canonical lessons remain visible at every level. All 20 stages have authored extensions: variable definitions, guided calculations, checkpoints and explicit assumptions. Guided predict → experiment → observe → explain → apply labs cover 19 stages; s15 uses static teaching. Formative practice is clearly distinguished from formal tests. Hints use native disclosures; retry restores radio focus and a lesson anchor returns to the current explanation. Advanced reasoning inputs stack vertically. Review shows uncertainty and a labelled self-reflection selector, without claiming an inferred error cause.

The original secondary color `#667371` is retained as a caption token; the small body-text token is darkened to `#596764` for contrast on tonal panels. The primary accent is `#087f8c`. Reusable form, checkpoint, review and lab surfaces live in `app/adaptive.css` and use shared tokens.

## Preserved functionality

All query routes, 20 stages, 70 source mappings, games, question generation, grading, immutable historical solutions and authentication remain. Preferences add a user-scoped revisioned table/API; review aggregates submitted snapshots without altering them. Canonical progress IDs do not depend on difficulty. See `docs/adaptive-learning.md` for the architecture and migration.

## Verification

See `docs/dashboard-redesign.md` for the audit, implementation plan and validation record. Asset provenance remains in `docs/design-direction.md`.
