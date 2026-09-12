# Changelog

All notable changes and milestones for the **Accessible Ebook Tagger** (`pdf-tagger-sns`) project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added & Enhanced
- **Voice Test Fine-Tuning & Multi-Page Navigation**:
  - **Unblocked Page Navigation While Paused**: Fixed the `useEffect` sync bug in [ReviewWorkspace.tsx](file:///c:/Users/acer/Documents/GitHub/pdf-tagger-sns/src/components/screens/ReviewWorkspace.tsx) where pausing voice playback previously forced `currentPage` back to the paused element's page number whenever a user attempted to navigate to other pages. Navigation across all pages is now completely unrestricted while paused or stopped.
  - **Minimized Floating Dock Mode**: Added a "Minimize" control to [ScreenReaderModal.tsx](file:///c:/Users/acer/Documents/GitHub/pdf-tagger-sns/src/components/modals/ScreenReaderModal.tsx), transforming the full-screen modal into a non-blocking floating player dock in the bottom-right corner. Users can freely view the PDF canvas, inspect page overlays, edit tags, and switch pages while voice test is paused or running.
  - **Direct Page Jump in Voice Test**: Added a page selector dropdown inside the voice test toolbar so users can instantly jump and preview screen reader announcements directly for any page (`Page X of Y`).
  - **Multi-Subscriber Event System in `ScreenReaderSimulator`**: Replaced single callback references in [speechSynthesizer.ts](file:///c:/Users/acer/Documents/GitHub/pdf-tagger-sns/src/services/speechSynthesizer.ts) with an event listener subscription pattern (`subscribe`) with clean unsubscribe cleanup.
  - **Garbage Collection & Error Protection**: Added instance tracking to `SpeechSynthesisUtterance` to safeguard against premature browser garbage collection cutoffs mid-speech in Chromium browsers, and ignored expected `'canceled'` / `'interrupted'` events during manual skips.

### Verified & Resolved
- **Duplicate Text & Tagging Issue Analysis**:
  - Investigated the PDF marked content injection and font resource registration pipeline.
  - Confirmed the fix for marked content text streams and structure element hierarchy in `pdfExportEngine.ts`.
  - Verified that structure parent tree numbers (`/StructParents`, `/Tabs /S`) and standard ISO 32000-1 / PDF/UA structural tags (`Document`, `H1`–`H6`, `P`, `LI`, `Figure`, `Table`, etc.) link directly without causing duplicate visible text rendering or Acrobat structure corruption errors.
  - Verified TypeScript compilation and bundle production (`npm run build` succeeds cleanly).

---

## [1.2.0] - 2026-08-20

### Fixed
- **Font Resource Registration**: Corrected font dictionary registration (`/F1` Helvetica and `/F2` Helvetica-Bold) on each page's `/Resources` dictionary to ensure PDF/UA marked content streams validate without missing font warnings in Adobe Acrobat.
- **Stream Integrity**: Resolved marked content stream creation and indirect object assignment to prevent stream syntax errors on exported tagged PDFs.

---

## [1.1.0] - 2026-08-15

### Added
- **Keyboard Shortcuts for Tagging**: Added single-key shortcuts for rapid manual tagging in the editor:
  - `P` for Paragraph (`P`)
  - `1`–`6` for Headings (`H1`–`H6`)
  - `F` for Figure
  - `T` for Table (`Table`)
  - `L` for ListItem (`LI`)
  - `O` for List (`List`)
  - `A` for Artifact
  - `C` for Caption
  - `S` for Sidebar
  - `Q` for BlockQuote
  - `N` for Footnote
  - `K` for Link
- **Heading Level Skip Detection**: Added `checkSkippedHeading` utility to identify skipped heading levels (e.g. jumping from `H1` straight to `H3`) and suggest the expected tag level.
- **Enhanced Hierarchy Tree**: Expanded `buildHierarchyTree` with support for subsections (`H3`), nested tree views, and warning badges for skipped headings and unverified tags.
- **Screen Reader Announcements**: Refined assistive speech announcements for figures, tables, sidebars, blockquotes, footnotes, and artifacts.
- **Tagged PDF Marked Content Packaging**: Implemented PDF marked content operators (`BDC ... EMC`) paired with `/MCID` tags and indirect structure tree objects (`StructTreeRoot`, `StructElem`).

---

## [1.0.0] - 2026-08-01

### Added
- **Accessible Ebook Tagger Web Application**: Initial complete release featuring:
  - **PDF Ingestion & Text Extraction**: Client-side parsing using PDF.js to extract text blocks, font sizes, weights, and bounding boxes.
  - **Automated Heuristic Tagging**: Automated structural classification into `H1`–`H6`, `P`, `List`, `Table`, `Figure`, `Artifact`, etc.
  - **Reading Order Editor**: Drag-and-drop reading order resequencing with visual connector lines.
  - **AI Alt-Text Generator & Suggestions**: Context-aware alt-text generation for images and figures.
  - **Screen Reader & Speech Simulator**: In-browser audio and text simulation of screen readers (NVDA/JAWS style).
  - **Accessibility Validator**: Automated WCAG 2.1 Level AA and PDF/UA-1 compliance checks with scoring and issue flagging.
  - **Multi-Format Export**:
    - Tagged Accessible PDF (PDF/UA-1 structure)
    - Structured JSON report
    - EPUB3-compliant semantic XHTML with embedded styling.
