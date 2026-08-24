import type { PdfElement, PdfTagType } from '../types/pdf';

export interface TagConfig {
  tag: PdfTagType;
  label: string;
  shortDesc: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  category: 'heading' | 'text' | 'structural' | 'media' | 'tabular' | 'decorative';
}

export const TAG_CONFIGS: Record<PdfTagType, TagConfig> = {
  H1: {
    tag: 'H1',
    label: 'Heading 1',
    shortDesc: 'Book title, major part, or chapter title',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderColor: '#c4b5fd',
    textColor: '#5b21b6',
    category: 'heading',
  },
  H2: {
    tag: 'H2',
    label: 'Heading 2',
    shortDesc: 'Primary section heading',
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderColor: '#93c5fd',
    textColor: '#1e40af',
    category: 'heading',
  },
  H3: {
    tag: 'H3',
    label: 'Heading 3',
    shortDesc: 'Subsection heading',
    color: '#0891b2',
    bgLight: '#ecfeff',
    borderColor: '#67e8f9',
    textColor: '#155e75',
    category: 'heading',
  },
  H4: {
    tag: 'H4',
    label: 'Heading 4',
    shortDesc: 'Sub-subsection heading',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    textColor: '#075985',
    category: 'heading',
  },
  H5: {
    tag: 'H5',
    label: 'Heading 5',
    shortDesc: 'Level 5 heading',
    color: '#4338ca',
    bgLight: '#eef2ff',
    borderColor: '#a5b4fc',
    textColor: '#3730a3',
    category: 'heading',
  },
  H6: {
    tag: 'H6',
    label: 'Heading 6',
    shortDesc: 'Level 6 heading',
    color: '#6366f1',
    bgLight: '#e0e7ff',
    borderColor: '#c7d2fe',
    textColor: '#4338ca',
    category: 'heading',
  },
  P: {
    tag: 'P',
    label: 'Paragraph',
    shortDesc: 'Standard body text content',
    color: '#475569',
    bgLight: '#f8fafc',
    borderColor: '#cbd5e1',
    textColor: '#334155',
    category: 'text',
  },
  List: {
    tag: 'List',
    label: 'List Block',
    shortDesc: 'Container for ordered or unordered items',
    color: '#ca8a04',
    bgLight: '#fefce8',
    borderColor: '#fde047',
    textColor: '#854d0e',
    category: 'structural',
  },
  ListItem: {
    tag: 'ListItem',
    label: 'List Item (LI)',
    shortDesc: 'Individual item with bullet or number',
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fcd34d',
    textColor: '#92400e',
    category: 'structural',
  },
  Table: {
    tag: 'Table',
    label: 'Table',
    shortDesc: 'Tabular data container',
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fdba74',
    textColor: '#9a3412',
    category: 'tabular',
  },
  TH: {
    tag: 'TH',
    label: 'Table Header',
    shortDesc: 'Header cell with row or column scope',
    color: '#c2410c',
    bgLight: '#ffedd5',
    borderColor: '#fb923c',
    textColor: '#7c2d12',
    category: 'tabular',
  },
  TD: {
    tag: 'TD',
    label: 'Table Data Cell',
    shortDesc: 'Standard tabular value cell',
    color: '#b45309',
    bgLight: '#fef3c7',
    borderColor: '#fde68a',
    textColor: '#78350f',
    category: 'tabular',
  },
  Figure: {
    tag: 'Figure',
    label: 'Figure / Graphic',
    shortDesc: 'Informative image requiring alt text',
    color: '#0d9488',
    bgLight: '#f0fdfa',
    borderColor: '#5eead4',
    textColor: '#115e59',
    category: 'media',
  },
  Caption: {
    tag: 'Caption',
    label: 'Caption',
    shortDesc: 'Text describing figure or table',
    color: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#6ee7b7',
    textColor: '#065f46',
    category: 'media',
  },
  Footnote: {
    tag: 'Footnote',
    label: 'Footnote / Note',
    shortDesc: 'Bottom-of-page citation or clarification',
    color: '#e11d48',
    bgLight: '#fff1f2',
    borderColor: '#fda4af',
    textColor: '#9f1239',
    category: 'text',
  },
  Sidebar: {
    tag: 'Sidebar',
    label: 'Sidebar / Callout',
    shortDesc: 'Supplementary box separate from main flow',
    color: '#4f46e5',
    bgLight: '#eef2ff',
    borderColor: '#a5b4fc',
    textColor: '#3730a3',
    category: 'structural',
  },
  Quote: {
    tag: 'Quote',
    label: 'Blockquote',
    shortDesc: 'Attributed quotation or excerpt',
    color: '#7e22ce',
    bgLight: '#faf5ff',
    borderColor: '#d8b4fe',
    textColor: '#581c87',
    category: 'text',
  },
  Artifact: {
    tag: 'Artifact',
    label: 'Artifact (Ignored)',
    shortDesc: 'Decorative art, running headers, page numbers',
    color: '#64748b',
    bgLight: '#f1f5f9',
    borderColor: '#cbd5e1',
    textColor: '#475569',
    category: 'decorative',
  },
  Link: {
    tag: 'Link',
    label: 'Link / Reference',
    shortDesc: 'Interactive URL or internal cross-reference',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#7dd3fc',
    textColor: '#075985',
    category: 'text',
  },
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeechAnnouncement(element: PdfElement): string {
  if (element.tag === 'Artifact') {
    return `[Artifact - skipped by screen reader]`;
  }
  
  if (element.tag === 'Figure') {
    const alt = element.altText || element.aiAltTextSuggested || 'Image without alternative text';
    return `Graphic. ${alt}.`;
  }

  if (element.tag === 'H1') {
    return `Heading Level 1. ${element.text}`;
  }
  if (element.tag === 'H2') {
    return `Heading Level 2. ${element.text}`;
  }
  if (element.tag === 'H3') {
    return `Heading Level 3. ${element.text}`;
  }
  if (element.tag === 'H4') {
    return `Heading Level 4. ${element.text}`;
  }
  if (element.tag === 'H5') {
    return `Heading Level 5. ${element.text}`;
  }
  if (element.tag === 'H6') {
    return `Heading Level 6. ${element.text}`;
  }

  if (element.tag === 'Table') {
    const rows = element.tableData?.rowCount || 3;
    const cols = element.tableData?.colCount || 3;
    const caption = element.tableData?.caption ? ` Caption: ${element.tableData.caption}.` : '';
    return `Table with ${cols} columns and ${rows} rows.${caption} ${element.text.slice(0, 100)}`;
  }

  if (element.tag === 'ListItem') {
    return `List item. ${element.text}`;
  }

  if (element.tag === 'Sidebar') {
    return `Sidebar callout. ${element.text}`;
  }

  if (element.tag === 'Footnote') {
    return `Footnote reference ${element.footnoteNumber || ''}. ${element.text}`;
  }

  if (element.tag === 'Link') {
    return `Link. ${element.text}. Destination: ${element.linkUrl || 'internal'}`;
  }

  return element.text;
}

export interface HierarchyTreeNode {
  id: string;
  type: 'document' | 'chapter' | 'section' | 'element';
  title: string;
  element?: PdfElement;
  children: HierarchyTreeNode[];
  pageNumber?: number;
  readingOrder?: number;
  tag?: PdfTagType;
  confidence?: number;
  isFlagged?: boolean;
}

export function buildHierarchyTree(elements: PdfElement[], docTitle: string): HierarchyTreeNode {
  const root: HierarchyTreeNode = {
    id: 'root-doc',
    type: 'document',
    title: docTitle || 'Accessible Document',
    children: [],
  };

  let currentChapter: HierarchyTreeNode | null = null;
  let currentSection: HierarchyTreeNode | null = null;

  const sortedElements = [...elements].sort((a, b) => a.readingOrder - b.readingOrder);

  sortedElements.forEach((el) => {
    const elementNode: HierarchyTreeNode = {
      id: el.id,
      type: 'element',
      title: el.text ? (el.text.length > 48 ? el.text.substring(0, 48) + '...' : el.text) : `[${el.tag}]`,
      element: el,
      children: [],
      pageNumber: el.pageNumber,
      readingOrder: el.readingOrder,
      tag: el.tag,
      confidence: el.confidence,
      isFlagged: el.isFlaggedForReview || (el.tag === 'Figure' && !el.altText),
    };

    if (el.tag === 'H1') {
      currentChapter = {
        id: `chap-${el.id}`,
        type: 'chapter',
        title: el.text || 'Untitled Chapter',
        element: el,
        children: [elementNode],
        pageNumber: el.pageNumber,
        readingOrder: el.readingOrder,
        tag: 'H1',
        confidence: el.confidence,
        isFlagged: el.isFlaggedForReview,
      };
      root.children.push(currentChapter);
      currentSection = null;
    } else if (el.tag === 'H2') {
      currentSection = {
        id: `sec-${el.id}`,
        type: 'section',
        title: el.text || 'Untitled Section',
        element: el,
        children: [elementNode],
        pageNumber: el.pageNumber,
        readingOrder: el.readingOrder,
        tag: 'H2',
        confidence: el.confidence,
        isFlagged: el.isFlaggedForReview,
      };

      if (currentChapter) {
        currentChapter.children.push(currentSection);
      } else {
        root.children.push(currentSection);
      }
    } else {
      if (currentSection) {
        currentSection.children.push(elementNode);
      } else if (currentChapter) {
        currentChapter.children.push(elementNode);
      } else {
        root.children.push(elementNode);
      }
    }
  });

  return root;
}
