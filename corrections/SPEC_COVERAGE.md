# Spec coverage

Every requirement in the client spec materials, mapped to **done / partly / missing**, with the
file:function where it lives (or why it is missing). Code paths are under `automation-app/src/`.

Spec materials read for this map (all in `corrections/`):

- `Accesible(EPUB)_Language_Automation_Specification_*.xlsx` — accessibility labels per language
- `Standard(EPUB)_Automation_Specification_*.xlsx` — Standard-EPUB tag templates per content element
- `Standard-Vs-Accesible(EPUB)_Tag-Differences_*.xlsx` — what the accessible profile adds
- `EPUB-Automation-Update_*.docx` and `EPUB-Automation-Update-V3_*.docx` — InDesign→EPUB defect list
- `Word-EPUB-Automation-Update-V1_*.docx` — Word(.docx)→EPUB defect list
- `Accessible-PDF-Automation_Updates_V1_*.docx` + both `*_PAC_UA_Report_*.pdf` — PDF/UA defect list
- `FORGE_STATUS.md`, `forge_task.md` — prior work log (`ux_report.md` not present)

Legend: **done** = implemented and tested; **partly** = present but incomplete or not wired the way
the task asks; **missing** = not implemented.

---

## A. Accessible-EPUB language spec (localized a11y labels)

| Requirement | Status | Location / why |
|---|---|---|
| `xml:lang` on `<html>`, no duplicate `lang`+`xml:lang` | done | `engine/settings.ts:htmlLangAttrs` (default mode emits only `xml:lang`); used `epub/package.ts`, `epub/xml.ts` |
| `dc:language` in OPF | done | `epub/package.ts` (`<dc:language>`) |
| Page marker `<span epub:type="pagebreak" role="doc-pagebreak" id="page-N" aria-label title>` | done | `indesign/build.ts:pageSpan`; PDF path `pdfepub/build.ts:marker` |
| `<title>` = localized "Chapter N" | done | section title render, `epub/locale.ts:TABLE` (`chapter`) |
| Nav `<title>` = localized "Table of Contents" | done | `epub/package.ts` nav build + `locale.ts` (`navTitle`) |
| Landmarks nav (Cover / Title Page / Start Reading), localized | done | `epub/package.ts` (`epub:type="landmarks"`) + `locale.ts` (`cover`/`title`/`startReading`) |
| aria-label on Title / Author / Publisher | done | front-matter render, `indesign/front.ts` + locale labels |
| `img alt` default + decorative label per language | done | `epub/locale.ts` (`imageAlt`/`decorativeAlt`); applied in alt settle |
| Label table for de/fr/es/it/pt (+ more) | done | `epub/locale.ts:TABLE` (de/fr/es/it/pt/en/nl/pl/sv/da/tr/ru/el/ar/he) |
| Localized labels tunable per client (layered rule) | **missing** | labels live in `settings.labels` but no rule in `spec/rules.ts` exposes them to the client→series→book layers / spec workbook |

## B. Standard-EPUB tag templates

| Element | Status | Location |
|---|---|---|
| html prolog / namespaces | done | `epub/xml.ts` |
| Headings (`<h1 class="chapter">`) | done | `indesign/build.ts:renderHeading` |
| Bold/italic `<b>`/`<i>` | done | `indesign/inline.ts` |
| Figure + caption (`fig_group`) | done | `indesign/build.ts:pictureHtml` (sibling caption); PDF path uses `<figure><figcaption>` `pdfepub/build.ts` |
| Unordered / ordered list | done | `STD-04`, list render |
| Quote / extract | done | `STD-05`; extract classes `indesign/build.ts` |
| Table | done | `STD-06`, `TBL-01/02` |
| External link | done | inline anchor render |
| Footnote (`<sup class="super"><a>`) | done | `NOTE-01/02/03`, `STD-07` |
| Page break | done | see A |
| Per-element Standard vs Accessible switch (STD-01…12) | done | `spec/rules.ts` STD-01…STD-12, tested `standard.test.ts` |

## C. Standard vs Accessible differences (accessible profile additions)

| Difference | Status | Location |
|---|---|---|
| `role="heading"` + `aria-level` on headings | done | `indesign/build.ts:renderHeading` (rules `HD-01`/`HD-02`) |
| `<section epub:type role="doc-chapter" aria-labelledby>` | done | `indesign/build.ts`; type/role table `epub/locale.ts:SECTION_META` |
| Inner `<div xml:lang>` language wrapper | done | `epub/package.ts:langDiv` (rules `DOC-01`/`DOC-02`/`STD-11`) |
| Accessibility metadata (schema:accessMode etc.) in OPF | done | `epub/package.ts` a11y block (driven by profile `DOC-00`) |
| section / epub:type exposed as a client rule | partly | only via `DOC-00` profile + `STD-10`; no dedicated epub:type rule |
| a11y metadata exposed as a client rule | partly | emitted by profile, not a tunable rule |

## D. InDesign→EPUB defect list (EPUB-Automation-Update, V3)

| Defect (client comment) | Status | Location |
|---|---|---|
| `role="heading"` missing | done | `indesign/build.ts:renderHeading` |
| Small-caps style missing in heading | done | `indesign/build.ts` seriesCaps + `inline.ts:smallCaps` |
| Extract/quote paragraph class missing | done | `indesign/build.ts` extract classes, `STD-05` |
| `xml:lang` div missing | done | `epub/package.ts:langDiv` |
| Duplicated language should be removed | done | `settings.ts:htmlLangAttrs` default `xml:lang` only |
| Heading top/bottom space & size, TOC indent, footnote indent | done | V3 rows 16–20 rules, tested `rules.test.ts` ("V3 rows 16–20") |
| Order by vertical / page-number placement | done | reading order `indesign/build.ts`; page markers in spine order |
| Table structure / extra tags | done | `TBL-02` (clean widths), table render |

## E. Word(.docx)→EPUB defect list (Word-EPUB-Automation-Update)

| Requirement | Status | Location / why |
|---|---|---|
| Chapter splitting matches book TOC | **missing** | no docx→EPUB conversion exists; `.docx` is read only as spec/alt input (`spec/office.ts:readDocx`, `pdfua/altdocx.ts`) |
| TOC/Nav/NCX matches sample | **missing** | same — no Word pipeline |
| Page-break spans placed correctly | **missing** | same |
| Run-on paragraphs merged with previous line | **missing** | same |
| Lists converted | **missing** | `readDocx` extracts text only, not list structure |
| Tables converted | **missing** | `readDocx` flattens table rows to text |

> The current product expects a Word manuscript to be converted via its **print PDF** (`ui/PdfFlow.tsx`
> comment). The task asks for direct `.docx` input using heading styles — **this is Step 2 work.**

## F. Accessible-PDF (PDF/UA) defect list + PAC reports

| Requirement | Status | Location / why |
|---|---|---|
| Real tagged PDF (`/StructTreeRoot`, `/MarkInfo /Marked true`) | done | `pdfua/write.ts:writeUa` |
| Structure elements P, H1–H6, Figure, L/LI, Note, TOC, Caption | done | `pdfua/structure.ts:buildStructure` |
| **Table/TR/TD/TH structure** | **missing** | no table tagging in `pdfua/*` — tabular data tagged as plain paragraphs |
| Reading order | done | `pdfua/structure.ts` (columns, XY-cut) + MCID assignment `write.ts` |
| Alt text on figures (`/Alt`), missing-alt blocks export | done | `pdfua/write.ts`; alt from `pdfua/altdocx.ts:matchAlt` + reviewer/AI |
| Alt via the **same layered system** as InDesign | **missing** | PDF/UA alt is its own path, not `epub/alt.ts` layers (spec→meta→decorative→AI) |
| Document `/Lang` + XMP dc:language | done | `pdfua/write.ts` (`setLanguage`, XMP) |
| **Per-element `/Lang`** | **missing** | no StructElem carries `/Lang` |
| Bookmarks / `/Outlines` + `PageMode UseOutlines` | done | `pdfua/write.ts` outline build |
| Title in docinfo + XMP + `DisplayDocTitle true` | done | `pdfua/write.ts`; verified `pdfua/check.ts` |
| Artifacts for headers/footers/page numbers/slug | done | `pdfua/write.ts` (untagged margin content, slug→null owner) |
| Figure + caption in order | done | `pdfua/structure.ts` figure/caption pairing |
| **Notes linked to their reference marks** | **missing** | Note elements created but no Note↔reference link/back-link |
| Decorative image → `/Artifact` | partly | decorative figures are dropped, not marked `/Artifact` |
| Internal Matterhorn-style checker | done | `pdfua/check.ts:checkUa` |
| **Validate with veraPDF / open checker** | **missing** | veraPDF not present; PAC is a manual step. (Step 3 asks to try veraPDF locally) |

## G. Quality checker (honest) — shared by both EPUB flows

| Check | Status | Location |
|---|---|---|
| Fails when no headings | done | `check/epub.ts` (~:319) |
| Fails when TOC lacks chapters | done | `check/epub.ts` (~:335) |
| Fails on empty `urn:isbn` / empty dc metadata | done | `check/epub.ts` (~:126) + ISBN-13 validity |
| Fails on placeholder/missing alt (`Bild`, `Beschreibung von KI generiert`, `[Fehler`) | done | `check/epub.ts:BAD_ALT`/`altLevel` + `epub/alt.ts:isPlaceholderAlt` |
| Fails when manifest image never placed | done | `check/epub.ts` (~:443) |
| Fails when printed ISBN dropped | done | `check/epub.ts` (~:438) |
| epubcheck validation | partly | runs in tests only (`test/epubcheck.ts`, JRE+jar in `tools/`); runtime re-implements checks in `check/epub.ts` |
| PDF→EPUB output runs the same checker | done | `ui/PdfFlow.tsx` calls `checkEpub` |

## H. Rule system / spec import (layered, not hardcoded)

| Capability | Status | Location |
|---|---|---|
| client→series→book layers (house baseline) | done | `spec/layers.ts:resolve`, levels `house/client/series/book` |
| Accessibility waivers | done | `spec/layers.ts` (unwaived a11y change not applied), `spec/session.ts:giveWaiver` |
| Decision log (who/what/when) | done | `spec/store.ts:addDecision`, `spec/session.ts:log` |
| Spec workbook export + round-trip import | done | `spec/requirements.ts:specWorkbook` / `fromSpecWorkbook` |
| Client file (xlsx/docx/csv/txt) → rules by keywords | done | `spec/requirements.ts:matchByKeywords`/`valueFromText` |
| AI-assisted matching (key in localStorage only) | done | `spec/ai.ts:matchWithAi` |
| ~41 rules (DOC/PG/HD/TXT/TBL/NOTE/NAV/CSS/FM/A11Y/QA/STD) | done | `spec/rules.ts:RULES` |

---

## Gaps mapped to the task steps

**Step 1 — InDesign→EPUB missing spec requirements, wired as rules (not hardcoded):**
- Localized a11y labels, nav/landmarks, epub:type/section, and a11y metadata are produced correctly
  but are **profile/settings-driven, not client-tunable rules** (rows A, C "partly"). Expose the ones
  that matter as layered rules + spec-workbook columns.

**Step 2 — PDF/Word→EPUB robustness (biggest gap):**
- PDF→EPUB alt text **not wired to the layered alt system** (spec/metadata/decorative/AI-draft) — row F.
- PDF→EPUB **language is hardcoded `en`** (no text detection) — row C of §PDF.
- **Word `.docx`→EPUB does not exist** — headings-as-styles, lists, tables, run-on merge, page markers,
  TOC/nav (row E). Follow `Word-EPUB-Automation-Update`.
- Must run the same checker/report (already shared via `checkEpub`).

**Step 3 — PDF/UA:**
- **Table tagging missing**, **per-element `/Lang` missing**, **footnote→reference linking missing**,
  decorative→`/Artifact` only partial.
- **No open-checker validation** — try veraPDF locally and record honest results.

**Step 4 — UX bugs:** picture thumbnails rendering as grey placeholders (blob/object URL, MIME, CSP,
revoke timing); layout at 1280px width (Accept button area — see task). *(Not a spec-doc item; from UX report.)*

**Needs a client answer (cannot resolve from samples):**
- Which localized labels / a11y-metadata values the client wants client-tunable vs fixed (Step 1 scope).
- Exact Word manuscript style names the client uses for headings/lists/extracts (Step 2) — the sample
  set has no `.docx` manuscript, only the `Cambia tu mente` defect table; detection must fall back to
  Word's built-in `Heading 1/2` styles and outline levels.
