# Design system / Studio 3.0

## Intent

Quiet editorial design at the intersection of business and software. The visual identity uses an original generated AR monogram, neutral white/navy surfaces, five user-selectable palettes with Professional blue as the approved identity, technical annotations, and original generated sculptural illustrations. No invented professional statistics, testimonials, or client claims. Arabic is the initial reading direction; all principal UI copy has an English equivalent.

## Tokens

The executable color source of truth is `src/palettes.css` and `src/preferences.css`, overriding fallback tokens in `src/tokens.css`. The table below describes the approved Professional blue palette. Semantic tokens switch under `[data-theme=dark]`; components do not invert the page with filters.

| Token       | Light   | Dark    | Purpose                         |
| ----------- | ------- | ------- | ------------------------------- |
| bg          | #f8fafc | #0b1220 | Page canvas                     |
| surface     | #ffffff | #142137 | Cards, dialogs, fields          |
| ink         | #171b2d | #eef1fa | Primary text                    |
| muted       | #5b6275 | #b2bad0 | Supporting text                 |
| accent      | #2563eb | #91c0ff | Links, selected state, progress |
| on-accent   | #ffffff | #131b35 | Primary button text             |
| accent-soft | #eaf1ff | #1d3251 | Learning surfaces, success      |
| line        | #dedfec | #334861 | Surface separation              |
| line-strong | #bec3d6 | #5b7290 | Input/interactive boundary      |
| focus       | #2563eb | #bacaff | Keyboard focus ring             |
| danger      | #a13434 | #ffb4a7 | Error and destructive actions   |

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 px. Radius: 4 px badges, 7–8 px controls, 10–12 px cards, 13 px dialogs. Shadows are limited to the editor illustration, floating note, toast, and dialog. No runtime animation library.

## Typography

Default font stack: system-ui, Segoe UI, Tahoma, Arial, sans-serif. Account preferences also offer Tahoma and Arial stacks with local fallbacks. Nothing is downloaded from a font service. Code: Cascadia Code, SFMono-Regular, Consolas, monospace. Serif emphasis and signature use Georgia on English editorial surfaces only.

- Hero: fluid 38–60 px (Arabic line-height 1.45, English 1.2).
- Page heading: fluid 32–48 px; lesson heading 30–36 px.
- Section: 23–32 px; card heading 20–24 px.
- Body: 16 px / 1.7; article prose and lesson reading text can be 16, 19 or 22 px with line-height 1.9 through personal preferences.
- Controls: 12–14 px, minimum primary target 44 px.
- Technical annotations: 8–11 px, used only for nonessential metadata. Avoid critical instructions at these sizes in production.
- No text-as-image. Code and email remain LTR inside RTL surfaces.

## Layout and behavior

Desktop content max-width 1184 px inside a 1248 px shell with 32 px gutters. Lesson shell can expand to 1356 px inside 1420 px. Article body is 720–740 px. Main breakpoints: 1080, 820, 600 px. Cards move 3 → 2 → 1; lesson index becomes a toggle on smaller screens; article aside is hidden below 820 px. Forms become single column. Tables scroll inside their container; the document must not overflow horizontally.

The academy has a separate HTML document and training navigation; the website retains editorial navigation. active links use `aria-current`. Mobile menu uses an expanded state and native links. A prototype dock remains accessible at the bottom; footer includes a generous bottom gutter so it does not cover final content. Light/dark, palette, and language preferences persist locally. See revision.css for the palette-review and AI-authoring responsive additions.

## Component contracts

| Component | Variants and behavior                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Button    | Primary, secondary, ghost, destructive, disabled; use a real button for actions and link for navigation                        |
| Card      | Article, project, course, progress; one meaningful heading and destination                                                     |
| Form      | Visible labels, native required/email/min-length validation, explanatory hint; preserve input on request errors                |
| Badge     | Neutral, green, amber; text always communicates meaning                                                                        |
| Notice    | Info, success, error; errors use role=alert                                                                                    |
| Toast     | role=status, polite, dismissible, 4.5 seconds; never the sole source of critical error details                                 |
| Modal     | Native dialog/showModal, Escape, focus containment/return, backdrop click; destructive action requires review                  |
| Tabs      | Training output/evaluation/history; selected state, labelled panels, left/right keyboard navigation                            |
| Editor    | Native textarea, accessible label, line numbers hidden from assistive tech, Tab exits normally; illustrative completion button |
| Meter     | Native progress with a label and adjacent numerical value                                                                      |
| Table     | Caption, header cells, horizontal containment                                                                                  |
| Empty     | Task-specific explanation and recovery CTA                                                                                     |
| Loading   | Progress text and skeleton; reduced-motion respected                                                                           |

## Accessibility review protocol

Target WCAG 2.2 AA. Automated axe checks are a regression tool, not certification. Manually verify keyboard-only flows, visible focus, modal Escape and focus return, 200% zoom, 320 CSS-pixel reflow, Arabic mixed-direction content, OS high contrast, reduced motion, and screen readers (NVDA/Firefox plus VoiceOver/Safari). Validate contrast in both themes including all hover, error and disabled states. Production must expand touch targets for compact supplementary controls where needed.

No critical status relies on color. All validation text must remain associated with its field in future server-error handling. Editorial illustrations are decorative and `aria-hidden`. The simulator must remain clearly labelled until removed in production.
