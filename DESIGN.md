# Design System

## Theme & Visual Identity
Accessible Ebook Tagger employs a high-craft, professional editorial workstation aesthetic. It pairs a deep midnight slate/navy chrome shell (`#0b1626` / `oklch(0.18 0.03 245)`) with crisp, high-contrast, warm slate editorial surfaces (`#f8fafc` / `#ffffff` / `#f1f5f9`).

## Color Palette (OKLCH & Hex Tokens)
### Brand & Accent
- **Primary Accent (Teal / Jade)**: `oklch(0.52 0.12 185)` (`#0f766e`) — Primary actions, focus rings, validated status
- **Accent Hover / Light**: `oklch(0.60 0.14 185)` (`#0d9488`), `oklch(0.96 0.03 185)` (`#f0fdfa`)
- **Navy Shell (Background & Dark Panels)**:
  - Deep Shell: `oklch(0.16 0.03 245)` (`#08101d`)
  - Chrome Header: `oklch(0.20 0.035 245)` (`#0b1626`)
  - Border Dark: `oklch(0.28 0.03 245)` (`#1e293b`)

### Neutral Ramp (Editor & Content Surfaces)
- **Editor Canvas Background**: `oklch(0.93 0.01 100)` (`#e2e8f0` / `#eef2f6`)
- **Panel Surface**: `oklch(0.99 0.002 100)` (`#ffffff`)
- **Subtle Surface**: `oklch(0.97 0.005 240)` (`#f8fafc`)
- **Panel Border**: `oklch(0.90 0.008 240)` (`#e2e8f0`)
- **Ink Primary**: `oklch(0.22 0.02 240)` (`#0f172a`)
- **Ink Muted**: `oklch(0.48 0.02 240)` (`#475569`)

### Semantic Tag Category Colors (High Contrast WCAG AA/AAA)
- **H1**: `oklch(0.50 0.22 290)` (`#7c3aed`) — Chapter / Book Title
- **H2**: `oklch(0.54 0.20 255)` (`#2563eb`) — Section Heading
- **H3**: `oklch(0.56 0.16 220)` (`#0891b2`) — Subsection Heading
- **H4..H6**: `oklch(0.52 0.15 240)` (`#0284c7`) — Sub-heading
- **P**: `oklch(0.42 0.03 240)` (`#334155`) — Body Paragraph
- **Table / TH / TD**: `oklch(0.58 0.18 45)` (`#ea580c` / `#c2410c`) — Tabular data
- **Figure / Image**: `oklch(0.55 0.14 185)` (`#0d9488`) — Figures & Charts
- **List / ListItem**: `oklch(0.62 0.16 85)` (`#d97706`) — Lists
- **Artifact**: `oklch(0.50 0.02 240)` (`#64748b`) — Decorative / Header / Footer
- **Sidebar / Footnote / Quote**: `oklch(0.52 0.18 280)` (`#4f46e5` / `#7e22ce` / `#e11d48`)

## Typography
- **UI Sans Stack**: `Inter`, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Editorial Serif Stack**: `Newsreader`, 'Times New Roman', Georgia, serif (for titles, chapter headings, and document previews)
- **Code & Metadata Mono Stack**: `JetBrains Mono`, Menlo, Monaco, Consolas, monospace (for tag badges, reading order numbers, page coordinates, and JSON previews)

## Layout & Hierarchy
- **Desktop 3-Pane Workstation**:
  - Left Pane (50% / 6 cols): PDF Canvas Viewer with high-DPI rendering, SVG reading-order vector paths, interactive bounding box highlights, and zoom/pan tools.
  - Middle Pane (25% / 3 cols): Document Structure Tree with quick filters (All, Headings, Figures, Tables, Flagged, Artifacts), reading-order reorder arrows, search, and bulk auto-artifact actions.
  - Right Pane (25% / 3 cols): Element Inspector with tag selector, real-time confidence rating, AI alt-text generation, table matrix editor, extracted text editor, speech audition button, and human review toggle.
- **Header Navigation**: Fixed high-contrast dark chrome with multi-stage pipeline stepper, live compliance score badge, Read Aloud simulator launch button, and keyboard shortcut guide.
- **Validation Scorecard**: Rich conformance dial, categorical issue cards with 1-click auto-fix actions, and standard clause mapping.

## Accessibility Rules
- Every interactive element has an explicit `focus-visible` ring (`2px solid #0f766e`, `offset: 2px`).
- High-contrast text: Body and label contrast ≥ 4.5:1 against background.
- Full keyboard operability (Tab, Shift+Tab, Arrow keys, Enter, Esc, Ctrl+Up/Down for reading order).
- ARIA live announcements and synchronized audio highlights for the built-in screen reader simulator.
