# Client markups of 16/17 Oct 2026: status

Branch `forge/combined` (merge of `forge/epub-dynamic` and `forge/pdfua-fixes`). Nothing is pushed.
Status words: **fixed** (changed, tested, checked on the real book), **partial** (changed, with a stated gap), **not** (not done).

Commits: `d5a5519`, `e83582b`, `b628a35`, `a35b3ba` (earlier PDF/UA work), `31ae0f7` (this round: figures, index, image list), `d11459b` (Word to EPUB), `825929e` (merge).
Tests on the merged branch: **127 run, 127 pass, 0 skipped** (`npm test`, includes the Gladiators and Medium PDF builds and EPUBCheck 5.4.0 on the Word test book).

## What was and was not checked

- `pdf_a` and `pdf_b` are the same book (*Gladiators in the Greek World*): the five screenshots in `pdf_b` are repeats of `pdf_a` 1 to 5. Both were treated as one list.
- The tag tree below is read back with pdf.js (`test/read-tags.ts`), the way assistive technology reads it, from a fresh build of `Simple/Input` (361 pages). No Acrobat and no PAC run was done overnight, so the Acrobat tag panel and the PAC report are still to be looked at by a person.
- **The Cambia tu mente Word manuscript (.docx) is not on this machine.** The client's screenshots show an older tool output (`sec.xhtml`, `sec2.xhtml` …) and a hand-made reference. The Word items were rebuilt as synthetic Word files that have the same shape; they have not been run on the real manuscript.

## PDF A and PDF B (Gladiators)

| # | Client markup | Status | Evidence |
|---|---|---|---|
| A1 | Alt missing | **fixed**, one input needed | All 30 Figures have alt (0 without). 28 come from the Word alt file. The two logos (p4 publisher, p5 FSC) have no text in the Word file: they get alt typed in the app, the sample runner fills a stand-in. Test `Simple: book + cover image + plates PDF` expects exactly pages 3 and 4 (0-based) without a drafted alt, and the build reports an error if any Figure ends without alt. |
| A2 | Reading order not proper (two H1 with the same title, picture before the title) | **fixed** | `e83582b`. Tags p2 to p4: `p2 P: Gladiators in the Greek World` (half title), `p4 H1: Gladiators in the Greek World`, `P: How A Roman Blood Sport…`, `P: Alexandra Sills`, then `Figure` (logo). One H1 in the book. Tests `one H1 for the book title…`, `Simple…` (`count(tags,'H1') == 1`). |
| A3 | Figure and caption not in order | **fixed** | Plates: every `Figure` is followed by its caption `P` (p354 to p361, 24 pairs, e.g. `Figure` then `P: Relief showing a gladiator fight… Ephesus.`). New in `31ae0f7`: a picture is placed where it stands on the page (before the first line below it; across the columns it splits them) instead of at the first paragraph break. Result: the p4 logo now comes after the author line, as in the hand-made file. Tests `a figure is read where it stands…`, `a figure beside its caption is read figure first…`. |
| A4 | Note not linked / Global: not linked to notes | **fixed** | `b628a35`. 485 `Link [Note n]` in the tree, each in `Reference`, each note number links back. p29: `Link [alt: Note 11]`, `Link [alt: Note 12]`. Test `end notes anywhere…`, and in `Simple…` `p29 … Link … : 12`. |
| A5 | "Link to image" and "Not linked to images at the end of the book (plate)" | **fixed** (a hidden fault was found and fixed) | The list of images (p16 to p17) has 24 entries as `L/LI/Lbl/LBody`, each with a `Link "Go to picture n"`. Before `31ae0f7` only entries 1 to 10 and 24 were read with their text; the rest landed on the right page only by position, and 24 pointed to p357. Fixed: entries are read top to bottom and matched to their plate by caption. Test `Simple…` reads the link annotations and checks that entry n lands on the page of the n-th plate (24 of 24). |
| A6 | Reading order not tagged correctly (note number 12 breaks the line, p29) | **fixed** | The call is a `Link` in `Reference`, in its own paragraph run (tree above), no longer plain text inside the `P`. |
| A7 | Not tagging figure (FSC logo, p5) | **fixed** (default changed) | `31ae0f7`. Logos are Figures by default (`logos: 'artifact'` stays available). `p5 Figure [alt: …]`. A chart big enough stays a chart (the Medium sample still has its 13). Test `a vector logo… is a figure…`. **Decision for you:** a decorative mark can still be set to decorative in the app. |
| A8 | Extra tags or path inside a figure | **fixed** | `b628a35`. Frames, rules and clipping paths are Artifacts: 0 path, clip or paint operators outside marked content in the whole book; maps p13 to p15 hold the picture only. Tests `frames, hairlines…`, `a clipping path outside any sequence…`. Not seen in Acrobat. |
| A9 | Chapter heading H2, sub-head H3 | **fixed** | `e83582b`. `p29 H2: Chapter 1 Arena`, `H3: The Greek Map`. Kept as one switch (`chapterLevel`) for a client that wants H1 chapters. Test `chapters take H2 and subheads H3…`. |
| A10 | List tag structure L / LI / Lbl / LBody | **fixed** | `e83582b`. 693 `Lbl` lines in the tree. p61: `Lbl: •`, `LBody: Lysimachos was a Thessalian general…`. Test `a list marker is split into Lbl…`. Also `31ae0f7`: a wrapped line that is flush with its paragraph no longer splits it (the "Front Cover: … Found / in Kibyra." note on p16 is one paragraph, p61 prose is no longer one P per line). |
| A11 | Index reading order not tagged properly (one P per entry) | **fixed** | `31ae0f7`. Left column, middle, right; one `P` per entry, turnover lines kept with their entry, sub-entries apart. p338: `P: Abdera, 55`, `P: Achaea (province), 60, 305n.129`, `P: Agora, 35–7, 45, 70, 183, 265`, `P: of Aphrodisias (south), 149`. Tests `an index: one paragraph per entry…`, `Simple…`. Index rule is limited to a section whose heading reads as an index. |

## Word to EPUB (Cambia tu mente, `word_epub.txt` / `img_word_epub`)

The client's test file is dated 29 Sep; the Word engine (`cbe305a`, 14 Oct) already fixed the first points. The rest is `d11459b`. All checked only on synthetic Word files (see above).

| # | Client markup | Status | Evidence |
|---|---|---|---|
| W1 | File list: tool made `sec.xhtml`…`sec5.xhtml`, the reference has `part1-3`, `chapter01-11`, `intro`, `list`… | **partial** | A heading starts its own file when the book's contents names it, at heading level 1 or 2, so a Heading-2 chapter under a Heading-1 part is no longer folded into the part. Front and back matter get `intro`, `ata`, `bib`, `concl`… as before. A "PRIMERA PARTE Title" heading is now recognised as a part (`part.xhtml`; `locale.ts`). Test `Word, Cambia shape…`: files `toc, intro, part, chapter01, chapter02`. Gap: the file for a second part is `part2`, not the reference's `part1`/`part2` pair numbering from 1; and no real manuscript was run. |
| W2 | Contents page: not linked, wrapped lines, leaders and page numbers as text (`TOC-2` lines, "c apítulo 9") | **fixed** (synthetic) | The contents list is read at every level; an entry wrapped over several lines becomes one entry without dot leaders or page number; the book gets a contents page (`toc.xhtml`, `doc-toc`) with `toc_1`, `toc_1a`, `toc_2` entries that link to their files. Test checks `<a href="chapter01.xhtml">Capítulo 1.` and no `...` or page numbers. An entry that matches no section is listed in the review. |
| W3 | Page marker split a paragraph; stray "1/9/26 15:00" text | **fixed** (before this round, `cbe305a`) | Test `Word chapters follow the contents list…`: the `pagebreak` span stays inside the paragraph, `1/9/26` and `15:00` are gone. Re-checked in the full suite. |
| W4 | Bullets typed as "•" inside one paragraph (class `extractt`) instead of a list | **fixed** (synthetic) | Lines that start with a bullet glyph, one paragraph each or joined by line breaks, become `<ul><li>`. A dash or asterisk is not taken as a bullet (dialogue, note marks "* Bethune"). Test checks `<ul><li>El 84 por ciento…` and no `•` left. |
| W5 | Table on printed p160 (checklist, circled): header and caption | **partial** | Table cells are real `th`/`td`; the first row is a header when it is flagged, all bold, or shaded above unshaded rows; a short bold line right above the table becomes its `<caption>`. I could not see what the client circled in the question column, so that part is not confirmed. |
| W6 | Printed page number 160 circled | **not confirmed** | The builder takes page numbers from the Word `PAGE` fields. I do not know what was wrong with 160. Needs the manuscript. |
| W7 | Produced EPUB valid | **fixed** for the test book | EPUBCheck 5.4.0 on the built Word EPUB in the test: 0 errors. The real Cambia Word file was not run. |

## Open decisions

1. FSC/publisher logos are now Figures with alt typed by the reviewer. If you prefer them as decoration by default, pass `logos: 'artifact'` in the client's `ua` options.
2. Chapters are H2 under a title H1 (the client's "global change"). A client that wants H1 chapters sets `chapterLevel: 1`.
3. Send the Cambia Word manuscript and the client's hand-made EPUB: W1, W5 and W6 can only be closed on the real file.
4. An Acrobat/PAC look at the Gladiators output is still needed for A8 (path tags) before you call it done.
