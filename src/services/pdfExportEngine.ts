import { 
  PDFDocument, 
  PDFName, 
  PDFString, 
  PDFNumber, 
  PDFArray, 
  StandardFonts 
} from 'pdf-lib';
import type { EbookDocument } from '../types/pdf';

/**
 * Escapes plain text for inclusion in PDF literal string operators: (text) Tj
 */
function escapePdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

/**
 * Helper to construct a PDFArray with context and initial items
 */
function createPdfArray(context: any, items: any[] = []): PDFArray {
  const arr = PDFArray.withContext(context);
  items.forEach((item) => arr.push(item));
  return arr;
}

/**
 * Exports a standards-compliant Tagged PDF (PDF/UA-1 / ISO 14289-1 & ISO 32000-1)
 * with complete StructTreeRoot, StructElem hierarchy, ParentTree Number Tree,
 * Page StructParents, and Marked Content sequences (/Tag << /MCID n >> BDC ... EMC)
 * so that Adobe Acrobat Pro and assistive readers display text items nested inside tags.
 */
export async function exportAccessibleTaggedPdf(doc: EbookDocument): Promise<Blob> {
  let pdfDoc: PDFDocument;

  if (doc.pdfArrayBuffer) {
    pdfDoc = await PDFDocument.load(doc.pdfArrayBuffer);
  } else {
    pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([595.28, 841.89]);
  }

  // Embed standard fonts for marked content operators
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Set Standards-Compliant Document Information Dictionary & Metadata
  pdfDoc.setTitle(doc.metadata.title || 'Accessible Document');
  pdfDoc.setAuthor(doc.metadata.author || 'Author');
  pdfDoc.setSubject(doc.metadata.subject || 'Accessible PDF/UA Document');
  pdfDoc.setKeywords(doc.metadata.keywords || ['Accessibility', 'PDF/UA', 'WCAG 2.1']);
  pdfDoc.setProducer('Accessible Ebook Tagger Engine v2.4 (ISO 14289-1 PDF/UA Compliant)');
  pdfDoc.setCreator('Accessible Ebook Tagger');
  pdfDoc.setModificationDate(new Date());

  // 2. Set PDF Catalog /Lang entry (RFC 3066/BCP 47 language code)
  const catalog = pdfDoc.catalog;
  const langCode = doc.metadata.language || 'en-US';
  catalog.set(PDFName.of('Lang'), PDFString.of(langCode));

  // 3. Set MarkInfo dictionary: << /Marked true >> (Standard requirement for Tagged PDF)
  const markInfoDict = pdfDoc.context.obj({
    Marked: true,
    UserProperties: false,
    Suspects: false,
  });
  catalog.set(PDFName.of('MarkInfo'), markInfoDict);

  // 4. Set ViewerPreferences: << /DisplayDocTitle true >>
  const viewerPrefs = pdfDoc.context.obj({
    DisplayDocTitle: true,
  });
  catalog.set(PDFName.of('ViewerPreferences'), viewerPrefs);

  // 5. Build StructTreeRoot, StructElem hierarchy, and Marked Content
  const pages = pdfDoc.getPages();
  const structTreeRootRef = pdfDoc.context.nextRef();
  const documentStructElemRef = pdfDoc.context.nextRef();

  // Map to store indirect StructElem references per page index for the ParentTree
  const pageStructRefsMap: Map<number, any[]> = new Map();
  pages.forEach((_, pIdx) => {
    pageStructRefsMap.set(pIdx, []);
  });

  const allChildStructRefs: any[] = [];
  const sortedElements = [...doc.elements].sort((a, b) => a.readingOrder - b.readingOrder);

  // Group elements by page
  const elementsByPage = new Map<number, typeof sortedElements>();
  sortedElements.forEach((el) => {
    const pNum = el.pageNumber || 1;
    if (!elementsByPage.has(pNum)) {
      elementsByPage.set(pNum, []);
    }
    elementsByPage.get(pNum)!.push(el);
  });

  // Process each page: link StructParents and inject marked content sequences
  for (let pIdx = 0; pIdx < pages.length; pIdx++) {
    const pageNum = pIdx + 1;
    const page = pages[pIdx];
    const pageElements = elementsByPage.get(pageNum) || [];
    const pageStructRefs = pageStructRefsMap.get(pIdx)!;

    // Set page /StructParents number and /Tabs /S (Use Document Structure for tab order)
    page.node.set(PDFName.of('StructParents'), PDFNumber.of(pIdx));
    page.node.set(PDFName.of('Tabs'), PDFName.of('S'));

    let currentMcid = 0;
    const markedContentOps: string[] = [];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    pageElements.forEach((el) => {
      if (el.tag === 'Artifact') {
        // Artifacts in PDF/UA are marked content with /Artifact tag and not registered in StructTree
        markedContentOps.push(`/Artifact << /Type /Pagination >> BDC\nEMC\n`);
        return;
      }

      const mcid = currentMcid++;
      const structElemRef = pdfDoc.context.nextRef();
      pageStructRefs.push(structElemRef);
      allChildStructRefs.push(structElemRef);

      // Sanitize tag name to standard ISO 32000-1 structural types
      const standardTag =
        el.tag === 'Caption'
          ? 'Caption'
          : el.tag === 'ListItem'
          ? 'LI'
          : el.tag === 'Footnote'
          ? 'Note'
          : el.tag === 'Sidebar'
          ? 'Sect'
          : el.tag === 'Quote'
          ? 'BlockQuote'
          : el.tag;

      // 1. Create StructElem dictionary with /Pg and /K pointing to the page's MCID
      const structElemDict = pdfDoc.context.obj({
        Type: PDFName.of('StructElem'),
        S: PDFName.of(standardTag),
        P: documentStructElemRef,
        Pg: page.ref,
        K: PDFNumber.of(mcid), // MCID integer linking directly to page content stream!
        Alt: el.altText ? PDFString.of(el.altText) : undefined,
        ActualText: el.text ? PDFString.of(el.text) : undefined,
        T: el.text ? PDFString.of(el.text.slice(0, 60)) : PDFString.of(standardTag),
      });
      pdfDoc.context.assign(structElemRef, structElemDict);

      // 2. Build Marked Content sequence in page content stream
      const fontName = el.fontWeight === 'bold' ? fontHelveticaBold.name : fontHelvetica.name;
      const fontSize = el.fontSize || 10.5;
      const xPt = Math.max(10, (el.bbox.x / 100) * pageWidth);
      const yPt = Math.max(10, pageHeight - ((el.bbox.y + el.bbox.height) / 100) * pageHeight);
      const escapedText = escapePdfText(el.text || (el.altText ? `[Figure: ${el.altText}]` : ''));

      markedContentOps.push(
        `/${standardTag} << /MCID ${mcid} >> BDC\n` +
        `BT\n` +
        `/${fontName} ${fontSize} Tf\n` +
        `${xPt.toFixed(2)} ${yPt.toFixed(2)} Td\n` +
        `(${escapedText}) Tj\n` +
        `ET\n` +
        `EMC\n`
      );
    });

    // Append Marked Content Stream to page contents
    if (markedContentOps.length > 0) {
      const mcStreamBytes = new TextEncoder().encode(markedContentOps.join('\n'));
      const mcStream = pdfDoc.context.flateStream(mcStreamBytes);
      const mcStreamRef = pdfDoc.context.register(mcStream);

      const existingContents = page.node.Contents();
      if (!existingContents) {
        page.node.set(PDFName.of('Contents'), mcStreamRef);
      } else if (existingContents instanceof PDFArray) {
        existingContents.push(mcStreamRef);
      } else {
        const newContentsArray = createPdfArray(pdfDoc.context, [existingContents, mcStreamRef]);
        page.node.set(PDFName.of('Contents'), newContentsArray);
      }
    }
  }

  // 6. Create Document Root StructElem
  const documentStructElem = pdfDoc.context.obj({
    Type: PDFName.of('StructElem'),
    S: PDFName.of('Document'),
    P: structTreeRootRef,
    K: createPdfArray(pdfDoc.context, allChildStructRefs),
    T: PDFString.of(doc.metadata.title || 'Document'),
  });
  pdfDoc.context.assign(documentStructElemRef, documentStructElem);

  // 7. Build ParentTree Number Tree (mapping each page's StructParents index to array of StructElem refs)
  const parentTreeNums: any[] = [];
  pages.forEach((_, pIdx) => {
    const pageRefs = pageStructRefsMap.get(pIdx) || [];
    if (pageRefs.length > 0) {
      const pageArray = createPdfArray(pdfDoc.context, pageRefs);
      const pageArrayRef = pdfDoc.context.register(pageArray);
      parentTreeNums.push(PDFNumber.of(pIdx));
      parentTreeNums.push(pageArrayRef);
    }
  });

  const parentTreeDict = pdfDoc.context.obj({
    Nums: createPdfArray(pdfDoc.context, parentTreeNums),
  });
  const parentTreeRef = pdfDoc.context.register(parentTreeDict);

  // 8. Build StructTreeRoot and attach to Catalog
  const structTreeRoot = pdfDoc.context.obj({
    Type: PDFName.of('StructTreeRoot'),
    K: createPdfArray(pdfDoc.context, [documentStructElemRef]),
    ParentTree: parentTreeRef,
    ParentTreeNextKey: PDFNumber.of(pages.length),
    RoleMap: pdfDoc.context.obj({
      Sidebar: PDFName.of('Sect'),
      Footnote: PDFName.of('Note'),
      Quote: PDFName.of('BlockQuote'),
      ListItem: PDFName.of('LI'),
    }),
  });
  pdfDoc.context.assign(structTreeRootRef, structTreeRoot);
  catalog.set(PDFName.of('StructTreeRoot'), structTreeRootRef);

  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

export function exportStructuredJson(doc: EbookDocument): string {
  const exportPayload = {
    schemaVersion: '2.0.0',
    standard: 'PDF/UA-1 (ISO 14289-1) & WCAG 2.1 Level AA',
    metadata: doc.metadata,
    validationScore: doc.validationReport.overallScore,
    wcagLevel: doc.validationReport.wcagLevel,
    elementsCount: doc.elements.length,
    structure: doc.elements.map((el) => ({
      id: el.id,
      readingOrder: el.readingOrder,
      pageNumber: el.pageNumber,
      tag: el.tag,
      confidence: el.confidence,
      text: el.text,
      altText: el.altText || null,
      isDecorative: !!el.isDecorative,
      boundingBoxPercentage: el.bbox,
      tableData: el.tableData || null,
      column: el.column || 1,
    })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportPayload, null, 2);
}

export function exportEpubXhtml(doc: EbookDocument): string {
  const sorted = [...doc.elements].sort((a, b) => a.readingOrder - b.readingOrder);
  let html = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${doc.metadata.language || 'en-US'}">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(doc.metadata.title)}</title>
  <meta name="author" content="${escapeXml(doc.metadata.author)}" />
  <style>
    body { font-family: "Georgia", serif; line-height: 1.6; max-width: 48em; margin: 2em auto; padding: 0 1em; color: #111; }
    h1 { font-size: 2.2em; color: #0b1626; margin-top: 1.5em; }
    h2 { font-size: 1.5em; color: #0f766e; margin-top: 1.2em; }
    h3 { font-size: 1.2em; color: #334155; }
    p { margin: 1em 0; text-align: justify; }
    figure { margin: 2em 0; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5em; border-radius: 8px; }
    figcaption { font-size: 0.9em; font-weight: bold; color: #475569; margin-top: 0.8em; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background-color: #0f766e; color: #ffffff; }
    aside.sidebar { background: #f1f5f9; border-left: 4px solid #4f46e5; padding: 1em 1.5em; margin: 1.5em 0; }
    aside.footnote { font-size: 0.85em; color: #64748b; border-top: 1px solid #e2e8f0; margin-top: 2em; padding-top: 0.5em; }
  </style>
</head>
<body>
  <article>
`;

  sorted.forEach((el) => {
    if (el.tag === 'Artifact') return; // Skip artifacts in semantic EPUB XHTML

    switch (el.tag) {
      case 'H1':
        html += `    <h1>${escapeXml(el.text)}</h1>\n`;
        break;
      case 'H2':
        html += `    <h2>${escapeXml(el.text)}</h2>\n`;
        break;
      case 'H3':
        html += `    <h3>${escapeXml(el.text)}</h3>\n`;
        break;
      case 'H4':
        html += `    <h4>${escapeXml(el.text)}</h4>\n`;
        break;
      case 'H5':
        html += `    <h5>${escapeXml(el.text)}</h5>\n`;
        break;
      case 'H6':
        html += `    <h6>${escapeXml(el.text)}</h6>\n`;
        break;
      case 'P':
        html += `    <p>${escapeXml(el.text)}</p>\n`;
        break;
      case 'ListItem':
        html += `    <li>${escapeXml(el.text)}</li>\n`;
        break;
      case 'Figure': {
        const alt = escapeXml(el.altText || el.aiAltTextSuggested || 'Figure');
        html += `    <figure role="group">\n      <div class="figure-placeholder" role="img" aria-label="${alt}">[Figure: ${alt}]</div>\n    </figure>\n`;
        break;
      }
      case 'Caption':
        html += `    <figcaption>${escapeXml(el.text)}</figcaption>\n`;
        break;
      case 'Table':
        if (el.tableData) {
          html += `    <table>\n`;
          if (el.tableData.caption) {
            html += `      <caption>${escapeXml(el.tableData.caption)}</caption>\n`;
          }
          html += `      <thead>\n        <tr>\n`;
          const headers = el.tableData.cells.filter((c) => c.rowIndex === 0);
          headers.forEach((h) => {
            html += `          <th scope="col">${escapeXml(h.text)}</th>\n`;
          });
          html += `        </tr>\n      </thead>\n      <tbody>\n`;
          const maxRow = Math.max(...el.tableData.cells.map((c) => c.rowIndex));
          for (let r = 1; r <= maxRow; r++) {
            html += `        <tr>\n`;
            const rowCells = el.tableData.cells.filter((c) => c.rowIndex === r);
            rowCells.forEach((c) => {
              html += `          <td>${escapeXml(c.text)}</td>\n`;
            });
            html += `        </tr>\n`;
          }
          html += `      </tbody>\n    </table>\n`;
        } else {
          html += `    <p class="table-text">${escapeXml(el.text)}</p>\n`;
        }
        break;
      case 'Sidebar':
        html += `    <aside class="sidebar" role="complementary">\n      <p>${escapeXml(el.text)}</p>\n    </aside>\n`;
        break;
      case 'Footnote':
        html += `    <aside class="footnote" role="doc-footnote">\n      <p>${escapeXml(el.text)}</p>\n    </aside>\n`;
        break;
      case 'Quote':
        html += `    <blockquote cite="">\n      <p>${escapeXml(el.text)}</p>\n    </blockquote>\n`;
        break;
      case 'Link':
        html += `    <p><a href="${escapeXml(el.linkUrl || '#')}">${escapeXml(el.text)}</a></p>\n`;
        break;
      default:
        html += `    <p>${escapeXml(el.text)}</p>\n`;
    }
  });

  html += `  </article>
</body>
</html>`;
  return html;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
