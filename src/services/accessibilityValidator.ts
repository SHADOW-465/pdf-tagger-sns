import type { AccessibilityAuditReport, PdfElement, PdfMetadata, PdfTagType, ValidationIssue } from '../types/pdf';

export function evaluateAccessibility(
  elements: PdfElement[],
  metadata: PdfMetadata
): AccessibilityAuditReport {
  const issues: ValidationIssue[] = [];
  const tagDistribution: Record<PdfTagType, number> = {
    H1: 0,
    H2: 0,
    H3: 0,
    H4: 0,
    H5: 0,
    H6: 0,
    P: 0,
    List: 0,
    ListItem: 0,
    Table: 0,
    TH: 0,
    TD: 0,
    Figure: 0,
    Caption: 0,
    Footnote: 0,
    Sidebar: 0,
    Quote: 0,
    Artifact: 0,
    Link: 0,
  };

  elements.forEach((el) => {
    if (tagDistribution[el.tag] !== undefined) {
      tagDistribution[el.tag]++;
    }
  });

  // 1. Check Document Metadata: Title
  if (!metadata.title || metadata.title.trim() === '' || metadata.title.toLowerCase().includes('untitled')) {
    issues.push({
      id: 'iss-meta-title',
      severity: 'critical',
      category: 'metadata',
      wcagCriterion: '2.4.2 Page Titled',
      pdfUaClause: 'Clause 7.1 General Requirements',
      title: 'Missing or Generic Document Title',
      description: 'The PDF document lacks an explicit, descriptive title metadata entry in the document information dictionary.',
      fixable: true,
      autoFixAction: 'Set title to detected H1 book title',
    });
  }

  // 2. Check Document Metadata: Language
  if (!metadata.language || metadata.language.trim() === '') {
    issues.push({
      id: 'iss-meta-lang',
      severity: 'critical',
      category: 'language',
      wcagCriterion: '3.1.1 Language of Page',
      pdfUaClause: 'Clause 7.2 Natural Language',
      title: 'Missing Document Natural Language Specification',
      description: 'The /Lang dictionary entry is not set, preventing screen readers from selecting the correct speech synthesis phoneme library and pronunciation dictionary.',
      fixable: true,
      autoFixAction: 'Assign language "en-US"',
    });
  }

  // 3. Check Headings Hierarchy
  const headings = elements
    .filter((el) => el.tag.startsWith('H') && el.tag.length === 2)
    .sort((a, b) => a.readingOrder - b.readingOrder);

  if (headings.length === 0) {
    issues.push({
      id: 'iss-head-none',
      severity: 'critical',
      category: 'heading',
      wcagCriterion: '1.3.1 Info and Relationships',
      pdfUaClause: 'Clause 7.3 Headings',
      title: 'No Headings Detected in Document',
      description: 'The document does not have any heading tags (H1-H6), severely hindering screen reader navigation.',
      fixable: false,
    });
  } else {
    // Check if starts with H1
    if (headings[0].tag !== 'H1') {
      issues.push({
        id: 'iss-head-first',
        severity: 'moderate',
        category: 'heading',
        wcagCriterion: '2.4.6 Headings and Labels',
        pdfUaClause: 'Clause 7.3 Headings',
        title: `Document Begins with ${headings[0].tag} Instead of H1`,
        description: `The first heading encountered is a ${headings[0].tag}. Screen readers expect the primary title to be tagged as H1.`,
        elementId: headings[0].id,
        pageNumber: headings[0].pageNumber,
        fixable: true,
        autoFixAction: 'Promote first heading to H1',
      });
    }

    // Check for skipped heading levels (e.g. H1 -> H3)
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = parseInt(headings[i].tag.substring(1), 10);
      const nextLevel = parseInt(headings[i + 1].tag.substring(1), 10);
      if (nextLevel > currentLevel + 1) {
        issues.push({
          id: `iss-head-skip-${headings[i + 1].id}`,
          severity: 'moderate',
          category: 'heading',
          wcagCriterion: '1.3.1 Info and Relationships',
          pdfUaClause: 'Clause 7.3 Headings',
          title: `Skipped Heading Level: ${headings[i].tag} jumps to ${headings[i + 1].tag}`,
          description: `Heading level jumped from ${headings[i].tag} ("${headings[i].text.slice(0, 30)}...") directly to ${headings[i + 1].tag} ("${headings[i + 1].text.slice(0, 30)}...") without an intermediate H${currentLevel + 1}.`,
          elementId: headings[i + 1].id,
          pageNumber: headings[i + 1].pageNumber,
          fixable: true,
          autoFixAction: `Change to H${currentLevel + 1}`,
        });
      }
    }
  }

  // 4. Check Figures for Alt Text
  elements.forEach((el) => {
    if (el.tag === 'Figure') {
      const hasAlt = el.altText && el.altText.trim().length > 0;
      const isDecor = el.isDecorative;

      if (!hasAlt && !isDecor) {
        issues.push({
          id: `iss-fig-alt-${el.id}`,
          severity: 'critical',
          category: 'altText',
          wcagCriterion: '1.1.1 Non-text Content',
          pdfUaClause: 'Clause 7.3 Figures',
          title: `Untagged Figure Missing Alternative Text`,
          description: `Image on Page ${el.pageNumber} does not have alternative text or decorative artifact classification, leaving non-visual readers with no context.`,
          elementId: el.id,
          pageNumber: el.pageNumber,
          fixable: true,
          autoFixAction: 'Apply AI-suggested alt text description',
        });
      } else if (hasAlt && el.altText!.trim().length < 8) {
        issues.push({
          id: `iss-fig-short-${el.id}`,
          severity: 'minor',
          category: 'altText',
          wcagCriterion: '1.1.1 Non-text Content',
          pdfUaClause: 'Clause 7.3 Figures',
          title: `Figure Alternative Text Is Extremely Short`,
          description: `The alternative text "${el.altText}" may not adequately convey the content or purpose of the visual figure.`,
          elementId: el.id,
          pageNumber: el.pageNumber,
          fixable: true,
          autoFixAction: 'Expand with AI detailed description',
        });
      }
    }
  });

  // 5. Check Tables for Header structure
  elements.forEach((el) => {
    if (el.tag === 'Table') {
      if (!el.tableData || !el.tableData.hasHeaderRow) {
        issues.push({
          id: `iss-tbl-hdr-${el.id}`,
          severity: 'serious',
          category: 'table',
          wcagCriterion: '1.3.1 Info and Relationships',
          pdfUaClause: 'Clause 7.5 Tables',
          title: `Table on Page ${el.pageNumber} Missing Header Cells (TH)`,
          description: 'Tabular data without explicit header cells prevents screen readers from associating data cells with their respective column labels during traversal.',
          elementId: el.id,
          pageNumber: el.pageNumber,
          fixable: true,
          autoFixAction: 'Designate first row as Table Header (TH)',
        });
      }
    }
  });

  // 6. Check Reading Order Continuity
  const sortedByOrder = [...elements].sort((a, b) => a.readingOrder - b.readingOrder);
  let orderDiscontinuity = false;
  for (let i = 0; i < sortedByOrder.length - 1; i++) {
    if (sortedByOrder[i + 1].readingOrder !== sortedByOrder[i].readingOrder + 1) {
      orderDiscontinuity = true;
      break;
    }
  }
  if (orderDiscontinuity) {
    issues.push({
      id: 'iss-order-gap',
      severity: 'moderate',
      category: 'readingOrder',
      wcagCriterion: '1.3.2 Meaningful Sequence',
      pdfUaClause: 'Clause 7.1 General Requirements',
      title: 'Reading Order Index Gaps or Duplications Detected',
      description: 'Elements in the document have non-sequential reading order keys, which can cause erratic jump behavior in certain PDF viewers.',
      fixable: true,
      autoFixAction: 'Renumber reading order sequentially',
    });
  }

  // 7. Check Running Headers & Page Numbers (Should be Artifacts)
  elements.forEach((el) => {
    if (el.tag !== 'Artifact') {
      const isHeaderFooter =
        el.text.toLowerCase().includes('page ') ||
        (el.bbox.y < 6 && el.fontSize !== undefined && el.fontSize < 10) ||
        (el.bbox.y > 94 && el.text.trim().match(/^\d+$/));

      if (isHeaderFooter && el.tag === 'P') {
        issues.push({
          id: `iss-art-hf-${el.id}`,
          severity: 'minor',
          category: 'artifact',
          wcagCriterion: '1.3.1 Info and Relationships',
          pdfUaClause: 'Clause 7.18 Artifacts',
          title: `Running Header/Page Number Tagged as Content`,
          description: `Element on Page ${el.pageNumber} ("${el.text.slice(0, 25)}") appears to be page furniture and should be tagged as an Artifact to avoid repetitive voice announcements.`,
          elementId: el.id,
          pageNumber: el.pageNumber,
          fixable: true,
          autoFixAction: 'Change tag to Artifact',
        });
      }
    }
  });

  // Calculate accessibility score
  let score = 100;
  let errorCount = 0;
  let warningCount = 0;
  let passedCount = 18; // Base set of satisfied structural criteria

  issues.forEach((issue) => {
    if (issue.severity === 'critical') {
      score -= 18;
      errorCount++;
    } else if (issue.severity === 'serious') {
      score -= 12;
      errorCount++;
    } else if (issue.severity === 'moderate') {
      score -= 6;
      warningCount++;
    } else if (issue.severity === 'minor') {
      score -= 3;
      warningCount++;
    }
  });

  score = Math.max(0, Math.min(100, Math.round(score)));

  let wcagLevel: 'A' | 'AA' | 'AAA' = 'A';
  if (score >= 95 && errorCount === 0) {
    wcagLevel = 'AAA';
  } else if (score >= 85 && errorCount === 0) {
    wcagLevel = 'AA';
  } else if (score >= 70) {
    wcagLevel = 'A';
  }

  const pdfUaCompliant = errorCount === 0 && score >= 90;

  const reviewedElementsCount = elements.filter(
    (el) => !el.isFlaggedForReview && (el.tag !== 'Figure' || !!el.altText || el.isDecorative)
  ).length;

  return {
    overallScore: score,
    passedChecks: passedCount,
    warningChecks: warningCount,
    errorChecks: errorCount,
    wcagLevel,
    pdfUaCompliant,
    issues,
    tagDistribution,
    pagesCount: metadata.pageCount || 1,
    elementsCount: elements.length,
    reviewedElementsCount,
    evaluatedAt: new Date().toISOString(),
  };
}
