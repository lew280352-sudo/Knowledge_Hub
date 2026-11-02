# Physic Learn visual system

The implemented interface follows the approved lab-notebook direction and Taste editorial-greeting app sheet. Operate surfaces prioritize the next action and saved state; Read surfaces prioritize the explanation, equation and diagram.

## Tokens

| Role | Value |
| --- | --- |
| Ground | `#f5f5f0` |
| Surface | `#fdfdfa` |
| Tonal panel | `#edeee9` |
| Ink | `#263b3d` |
| Secondary text | `#667371` |
| Rule | `#d9ded7` |
| Wave/measurement accent | `#087f8c` |
| Secondary ray | `#b66932` |
| Body/type | Self-hosted IBM Plex Sans Thai, 400/500/600/700 |
| Base type | 15px / 1.7; lesson copy 14–15px / 2.05 |
| Surface radius | 14px; controls 8–9px |

## Composition

240px labelled navigation beside a centered content area up to 1100px. The home introduces the next useful lesson beside a measured wave diagram, then four genuine counts and the chapter trail. Chapter counts derive from server scores; stage numbers carry the learning sequence. Muted navigation never competes with the diagram.

Below 700px, navigation becomes a controlled sheet. Hidden navigation is inert; open navigation traps keyboard focus and Escape returns focus to its trigger. Reading, matching and exam controls stack without page overflow. Diagrams keep their proportions and provide a textual numeric readout and explicit units.

## Components and states

Flat tonal surfaces and one-pixel rules; no decorative gradients or shadows. Near-black primary actions; teal encodes measured physics or selection. Success/error use text and icons as well as color. Lucide is the consistent interface icon system; actual GitHub branding uses Simple Icons.

Lessons use a numbered outline, a readable explanation, KaTeX equations, parameter-driven SVG and previous/next actions. Matching uses two button columns so touch and keyboard work without dragging. Exams use a compact question index, large answer buttons, a per-attempt save indicator and explicit conflict resolution. Historic solutions compare the answer given with the correct answer and preserve each calculation.

Loading, empty, offline, save failure, stale revision, deadline expiry and submitted states are distinct. A draft never appears as saved. Motion is limited to small interaction transitions and honors reduced-motion preferences.

## Verification

Desktop 1440px, tablet 820px and mobile 390px renders inspected. Local Playwright covers navigation, lesson resume, games, exams, history, two contexts sharing D1, conflict resolution and retry after network failure. Asset sources are recorded in `docs/design-direction.md`.
