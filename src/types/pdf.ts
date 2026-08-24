export type PdfTagType =
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5'
  | 'H6'
  | 'P'
  | 'List'
  | 'ListItem'
  | 'Table'
  | 'TH'
  | 'TD'
  | 'Figure'
  | 'Caption'
  | 'Footnote'
  | 'Sidebar'
  | 'Quote'
  | 'Artifact'
  | 'Link';

export interface BoundingBox {
  x: number; // 0-100 percentage from left
  y: number; // 0-100 percentage from top
  width: number; // 0-100 percentage
  height: number; // 0-100 percentage
  originalPdfCoords?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TableCell {
  rowIndex: number;
  colIndex: number;
  text: string;
  isHeader: boolean;
  rowSpan?: number;
  colSpan?: number;
}

export interface TableStructure {
  rowCount: number;
  colCount: number;
  hasHeaderRow: boolean;
  hasHeaderCol: boolean;
  caption?: string;
  summary?: string;
  cells: TableCell[];
}

export interface PdfElement {
  id: string;
  pageNumber: number;
  tag: PdfTagType;
  readingOrder: number;
  bbox: BoundingBox;
  text: string;
  confidence: number; // 0.0 to 1.0
  isFlaggedForReview: boolean;
  reviewNotes?: string;
  
  // Specific tag details
  altText?: string;
  isDecorative?: boolean;
  aiAltTextSuggested?: string;
  imageUrl?: string;
  
  // Typography & Layout metadata
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  column?: number; // 1 or 2 for multi-column
  
  // Structured types
  tableData?: TableStructure;
  linkUrl?: string;
  footnoteNumber?: number;
  headingLevel?: number;
}

export interface PdfMetadata {
  title: string;
  author: string;
  language: string; // e.g. 'en-US'
  subject?: string;
  keywords?: string[];
  producer?: string;
  creator?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  fileSize: number;
  fileName: string;
  isPreTagged: boolean;
  hasMarkedInfo: boolean;
  hasStructTree: boolean;
  detectedLanguage?: string;
}

export interface ValidationIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: 'heading' | 'altText' | 'readingOrder' | 'table' | 'metadata' | 'artifact' | 'contrast' | 'language';
  wcagCriterion: string; // e.g. '1.3.1 Info and Relationships', '1.1.1 Non-text Content', '2.4.6 Headings and Labels'
  pdfUaClause: string; // e.g. 'Clause 7.1 General', 'Clause 7.3 Headings'
  title: string;
  description: string;
  elementId?: string;
  pageNumber?: number;
  fixable: boolean;
  autoFixAction?: string;
  isResolved?: boolean;
}

export interface AccessibilityAuditReport {
  overallScore: number; // 0 - 100
  passedChecks: number;
  warningChecks: number;
  errorChecks: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  pdfUaCompliant: boolean;
  issues: ValidationIssue[];
  tagDistribution: Record<PdfTagType, number>;
  pagesCount: number;
  elementsCount: number;
  reviewedElementsCount: number;
  evaluatedAt: string;
}

export interface ProcessingPipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'warning' | 'error';
  progress: number; // 0 to 100
  durationMs?: number;
  details?: string;
}

export interface EbookDocument {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pdfDataUrl?: string;
  pdfArrayBuffer?: ArrayBuffer;
  metadata: PdfMetadata;
  elements: PdfElement[];
  validationReport: AccessibilityAuditReport;
  createdAt: Date;
  updatedAt: Date;
}
