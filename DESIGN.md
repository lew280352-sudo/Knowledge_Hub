# Physic Learn visual system

Soft Academic / Scientific Minimalism: an off-white learning workspace with measured teal accents, legible Thai typography, subtle borders and restrained elevation. The existing six dashboard sections, navigation hierarchy, curriculum, data and learning flows are retained.

## Shared design tokens

`app/tokens.css` is the reusable source of truth. The original aliases (`--ground`, `--surface`, `--ink`, `--muted`, `--accent`, etc.) point to semantic tokens so the existing lesson, game and exam components continue to work.

| Role | Value |
| --- | --- |
| Canvas | `#f6f8f5` |
| Surface | `#ffffff` |
| Sidebar | `#fbfcf9` |
| Featured lesson | `#edf6f2` |
| Primary text | `#233c37` |
| Secondary text | `#566b63` |
| Teal action / focus | `#086b61` |
| Teal hover | `#07584f` |
| Teal selection tint | `#e0f0e9` |
| Border | `#dce5dd` |
| Completion text | `#27654a` |
| Font | Self-hosted IBM Plex Sans Thai, 400/500/600/700 |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px |
| Type | 13, 14, 16, 18, 22px plus fluid headings |
| Radius | 8px controls; 12–16px panels; 20px available for larger surfaces |
| Elevation | Small neutral shadows; no glow, glass, gradients or decorative animation |
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

## Preserved functionality

No route, API, database, question engine, curriculum, grading, persistence, synchronization or authentication changes. The existing component framework and physics calculations remain in use. The graph's axis-label position was adjusted solely to keep text clear of plotted data.

## Verification

See `docs/dashboard-redesign.md` for the audit, implementation plan and validation record. Asset provenance remains in `docs/design-direction.md`.
