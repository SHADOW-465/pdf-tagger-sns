Chapter and heading detection now follows the book's own heading tags, paragraph style names, and contents list. Das Tempelhofer Feld builds as ten chapters in reading order — Luftfahrt is a chapter, and the imprint stays the copyright page — with those chapters in the contents menu and page numbers in spine order. Full test suite: 39 passed. Headless run of the Tempelhofer export: 10 chapters, contents links resolved, checker reported 0 problems to fix.

The quality check now fails a book that has no headings, a contents menu without the chapters, an empty ISBN, placeholder picture text such as "Bild" or "Beschreibung von KI generiert", a picture that is in the package but not on a page, or a printed ISBN that was left out. It no longer calls that part passed. Full test suite: 40 passed. Headless run of Das Tempelhofer Feld: 63 problems to fix, mostly placeholder picture text, and the accessibility group was not marked passed.

The author is now the person named on the title page. For Das Tempelhofer Feld that is Bjoern Weigel; the publisher and the people named in the copyright and acknowledgements are no longer stored as the author. Untitled parts can be given a title in Structure, and Next warns while those decisions are still open. Full test suite: 45 passed. Headless run: author Bjoern Weigel, ten chapters, 63 problems to fix (placeholder picture text).

Pictures that InDesign had dumped in a pile are now placed on the printed page that contains their caption. For Das Tempelhofer Feld, 63 pictures moved and the author portrait stays with the biography. Three pictures had no page marker in reading order, so they stayed where the export put them and that is listed under Changes made automatically. Full test suite: 45 passed. Headless run: 74 pictures, 63 problems to fix (placeholder picture text).

The house style screen now leads with a few plain choices, such as the kind of e-book, page numbers and picture descriptions, and puts the rest under Advanced with the jargon explained. A file that still has problems asks for a second confirmation before it downloads, the cover slot accepts only a JPG or PNG, and small files are shown in KB. The e-book is no longer marked as already certified. Full test suite: 45 passed. Headless run of Das Tempelhofer Feld: author Bjoern Weigel, 63 pictures moved, 63 problems to fix (placeholder picture text) and 4 to check, including the missing certificate.

A1–A3 fd67526: Spec workbook, image metadata, and decorative rules fill picture descriptions; a typed description always wins.

A4–A5 2bad15b: Vision drafts (Groq/OpenRouter/any OpenAI-compatible API, key in localStorage only) with source labels, approval, and a certification hold while an AI draft is open.

B1 ec15dbe: Each file slot has its own picker, accepts a file by extension when the type is empty, and clears a stale rejection after the right file is attached.

B2 8ba5c68: Check these first and the Next warning share one review list. Automatic changes are explained and left out of that count.

B3 754fe2d: The structure step always shows Update the preview, and says whether the preview is behind the choices.

B4 dcbed87: Picture thumbnails use the image type read from the file bytes, so they are the real pictures. The caption is shown beside each description (added in 2bad15b).
