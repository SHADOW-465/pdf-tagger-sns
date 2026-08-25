import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { EbookDocument, PdfElement, PdfMetadata } from '../types/pdf';
import { evaluateAccessibility } from './accessibilityValidator';
import { getPdfDocument } from './pdfJsCache';

export async function createDemoPdfDocument(): Promise<EbookDocument> {
  const pdfDoc = await PDFDocument.create();
  
  // Set standard PDF metadata
  pdfDoc.setTitle('The Architecture of Thought: Accessible Design Patterns for Digital Literature');
  pdfDoc.setAuthor('Dr. Elena Rostova & Marcus Vance');
  pdfDoc.setSubject('Accessible Digital Publishing, Screen Reader Compatibility, PDF/UA, WCAG 2.1');
  pdfDoc.setKeywords(['accessibility', 'PDF/UA', 'WCAG', 'screen reader', 'ebooks', 'semantic tagging']);
  pdfDoc.setProducer('Accessible Ebook Tagger Engine v2.4');
  pdfDoc.setCreator('Accessible Ebook Tagger');
  pdfDoc.setCreationDate(new Date('2026-01-15T09:00:00Z'));

  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontSerifRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  const PAGE_WIDTH = 595.28; // A4 point size
  const PAGE_HEIGHT = 841.89;

  // --- PAGE 1: COVER & FRONT MATTER ---
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  // Background aesthetic
  page1.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: rgb(0.98, 0.98, 0.96),
  });
  // Top decorative band
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 12,
    width: PAGE_WIDTH,
    height: 12,
    color: rgb(0.05, 0.09, 0.15),
  });
  page1.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 18,
    width: PAGE_WIDTH,
    height: 6,
    color: rgb(0.06, 0.46, 0.43),
  });

  // Cover emblem (Artifact decoration)
  page1.drawCircle({
    x: PAGE_WIDTH / 2,
    y: PAGE_HEIGHT - 180,
    size: 40,
    borderColor: rgb(0.06, 0.46, 0.43),
    borderWidth: 2,
    color: rgb(0.94, 0.97, 0.97),
  });
  page1.drawText('A', {
    x: PAGE_WIDTH / 2 - 10,
    y: PAGE_HEIGHT - 192,
    size: 34,
    font: fontSerif,
    color: rgb(0.06, 0.46, 0.43),
  });

  // Title
  page1.drawText('THE ARCHITECTURE', {
    x: 50,
    y: PAGE_HEIGHT - 280,
    size: 28,
    font: fontSerif,
    color: rgb(0.05, 0.09, 0.15),
  });
  page1.drawText('OF THOUGHT', {
    x: 50,
    y: PAGE_HEIGHT - 315,
    size: 28,
    font: fontSerif,
    color: rgb(0.06, 0.46, 0.43),
  });

  // Subtitle
  page1.drawText('Accessible Design Patterns for Digital Literature and Read Aloud Experiences', {
    x: 50,
    y: PAGE_HEIGHT - 360,
    size: 12.5,
    font: fontSansBold,
    color: rgb(0.25, 0.3, 0.38),
  });

  // Authors
  page1.drawText('Dr. Elena Rostova & Marcus Vance', {
    x: 50,
    y: PAGE_HEIGHT - 440,
    size: 14,
    font: fontSans,
    color: rgb(0.1, 0.15, 0.2),
  });
  page1.drawText('Foreword by The Universal Accessibility Consortium', {
    x: 50,
    y: PAGE_HEIGHT - 465,
    size: 10,
    font: fontSans,
    color: rgb(0.45, 0.5, 0.55),
  });

  // ISBN / Cataloging
  page1.drawText('ISBN 978-1-987654-32-1 | Oxford Academic Digital Library Series', {
    x: 50,
    y: 80,
    size: 9,
    font: fontMono,
    color: rgb(0.5, 0.55, 0.6),
  });


  // --- PAGE 2: CHAPTER 1 & DIAGRAM & FOOTNOTE ---
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  // Running Header
  page2.drawText('THE ARCHITECTURE OF THOUGHT | CHAPTER 1', {
    x: 50,
    y: PAGE_HEIGHT - 45,
    size: 8,
    font: fontSansBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page2.drawLine({
    start: { x: 50, y: PAGE_HEIGHT - 52 },
    end: { x: PAGE_WIDTH - 50, y: PAGE_HEIGHT - 52 },
    thickness: 0.5,
    color: rgb(0.8, 0.82, 0.85),
  });

  // Chapter 1 Title
  page2.drawText('Chapter 1: The Human Interface of Information', {
    x: 50,
    y: PAGE_HEIGHT - 95,
    size: 20,
    font: fontSerif,
    color: rgb(0.05, 0.09, 0.15),
  });

  // Section 1.1
  page2.drawText('1.1 Sensory Perception and Non-Visual Navigation', {
    x: 50,
    y: PAGE_HEIGHT - 135,
    size: 14,
    font: fontSansBold,
    color: rgb(0.06, 0.46, 0.43),
  });

  // Paragraphs
  const p1Text = 'When an ebook is opened by a screen reader user or spoken via a modern Read Aloud engine, the software does not experience the page as a two-dimensional visual grid. Instead, assistive technologies parse the underlying Document Structure Tree to construct a continuous, serialized audio stream.';
  page2.drawText(p1Text, {
    x: 50,
    y: PAGE_HEIGHT - 165,
    size: 10.5,
    font: fontSerifRegular,
    color: rgb(0.12, 0.15, 0.2),
    maxWidth: PAGE_WIDTH - 100,
    lineHeight: 16,
  });

  const p2Text = 'Without explicit semantic tagging, multi-column articles collapse unpredictably, decorative icons get read aloud as cryptic filename strings, and complex figures become silent voids in the reading experience.';
  page2.drawText(p2Text, {
    x: 50,
    y: PAGE_HEIGHT - 225,
    size: 10.5,
    font: fontSerifRegular,
    color: rgb(0.12, 0.15, 0.2),
    maxWidth: PAGE_WIDTH - 100,
    lineHeight: 16,
  });

  // Diagram Box (Figure)
  page2.drawRectangle({
    x: 50,
    y: PAGE_HEIGHT - 470,
    width: PAGE_WIDTH - 100,
    height: 180,
    borderColor: rgb(0.06, 0.46, 0.43),
    borderWidth: 1.5,
    color: rgb(0.95, 0.98, 0.98),
  });
  // Inside Diagram graphics
  page2.drawRectangle({
    x: 75,
    y: PAGE_HEIGHT - 380,
    width: 100,
    height: 50,
    color: rgb(0.85, 0.92, 0.92),
    borderColor: rgb(0.06, 0.46, 0.43),
    borderWidth: 1,
  });
  page2.drawText('Raw Visual PDF\n(Bitmaps/Coords)', {
    x: 82,
    y: PAGE_HEIGHT - 355,
    size: 8.5,
    font: fontSansBold,
    color: rgb(0.08, 0.2, 0.25),
    lineHeight: 12,
  });

  // Arrow 1 vector line
  page2.drawLine({
    start: { x: 185, y: PAGE_HEIGHT - 355 },
    end: { x: 225, y: PAGE_HEIGHT - 355 },
    thickness: 2,
    color: rgb(0.06, 0.46, 0.43),
  });
  page2.drawText('->', {
    x: 215,
    y: PAGE_HEIGHT - 359,
    size: 12,
    font: fontMono,
    color: rgb(0.06, 0.46, 0.43),
  });

  page2.drawRectangle({
    x: 235,
    y: PAGE_HEIGHT - 380,
    width: 125,
    height: 50,
    color: rgb(0.9, 0.94, 0.98),
    borderColor: rgb(0.15, 0.4, 0.7),
    borderWidth: 1,
  });
  page2.drawText('Semantic Classifier\n& Reading Engine', {
    x: 242,
    y: PAGE_HEIGHT - 355,
    size: 8.5,
    font: fontSansBold,
    color: rgb(0.1, 0.25, 0.5),
    lineHeight: 12,
  });

  // Arrow 2 vector line
  page2.drawLine({
    start: { x: 370, y: PAGE_HEIGHT - 355 },
    end: { x: 405, y: PAGE_HEIGHT - 355 },
    thickness: 2,
    color: rgb(0.06, 0.46, 0.43),
  });
  page2.drawText('->', {
    x: 395,
    y: PAGE_HEIGHT - 359,
    size: 12,
    font: fontMono,
    color: rgb(0.06, 0.46, 0.43),
  });

  page2.drawRectangle({
    x: 415,
    y: PAGE_HEIGHT - 380,
    width: 110,
    height: 50,
    color: rgb(0.93, 0.98, 0.92),
    borderColor: rgb(0.15, 0.6, 0.25),
    borderWidth: 1,
  });
  page2.drawText('PDF/UA Tagged Tree\n& Audio Synthesis', {
    x: 420,
    y: PAGE_HEIGHT - 355,
    size: 8.5,
    font: fontSansBold,
    color: rgb(0.1, 0.4, 0.15),
    lineHeight: 12,
  });

  // Caption
  page2.drawText('Figure 1.1: Multi-stage transformation from unstructured canvas coordinates into an accessible semantic tree.', {
    x: 50,
    y: PAGE_HEIGHT - 490,
    size: 9,
    font: fontSansBold,
    color: rgb(0.3, 0.35, 0.4),
    maxWidth: PAGE_WIDTH - 100,
  });

  // Footnote
  page2.drawLine({
    start: { x: 50, y: 70 },
    end: { x: 180, y: 70 },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  page2.drawText('1. See ISO 14289-1:2014 (PDF/UA-1) for technical specifications on Document Structure Trees.', {
    x: 50,
    y: 55,
    size: 8,
    font: fontSerifRegular,
    color: rgb(0.4, 0.45, 0.5),
  });

  // Page number
  page2.drawText('2', {
    x: PAGE_WIDTH / 2,
    y: 30,
    size: 9,
    font: fontSans,
    color: rgb(0.5, 0.55, 0.6),
  });


  // --- PAGE 3: TWO COLUMNS & TABLE ---
  const page3 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  // Running Header
  page3.drawText('THE ARCHITECTURE OF THOUGHT | CHAPTER 1', {
    x: 50,
    y: PAGE_HEIGHT - 45,
    size: 8,
    font: fontSansBold,
    color: rgb(0.5, 0.55, 0.6),
  });
  page3.drawLine({
    start: { x: 50, y: PAGE_HEIGHT - 52 },
    end: { x: PAGE_WIDTH - 50, y: PAGE_HEIGHT - 52 },
    thickness: 0.5,
    color: rgb(0.8, 0.82, 0.85),
  });

  // Section 1.2
  page3.drawText('1.2 Comparative Evaluation of Ingestion Paradigms', {
    x: 50,
    y: PAGE_HEIGHT - 85,
    size: 14,
    font: fontSansBold,
    color: rgb(0.06, 0.46, 0.43),
  });

  // Two columns
  const colWidth = (PAGE_WIDTH - 120) / 2;
  const colLeftX = 50;
  const colRightX = 50 + colWidth + 20;

  const col1Text = 'Traditional optical character recognition (OCR) systems process documents purely as visual rasters. While basic textual tokens are recovered, spatial column layouts, floating callouts, and mathematical tables are frequently mangled into incoherent sentence fragments.';
  page3.drawText(col1Text, {
    x: colLeftX,
    y: PAGE_HEIGHT - 120,
    size: 9.5,
    font: fontSerifRegular,
    color: rgb(0.12, 0.15, 0.2),
    maxWidth: colWidth,
    lineHeight: 15,
  });

  const col2Text = 'In modern PDF/UA architectures, spatial awareness is paired with strict logical reading sequences. As a result, screen reader focus shifts seamlessly across multi-column gutters without prematurely reading adjacent paragraphs or skipping crucial table cells.';
  page3.drawText(col2Text, {
    x: colRightX,
    y: PAGE_HEIGHT - 120,
    size: 9.5,
    font: fontSerifRegular,
    color: rgb(0.12, 0.15, 0.2),
    maxWidth: colWidth,
    lineHeight: 15,
  });

  // Table Title
  page3.drawText('Table 1.1: Benchmark Matrix of PDF Accessibility Formats', {
    x: 50,
    y: PAGE_HEIGHT - 250,
    size: 11,
    font: fontSansBold,
    color: rgb(0.05, 0.09, 0.15),
  });

  // Table Header row
  const tableY = PAGE_HEIGHT - 270;
  const rowHeight = 28;

  page3.drawRectangle({
    x: 50,
    y: tableY - rowHeight,
    width: PAGE_WIDTH - 100,
    height: rowHeight,
    color: rgb(0.06, 0.46, 0.43),
  });
  page3.drawText('Capability', { x: 60, y: tableY - 19, size: 9.5, font: fontSansBold, color: rgb(1, 1, 1) });
  page3.drawText('Untagged PDF / Scanned', { x: 205, y: tableY - 19, size: 9.5, font: fontSansBold, color: rgb(1, 1, 1) });
  page3.drawText('Accessible Tagged PDF (PDF/UA)', { x: 375, y: tableY - 19, size: 9.5, font: fontSansBold, color: rgb(1, 1, 1) });

  // Row 1
  page3.drawRectangle({
    x: 50,
    y: tableY - rowHeight * 2,
    width: PAGE_WIDTH - 100,
    height: rowHeight,
    color: rgb(0.96, 0.97, 0.98),
  });
  page3.drawText('Heading Traversal (H1-H6)', { x: 60, y: tableY - rowHeight - 18, size: 9, font: fontSans, color: rgb(0.1, 0.15, 0.2) });
  page3.drawText('Unavailable (flat text flow)', { x: 205, y: tableY - rowHeight - 18, size: 9, font: fontSans, color: rgb(0.7, 0.2, 0.2) });
  page3.drawText('Instant jump keys (H, 1-6 in NVDA)', { x: 375, y: tableY - rowHeight - 18, size: 9, font: fontSansBold, color: rgb(0.1, 0.5, 0.2) });

  // Row 2
  page3.drawRectangle({
    x: 50,
    y: tableY - rowHeight * 3,
    width: PAGE_WIDTH - 100,
    height: rowHeight,
    color: rgb(1, 1, 1),
  });
  page3.drawText('Image Descriptions', { x: 60, y: tableY - rowHeight * 2 - 18, size: 9, font: fontSans, color: rgb(0.1, 0.15, 0.2) });
  page3.drawText('Silent or raw image file path', { x: 205, y: tableY - rowHeight * 2 - 18, size: 9, font: fontSans, color: rgb(0.7, 0.2, 0.2) });
  page3.drawText('Context-aware AI verified alt text', { x: 375, y: tableY - rowHeight * 2 - 18, size: 9, font: fontSansBold, color: rgb(0.1, 0.5, 0.2) });

  // Row 3
  page3.drawRectangle({
    x: 50,
    y: tableY - rowHeight * 4,
    width: PAGE_WIDTH - 100,
    height: rowHeight,
    color: rgb(0.96, 0.97, 0.98),
  });
  page3.drawText('Table Matrix Navigation', { x: 60, y: tableY - rowHeight * 3 - 18, size: 9, font: fontSans, color: rgb(0.1, 0.15, 0.2) });
  page3.drawText('Unordered raw coordinates', { x: 205, y: tableY - rowHeight * 3 - 18, size: 9, font: fontSans, color: rgb(0.7, 0.2, 0.2) });
  page3.drawText('Header-cell speech coordinate sync', { x: 375, y: tableY - rowHeight * 3 - 18, size: 9, font: fontSansBold, color: rgb(0.1, 0.5, 0.2) });

  // Table border
  page3.drawRectangle({
    x: 50,
    y: tableY - rowHeight * 4,
    width: PAGE_WIDTH - 100,
    height: rowHeight * 4,
    borderColor: rgb(0.8, 0.83, 0.88),
    borderWidth: 1,
  });

  // Sidebar Box
  page3.drawRectangle({
    x: 50,
    y: PAGE_HEIGHT - 570,
    width: PAGE_WIDTH - 100,
    height: 120,
    color: rgb(0.95, 0.95, 0.99),
    borderColor: rgb(0.3, 0.3, 0.8),
    borderWidth: 1,
  });
  page3.drawText('SIDEBAR: THE COST OF UNTAGGED CONTENT', {
    x: 65,
    y: PAGE_HEIGHT - 475,
    size: 10,
    font: fontSansBold,
    color: rgb(0.2, 0.2, 0.6),
  });
  page3.drawText('Over 2.2 billion people globally live with visual impairments or print disabilities. When academic institutions and publishers distribute inaccessible PDFs, they erect involuntary barriers to research, education, and public knowledge. Tagging is not merely a compliance checkbox -- it is a human right.', {
    x: 65,
    y: PAGE_HEIGHT - 505,
    size: 9.5,
    font: fontSerifRegular,
    color: rgb(0.1, 0.15, 0.25),
    maxWidth: PAGE_WIDTH - 130,
    lineHeight: 15,
  });

  // Page number
  page3.drawText('3', {
    x: PAGE_WIDTH / 2,
    y: 30,
    size: 9,
    font: fontSans,
    color: rgb(0.5, 0.55, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const pdfDataUrl = URL.createObjectURL(pdfBlob);
  const pdfArrayBuffer = pdfBytes.buffer.slice(
    pdfBytes.byteOffset,
    pdfBytes.byteOffset + pdfBytes.byteLength
  ) as ArrayBuffer;
  void getPdfDocument('demo-ebook-01', pdfArrayBuffer);

  // Define structured elements for all pages
  const elements: PdfElement[] = [
    // Page 1 Elements
    {
      id: 'el-p1-art-1',
      pageNumber: 1,
      tag: 'Artifact',
      readingOrder: 1,
      bbox: { x: 0, y: 0, width: 100, height: 2 },
      text: '[Top Brand Trim Band]',
      confidence: 0.99,
      isFlaggedForReview: false,
      isDecorative: true,
    },
    {
      id: 'el-p1-art-2',
      pageNumber: 1,
      tag: 'Artifact',
      readingOrder: 2,
      bbox: { x: 42, y: 18, width: 16, height: 10 },
      text: '[Decorative Section Emblem]',
      confidence: 0.98,
      isFlaggedForReview: false,
      isDecorative: true,
    },
    {
      id: 'el-p1-h1-1',
      pageNumber: 1,
      tag: 'H1',
      readingOrder: 3,
      bbox: { x: 8, y: 32, width: 84, height: 8 },
      text: 'THE ARCHITECTURE OF THOUGHT',
      confidence: 0.99,
      isFlaggedForReview: false,
      fontSize: 28,
      fontWeight: 'bold',
    },
    {
      id: 'el-p1-h2-1',
      pageNumber: 1,
      tag: 'H2',
      readingOrder: 4,
      bbox: { x: 8, y: 42, width: 84, height: 5 },
      text: 'Accessible Design Patterns for Digital Literature and Read Aloud Experiences',
      confidence: 0.96,
      isFlaggedForReview: false,
      fontSize: 13,
      fontWeight: 'bold',
    },
    {
      id: 'el-p1-p-1',
      pageNumber: 1,
      tag: 'P',
      readingOrder: 5,
      bbox: { x: 8, y: 51, width: 84, height: 4 },
      text: 'Dr. Elena Rostova & Marcus Vance',
      confidence: 0.94,
      isFlaggedForReview: false,
      fontSize: 14,
    },
    {
      id: 'el-p1-p-2',
      pageNumber: 1,
      tag: 'P',
      readingOrder: 6,
      bbox: { x: 8, y: 56, width: 84, height: 3 },
      text: 'Foreword by The Universal Accessibility Consortium',
      confidence: 0.92,
      isFlaggedForReview: false,
      fontSize: 10,
    },
    {
      id: 'el-p1-p-3',
      pageNumber: 1,
      tag: 'P',
      readingOrder: 7,
      bbox: { x: 8, y: 89, width: 84, height: 3 },
      text: 'ISBN 978-1-987654-32-1 | Oxford Academic Digital Library Series',
      confidence: 0.95,
      isFlaggedForReview: false,
      fontSize: 9,
    },

    // Page 2 Elements
    {
      id: 'el-p2-art-1',
      pageNumber: 2,
      tag: 'Artifact',
      readingOrder: 8,
      bbox: { x: 8, y: 4, width: 84, height: 2 },
      text: 'THE ARCHITECTURE OF THOUGHT | CHAPTER 1',
      confidence: 0.98,
      isFlaggedForReview: false,
      isDecorative: true,
    },
    {
      id: 'el-p2-h1-1',
      pageNumber: 2,
      tag: 'H1',
      readingOrder: 9,
      bbox: { x: 8, y: 10, width: 84, height: 4 },
      text: 'Chapter 1: The Human Interface of Information',
      confidence: 0.98,
      isFlaggedForReview: false,
      fontSize: 20,
      fontWeight: 'bold',
    },
    {
      id: 'el-p2-h2-1',
      pageNumber: 2,
      tag: 'H2',
      readingOrder: 10,
      bbox: { x: 8, y: 15, width: 84, height: 3.5 },
      text: '1.1 Sensory Perception and Non-Visual Navigation',
      confidence: 0.97,
      isFlaggedForReview: false,
      fontSize: 14,
      fontWeight: 'bold',
    },
    {
      id: 'el-p2-p-1',
      pageNumber: 2,
      tag: 'P',
      readingOrder: 11,
      bbox: { x: 8, y: 19, width: 84, height: 6.5 },
      text: p1Text,
      confidence: 0.99,
      isFlaggedForReview: false,
      fontSize: 10.5,
    },
    {
      id: 'el-p2-p-2',
      pageNumber: 2,
      tag: 'P',
      readingOrder: 12,
      bbox: { x: 8, y: 26, width: 84, height: 5.5 },
      text: p2Text,
      confidence: 0.99,
      isFlaggedForReview: false,
      fontSize: 10.5,
    },
    {
      id: 'el-p2-fig-1',
      pageNumber: 2,
      tag: 'Figure',
      readingOrder: 13,
      bbox: { x: 8, y: 33, width: 84, height: 21 },
      text: '[Flowchart: Multi-stage transformation from raw visual PDF coordinates into an accessible semantic tree and audio synthesis]',
      confidence: 0.82,
      isFlaggedForReview: true, // Needs alt-text review by user!
      altText: '',
      aiAltTextSuggested: 'Flowchart with three connected boxes: Box 1 depicts Raw Visual PDF Coordinates with bitmaps, connected by an arrow to Box 2 depicting Semantic Classifier and Reading Engine, connected to Box 3 showing PDF/UA Tagged Tree and Audio Synthesis.',
    },
    {
      id: 'el-p2-cap-1',
      pageNumber: 2,
      tag: 'Caption',
      readingOrder: 14,
      bbox: { x: 8, y: 57, width: 84, height: 3 },
      text: 'Figure 1.1: Multi-stage transformation from unstructured canvas coordinates into an accessible semantic tree.',
      confidence: 0.95,
      isFlaggedForReview: false,
      fontSize: 9,
    },
    {
      id: 'el-p2-fn-1',
      pageNumber: 2,
      tag: 'Footnote',
      readingOrder: 15,
      bbox: { x: 8, y: 92, width: 84, height: 3 },
      text: '1. See ISO 14289-1:2014 (PDF/UA-1) for technical specifications on Document Structure Trees.',
      confidence: 0.91,
      isFlaggedForReview: false,
      footnoteNumber: 1,
      fontSize: 8,
    },
    {
      id: 'el-p2-art-2',
      pageNumber: 2,
      tag: 'Artifact',
      readingOrder: 16,
      bbox: { x: 48, y: 96, width: 4, height: 2 },
      text: '2',
      confidence: 0.99,
      isFlaggedForReview: false,
      isDecorative: true,
    },

    // Page 3 Elements
    {
      id: 'el-p3-art-1',
      pageNumber: 3,
      tag: 'Artifact',
      readingOrder: 17,
      bbox: { x: 8, y: 4, width: 84, height: 2 },
      text: 'THE ARCHITECTURE OF THOUGHT | CHAPTER 1',
      confidence: 0.98,
      isFlaggedForReview: false,
      isDecorative: true,
    },
    {
      id: 'el-p3-h2-1',
      pageNumber: 3,
      tag: 'H2',
      readingOrder: 18,
      bbox: { x: 8, y: 9.5, width: 84, height: 3.5 },
      text: '1.2 Comparative Evaluation of Ingestion Paradigms',
      confidence: 0.97,
      isFlaggedForReview: false,
      fontSize: 14,
      fontWeight: 'bold',
    },
    {
      id: 'el-p3-p-1',
      pageNumber: 3,
      tag: 'P',
      readingOrder: 19,
      bbox: { x: 8, y: 14, width: 40, height: 14 },
      text: col1Text,
      confidence: 0.96,
      isFlaggedForReview: false,
      column: 1,
      fontSize: 9.5,
    },
    {
      id: 'el-p3-p-2',
      pageNumber: 3,
      tag: 'P',
      readingOrder: 20,
      bbox: { x: 51, y: 14, width: 40, height: 14 },
      text: col2Text,
      confidence: 0.96,
      isFlaggedForReview: false,
      column: 2,
      fontSize: 9.5,
    },
    {
      id: 'el-p3-tbl-1',
      pageNumber: 3,
      tag: 'Table',
      readingOrder: 21,
      bbox: { x: 8, y: 31, width: 84, height: 18 },
      text: 'Table 1.1: Benchmark Matrix of PDF Accessibility Formats. Comparing Heading Traversal, Image Descriptions, and Table Matrix Navigation across Untagged PDF and Accessible Tagged PDF.',
      confidence: 0.94,
      isFlaggedForReview: false,
      tableData: {
        rowCount: 4,
        colCount: 3,
        hasHeaderRow: true,
        hasHeaderCol: false,
        caption: 'Table 1.1: Benchmark Matrix of PDF Accessibility Formats',
        summary: 'Comparison of accessible capabilities between raw PDF and PDF/UA',
        cells: [
          { rowIndex: 0, colIndex: 0, text: 'Capability', isHeader: true },
          { rowIndex: 0, colIndex: 1, text: 'Untagged PDF / Scanned', isHeader: true },
          { rowIndex: 0, colIndex: 2, text: 'Accessible Tagged PDF (PDF/UA)', isHeader: true },
          
          { rowIndex: 1, colIndex: 0, text: 'Heading Traversal (H1-H6)', isHeader: false },
          { rowIndex: 1, colIndex: 1, text: 'Unavailable (flat text flow)', isHeader: false },
          { rowIndex: 1, colIndex: 2, text: 'Instant jump keys (H, 1-6 in NVDA)', isHeader: false },

          { rowIndex: 2, colIndex: 0, text: 'Image Descriptions', isHeader: false },
          { rowIndex: 2, colIndex: 1, text: 'Silent or raw image file path', isHeader: false },
          { rowIndex: 2, colIndex: 2, text: 'Context-aware AI verified alt text', isHeader: false },

          { rowIndex: 3, colIndex: 0, text: 'Table Matrix Navigation', isHeader: false },
          { rowIndex: 3, colIndex: 1, text: 'Unordered raw coordinates', isHeader: false },
          { rowIndex: 3, colIndex: 2, text: 'Header-cell speech coordinate sync', isHeader: false },
        ],
      },
    },
    {
      id: 'el-p3-side-1',
      pageNumber: 3,
      tag: 'Sidebar',
      readingOrder: 22,
      bbox: { x: 8, y: 53, width: 84, height: 16 },
      text: 'SIDEBAR: THE COST OF UNTAGGED CONTENT. Over 2.2 billion people globally live with visual impairments or print disabilities. When academic institutions and publishers distribute inaccessible PDFs, they erect involuntary barriers to research, education, and public knowledge. Tagging is not merely a compliance checkbox -- it is a human right.',
      confidence: 0.93,
      isFlaggedForReview: false,
      fontSize: 9.5,
    },
    {
      id: 'el-p3-art-2',
      pageNumber: 3,
      tag: 'Artifact',
      readingOrder: 23,
      bbox: { x: 48, y: 96, width: 4, height: 2 },
      text: '3',
      confidence: 0.99,
      isFlaggedForReview: false,
      isDecorative: true,
    },
  ];

  const metadata: PdfMetadata = {
    title: 'The Architecture of Thought: Accessible Design Patterns for Digital Literature',
    author: 'Dr. Elena Rostova & Marcus Vance',
    language: 'en-US',
    subject: 'Accessible Digital Publishing, Screen Reader Compatibility, PDF/UA, WCAG 2.1',
    keywords: ['accessibility', 'PDF/UA', 'WCAG', 'screen reader', 'ebooks', 'semantic tagging'],
    producer: 'Accessible Ebook Tagger Engine v2.4',
    creator: 'Accessible Ebook Tagger',
    creationDate: '2026-01-15T09:00:00Z',
    pageCount: 3,
    fileSize: pdfBytes.byteLength,
    fileName: 'architecture_of_thought_sample.pdf',
    isPreTagged: false,
    hasMarkedInfo: false,
    hasStructTree: false,
    detectedLanguage: 'en-US',
  };

  const validationReport = evaluateAccessibility(elements, metadata);

  return {
    id: 'demo-ebook-01',
    fileName: 'the_architecture_of_thought.pdf',
    fileSize: pdfBytes.byteLength,
    pageCount: 3,
    pdfDataUrl,
    pdfArrayBuffer,
    metadata,
    elements,
    validationReport,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
